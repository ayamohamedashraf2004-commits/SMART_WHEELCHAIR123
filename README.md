
# ♿ Smart Wheelchair System - Dashboard & Control
**AI-Powered Navigation and Monitoring Interface**

📝 Project Overview
The **Smart Wheelchair** is an integrated ecosystem designed to bridge the gap between advanced AI and physical mobility. ]It provides a secure, real-time, and autonomous navigation solution for users with disabilities, managed through a high-performance web dashboard

 Core Capabilities
* **Biometric Authentication:** Secure login using Face Recognition with Liveness Detection (Eye Blink verification).
* **Dual-Mode Navigation:** Toggle between Manual control and Autonomous navigation to pre-mapped campus destinations.
* **Real-time Telemetry:** Live streaming of battery levels, velocity, and GPS coordinates via WebSockets.
* **Cloud Synchronized:** Centralized management of user attendance and wheelchair status using Supabase.

 🧱 Project Structure Layers
The system is organized into a modular architecture to ensure scalability and ease of integration with hardware:

 1. Frontend Layer (React & TypeScript)
* **Role:** User interface and camera processing.
* **Key Logic:** Handles client-side face capture, eye blink detection (EAR), and interactive mapping using Leaflet.js.

 2. Backend Layer (FastAPI)
* **Role:** Business logic and AI service orchestration.
* **Key Logic:** Manages the Face Recognition service (dlib-based) and the WebSocket connection manager for live data broadcasting.

 3. Database & Security Layer (Supabase & Fernet)
* **Role:** Persistence and data protection.
* **Key Logic:** Stores encrypted face embeddings using Fernet (AES-128) and manages real-time status tables for wheelchair control.

 4. Hardware Integration Layer (ROS Bridge)
*]**Role:** Physical execution of commands.
* **Key Logic:** Receives target coordinates from the database and streams sensor data back to the dashboard as JSON packets.

 🚀 How to Run

 Prerequisites
* Python 3.10+
* Node.js (for React frontend)
* Supabase Account & Project Keys

 Backend Setup
1.  **Initialize Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
2.  **Install Dependencies:**
    ```bash
    pip install fastapi uvicorn supabase face_recognition opencv-python cryptography
    ```
3.  **Run Server:**
    ```bash
    uvicorn app.main:app --reload
    ```

 Frontend Setup
1.  **Navigate to directory:** `cd frontend`
2.  **Install packages:** `npm install`
3.  **Run development server:** `npm run dev`

🔒 Security Philosophy
* **Zero-Trust Biometrics:** Access is only granted after verifying human liveness through blink detection (EAR < 5.5).
* **Data Masking:** Sensitive face vectors are never stored in raw format; they are serialized and encrypted before reaching the cloud.

---
