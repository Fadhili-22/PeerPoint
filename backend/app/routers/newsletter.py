from fastapi import APIRouter, status

from app import schemas

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])


@router.post("/subscribe", response_model=schemas.NewsletterSubscribeResponse, status_code=status.HTTP_201_CREATED)
def subscribe_to_newsletter(payload: schemas.NewsletterSubscribeRequest):
    # TODO: implement
    raise NotImplementedError
