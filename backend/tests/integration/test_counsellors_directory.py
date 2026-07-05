from tests.helpers import (
    create_listed_counsellor,
    create_user,
    grant_student_role,
    login_headers,
)


def test_list_counsellors_filters_by_specialty(client, db_session):
    password = "StudentPass123!"
    student = create_user(
        db_session,
        full_name="Directory Student",
        password=password,
        email_verified=True,
    )
    grant_student_role(db_session, student)

    anxiety_counsellor, _ = create_listed_counsellor(
        db_session,
        full_name="Anxiety Counsellor",
        specialties=["Anxiety"],
    )
    career_counsellor, _ = create_listed_counsellor(
        db_session,
        full_name="Career Counsellor",
        specialties=["Career Guidance"],
    )
    relationships_counsellor, _ = create_listed_counsellor(
        db_session,
        full_name="Relationships Counsellor",
        specialties=["Relationships"],
    )
    db_session.flush()

    headers = login_headers(client, student.email, password)
    response = client.get(
        "/counsellors",
        params={"specialties": "Anxiety"},
        headers=headers,
    )

    assert response.status_code == 200
    counsellors = response.json()["counsellors"]
    returned_ids = {item["id"] for item in counsellors}

    assert anxiety_counsellor.id in returned_ids
    assert career_counsellor.id not in returned_ids
    assert relationships_counsellor.id not in returned_ids

    for item in counsellors:
        assert "Anxiety" in item["specialties"]
