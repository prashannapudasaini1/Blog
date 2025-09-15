from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
from pydantic.types import conint


# Post Schemas

class PostBase(BaseModel):
    title: str
    content: str
    published: bool = False
    create_time: Optional[datetime] = None


class PostCreate(PostBase):
    pass


# User Schemas

class UserOut(BaseModel):
    id: int
    email: EmailStr
    create_time: datetime

    model_config = {
        "from_attributes": True
    }


# Response Schemas

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    published: bool
    owner_id: int
    owner: UserOut

    model_config = {
        "from_attributes": True
    }


# Post + Likes
class PostOut(BaseModel):
    Post: PostResponse
    likes: int

    model_config = {
        "from_attributes": True
    }


# Auth Schemas

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: Optional[str] = None


# Like Schema

class Like(BaseModel):
    post_id: int
    dir: conint(le=1)   # 0 = unlike, 1 = like
