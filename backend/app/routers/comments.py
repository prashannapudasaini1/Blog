from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, oauth, database

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)

# Create comment (only Viewer can comment)
@router.post("/", response_model=schemas.CommentResponse)
def create_comment(comment: schemas.CommentCreate,post_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth.get_current_user)
):
    # only viewer allowed
    if current_user.role != models.Role.viewer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only viewers can comment"
        )

    # check if post exists
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    new_comment = models.Comment(
        content=comment.text,
        post_id=post_id,
        user_id=current_user.id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return new_comment


# Optional: Get comments for a post
@router.get("/post/{post_id}", response_model=list[schemas.CommentResponse])
def get_comments(post_id: int, db: Session = Depends(database.get_db)):
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).all()
    return comments
