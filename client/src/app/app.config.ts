import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // [เพิ่ม] withInterceptors
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // 1. เพิ่มบรรทัดนี้
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // [เพิ่ม] นำเข้าไฟล์ที่เพิ่งสร้าง
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // [แก้ไข] บรรทัดนี้สำคัญมาก! บอกให้ Angular ใช้ Interceptor
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync() ,
    
    // 2. เพิ่มบรรทัดนี้ เพื่อลงทะเบียน Chart.js
    provideCharts(withDefaultRegisterables())
  ]
};