from fastapi import APIRouter, HTTPException, Query
from app.services.user_service import live_face_scan, capture_and_register, face_scan_signout

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/signup-scan")
def signup_via_scan(
    name: str = Query(..., description="الاسم بالكامل"),
    age: int = Query(..., description="السن"),
    phone: str = Query(..., description="رقم التليفون"),
    emergency_contact: str = Query(..., description="رقم الطوارئ")
):
    """
    يفتح الكاميرا لتسجيل مستخدم جديد ببياناته الكاملة.
    يجب رمش العين (Blink) لتفعيل زر الحفظ 's'.
    """
    # تجميع البيانات في قاموس واحد لبعتها للـ Service
    user_info = {
        "name": name,
        "age": age,
        "phone": phone,
        "emergency_contact": emergency_contact
    }
    
    # نداء الدالة المعدلة في الـ Service
    success = capture_and_register(user_info)
    
    if success:
        return {
            "status": "success", 
            "message": f"User {name} registered with full details and liveness verification."
        }
        
    raise HTTPException(status_code=400, detail="Registration failed. Liveness not verified or cancelled.")

# دالات الـ Login والـ Signout زي ما هي تمام لأنها بتعتمد على بصمة الوجه فقط

@router.get("/login")
def login_user_face():
    """
    يفتح الكاميرا لتسجيل الدخول (Attendance: Present).
    ملاحظة: النظام لن يسجل الدخول إلا بعد التأكد من رمش العين.
    """
    try:
        user_name = live_face_scan()
        if user_name:
            return {"status": "success", "message": f"Welcome {user_name}, attendance recorded."}
        return {"status": "failed", "message": "Login failed: User not recognized or liveness not verified."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

@router.get("/signout")
def signout_user_face():
    """
    يفتح الكاميرا لتسجيل الانصراف (Attendance: Signed Out).
    ملاحظة: يتطلب رمش العين للتحقق من الهوية الحقيقية.
    """
    try:
        user_name = face_scan_signout()
        if user_name:
            return {"status": "success", "message": f"Goodbye {user_name}, sign-out recorded."}
        return {"status": "failed", "message": "Sign-out failed: User not recognized or liveness not verified."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))