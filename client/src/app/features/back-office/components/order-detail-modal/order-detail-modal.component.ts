import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail-modal.component.html'
})
export class OrderDetailModalComponent {
  isOpen = false;
  isLoading = false;
  order: any = null;

  @Output() close = new EventEmitter<void>();

  constructor(private orderService: OrderService) {}

  // ฟังก์ชันที่ให้คนอื่นเรียกใช้เพื่อเปิด Modal
  open(orderId: number) {
    this.isOpen = true;
    this.isLoading = true;
    this.order = null; // เคลียร์ค่าเก่า

    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.order = data;
        this.isLoading = false;
      },
      error: (err) => {
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit(); // บอกตัวแม่ว่าปิดแล้ว
  }
}