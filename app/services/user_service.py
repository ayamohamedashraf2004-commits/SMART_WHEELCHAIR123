import face_recognition
import cv2
import numpy as np
from supabase import create_client
from app.core.config import get_settings 

# 1. الإعدادات والاتصال
settings = get_settings()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
fernet = settings.fernet

def get_ear(eye_landmarks):
    """حساب فتحة العين - كل ما الرقم يقل يعني العين بتتقفل"""
    top = np.mean(eye_landmarks[1:3], axis=0)
    bottom = np.mean(eye_landmarks[4:6], axis=0)
    return np.linalg.norm(top - bottom)

def load_registered_users():
    try:
        response = supabase.table("users").select("*").execute()
        users_data = response.data
        registered_users = []
        for user in users_data:
            encrypted = user["face_embedding"]
            encrypted_data = encrypted.encode() if isinstance(encrypted, str) else encrypted
            decrypted_bytes = fernet.decrypt(encrypted_data)
            embedding = np.frombuffer(decrypted_bytes, dtype=np.float64)
            registered_users.append({"name": user["name"], "embedding": embedding})
        print(f"✅ Loaded {len(registered_users)} users.")
        return registered_users
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return []

# --- 1. Registration (Signup) ---
def capture_and_register(name):
    cap = cv2.VideoCapture(0)
    blinked = False
    while True:
        ret, frame = cap.read()
        if not ret: break
        
        landmarks = face_recognition.face_landmarks(frame)
        if landmarks:
            ear = (get_ear(landmarks[0]['left_eye']) + get_ear(landmarks[0]['right_eye'])) / 2
            # لو الرقم نزل تحت 5.5 (تقدري تغيريه لـ 6.0 لو لسه مش بيلقط)
            if ear < 5.5: blinked = True 
            cv2.putText(frame, f"Eye Status: {round(ear, 1)}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

        msg = "REAL USER VERIFIED - Press 's'" if blinked else "PLEASE BLINK TO REGISTER"
        color = (0, 255, 0) if blinked else (0, 0, 255)
        cv2.putText(frame, msg, (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        cv2.imshow("Secure Signup", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('s') and blinked:
            encodings = face_recognition.face_encodings(frame)
            if encodings:
                encrypted_encoding = fernet.encrypt(encodings[0].tobytes()).decode()
                supabase.table("users").insert({"name": name, "face_embedding": encrypted_encoding}).execute()
                cap.release(); cv2.destroyAllWindows(); return True
        elif key == ord('q'): break
    cap.release(); cv2.destroyAllWindows(); return False

# --- 2. Login (Sign-In) ---
def live_face_scan():
    users = load_registered_users()
    cap = cv2.VideoCapture(0)
    liveness_verified = False

    while True:
        ret, frame = cap.read()
        if not ret: break
        
        # كشف الرمش للحيوية
        landmarks = face_recognition.face_landmarks(frame)
        if landmarks:
            ear = (get_ear(landmarks[0]['left_eye']) + get_ear(landmarks[0]['right_eye'])) / 2
            if ear < 5.5: liveness_verified = True
            cv2.putText(frame, f"Eye: {round(ear, 1)}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

        # التعرف على الوجه (فقط لو الشخص حقيقي أو بنحدث الحالة)
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        face_locations = face_recognition.face_locations(small_frame)
        face_encodings = face_recognition.face_encodings(small_frame, face_locations)

        for face_encoding in face_encodings:
            for user in users:
                if face_recognition.compare_faces([user["embedding"]], face_encoding, 0.5)[0]:
                    if liveness_verified:
                        supabase.table("attendance").insert({"user_name": user["name"], "status": "Present"}).execute()
                        print(f"✅ Login Success: {user['name']}")
                        cap.release(); cv2.destroyAllWindows(); return user["name"]

        status = "VERIFIED - LOGGING IN..." if liveness_verified else "BLINK TO LOGIN"
        color = (0, 255, 0) if liveness_verified else (0, 0, 255)
        cv2.putText(frame, status, (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        cv2.imshow("Secure Login", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break
    cap.release(); cv2.destroyAllWindows()

# --- 3. Sign-Out ---
def face_scan_signout():
    users = load_registered_users()
    cap = cv2.VideoCapture(0)
    liveness_verified = False

    while True:
        ret, frame = cap.read()
        if not ret: break
        
        landmarks = face_recognition.face_landmarks(frame)
        if landmarks:
            ear = (get_ear(landmarks[0]['left_eye']) + get_ear(landmarks[0]['right_eye'])) / 2
            if ear < 5.5: liveness_verified = True

        if liveness_verified:
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            face_encodings = face_recognition.face_encodings(small_frame)
            for face_encoding in face_encodings:
                for user in users:
                    if face_recognition.compare_faces([user["embedding"]], face_encoding, 0.5)[0]:
                        supabase.table("attendance").insert({"user_name": user["name"], "status": "Signed Out"}).execute()
                        print(f"👋 Sign-out: {user['name']}")
                        cap.release(); cv2.destroyAllWindows(); return user["name"]

        cv2.putText(frame, "BLINK TO SIGN-OUT", (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
        cv2.imshow("Secure Sign-Out", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break
    cap.release(); cv2.destroyAllWindows()