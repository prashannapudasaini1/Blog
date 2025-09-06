from fastapi import FastAPI
from routers import posts, users, auth
from app import models
from app.database import engine


app = FastAPI()

models.Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"Message": "Hell World !!!"}

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(users.router)



9.24.15




