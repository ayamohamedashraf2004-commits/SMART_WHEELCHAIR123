from fastapi import APIRouter, HTTPException, Query
from app.services.user_service import live_face_scan, capture_and_register, process_logout
router = APIRouter(prefix="/users", tags=["Users"])

from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool # استيراد المكتبة المهمة
from app.services.user_service import capture_and_register

router = APIRouter()

@router.post("/signup-scan")
async def signup_via_scan(name: str, age: int, phone: str, emergency_contact: str):
    # 1. تجميع البيانات
    user_info = {
        "name": name,
        "age": age,
        "phone": phone,
        "emergency_contact": emergency_contact
    }
    
    try:
        # 2. تشغيل الدالة في Thread منفصل عشان السيرفر ميهنجش والاتصال ميفصلش
        # لاحظي استخدام await و run_in_threadpool
        success = await run_in_threadpool(capture_and_register, user_info)
        
        if success:
            return {"message": f"User {name} registered successfully"}
        else:
            raise HTTPException(status_code=500, detail="Registration failed or cancelled")
            
    except Exception as e:
        print(f"Error during scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
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

@router.post("/logout")
def logout(user_id: int):
    success = process_logout(user_id)
    if success:
        return {"message": "Logged out successfully"}
    else:
        raise HTTPException(status_code=500, detail="Logout failed")