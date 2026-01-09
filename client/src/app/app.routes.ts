import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    //loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./features/pos/pos.component').then(m => m.PosComponent)
  },
  // เพิ่ม Route ใหม่ตรงนี้
  {
    path: 'admin/products',
    loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'admin/dashboard', // เดี๋ยวค่อยสร้างไฟล์นี้ทีหลัง
    redirectTo: 'admin/products' // ชั่วคราว: ให้เด้งไปหน้า products ก่อน
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];