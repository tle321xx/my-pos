import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { OrderDetailModalComponent } from '../../components/order-detail-modal/order-detail-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, OrderDetailModalComponent], // เพิ่ม BaseChartDirective
  templateUrl: './dashboard.component.html',
  styles: [`
    .stat-card {
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-5px);
    }
    .icon-box {
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 12px; font-size: 1.5rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  // สั่ง Update กราฟเมื่อข้อมูลเปลี่ยน
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @ViewChild(OrderDetailModalComponent) orderModal!: OrderDetailModalComponent;

  activeTab: string = 'overview';

// ข้อมูล Tab 1 (Monitor)
  stats: any = { sales: 0, bills: 0, products: 0, lowStock: [] };
  recentOrders: any[] = [];
  showLowStockPopup = false;
  
  // ข้อมูล Tab 2 (Report)
  summaryData: any = {
    sales: { today: 0, week: 0, month: 0, allTime: 0 },
    weedDaily: []
  };

  dateLabels = {
    today: '',
    week: '',
    month: '',
    lastMonth: ''
  };

  // --- 1. กราฟเส้น (เตรียมโครงไว้ก่อน) ---
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ],
    datasets: [
      {
        data: [], // รอข้อมูลจริง
        label: 'ยอดขายรายชั่วโมง (บาท)',
        fill: true,
        tension: 0.4,
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.1)'
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false, // ให้ยืดเต็มกล่อง
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true } // ให้แกน Y เริ่มที่ 0 เสมอ
    }
  };

  // --- 2. กราฟโดนัท ---
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [], // รอชื่อหมวดหมู่จริง
    datasets: [{ 
      data: [], // รอยอดขายจริง
      backgroundColor: ['#198754', '#ffc107', '#0dcaf0', '#6c757d'] 
    }]
  };

  constructor(private dashboardService: DashboardService,
    private router: Router) {}

  ngOnInit() {
    this.generateDateLabels();
    this.loadDashboardData();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'report') {
      this.loadSummaryData();
    }
  }

  loadOverviewData() {
    this.dashboardService.getStats().subscribe(data => this.stats = data);
    this.dashboardService.getRecentOrders().subscribe(data => this.recentOrders = data);
    this.dashboardService.getChartData().subscribe(res => this.updateCharts(res));
  }

  loadSummaryData() {
    this.dashboardService.getSummary().subscribe(data => {
      this.summaryData = data;
    });
  }

  loadDashboardData() {
    // โหลด Stats และ Table (ของเดิม)
    this.dashboardService.getStats().subscribe(data => this.stats = data);
    this.dashboardService.getRecentOrders().subscribe(data => this.recentOrders = data);

    // [ใหม่] โหลดข้อมูลกราฟ
    this.dashboardService.getChartData().subscribe(res => {
      this.updateCharts(res);
    });
  }

updateCharts(apiData: any) {
     // ... (Logic เดิมในการอัปเดตกราฟ) ...
     const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
     this.lineChartData.labels = hours;
     this.lineChartData.datasets[0].data = apiData.hourlySales;
     
     const labels: string[] = [];
     const data: number[] = [];
     if(apiData.categorySales) {
        apiData.categorySales.forEach((item:any) => {
            labels.push(item.category ? item.category.toUpperCase() : 'Other');
            data.push(item.total);
        });
     }
     this.doughnutChartData.labels = labels;
     this.doughnutChartData.datasets[0].data = data;
     this.chart?.update();
  }

  openOrderDetails(orderId: string) {
    // orderId ของ recentOrder อาจมาเป็น string 'RW-...' หรือตัวเลข ขึ้นอยู่กับ API 
    // ถ้า API getRecentOrders ส่ง id เป็น receipt_no ให้ระวัง
    // **สำคัญ:** ถ้า Backend ส่งมาแต่ receipt_no แต่ API getOrderById ต้องการ ID (number)
    // คุณอาจจะต้องแก้ getRecentOrders ให้ส่ง id จริงๆ มาด้วย (ผมแก้ให้แล้วในขั้นตอนก่อนหน้าที่ Backend ส่งทั้ง id และ receipt_no)
    
    // แปลงเป็น number (เผื่อไว้)
    const id = Number(orderId); 
    if(id) {
       this.orderModal.open(id);
    } else {
       // กรณีส่งมาเป็น String (RW-xxx) แล้ว Frontend หา ID ไม่เจอ อาจต้องปรับ Backend ให้ส่ง ID คู่มาด้วย
       console.error("Invalid Order ID:", orderId);
    }
  }

  loadStats() {
    this.dashboardService.getStats().subscribe(res => {
      console.log('Dashboard Data:', res);
      this.stats = res;
    });
  }

  navigateToRestock() {
    this.showLowStockPopup = false; // สั่งปิด Popup ให้เรียบร้อยก่อน
    this.router.navigate(['/admin/products']); // สั่งเปลี่ยนหน้า
  }

  navigateToSaleHistory() {
    this.showLowStockPopup = false; // สั่งปิด Popup ให้เรียบร้อยก่อน
    this.router.navigate(['/admin/sales']); // สั่งเปลี่ยนหน้า
  }

  getItemSummary(order: any): string {
    // 1. สร้างข้อความของสินค้าชิ้นแรก
    const qty = order.first_item_qty;
    const unit = order.first_item_unit || 'pcs'; // ถ้าไม่มีหน่วยให้เป็น pcs
    const name = order.first_item_name || 'สินค้าลบแล้ว';
    
    // จัดรูปแบบทศนิยม: ถ้าเป็นกรัม (g) อาจจะมีทศนิยม, ถ้าเป็นชิ้น (pcs) ไม่ควรมี
    const displayQty = unit === 'g' ? Number(qty).toFixed(1) : Math.round(qty);
    
    let summary = `${name} (${displayQty} ${unit})`;

    // 2. ถ้ามีมากกว่า 1 รายการ ให้เติมคำว่า "& อีก X รายการ"
    if (order.item_count > 1) {
      summary += ` <span class="text-muted small">& อีก ${order.item_count - 1} รายการ</span>`;
    }

    return summary;
  }

  generateDateLabels() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }; // เช่น 17 ม.ค.
    const monthOptions: Intl.DateTimeFormatOptions = { month: 'long' }; // เช่น มกราคม
    
    // 1. วันนี้
    this.dateLabels.today = `(${now.toLocaleDateString('th-TH', options)})`;

    // 2. สัปดาห์นี้ (หาวันอาทิตย์ - วันเสาร์)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // ถอยไปวันอาทิตย์
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // บวกไปถึงวันเสาร์

    const startStr = startOfWeek.toLocaleDateString('th-TH', options);
    const endStr = endOfWeek.toLocaleDateString('th-TH', options);
    this.dateLabels.week = `(${startStr} - ${endStr})`;

    // 3. เดือนนี้
    this.dateLabels.month = `(${now.toLocaleDateString('th-TH', monthOptions)})`;
    
    // 4. เดือนที่แล้ว (ชื่อเดือน)
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(now.getMonth() - 1);
    this.dateLabels.lastMonth = `(${lastMonthDate.toLocaleDateString('th-TH', monthOptions)})`;
  }
  
}