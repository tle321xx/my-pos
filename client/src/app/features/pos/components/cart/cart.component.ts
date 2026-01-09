import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/models/product';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss' // ถ้ายังไม่มีไฟล์ scss ให้สร้างไฟล์เปล่า หรือลบบรรทัดนี้
})
export class CartComponent implements OnInit {
  cartItems: Product[] = [];
  total: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    // ดึงข้อมูลตะกร้าแบบ Real-time
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  // เพิ่มลดจำนวน
  addToCart(item: Product) {
    this.cartService.addToCart(item);
  }

  decreaseItem(item: Product) {
    this.cartService.decreaseItem(item);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  pay() {
    if (this.cartItems.length === 0) return;
    
    this.cartService.checkout().subscribe({
      next: (res) => {
        alert('พิมพ์ใบเสร็จเรียบร้อย / Receipt Printed!');
        this.cartService.clearCart();
      },
      error: (err) => {
        alert('เกิดข้อผิดพลาดในการพิมพ์ / Print Error');
        console.error(err);
      }
    });
  }
}