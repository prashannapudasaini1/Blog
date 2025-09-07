from fastapi import APIRouter, HTTPException, Response, status, Depends
from sqlalchemy.orm import Session
from app import schemas, database, models
from . import oauth2

router = APIRouter(
    prefix= "/like",
    tags= ["Like"]
)

@router.post("/", status_code= status.HTTP_201_CREATED)
def like(like: schemas.Like,db: Session = Depends(database.get_db),current_user: int = Depends(oauth2.get_current_user)):  
    
    post = db.query(models.Posts).filter(models.Posts.id == like.post_id).first()
    if not post:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail= "Post with doesn't exist")
    
    
     
    like_query = db.query(models.Like).filter(models.Like.post_id == like.post_id, models.Like.user_id == current_user.id)
    found_like = like_query.first()
    if(like.dir == 1):
        if found_like:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, details = f"user {current_user.id} ahve already like the post")
        new_like = models.Like(post_id = like.post_id, user_id = current_user.id)
        db.add(new_like)
        db.commit()
        return{'message': "Liked"}
    else:
        if not found_like:
            raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail=f"Unliked")
        
        like_query.delete(synchronize_session= False)
        db.commit()
        
        return{'message': "UnLiked"}                


