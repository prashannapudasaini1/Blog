from fastapi.security.oauth2 import  OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends,status, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, utils
from . import oauth2

router = APIRouter(
    tags = ['AUTH']
    )

@router.post('/login', response_model= schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm  = Depends(), db: Session = Depends(database.get_db)):

    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=("!!! Not found !!!"))

    if not utils.verify(user_credentials.password,user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=("!!! Not FOund"))
    # create token

    access_token = oauth2.create_access_token(data={"user_id": user.id})

    return {"access_token": access_token, "token_type": "bearer"}


