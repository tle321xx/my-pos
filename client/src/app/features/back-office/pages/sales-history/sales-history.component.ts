import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrderService } from '../../../../core/services/order.service';

interface OrderDetail {
  id: number;
  receipt_no: string;
  created_at: string;
  staff_name: string;
  payment_method: string;
  total_price: number;
  customer_name?: string;  // ข้อมูลลูกค้า (Optional)
  customer_phone?: string;
  items: any[]; // รายการสินค้า
}

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './sales-history.component.html',
  styles: [`
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { background-color: #f8f9fa; }
  `]
})
export class SalesHistoryComponent implements OnInit {
  orders: any[] = [];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0; // Backend รับเป็น 1, Material เริ่ม 0 (ต้อง +1 ตอนส่ง)
  
  // ตัวแปรสำหรับ Sort
  sortBy = 'id';
  sortOrder = 'desc'; // 'asc' หรือ 'desc'

  selectedOrder: OrderDetail | null = null;
  isModalOpen = false;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    // ส่ง pageIndex + 1 เพราะ Backend เริ่มหน้า 1
    this.orderService.getOrders(this.pageIndex + 1, this.pageSize, this.sortBy, this.sortOrder)
      .subscribe(res => {
        this.orders = res.data;
        this.totalItems = res.totalItems;
      });
  }

  // เมื่อกดเปลี่ยนหน้า
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  // เมื่อกดหัวตารางเพื่อ Sort
  sort(column: string) {
    if (this.sortBy === column) {
      // ถ้ากดซ้ำคอลัมน์เดิม ให้สลับ asc/desc
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // ถ้ากดคอลัมน์ใหม่ ให้เริ่มที่ desc
      this.sortBy = column;
      this.sortOrder = 'desc';
    }
    this.loadOrders();
  }
  
  // Helper สำหรับแสดงลูกศร
  getSortIcon(column: string) {
    if (this.sortBy !== column) return 'bi-arrow-down-up text-muted opacity-25';
    return this.sortOrder === 'asc' ? 'bi-arrow-up text-primary' : 'bi-arrow-down text-primary';
  }

  viewOrder(id: number) {
    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.selectedOrder = data;
        this.isModalOpen = true;
      },
      error: (err) => alert('ไม่สามารถดึงข้อมูลได้: ' + err.error?.message)
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }
}