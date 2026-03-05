from sqlalchemy.orm import Session
from app.models.user import User
import numpy as np

def register_face(db: Session, user_id: int, embedding: np.ndarray):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, face_embedding=embedding.tolist())
        db.add(user)
    else:
        user.face_embedding = embedding.tolist()
    db.commit()
    db.refresh(user)
    return user

def face_login(db: Session, embedding: np.ndarray):
    users = db.query(User).all()
    for user in users:
        if user.face_embedding:
            stored = np.array(user.face_embedding)
            if np.linalg.norm(stored - embedding) < 0.6:  # threshold
                return user
    return None