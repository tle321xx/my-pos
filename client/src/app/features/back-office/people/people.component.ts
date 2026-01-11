import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeopleService } from '../../../core/services/people.service';
import { MatPaginator, MatPaginatorModule,PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './people.component.html',
})
export class PeopleComponent implements OnInit {
  activeTab = 'staff';
  users: any[] = [];
  customers: any[] = [];

  // Modal State
  isModalOpen = false;
  modalType: 'staff' | 'customer' = 'staff'; // ตัวบอกว่า Modal นี้แสดงฟอร์มอะไร
  
  // Form Data (ใช้ร่วมกัน)
  formData: any = { };
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  // ข้อมูลดิบทั้งหมด
  allUsers: any[] = [];
  allCustomers: any[] = [];

  // ข้อมูลที่แสดงผล (ตัดหน้ามาแล้ว)
  pagedUsers: any[] = [];
  pagedCustomers: any[] = [];

  // Config Pagination
  pageSize = 5;
  
  // แยก PageIndex ของใครของมัน จะได้ไม่ตีกันเวลาสลับ Tab
  userPageIndex = 0;
  custPageIndex = 0;

  constructor(private PeopleService: PeopleService) {}

  ngOnInit() {
    this.loadData();
  }

loadData() {
    this.PeopleService.getUsers().subscribe(res => {
      this.allUsers = res;
      this.updateUserPage(); // โหลดเสร็จสั่งตัดหน้าทันที
    });
    this.PeopleService.getCustomers().subscribe(res => {
      this.allCustomers = res;
      this.updateCustPage(); // โหลดเสร็จสั่งตัดหน้าทันที
    });
  }

  openModal(type: 'staff' | 'customer') {
    this.modalType = type;
    this.formData = {}; // เคลียร์ค่าเก่า
    this.selectedFile = null;
    this.imagePreview = null;
    
    // ตั้งค่าเริ่มต้น
    if(type === 'staff') this.formData.role = 'staff';
    
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  // จัดการรูปภาพ
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  // บันทึกข้อมูล
  submitForm() {
    const data = new FormData();
    // ใส่ข้อมูลพื้นฐานที่ทั้ง 2 ฝั่งมีเหมือนกัน (ถ้ามี)
    if(this.formData.name) data.append('name', this.formData.name);
    if(this.selectedFile) data.append('imageFile', this.selectedFile);

    if (this.modalType === 'staff') {
      data.append('username', this.formData.username);
      data.append('password', this.formData.password);
      data.append('role', this.formData.role);

this.PeopleService.createUser(data).subscribe({
        next: () => {
          this.closeModal(); 
          this.loadData(); 
          alert('เพิ่มพนักงานสำเร็จ');
        },
        error: (err) => {
          // ดึงข้อความจาก Backend มาแสดง
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
        }
      });

    } else {
      // Customer Fields
      if(this.formData.phone) data.append('phone', this.formData.phone);
      if(this.formData.line_id) data.append('line_id', this.formData.line_id);
      if(this.formData.id_card) data.append('id_card', this.formData.id_card);

      this.PeopleService.createCustomer(data).subscribe({
      next: () => {
        this.closeModal();
        this.loadData();
        alert('✅ เพิ่มสมาชิกเรียบร้อย');
      },
      error: (err) => {
        // เผื่ออนาคตเราทำ Unique เบอร์โทรศัพท์
        if (err.error && err.error.message && err.error.message.includes('UNIQUE')) {
           alert('❌ ข้อมูลซ้ำในระบบ (อาจเป็นเบอร์โทรหรือรหัสบัตร)');
        } else {
           alert('❌ เกิดข้อผิดพลาด: ' + (err.error?.message || 'บันทึกไม่สำเร็จ'));
        }
      }
    });
    }
  }
  deleteUser(id: number) { 
    if(confirm('ยืนยันลบพนักงาน?')) this.PeopleService.deleteUser(id).subscribe(() => this.loadData());
  }
  viewHistory(c: any) { 
    this.PeopleService.getCustomerHistory(c.id).subscribe(history => {
      let msg = `ประวัติการซื้อของ: ${c.name}\nจำนวนครั้งที่ซื้อ: ${history.length} ครั้ง\n\n`;
      history.slice(0, 5).forEach((h:any) => {
         msg += `${new Date(h.created_at).toLocaleDateString('th-TH')} - ${h.total_price}฿ (${h.items})\n`;
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