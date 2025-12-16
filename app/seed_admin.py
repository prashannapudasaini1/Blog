from sqlalchemy.orm import Session
from app import models, utils

def seed_admin(db: Session):
    # check if admin already exists
    admin = db.query(models.User).filter(models.User.role == models.Role.admin).first()
    if not admin:
        hashed_pw = utils.hash("admin123")  
        admin_user = models.User(
            email="admin@example.com",
            password=hashed_pw,
            role=models.Role.admin
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print("✅ Admin user seeded:", admin_user.email)
    else:
        print("⚠️ Admin already exists:", admin.email)
