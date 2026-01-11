import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // มี Token -> ผ่านได้
  } else {
    // ไม่มี Token -> ดีดไปหน้า Login
    router.navigate(['/login']);
    return false;
  }
};