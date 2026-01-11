import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. ดึง Token จาก LocalStorage
  const token = localStorage.getItem('racha_token');

  // 2. ถ้ามี Token ให้โคลน Request เดิมแล้วแปะ Header เพิ่ม
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // 3. ถ้าไม่มี Token ก็ส่งไปแบบเดิม (สำหรับหน้า Login)
  return next(req);
};