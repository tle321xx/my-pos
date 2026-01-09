// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router'; // 1. import นี้
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes'; // 2. import routes ที่เพิ่งสร้าง

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // 3. ใส่เข้าไปตรงนี้
    provideHttpClient()
  ]
};