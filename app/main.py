from fastapi import FastAPI
from app.routers import user_router  # تأكدي من المسار الكامل لضمان العمل مع uvicorn

app = FastAPI(
    title="Face Recognition Attendance System",
    description="نظام التعرف على الوجه المرتبط بقاعدة بيانات Supabase",
    version="1.0.0"
)

# ربط الراوتر الخاص بالمستخدمين (الذي يحتوي الآن على مسار تشغيل الكاميرا)
app.include_router(user_router.router)

@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Welcome to the Graduation Project API",
        "status": "Running",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    # تشغيل السيرفر محلياً
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)