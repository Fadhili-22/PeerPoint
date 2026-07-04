from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services import newsletter as newsletter_service

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])


@router.post("/subscribe", response_model=schemas.NewsletterSubscribeResponse, status_code=status.HTTP_201_CREATED)
def subscribe_to_newsletter(
    payload: schemas.NewsletterSubscribeRequest,
    db: Session = Depends(get_db),
):
    subscription = newsletter_service.subscribe(db, payload.email)
    return schemas.NewsletterSubscribeResponse(
        email=subscription.email,
        subscribed_at=subscription.subscribed_at,
        active=subscription.active,
    )
