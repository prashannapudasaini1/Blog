from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, oauth
from ..database import get_db
from typing import List, Optional

router = APIRouter(tags=['posts'])

# Dependency: Require Admin
def require_admin(user: models.User = Depends(oauth.get_current_user)):
    if user.role != models.Role.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can perform this action"
        )
    return user

# Dependency: Require Admin or Blog Writer
def require_admin_or_writer(user: models.User = Depends(oauth.get_current_user)):
    if user.role not in [models.Role.admin, models.Role.blog_writer]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or blog writer can perform this action"
        )
    return user


# Get all posts
@router.get("/posts", response_model=List[schemas.Post])
def get_posts(db: Session = Depends(get_db), limit: int = 10, skip: int = 0, search: Optional[str] = ""):
    posts = db.query(models.Post).filter(models.Post.title.contains(search)).limit(limit).offset(skip).all()
    return posts


# Create post (Admin & Blog Writer)
@router.post("/posts", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, 
                db: Session = Depends(get_db),
                current_user: models.User = Depends(require_admin_or_writer)):
    new_post = models.Post(owner_id=current_user.id, **post.dict())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


# Update post (Admin & Blog Writer)
@router.put("/posts/{id}")
def update_post(id: int, 
                updated_post: schemas.PostCreate, 
                db: Session = Depends(get_db),
                current_user: models.User = Depends(require_admin_or_writer)):
    post_query = db.query(models.Post).filter(models.Post.id == id)
    post = post_query.first()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {id} not found")

    # If Blog Writer, allow update only for own posts
    if current_user.role == models.Role.blog_writer and post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this post")

    post_query.update(updated_post.dict(), synchronize_session=False)
    db.commit()
    return {"detail": "Post successfully updated"}


# Delete post (Admin only)
@router.delete("/posts/{id}")
def delete_post(id: int, db: Session = Depends(get_db),
                current_user: models.User = Depends(require_admin)):
    post_query = db.query(models.Post).filter(models.Post.id == id)
    post = post_query.first()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id {id} not found")

    post_query.delete(synchronize_session=False)
    db.commit()
    return {"detail": "Post successfully deleted"}
