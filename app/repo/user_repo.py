from sqlalchemy.orm import Session
from app.models.user_model import User, Attendance

# 1. دالة لجلب مستخدم معين بالاسم (مفيدة للتأكد من وجود الشخص)
def get_user_by_name(db: Session, name: str):
    return db.query(User).filter(User.name == name).first()

# 2. دالة لجلب كل سجلات الحضور (عشان لو حابة تعرضي تقرير للجنة)
def get_all_attendance(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Attendance).offset(skip).limit(limit).all()

# 3. دالة لحذف مستخدم (لو حابة تمسحي حد سجل غلط)
def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False