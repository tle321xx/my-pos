import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { OrderDetailModalComponent } from '../../components/order-detail-modal/order-detail-modal.component';

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

  stats: any = {};
  recentOrders: any[] = [];

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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
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
    // 1. อัปเดตกราฟเส้น
    this.lineChartData.datasets[0].data = apiData.hourlySales;

    // 2. อัปเดตกราฟโดนัท
    // สมมติ apiData.categorySales = [{category: 'weed', total: 500}, {category: 'gear', total: 200}]
    const labels: string[] = [];
    const data: number[] = [];

    if (apiData.categorySales && apiData.categorySales.length > 0) {
        apiData.categorySales.forEach((item: any) => {
          labels.push(item.category.toUpperCase()); // ชื่อหมวดหมู่
          data.push(item.total);                    // ยอดขาย
        });
    } else {
        // กรณีวันนี้ยังขายไม่ได้เลย ให้ใส่ข้อมูลว่างๆ ไปก่อน กราฟจะได้ไม่พัง
        labels.push('No Sales');
        data.push(1);
    }

    this.doughnutChartData.labels = labels;
    this.doughnutChartData.datasets[0].data = data;

    // สั่งให้กราฟวาดใหม่
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
}