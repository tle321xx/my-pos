// src/app/features/admin/products/products.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator'; // เพิ่ม Paginator
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  
  // ตัวแปรสำหรับ Filter
  activeTab: string = 'all'; // หมวดหมู่ (all, weed, instrument)
  statusFilter: 'active' | 'inactive' | 'all' = 'active'; // สถานะ (active, inactive, all)

  // Modal State
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  editingProduct: Product | null = null;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  pagedProducts: Product[] = []; // ข้อมูลที่จะแสดงผลจริงในหน้าปัจจุบัน (ตัดมาแล้ว)
  pageSize = 10; // จำนวนต่อหน้า
  pageIndex = 0; // หน้าปัจจุบัน (เริ่มที่ 0)
  
  // อ้างอิงถึงตัว Paginator ใน HTML เพื่อสั่ง reset หน้าเวลากรองข้อมูล
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.products$.subscribe(data => {
      this.allProducts = data;
      this.applyFilter(); // เรียกฟังก์ชันกรองเมื่อโหลดข้อมูล
    });
  }

  // ฟังก์ชันเลือกหมวดหมู่ (Tabs)
  filterCategory(category: string) {
    this.activeTab = category;
    this.applyFilter();
  }

  // ฟังก์ชันเลือกสถานะ (Active/Inactive)
  filterStatus(status: 'active' | 'inactive' | 'all') {
    this.statusFilter = status;
    this.applyFilter();
  }

  // *** หัวใจสำคัญ: ฟังก์ชันกรองรวม (รวมทั้งหมวดหมู่และสถานะ) ***
  applyFilter() {
    let result = this.allProducts;

    // 1. กรองตามสถานะ
    if (this.statusFilter === 'active') {
      result = result.filter(p => p.active === true);
    } else if (this.statusFilter === 'inactive') {
      result = result.filter(p => !p.active);
    }
    // ถ้าเป็น 'all' ก็ไม่ต้องกรอง active

    // 2. กรองตามหมวดหมู่
    if (this.activeTab === 'weed') {
      result = result.filter(p => p.category === 'weed');
    } else if (this.activeTab === 'instrument') {
      result = result.filter(p => p.category === 'instrument');
    }

    this.filteredProducts = result;

    // [เพิ่ม] เมื่อกรองข้อมูลเสร็จ ให้รีเซ็ตกลับไปหน้า 1 และตัดข้อมูลใหม่
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage(); 
    this.updatePagedList();
  }

  // [เพิ่ม] ฟังก์ชันรับ Event เมื่อผู้ใช้กดเปลี่ยนหน้า
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedList();
  }

  // [เพิ่ม] ฟังก์ชันตัดข้อมูล (Client-side Pagination)
  updatePagedList() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  toggleActive(product: Product) {
    const updated = { ...product, active: !product.active };
    this.productService.updateProduct(product.id, updated).subscribe({
      next: () => {
        // อัปเดตข้อมูลในอาเรย์และกรองใหม่ทันที
        const index = this.allProducts.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.allProducts[index] = updated;
          this.applyFilter(); 
        }
      }
    });
  }

  // --- Modal Functions ---
  openAddModal() {
    this.isEditMode = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.editingProduct = { 
      id: 0, name: '', price: 0, unit: 'g', weight: 1, 
      category: 'weed', strain: 'Indica', active: true, tags: [] 
    };
    this.isModalOpen = true;
  }

  openEditModal(product: Product) {
    this.isEditMode = true;
    this.selectedFile = null;
    this.imagePreview = product.image || null;
    this.editingProduct = { ...product };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingProduct = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  saveProduct() {
    if (!this.editingProduct) return;

    const formData = new FormData();
    formData.append('name', this.editingProduct.name);
    formData.append('price', this.editingProduct.price.toString());
    formData.append('category', this.editingProduct.category || 'other');
    formData.append('unit', this.editingProduct.unit || 'pcs');
    
    if (this.editingProduct.unit === 'g') {
      formData.append('weight', (this.editingProduct.weight || 0).toString());
    }
    if (this.editingProduct.category === 'weed') {
      formData.append('strain', this.editingProduct.strain || '');
    }

    // เพิ่ม fields ใหม่
    if (this.editingProduct.thc) formData.append('thc', this.editingProduct.thc.toString());
    if (this.editingProduct.ratio) formData.append('ratio', this.editingProduct.ratio);
    if (this.editingProduct.scent) formData.append('scent', this.editingProduct.scent);

    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile);
    }

    if (this.isEditMode) {
      this.productService.updateProduct(this.editingProduct.id, formData).subscribe(() => {
        this.closeModal();
        alert('แก้ไขข้อมูลเรียบร้อย');
      });
    } else {
      this.productService.addProduct(formData).subscribe({
        next: () => {
          this.closeModal();
          alert('เพิ่มสินค้าเรียบร้อย');
        },
        error: (err:any) => alert('Error: ' + err.message)
      });
    }
  }

  deleteProduct(id: number) {
    if(confirm('ยืนยันการลบ?')) {
      this.productService.deleteProduct(id).subscribe();
    }
  }
}