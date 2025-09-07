from fastapi import APIRouter, HTTPException, Response, status, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from . import  oauth2
from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix= "/posts",
    tags= ['Posts']
)



@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(
        db: Session = Depends(get_db),
        current_user : int = Depends(oauth2.get_current_user),
        limit: int = 10,
        skip: int = 0,
        search: Optional[str] = ""):
    # post = db.query(models.Posts).filter(models.Posts.owner_id == current_user.id).all()
    posts = db.query(models.Posts).filter(models.Posts.title.contains(search)).limit(limit).offset(skip).all()
    
    results = db.query(models.Posts).join(models.like, models.like.post_id ==model)

    return posts


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.PostResponse)
def create_post(post: schemas.postCreate, db: Session = Depends(get_db), current_user: schemas.TokenData = Depends(oauth2.get_current_user)):
    new_post = models.Posts(owner_id = current_user.id, **post.dict())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post



@router.get("/{id}", response_model=schemas.PostResponse)
def get_post(id: int, db: Session = Depends(get_db), current_user : int = Depends(oauth2.get_current_user)):
    # post = db.query(models.Posts).filter(models.Posts.owner_id == current_user.id).first()
    post = db.query(models.Posts).filter(models.Posts.id == id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # if post.owner.id != current_user.id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")
    return post


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id: int, db: Session = Depends(get_db), current_user : int = Depends(oauth2.get_current_user)):
    post_query = db.query(models.Posts).filter(models.Posts.id == id)

    post = post_query.first()

    if post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # if post.owner.id != current_user.id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")

    post_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{id}", response_model=schemas.PostResponse)
def update_post(post: schemas.postBased, id: int, db: Session = Depends(get_db), current_user: schemas.TokenData = Depends(oauth2.get_current_user)):
    post_db = db.query(models.Posts).filter(models.Posts.id == id).first()

    if post_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if post_db.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")

    post_db.title = post.title
    post_db.content = post.content
    post_db.published = post.published

    db.commit()
    db.refresh(post_db)
    return post_db




