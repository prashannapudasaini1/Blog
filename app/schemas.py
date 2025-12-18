
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from pydantic.types import conint
from .models import Role

# -------------------
# User Schemas
# -------------------

class UserOut(BaseModel):
    id: int
    email: str
    role: Optional[Role] = None

    class Config:
        form_attributes = True

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: Role

    class Config:
        form_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[Role] = None  # Admin sets role automatically

class UserLogin(BaseModel):
    email: str
    password: str

# -------------------
# Token Schemas
# -------------------

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

# -------------------
# Post Schemas
# -------------------

class Post(BaseModel):
    title: str
    content: str
    published: bool = True
    created_at: datetime
    owner_id: int
    owner: UserOut
    vote: Optional[int] = 0
    photo_path: Optional[str] = None 

    class Config:
       from_attributes = True

class postBase(BaseModel):
    title: str
    content: str
    published: bool = True

class PostCreate(postBase):
    pass

class PostResponse(BaseModel):
    title: str
    content: str
    published: bool
    owner_id: int

    class Config:
        from_attributes = True

# -------------------
# Vote Schema
# -------------------

class vote(BaseModel):
    post_id: int
    dir: conint(le=1)

# -------------------
# Comment Schemas
# -------------------

class CommentCreate(BaseModel):
    text: str   # was 'content'

class CommentResponse(BaseModel):
    id: int
    content: str   # was 'content'
    user: UserOut   # was 'user'

    class Config:
        from_attributes = True
