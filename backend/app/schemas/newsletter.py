from datetime import datetime

from pydantic import BaseModel, EmailStr


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr


class NewsletterSubscribeResponse(BaseModel):
    email: EmailStr
    subscribed_at: datetime
    active: bool
