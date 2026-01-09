import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/product';
import { CartService } from '../../../../core/services/cart.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  
  // ตัวแปรบอกว่า Tab ไหน Active อยู่ (เริ่มต้นที่ All)
  activeCategory: string = 'all'; 

cartItemsMap: Map<number, number> = new Map(); // เก็บ id -> quantity

  constructor(private cartService: CartService) {}

  ngOnInit() {
    // 1. โหลดสินค้าทั้งหมด
    this.cartService.getProducts().subscribe(data => {
      this.allProducts = data.filter(p => p.active === true);
      this.selectCategory('all');
    });

    // 2. Subscribe ตะกร้า เพื่ออัปเดตตัวเลขในการ์ดแบบ Real-time
    this.cartService.cartItems$.subscribe(items => {
      // แปลง Array ตะกร้า เป็น Map เพื่อให้ค้นหาจำนวนได้เร็วๆ
      this.cartItemsMap.clear();
      items.forEach(item => {
        this.cartItemsMap.set(item.id, item.quantity || 0);
      });
    });
  }

  // Helper function เพื่อดึงจำนวนสินค้า
  getQuantity(productId: number): number {
    return this.cartItemsMap.get(productId) || 0;
  }

  // รับ Event จากการ์ดลูก
  onAddItem(p: Product) {
    this.cartService.addToCart(p);
  }

  onRemoveItem(p: Product) {
    this.cartService.decreaseItem(p);
  }

  addToCart(p: Product) {
    this.cartService.addToCart(p);
  }

  // ฟังก์ชันเปลี่ยน Tab
  selectCategory(category: string) {
    this.activeCategory = category;

    // Logic การกรองสินค้า
    if (category === 'all') {
      this.filteredProducts = this.allProducts;
    } 
    else if (['Indica', 'Sativa', 'Hybrid'].includes(category)) {
      this.filteredProducts = this.allProducts.filter(p => p.strain === category);
    } 
    else if (category === '3g100') {
      this.filteredProducts = this.allProducts.filter(p => p.tags?.includes('3g100'));
    } 
    else if (category === 'instrument') {
      this.filteredProducts = this.allProducts.filter(p => p.category === 'instrument');
    }
  }
}