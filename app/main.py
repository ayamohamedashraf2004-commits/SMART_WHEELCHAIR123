from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import shutil, os
from app.services.user_service import save_face, recognize_face
app = FastAPI()

# ربط مجلد static
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def home():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.post("/register")
async def register(name: str, file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    result = save_face(name, temp_path)
    os.remove(temp_path)
    return result

@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result = recognize_face(temp_path)
    os.remove(temp_path)
    return result