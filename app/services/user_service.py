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
            try:
                encrypted_data = encrypted.encode() if isinstance(encrypted, str) else encrypted
                decrypted_bytes = fernet.decrypt(encrypted_data)
                embedding = np.frombuffer(decrypted_bytes, dtype=np.float64)
                registered_users.append({
                    "id": user["id"],
                    "name": user["name"],
                    "embedding": embedding
                })
            except Exception as dec_err:
                print(f"⚠️ Error decrypting user {user.get('name')}: {dec_err}")
                continue
        print(f"✅ Loaded {len(registered_users)} users.")
        return registered_users
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return []

# --- 1. Registration (Signup) المعدلة ---
def capture_and_register(user_data):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return False

    blinked = False
    print(f"Starting registration for: {user_data['name']}")

    while True:
        ret, frame = cap.read()
        if not ret: 
            break

        # 1. تحويل الصورة إلى RGB
        # 1. تحويل الصورة
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # 2. البحث عن الـ Landmarks
        face_landmarks_list = face_recognition.face_landmarks(rgb_frame)

        if face_landmarks_list:
            # نأخذ أول وجه يظهر في الكاميرا
            face_marks = face_landmarks_list 
            
            if 'left_eye' in face_marks and 'right_eye' in face_marks:
                left_eye = face_marks['left_eye']
                right_eye = face_marks['right_eye']
                
                # حساب الـ EAR
                current_ear = (get_ear(left_eye) + get_ear(right_eye)) / 2
                
                # السطر ده هيخليكي تشوفي الرقم في الـ Terminal عشان تعرفي المشكلة فين
                print(f"DEBUG: Eye Aspect Ratio: {current_ear:.2f}")

                # جربي رفع الرقم لـ 0.3 إذا كانت الحساسية ضعيفة
                if current_ear < 0.25: 
                    blinked = True
                    print("✅ Blink Detected!")

        # 3. واجهة المستخدم (UI)
        status_color = (0, 255, 0) if blinked else (0, 0, 255)
        status_msg = "READY: Press 'S' to Save" if blinked else "BLINK TO VERIFY"
        
        cv2.putText(frame, status_msg, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
        cv2.imshow("Registration", frame)
        
        key = cv2.waitKey(1) & 0xFF

        # حفظ البيانات عند الضغط على S بشرط حدوث الرمشة (للتأكد أنه إنسان حقيقي)
        if key == ord('s') and blinked:
            encodings = face_recognition.face_encodings(rgb_frame)
            if encodings:
                # تحويل الـ encoding لمصفوفة numpy ثم bytes للتخزين
                encoding_bytes = np.array(encodings).tobytes()
                encrypted_encoding = fernet.encrypt(encoding_bytes).decode()
                
                new_user = {
                    "name": user_data["name"],
                    "age": user_data["age"],
                    "phone": user_data["phone"],
                    "emergency_contact": user_data["emergency_contact"],
                    "face_embedding": encrypted_encoding
                }
                supabase.table("users").insert(new_user).execute()
                print("✅ Saved to database!")
                break 
        
        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return True
# --- 2. Login (تم تعديله ليكون متوافق) ---
def live_face_scan():
    users = load_registered_users()
    cap = cv2.VideoCapture(0)
    liveness_verified = False

    while True:
        ret, frame = cap.read()
        if not ret: break
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        landmarks = face_recognition.face_landmarks(rgb_frame)
        
        if landmarks:
            face_marks = landmarks
            ear = (get_ear(face_marks['left_eye']) + get_ear(face_marks['right_eye'])) / 2
            if ear < 0.25: 
                liveness_verified = True

        if liveness_verified:
            # تصغير الفريم للسرعة
            small_frame = cv2.resize(rgb_frame, (0, 0), fx=0.25, fy=0.25)
            face_encodings = face_recognition.face_encodings(small_frame)
            
            for face_encoding in face_encodings:
                for user in users:
                    # مقارنة
                    matches = face_recognition.compare_faces([user["embedding"]], face_encoding, 0.5)
                    if matches:
                        try:
                            supabase.table("attendance").insert({
                                "user_id": user["id"],
                                "status": "Present"
                            }).execute()
                            print(f"✅ Welcome {user['name']}!")
                            cap.release(); cv2.destroyAllWindows(); return user["name"]
                        except Exception as e:
                            print(f"⚠️ Attendance Error: {e}")

        cv2.imshow("Secure Login", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release(); cv2.destroyAllWindows()
    return None

# ... (باقي دوال التحكم والـ Navigation سيبيهم زي ما هما)

# --- 3. Sign-Out ---
def process_logout(user_id: int):
    """تسجيل خروج المستخدم في الداتابيز بدون كاميرا"""
    try:
        # تسجيل حالة الخروج في جدول الـ attendance
        response = supabase.table("attendance").insert({
            "user_id": user_id,
            "status": "Signed Out"
        }).execute()
        
        if response.data:
            print(f"✅ User {user_id} signed out successfully.")
            return True
        return False
    except Exception as e:
        print(f"❌ Logout Service Error: {e}")
        return False
    #-------chair control functions--------------
def update_chair_target_mode(mode: str):
    """تحديث الوضع المطلوب (Target) من الداشبورد"""
    try:
        # بنعدل الـ target_mode والـ last_ping بيتحث تلقائي في الداتابيز
        response = supabase.table("chair_control")\
            .update({"target_mode": mode})\
            .eq("id", 1)\
            .execute()
        
        if response.data:
            print(f"✅ Target mode set to: {mode}")
            return True
        return False
    except Exception as e:
        print(f"❌ Service Error: {e}")
        return False

def get_chair_status():
    """جلب حالة الكرسي الحالية لمعرفة هل هو أونلاين ولا لا"""
    try:
        response = supabase.table("chair_control").select("*").eq("id", 1).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Service Error: {e}")
        return None
    
    #-------navigation functions--------------
def set_navigation_target(location_name: str):
    """بتاخد اسم الكلية وتحدث إحداثيات الهدف للكرسي"""
    try:
        # 1. نجيب إحداثيات الكلية من جدول المواقع
        loc_res = supabase.table("campus_locations").select("slam_x, slam_y").eq("name", location_name).execute()
        if loc_res.data:
            target = loc_res.data[0]
            # 2. نحدث جدول التحكم عشان الكرسي يعرف هو رايح فين
            supabase.table("chair_control").update({
                "target_x": target["slam_x"],
                "target_y": target["slam_y"],
                "target_mode": "Autonomous" # نحوله آلي تلقائياً
            }).eq("id", 1).execute()
            return True
        return False
    except Exception as e:
        print(f"❌ Nav Service Error: {e}")
        return False    