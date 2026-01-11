import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // [แก้ไข 1] ชี้ไปที่ /api เฉยๆ พอครับ
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    // URL จะเป็น: http://localhost:3000/api/dashboard/stats
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }

  getRecentOrders(): Observable<any[]> {
    // [แก้ไข 2] เปลี่ยนจาก orders (พหูพจน์) เป็น order (เอกพจน์) ให้ตรงกับ route ใน server.js
    // URL จะเป็น: http://localhost:3000/api/order/recent
    return this.http.get<any[]>(`${this.apiUrl}/order/recent`);
  }

  getChartData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/charts`);
  }
}