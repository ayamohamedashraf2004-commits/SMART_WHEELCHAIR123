from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # ده اللي شايل Hamed, Mariam, Aya
    # غيرنا النوع لـ String عشان يطابق الـ text اللي في الصورة
    face_embedding = Column(String, nullable=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
     