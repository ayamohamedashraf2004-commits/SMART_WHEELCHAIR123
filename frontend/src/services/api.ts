// 1. تصحيح الـ URL الأساسي (شيلنا /api لأن الباك إند مش بيستخدمها)
const API_URL = import.meta.env.VITE_API_URL|| 'http://localhost:8000';

export interface UserProfile {
  id: number; // غيرناها لـ number لأن سوبابيز بيدي ID رقمي
  name: string;
  age: number;
  phone: string;
  emergency_contact: string;
  status?: string;
  face_embedding?: string; // متخزن كـ string مشفر في الداتابيز
}

export const api = {
  
  // --- تسجيل مستخدم جديد (Signup) ---
  async signup(data: {
    name: string;
    age: number;
    phone: string;
    emergency_contact: string;
  }): Promise<boolean> {
    try {
      // إرسال البيانات كـ Query Parameters زي ما الـ Swagger طالب بالظبط
      const queryParams = new URLSearchParams({
        name: data.name,
        age: data.age.toString(),
        phone: data.phone,
        emergency_contact: data.emergency_contact
      });

      const res = await fetch(`${API_URL}/users/signup-scan?${queryParams}`, {
        method: 'POST',
        headers: { 'accept': 'application/json' }
        // الـ Body هنا فاضي لأن الداتا في اللينك
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'فشل عملية التسجيل');
      }

      return true;
    } catch (error: any) {
      console.error("Signup Error:", error.message);
      throw error;
    }
  },

  // --- تسجيل الدخول بالوجه (Login) ---
  async faceLogin(): Promise<UserProfile> {
    try {
      // إحنا بننادي الـ endpoint اللي بيفتح الكاميرا في الباك إند
      const res = await fetch(`${API_URL}/users/login-scan`, {
        method: 'POST',
        headers: { 'accept': 'application/json' }
      });

      if (res.status === 401) {
        throw new Error('الوجه غير مسجل، برجاء التسجيل أولاً');
      }

      if (!res.ok) {
        throw new Error('فشل تسجيل الدخول بالوجه');
      }

      const data = await res.json();
      
      // حفظ بيانات المستخدم في المتصفح عشان نستخدمها في الداشبورد
      localStorage.setItem('wheelchair_user', JSON.stringify(data));

      return data;
    } catch (error: any) {
      console.error("Login Error:", error.message);
      throw error;
    }
  },

  // --- تسجيل الخروج (Logout) ---
  async signout(): Promise<void> {
    try {
      const user = this.getCurrentUser();
      const userId = user?.id;

      // 1. مسح البيانات محلياً أولاً
      localStorage.removeItem('wheelchair_user');

      // 2. إبلاغ الباك إند بالخروج لو فيه ID
      if (userId) {
        await fetch(`${API_URL}/users/logout?user_id=${userId}`, {
          method: 'POST',
        });
      }
      
      console.log("User logged out successfully");
      // توجيه لصفحة اللوجين
      window.location.href = '/login';
    } catch (error) {
      console.error("Signout Error:", error);
    }
  },

  // --- الحصول على بيانات المستخدم الحالي ---
  getCurrentUser(): UserProfile | null {
    const stored = localStorage.getItem('wheelchair_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      return null;
    }
  }
};