from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from sqlalchemy.sql import func
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False) 
    status = Column(String, default="Present") 
    created_at = Column(DateTime(timezone=True), server_default=func.now())