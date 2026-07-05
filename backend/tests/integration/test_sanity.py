"""End-to-end fixture sanity check — not a business-logic test."""


def test_root_endpoint_returns_200(client):
    # GET / is unauthenticated and defined in app.main.
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "PeerPoint API"}
