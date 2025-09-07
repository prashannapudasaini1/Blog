from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from  pydantic.types import conint


class postBased(BaseModel):
    title: str
    content: str
    published: bool = False
    create_time: Optional[datetime] = None


class postCreate(postBased):
    pass

class UserOut(BaseModel):
    id: int
    email: EmailStr
    create_time: datetime

    model_config = {
        "from_attributes": True
    }

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



class UserCreated(BaseModel):
    email: EmailStr
    password: str



class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id : Optional[str] = None
    

class Like(BaseModel):
    post_id: int
    dir: conint(le=1)
    
    