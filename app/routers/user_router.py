from fastapi import APIRouter
from fastapi import Body
from app.core.config import supabase
import face_recognition
import numpy as np
import base64
import io
from PIL import Image
import json

router = APIRouter()

@router.post("/face-login")
async def face_login(payload: dict = Body(...)):
    image_data = payload.get("image")
    if not image_data:
        return {"message": "No image provided"}

    # تحويل الصورة من base64 لـ PIL image
    header, encoded = image_data.split(",", 1)
    image_bytes = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(image_bytes))
    image = np.array(image)

    try:
        face_encoding = face_recognition.face_encodings(image)[0]
    except IndexError:
        return {"message": "No face detected. Try again."}

    # جلب جميع الـ face_encodings من Supabase
    users = supabase.table("users_faces").select("*").execute().data
    for user in users:
        stored_encoding = np.array(json.loads(user['face_encoding']))
        match = face_recognition.compare_faces([stored_encoding], face_encoding, tolerance=0.5)
        if match[0]:
            return {"message": f"Welcome User {user['user_id']}"}

    return {"message": "Face not recognized. Try again."}