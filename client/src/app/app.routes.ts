import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. หน้า Login
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login/login.component').then(m => m.LoginComponent)
  },
  
  // 2. หน้า POS (ขายหน้าร้าน) - ไม่ใช้ Sidebar
  {
    path: '',
    loadComponent: () => import('./features/pos/pos.component').then(m => m.PosComponent),
    canActivate: [authGuard]
  },

  // 3. หน้า Admin (หลังบ้าน) - ใช้ Sidebar (MainLayout)
  // เราจะกำหนด path หลักเป็น 'admin' แล้วโหลด Layout มาครอบก่อน
  {
    path: 'admin',
    loadComponent: () => import('./features/back-office/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard], // เช็คสิทธิ์ตั้งแต่เข้า Admin
    children: [
      {
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/back-office/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'people',
        loadComponent: () => import('./features/back-office/pages/people/people.component').then(m => m.PeopleComponent)
      },
      {
        path: 'sales',
        loadComponent: () => import('./features/back-office/pages/sales-history/sales-history.component').then(m => m.SalesHistoryComponent)
      }
    ]
  },

  // กรณีพิมพ์ผิดให้กลับไปหน้าแรก
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];