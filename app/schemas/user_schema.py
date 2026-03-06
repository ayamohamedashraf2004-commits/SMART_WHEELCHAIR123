from pydantic import BaseModel
from typing import Optional

# 1. مش محتاجين UserLogin (إيميل وباسورد) لأن الدخول بالوجه
# لكن لو حابة تخلي Schema لإدخال الاسم فقط عند التسجيل:
class UserCreate(BaseModel):
    name: str

# 2. الـ Schema اللي بتظهر بيانات المستخدم (Output)
class UserOut(BaseModel):
    id: int
    name: str # غيرنا email لـ name عشان يطابق جدولك
    # face_embedding مش بنرجعه في الـ Out غالباً للأمان

    class Config:
        from_attributes = True # في الإصدارات الجديدة من Pydantic بنستخدم دي بدل orm_mode