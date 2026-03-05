import cv2
import mediapipe as mp
import numpy as np
from supabase import create_client
import os
from dotenv import load_dotenv

# 1. تحميل الإعدادات وتأكيد المسار
load_dotenv() 

# 2. سحب القيم مع استخدام .strip() لمسح أي مسافات زيادة (مهم جداً!)
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

# 3. حل بديل لو الـ .env مقرأش (حطي الرابط والمفتاح بتوعك هنا مباشرة للتجربة)
if not SUPABASE_URL or "https" not in SUPABASE_URL:
    SUPABASE_URL = "https://jqlczjccjkzxqobmiykd.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGN6amNjamt6eHFvYm1peWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjMzMzcsImV4cCI6MjA4ODEzOTMzN30.-O3GBags3Q-R-_zMgHIMdESqZwDu1NT1jslg5aDoZZA" # المفتاح الطويل بتاعك

# 4. محاولة الاتصال مع صيد الخطأ لو الرابط لسه فيه مشكلة
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"نقطة الفشل هنا: {e}")
# حل مشكلة MediaPipe: استدعاء الحلول بطريقة مباشرة
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1)

def get_face_embedding(image_path):
    """تحويل صورة الوجه لـ embedding"""
    image = cv2.imread(image_path)
    if image is None:
        return None
        
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(image_rgb)

    if not results.multi_face_landmarks:
        return None

    face_landmarks = results.multi_face_landmarks[0]
    embedding = []
    # تقليل عدد النقاط لزيادة السرعة ودقة المقارنة
    for lm in face_landmarks.landmark:
        embedding.extend([lm.x, lm.y])
    return np.array(embedding)

def save_face(name, image_path):
    embedding = get_face_embedding(image_path)
    if embedding is None:
        return {"error": "ما فيش وجه في الصورة"}

    # تأكدي إن اسم الجدول في Supabase هو 'faces'
    try:
        supabase.table("faces").insert({
            "name": name,
            "face_embedding": embedding.tolist()
        }).execute()
        return {"success": True, "message": f"تم حفظ وجه {name}"}
    except Exception as e:
        return {"error": str(e)}

def recognize_face(image_path):
    embedding = get_face_embedding(image_path)
    if embedding is None:
        return {"matched": False, "error": "ما فيش وجه في الصورة"}

    try:
        response = supabase.table("faces").select("name, face_embedding").execute()
        faces_data = response.data

        for face in faces_data:
            stored_embedding = np.array(face["face_embedding"])
            # حساب المسافة الإقليدية بين الوجهين
            distance = np.linalg.norm(stored_embedding - embedding)
            
            # الـ threshold (0.4 لـ 0.6) أفضل مع Face Mesh
            if distance < 0.5:  
                return {"matched": True, "name": face["name"], "distance": float(distance)}

        return {"matched": False, "message": "Try Again"}
    except Exception as e:
        return {"error": str(e)}