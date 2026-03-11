from fastapi import APIRouter, HTTPException
from app.core.config import get_settings
from supabase import create_client

settings = get_settings()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

router = APIRouter(prefix="/navigation", tags=["Navigation & Maps"])

@router.get("/locations")
def get_all_locations():
    """جلب كل الكليات الموجودة في الداتابيز لعرضها في القائمة"""
    response = supabase.table("campus_locations").select("*").execute()
    return response.data

@router.post("/go-to")
def navigate_to_faculty(location_name: str):
    """إرسال أمر للكرسي للذهاب لكلية معينة"""
    # 1. نجيب إحداثيات الكلية
    res = supabase.table("campus_locations").select("*").eq("name", location_name).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Location not found")
    
    dest = res.data[0]

    # 2. نحدث جدول التحكم (Chair Control) بالإحداثيات الجديدة
    # الـ ROS هيراقب الحقول دي ويتحرك فوراً
    supabase.table("chair_control").update({
        "target_mode": "Autonomous",
        "target_x": dest["slam_x"],
        "target_y": dest["slam_y"]
    }).eq("id", 1).execute()

    return {"status": "Success", "navigating_to": location_name, "coords": [dest["slam_x"], dest["slam_y"]]}