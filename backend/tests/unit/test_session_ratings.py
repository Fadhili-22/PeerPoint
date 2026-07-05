from app import schemas
from app.models import SessionRating, UserRole
from app.services.session_ratings import list_admin_ratings, submit_session_rating
from tests.helpers import (
    create_completed_session_request,
    create_user,
    grant_student_role,
)


def test_submit_rating_stores_student_id(db_session):
    student = create_user(db_session, full_name="Rating Student")
    counsellor = create_user(
        db_session,
        full_name="Rating Counsellor",
        role=UserRole.counsellor,
        is_verified=True,
    )
    grant_student_role(db_session, student)
    db_session.flush()

    session_request = create_completed_session_request(
        db_session,
        student=student,
        counsellor=counsellor,
    )

    submit_session_rating(
        db_session,
        student.id,
        session_request.id,
        schemas.SessionRatingCreate(stars=5, comment="Great session"),
    )

    rating = (
        db_session.query(SessionRating)
        .filter(SessionRating.session_request_id == session_request.id)
        .one()
    )

    assert rating.student_id == student.id
    assert rating.counsellor_id == counsellor.id
    assert rating.stars == 5


def test_admin_rating_view_excludes_student_id(db_session):
    student = create_user(db_session, full_name="Anon Student")
    counsellor = create_user(
        db_session,
        full_name="Listed Counsellor",
        role=UserRole.counsellor,
        is_verified=True,
    )
    grant_student_role(db_session, student)
    db_session.flush()

    session_request = create_completed_session_request(
        db_session,
        student=student,
        counsellor=counsellor,
    )
    submit_session_rating(
        db_session,
        student.id,
        session_request.id,
        schemas.SessionRatingCreate(stars=4, comment="Helpful"),
    )

    ratings = list_admin_ratings(db_session)

    assert len(ratings) >= 1
    item = next(r for r in ratings if r.stars == 4 and r.comment == "Helpful")

    dumped = item.model_dump()
    assert "student_id" not in dumped
    assert not hasattr(item, "student_id")
    assert item.counsellor_name == counsellor.full_name
