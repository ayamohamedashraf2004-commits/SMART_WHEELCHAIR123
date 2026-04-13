
# ♿ Smart Wheelchair System - Dashboard & Control
**AI-Powered Navigation and Monitoring Interface**

📝 Project Overview
[cite_start]The **Smart Wheelchair** is an integrated ecosystem designed to bridge the gap between advanced AI and physical mobility[cite: 3]. [cite_start]It provides a secure, real-time, and autonomous navigation solution for users with disabilities, managed through a high-performance web dashboard[cite: 4].

 Core Capabilities
* [cite_start]**Biometric Authentication:** Secure login using Face Recognition with Liveness Detection (Eye Blink verification)[cite: 4, 18].
* [cite_start]**Dual-Mode Navigation:** Toggle between Manual control and Autonomous navigation to pre-mapped campus destinations[cite: 4].
* [cite_start]**Real-time Telemetry:** Live streaming of battery levels, velocity, and GPS coordinates via WebSockets[cite: 4, 17].
* [cite_start]**Cloud Synchronized:** Centralized management of user attendance and wheelchair status using Supabase[cite: 6, 10].

 🧱 Project Structure Layers
[cite_start]The system is organized into a modular architecture to ensure scalability and ease of integration with hardware[cite: 6, 8]:

 1. Frontend Layer (React & TypeScript)
* [cite_start]**Role:** User interface and camera processing[cite: 5, 25].
* [cite_start]**Key Logic:** Handles client-side face capture, eye blink detection (EAR), and interactive mapping using Leaflet.js[cite: 20, 31].

 2. Backend Layer (FastAPI)
* [cite_start]**Role:** Business logic and AI service orchestration[cite: 5, 11].
* [cite_start]**Key Logic:** Manages the Face Recognition service (dlib-based) and the WebSocket connection manager for live data broadcasting[cite: 16, 17].

 3. Database & Security Layer (Supabase & Fernet)
* [cite_start]**Role:** Persistence and data protection[cite: 6, 15].
* [cite_start]**Key Logic:** Stores encrypted face embeddings using Fernet (AES-128) and manages real-time status tables for wheelchair control[cite: 15, 24].

 4. Hardware Integration Layer (ROS Bridge)
* [cite_start]**Role:** Physical execution of commands[cite: 7].
* [cite_start]**Key Logic:** Receives target coordinates from the database and streams sensor data back to the dashboard as JSON packets[cite: 7, 39].

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
* [cite_start]**Zero-Trust Biometrics:** Access is only granted after verifying human liveness through blink detection (EAR < 5.5)[cite: 20].
* [cite_start]**Data Masking:** Sensitive face vectors are never stored in raw format; they are serialized and encrypted before reaching the cloud[cite: 24, 40].

---
