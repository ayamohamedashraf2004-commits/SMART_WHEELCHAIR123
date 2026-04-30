
---

# ♿ Smart Wheelchair System: Dashboard & Control

### AI-Powered Navigation and Monitoring Interface
The **Smart Wheelchair** is an integrated ecosystem designed to bridge the gap between advanced AI and physical mobility. It provides a secure, real-time, and autonomous navigation solution for users with disabilities, managed through a high-performance web dashboard.

## 🌟 Core Capabilities

| Feature | Description |
| :--- | :--- |
| **Biometric Authentication** | Secure login using **Face Recognition** with **Liveness Detection** (____________). |
| **Dual-Mode Navigation** | Toggle between **Manual control** and **Autonomous navigation** to pre-mapped destinations. |
| **Real-time Telemetry** | Live streaming of battery levels, velocity, and GPS coordinates via **WebSockets**. |
| **Cloud Synchronized** | Centralized management of user attendance and status using **Supabase**. |

## 🧱 Project Architecture
The system is organized into a modular architecture to ensure scalability and seamless hardware integration:

### 🎨 Frontend Layer (React & TypeScript)
* **Role:** User interface and camera processing.
* **Key Logic:** Client-side face capture, **Eye Aspect Ratio (EAR)** calculation for blink detection, and interactive mapping using **Leaflet.js**.

### ⚙️ Backend Layer (FastAPI)
* **Role:** Business logic and AI service orchestration.
* **Key Logic:** **Dlib-based** Face Recognition service and a **WebSocket Manager** for broadcasting live telemetry data.

### 🔐 Database & Security (Supabase & Fernet)
* **Role:** Persistence and data protection.
* **Key Logic:** **Encrypted storage** of face embeddings using **Fernet (AES-128)**; real-time database triggers for wheelchair state management.

### 🤖 Hardware Integration (ROS Bridge)
* **Role:** Physical execution and sensor feedback.
* **Key Logic:** Interfaces with **ROS** nodes to receive target coordinates and streams sensor data as JSON packets back to the dashboard.

---

## 🚀 Getting Started

### Prerequisites
* **Python:** 3.10+
* **Node.js:** Latest LTS
* **Cloud:** Active Supabase Project

## 🛠️ Installation & Setup

### 1. Backend Setup (FastAPI)
```bash
# 1. Initialize Environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install Dependencies
pip install -r requirements.txt

# 3. Environment Variables
# Create a .env file in the root directory and add:
# SUPABASE_URL=your_url
# SUPABASE_ANON_KEY=your_key
# SECRET_KEY=your_fernet_key

# 4. Run the Server
uvicorn app.main:app --reload
```

### 2. Frontend Setup (React + Vite)
```bash
# 1. Navigate to frontend
cd frontend

# 2. Install Dependencies
npm install

# 3. Environment Variables
# Create a .env file in /frontend and add:
# VITE_API_URL=http://localhost:8000

# 4. Launch Dashboard
npm run dev
```

---

## 🔒 Security Philosophy
* **Zero-Trust Biometrics:** Access is strictly granted only after verifying human liveness through _________.
* **Data Masking:** Sensitive face vectors are **never** stored in raw format; they are serialized and encrypted before reaching the cloud to ensure user privacy.

---

**Developed as part of the Graduation Project @ Egyptian Russian University.**

---

