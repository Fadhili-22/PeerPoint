from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.enums import ResourceCategory, ResourceStatus, ReviewDecision


class ResourceSubmittedBy(BaseModel):
    id: int
    full_name: str
    email: EmailStr


class ResourceBase(BaseModel):
    title: str
    category: ResourceCategory
    description: str
    read_time: str
    author: str
    author_role: str
    image: str
    image_alt: str
    body: list[str]


class ResourceCreate(ResourceBase):
    publish: bool | None = None


class ResourceUpdate(ResourceBase):
    pass


class ResourceResponse(BaseModel):
    id: str
    slug: str
    title: str
    category: ResourceCategory
    description: str
    read_time: str
    author: str
    author_role: str
    image: str
    image_alt: str
    body: list[str]
    status: ResourceStatus
    featured: bool
    featured_order: int | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    last_edited_by: str | None
    submitted_by: ResourceSubmittedBy | None
    submitted_at: datetime | None
    reviewed_by: str | None
    reviewed_at: datetime | None
    rejection_reason: str | None
    views: int
    saves: int


class ResourceListResponse(BaseModel):
    resources: list[ResourceResponse]


class ResourceFeatureRequest(BaseModel):
    featured: bool
    featured_order: int | None = None


class ResourceReviewRequest(BaseModel):
    decision: ReviewDecision
    rejection_reason: str | None = None


class ResourceStatsResponse(BaseModel):
    total: int
    published: int
    drafts: int
    pending_review: int
    featured: int
    archived: int


class ResourceActionResponse(BaseModel):
    id: str
    status: ResourceStatus
    message: str


class ResourceViewResponse(BaseModel):
    id: str
    views: int
