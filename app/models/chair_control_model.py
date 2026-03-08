from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from sqlalchemy.sql import func

class ChairControl(Base):
    __tablename__ = "chair_control"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. وضع القيادة (ده اللي عمر هيغيره من الداشبورد)
    driving_mode = Column(String, default="Manual") # "Manual" or "Autonomous"
    
    # 2. نبضات القلب (دي فايدتها الـ System Check OK)
    last_ping = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())