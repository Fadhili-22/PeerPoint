from app.models import UserRole
from app.services.user_roles import grant_role
from tests.helpers import (
    bearer_headers,
    create_counsellor_profile,
    create_user,
    grant_student_role,
    login_headers,
)


def test_login_blocked_when_account_inactive(client, db_session):
    password = "InactivePass123!"
    user = create_user(
        db_session,
        password=password,
        is_active=False,
        email_verified=True,
    )
    grant_student_role(db_session, user)
    db_session.flush()

    response = client.post(
        "/auth/login",
        data={"username": user.email, "password": password},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "ACCOUNT_INACTIVE"


def test_login_succeeds_when_account_active(client, db_session):
    password = "ActivePass123!"
    user = create_user(
        db_session,
        password=password,
        is_active=True,
        email_verified=True,
    )
    grant_student_role(db_session, user)
    db_session.flush()

    response = client.post(
        "/auth/login",
        data={"username": user.email, "password": password},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token"]["access_token"]
    assert body["token"]["token_type"] == "bearer"
    assert body["user"]["email"] == user.email


def test_unverified_student_blocked_from_student_only_route(client, db_session):
    user = create_user(
        db_session,
        email_verified=False,
        is_active=True,
    )
    grant_student_role(db_session, user)
    db_session.flush()

    response = client.get(
        "/students/me/sessions",
        headers=bearer_headers(user.id, [UserRole.student.value]),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Email not verified"


def test_unapproved_counsellor_blocked_from_counsellor_only_route(client, db_session):
    # Counsellor approval is users.is_verified (not counsellor_profiles or email_verified).
    password = "CounsellorPass123!"
    counsellor = create_user(
        db_session,
        full_name="Pending Counsellor",
        password=password,
        role=UserRole.counsellor,
        is_verified=False,
        email_verified=True,
    )
    grant_role(db_session, user_id=counsellor.id, role=UserRole.counsellor, granted_by=None)
    create_counsellor_profile(db_session, counsellor)
    db_session.flush()

    headers = login_headers(client, counsellor.email, password)
    response = client.get("/counsellor/session-requests", headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Counsellor account pending approval"
