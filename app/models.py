# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, TIMESTAMP, text
from sqlalchemy.orm import relationship
from .database import Base
import enum

class Role(str, enum.Enum):
    admin = "admin"
    blog_writer = "blog_writer"
    viewer = "viewer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, server_default="viewer")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)

    posts = relationship("Post", back_populates="owner", cascade="all, delete-orphan", passive_deletes=True)
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    published = Column(Boolean, nullable=False, server_default="true")
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)
    photo_path = Column(String, nullable=True)

    owner = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan", passive_deletes=True)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)

    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")

class Vote(Base):
    __tablename__ = "votes"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)

    user = relationship("User")
    post = relationship("Post")


