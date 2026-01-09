import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() quantity: number = 0; // รับจำนวนที่มีในตะกร้ามาโชว์

  // แยก Event การกดบวกและลบ
  @Output() add = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<Product>();

  onAdd(e: Event) {
    e.stopPropagation(); // กันไม่ให้ไป Trigger Event อื่น
    this.add.emit(this.product);
  }

  onRemove(e: Event) {
    e.stopPropagation();
    this.remove.emit(this.product);
  }
}