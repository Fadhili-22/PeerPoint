from app.models import CounsellorProfileStatus, UserRole, UserRoleAssignment
from app.services.admin_counsellors import demote_counsellor
from app.services.user_roles import (
    grant_counsellor_role,
    grant_role,
    revoke_role,
    user_has_active_role,
)
from tests.helpers import (
    create_counsellor_profile,
    create_user,
    grant_admin_role,
    grant_student_role,
)


def test_grant_counsellor_role_preserves_student_role(db_session):
    admin = create_user(db_session, full_name="Admin User", role=UserRole.admin)
    grant_admin_role(db_session, admin)

    student = create_user(db_session, full_name="Student User")
    grant_student_role(db_session, student)
    db_session.flush()

    grant_counsellor_role(
        db_session,
        user_id=student.id,
        granted_by=admin.id,
    )
    db_session.flush()

    active_roles = (
        db_session.query(UserRoleAssignment)
        .filter(
            UserRoleAssignment.user_id == student.id,
            UserRoleAssignment.is_active.is_(True),
        )
        .all()
    )
    role_values = {assignment.role for assignment in active_roles}

    assert UserRole.student in role_values
    assert UserRole.counsellor in role_values
    assert len(active_roles) == 2


def test_revoke_role_removes_only_target_role(db_session):
    user = create_user(db_session, full_name="Dual Role User")
    grant_student_role(db_session, user)
    grant_role(db_session, user_id=user.id, role=UserRole.counsellor, granted_by=None)
    db_session.flush()

    revoked = revoke_role(db_session, user_id=user.id, role=UserRole.counsellor)
    db_session.flush()

    assert revoked is not None
    assert revoked.is_active is False
    assert revoked.revoked_at is not None
    assert user_has_active_role(db_session, user.id, UserRole.student)
    assert not user_has_active_role(db_session, user.id, UserRole.counsellor)


def test_demote_counsellor_updates_profile_status(db_session):
    user = create_user(db_session, full_name="Counsellor User", is_verified=True)
    grant_student_role(db_session, user)
    grant_role(db_session, user_id=user.id, role=UserRole.counsellor, granted_by=None)
    profile = create_counsellor_profile(
        db_session,
        user,
        status=CounsellorProfileStatus.active,
    )
    db_session.flush()

    demote_counsellor(db_session, user.id)
    db_session.refresh(profile)

    assert profile.status == CounsellorProfileStatus.inactive
    assert not user_has_active_role(db_session, user.id, UserRole.counsellor)
    assert user_has_active_role(db_session, user.id, UserRole.student)
