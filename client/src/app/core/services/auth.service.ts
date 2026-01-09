// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'racha_token';
  private userKey = 'racha_user';

  // State เก็บข้อมูล User ปัจจุบัน (เพื่อให้ Component อื่นๆ subscribe ดูได้)
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // ตอนเปิดเว็บขึ้นมา ให้ลองโหลด User จาก LocalStorage (ถ้ามี)
    this.loadUserFromStorage();
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.success) {
          // 1. เก็บ Token และ User ลงเครื่อง
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          
          // 2. อัปเดต State ในแอพ
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout() {
    // ลบทุกอย่างออก
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    
    // เด้งกลับไปหน้า Login
    this.router.navigate(['/login']);
  }

  // Helper: โหลดข้อมูลจาก Storage ตอน Refresh หน้าจอ
  private loadUserFromStorage() {
    const userJson = localStorage.getItem(this.userKey);
    const token = localStorage.getItem(this.tokenKey);
    if (userJson && token) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  // Helper: เช็คว่า Login อยู่ไหม
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Helper: ดึง User ปัจจุบัน
  getCurrentUser() {
    return this.currentUserSubject.value;
  }
}