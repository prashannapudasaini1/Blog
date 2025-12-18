from fastapi import APIRouter, Depends ,UploadFile, File , HTTPException , status
from sqlalchemy.orm import Session
from .. import schemas, models, oauth, database
from ..oauth import require_role, create_access_token
from ..database import get_db
from  app.routers.post import require_admin_or_writer 
from app import utils as utils
import shutil
import os

router = APIRouter(prefix="/admin", tags=["Admin"])

# @router.post("/register", response_model=schemas.UserResponse)
# def register_blog_writer(
#     user_data: schemas.UserCreate,
#     db: Session = Depends(database.get_db),
#     admin: models.User = Depends(oauth.require_role(models.Role.admin))
# ):
#     hashed_pw = hash(user_data.password)  # use utils for consistency

#     user = models.User(
#         email=user_data.email,
#         password=hashed_pw,
#         role=models.Role.blog_writer
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user


@router.post("/register", response_model=schemas.UserResponse)
def register_blog_writer(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Only allow 'admin' role if it doesn't exist yet
    if user_data.role == models.Role.admin:
        existing_admin = db.query(models.User).filter(models.User.role == models.Role.admin).first()
        if existing_admin:
            raise HTTPException(status_code=403, detail="Admin already exists. Cannot register another admin.")

    # Check if the email is already registered
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password and create user
    hashed_password = utils.hash(user_data.password)
    new_user = models.User(email=user_data.email, password=hashed_password, role=user_data.role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.delete("/user/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth.get_current_user)  # get logged-in user
):
    # Only admin can delete
    if current_user.role != models.Role.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin is permitted to delete users"
        )

    # Fetch the user to delete
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {"message": f"User with id {user_id} deleted successfully"}


# Upload post photo (Admin & Blog Writer)
@router.post("/posts/{id}/upload-photo")
def upload_post_photo(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin_or_writer)
):
    # Check if post exists
    post = db.query(models.Post).filter(models.Post.id == id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Blog Writer can upload only for their own posts
    if current_user.role == models.Role.blog_writer and post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload photo for this post")

    # Create a folder if it doesn't exist
    upload_dir = "uploads/posts"
    os.makedirs(upload_dir, exist_ok=True)

    # Save file to disk
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save path to database
    post.photo_path = file_path
    db.commit()
    db.refresh(post)

    return {
        "detail": "Photo uploaded successfully",
        "file_path": post.photo_path
    }