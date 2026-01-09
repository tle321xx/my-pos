import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './components/product-list/product-list.component'; // import component ลูก
import { CartComponent } from './components/cart/cart.component';       // import component ลูก

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, ProductListComponent, CartComponent], // ใส่ใน imports
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent {}