import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api';
  
  // ใช้ Subject เพื่อให้ Component อื่นๆ รู้ว่าข้อมูลเปลี่ยนแล้ว (เช่น POS ต้องรู้ว่าเมนูเปลี่ยน)
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  // โหลดข้อมูลจาก Server
  loadProducts() {
    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe(data => {
      this.productsSubject.next(data);
    });
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  addProduct(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, data).pipe(
      map(res => {
        this.loadProducts(); // โหลดข้อมูลใหม่ทันที
        return res;
      })
    );
  }

  // แก้ไขสินค้า (รวมถึงการ Toggle Active)
updateProduct(id: number, data: FormData | Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, data).pipe(
      map(res => {
        this.loadProducts();
        return res;
      })
    );
  }

  // ลบสินค้า
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`).pipe(
      map(res => {
        this.loadProducts(); // โหลดข้อมูลใหม่ทันทีหลังลบเสร็จ
        return res;
      })
    );
  }
}