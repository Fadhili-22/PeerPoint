from fastapi import APIRouter, Depends

from app import schemas
from app.dependencies import require_admin
from app.models import User

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"])


@router.get("/analytics", response_model=schemas.AdminReportsResponse)
def get_analytics_report(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.get("/trends", response_model=schemas.AdminReportsResponse)
def get_trends_report(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.get("/sessions", response_model=schemas.AdminReportsResponse)
def get_sessions_report(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.get("/resources", response_model=schemas.AdminReportsResponse)
def get_resources_report(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.get("/exports", response_model=schemas.AdminReportsResponse)
def get_exports_report(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError
