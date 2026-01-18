import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeopleService } from '../../../../core/services/people.service';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './people.component.html',
})
export class PeopleComponent implements OnInit {
  activeTab = 'staff'; // หรือ set default เป็น 'customer' ถ้าไม่ใช่ admin
  currentUser: any = null; // [เพิ่ม] เก็บข้อมูลคน Login

  allUsers: any[] = [];
  allCustomers: any[] = [];
  pagedUsers: any[] = [];
  pagedCustomers: any[] = [];

  pageSize = 10;
  userPageIndex = 0;
  custPageIndex = 0;

  // Modal State
  isModalOpen = false;
  modalType: 'staff' | 'customer' = 'staff';
  isEditMode = false; // [เพิ่ม] บอกสถานะว่ากำลังแก้ไข
  editingId: number | null = null; // [เพิ่ม] เก็บ ID ที่กำลังแก้

  formData: any = {};
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private PeopleService: PeopleService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // ดึงข้อมูลคน Login
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      // ถ้าไม่ใช่ Admin ให้เด้งไป Tab Customer อัตโนมัติ เพราะ Staff ห้ามยุ่งกับ Tab Staff
      if (this.currentUser?.role !== 'admin') {
        this.activeTab = 'customer';
      }
    });
    this.loadData();
  }

  loadData() {
    this.PeopleService.getUsers().subscribe((res) => {
      this.allUsers = res;
      this.updateUserPage(); // โหลดเสร็จสั่งตัดหน้าทันที
    });
    this.PeopleService.getCustomers().subscribe((res) => {
      this.allCustomers = res;
      this.updateCustPage(); // โหลดเสร็จสั่งตัดหน้าทันที
    });
  }

  openModal(type: 'staff' | 'customer', data: any = null) {
    this.modalType = type;
    this.selectedFile = null;
    this.imagePreview = null;

    if (data) {
      // โหมดแก้ไข
      this.isEditMode = true;
      this.editingId = data.id;
      this.formData = { ...data }; // Copy ข้อมูลมาใส่ฟอร์ม
      this.imagePreview = data.image; // โชว์รูปเดิม
      // เคลียร์ password เวลาแก้ไข (ไม่ควรโชว์ hash)
      if (type === 'staff') this.formData.password = '';
    } else {
      // โหมดเพิ่มใหม่
      this.isEditMode = false;
      this.editingId = null;
      this.formData = {};
      if (type === 'staff') this.formData.role = 'staff';
    }

    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // จัดการรูปภาพ
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  // บันทึกข้อมูล
  submitForm() {
    const data = new FormData();
    if (this.formData.name) data.append('name', this.formData.name);
    if (this.selectedFile) data.append('imageFile', this.selectedFile);

    if (this.modalType === 'staff') {
      data.append('role', this.formData.role);
      // ถ้าแก้ไข และไม่ได้กรอกรหัสใหม่ ไม่ต้องส่ง password ไป
      if (this.formData.password)
        data.append('password', this.formData.password);
      if (!this.isEditMode && this.formData.username)
        data.append('username', this.formData.username);

      // เลือก API ว่าจะ Create หรือ Update
      const request = this.isEditMode
        ? this.PeopleService.updateUser(this.editingId!, data)
        : this.PeopleService.createUser(data);

      request.subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
          alert(this.isEditMode ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ');
        },
        error: (err) => alert(err.error?.message || 'Error'),
      });
    } else {
      // Customer
      if (this.formData.phone) data.append('phone', this.formData.phone);
      if (this.formData.line_id) data.append('line_id', this.formData.line_id);
      if (this.formData.id_card) data.append('id_card', this.formData.id_card);

      const request = this.isEditMode
        ? this.PeopleService.updateCustomer(this.editingId!, data)
        : this.PeopleService.createCustomer(data);

      request.subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
          alert(this.isEditMode ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ');
        },
        error: (err) => alert(err.error?.message || 'Error'),
      });
    }
  }
  deleteUser(id: number) {
    if (confirm('ยืนยันการลบ?')) {
      this.PeopleService.deleteUser(id).subscribe(() => this.loadData());
    }
  }
  viewHistory(c: any) {
    this.PeopleService.getCustomerHistory(c.id).subscribe((history) => {
      let msg = `ประวัติการซื้อของ: ${c.name}\nจำนวนครั้งที่ซื้อ: ${history.length} ครั้ง\n\n`;
      history.slice(0, 5).forEach((h: any) => {
        msg += `${new Date(h.created_at).toLocaleDateString('th-TH')} - ${
          h.total_price
        }฿ (${h.items})\n`;
      });
      alert(msg);
    });
  }

  onUserPageChange(e: PageEvent) {
    this.userPageIndex = e.pageIndex;
    this.pageSize = e.pageSize; // แชร์ pageSize ร่วมกันได้ หรือจะแยกก็ได้
    this.updateUserPage();
  }

  updateUserPage() {
    const start = this.userPageIndex * this.pageSize;
    this.pagedUsers = this.allUsers.slice(start, start + this.pageSize);
  }

  // --- Logic ตัดหน้าของ Customer ---
  onCustPageChange(e: PageEvent) {
    this.custPageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.updateCustPage();
  }

  updateCustPage() {
    const start = this.custPageIndex * this.pageSize;
    this.pagedCustomers = this.allCustomers.slice(start, start + this.pageSize);
  }
}
