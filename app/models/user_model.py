from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.core.database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)           # السن
    phone = Column(String, nullable=False)         # التليفون
    emergency_contact = Column(String, nullable=False) # رقم الطوارئ
    face_embedding = Column(String, nullable=False) 
    
    # حقول الداشبورد (الحالة والوقت)
    is_active = Column(Boolean, default=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())