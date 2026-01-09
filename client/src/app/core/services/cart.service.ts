import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  // BehaviorSubject เก็บ state ของตะกร้า
  private _cartItems = new BehaviorSubject<Product[]>([]);
  cartItems$ = this._cartItems.asObservable();

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ดึงสินค้าจาก Backend
  getProducts() {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  addToCart(product: Product) {
    const currentItems = this._cartItems.getValue();
    const foundItem = currentItems.find(p => p.id === product.id);

    if (foundItem) {
      foundItem.quantity = (foundItem.quantity || 1) + 1;
    } else {
      currentItems.push({ ...product, quantity: 1 });
    }
    
    this._cartItems.next([...currentItems]); // Update state
  }

  getTotal(): number {
    return this._cartItems.getValue().reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  }

  checkout() {
    const orderData = {
      items: this._cartItems.getValue(),
      total: this.getTotal()
    };
    // ยิงไปหา Node.js เพื่อสั่งพิมพ์
    return this.http.post(`${this.apiUrl}/order`, orderData);
  }

  clearCart() {
    this._cartItems.next([]);
  }
  decreaseItem(product: Product) {
    const currentItems = this._cartItems.getValue();
    const foundItem = currentItems.find(p => p.id === product.id);

    if (foundItem) {
      foundItem.quantity = (foundItem.quantity || 1) - 1;
      
      // ถ้าเหลือ 0 ให้ลบออกจากตะกร้า
      if (foundItem.quantity === 0) {
        this.removeItem(product);
        return; 
      }
    }
    
    this._cartItems.next([...currentItems]);
  }

  // เพิ่มฟังก์ชันลบรายการทิ้งทันที
  removeItem(product: Product) {
    const currentItems = this._cartItems.getValue();
    const updatedItems = currentItems.filter(p => p.id !== product.id); // กรองเอาตัวที่จะลบออกไป
    this._cartItems.next(updatedItems);
  }
}