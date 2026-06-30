from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    admin,
    admin_reports,
    admin_resources,
    auth,
    counsellor_availability,
    counsellor_profile,
    counsellor_resources,
    counsellor_sessions,
    counsellors,
    media,
    newsletter,
    public,
    resources,
    session_requests,
    student_sessions,
    users,
)

app = FastAPI(title="PeerPoint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    # Vite may hop to 5174+ if 5173 is busy; allow local dev ports on loopback.
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):517[0-9]+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(public.router)
app.include_router(counsellors.router)
app.include_router(session_requests.router)
app.include_router(counsellor_sessions.router)
app.include_router(student_sessions.router)
app.include_router(counsellor_availability.router)
app.include_router(counsellor_profile.router)
app.include_router(resources.router)
app.include_router(counsellor_resources.router)
app.include_router(admin_resources.router)
app.include_router(admin.router)
app.include_router(admin_reports.router)
app.include_router(newsletter.router)
app.include_router(media.router)


@app.get("/")
async def root():
    return {"message": "PeerPoint API"}
