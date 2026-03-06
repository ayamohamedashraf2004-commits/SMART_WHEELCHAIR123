from fastapi import APIRouter, HTTPException, Query
from app.services.user_service import live_face_scan, capture_and_register, face_scan_signout

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/signup-scan")
def signup_via_scan(name: str = Query(..., description="الاسم المراد تسجيله")):
    """
    يفتح الكاميرا لتسجيل وجه جديد.
    ملاحظة: يجب رمش العين (Blink) لتفعيل زر الحفظ 's'.
    """
    success = capture_and_register(name)
    if success:
        return {"status": "success", "message": f"User {name} registered with liveness verification."}
    raise HTTPException(status_code=400, detail="Registration failed. Liveness not verified or cancelled.")

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