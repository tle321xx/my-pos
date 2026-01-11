import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '', // หน้าแรกคือ POS (เต็มจอ ไม่มี Sidebar Admin)
    loadComponent: () => import('./features/pos/pos.component').then(m => m.PosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin', // โซนหลังบ้าน
    // โหลด Module BackOffice (แบบ Lazy Load)
    loadChildren: () => import('./features/back-office/back-office.module').then(m => m.BackOfficeModule),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];