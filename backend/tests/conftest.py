"""Shared pytest fixtures for PeerPoint backend tests."""

import time
from collections.abc import Generator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

import app.config as app_config
from app import models  # noqa: F401 — register models on Base.metadata
from app.config import settings
from app.database import get_db
from app.main import app

BACKEND_ROOT = Path(__file__).resolve().parents[1]

# The peerpoint_test database must exist on the Postgres server before running
# tests. Create it once manually if needed:
#   CREATE DATABASE peerpoint_test;


def _make_alembic_config(database_url: str) -> Config:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    config.set_main_option("sqlalchemy.url", database_url)
    return config


def _reset_public_schema(engine) -> None:
    with engine.connect() as connection:
        with connection.execution_options(isolation_level="AUTOCOMMIT"):
            connection.execute(text("DROP SCHEMA IF EXISTS public CASCADE"))
            connection.execute(text("CREATE SCHEMA public"))
            connection.execute(text("GRANT ALL ON SCHEMA public TO public"))


def _run_alembic_upgrade(database_url: str) -> None:
    original_database_url = app_config.settings.DATABASE_URL
    try:
        app_config.settings.DATABASE_URL = database_url
        config = _make_alembic_config(database_url)
        command.upgrade(config, "head")
    finally:
        app_config.settings.DATABASE_URL = original_database_url


@pytest.fixture(scope="session")
def test_database_url() -> str:
    """Same host/port/user/password as dev; only the database name changes."""
    url = make_url(settings.DATABASE_URL)
    return url.set(database="peerpoint_test").render_as_string(hide_password=False)


@pytest.fixture(scope="session")
def test_engine(test_database_url: str):
    engine = create_engine(test_database_url, poolclass=NullPool)

    # Uses Alembic migrations (not Base.metadata.create_all) so tests validate
    # against the actual production schema — see TrainingStatus enum
    # values_callable mismatch, a known but low-priority issue affecting only
    # Base.metadata.create_all-based schema generation.
    _reset_public_schema(engine)
    started_at = time.perf_counter()
    _run_alembic_upgrade(test_database_url)
    upgrade_seconds = time.perf_counter() - started_at
    print(f"\n[Alembic] upgrade head completed in {upgrade_seconds:.2f}s")

    yield engine

    _reset_public_schema(engine)
    engine.dispose()


@pytest.fixture
def db_session(test_engine) -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(autocommit=False, autoflush=False, bind=connection)()
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
