// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styles: [`
    .login-bg {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .brand-header {
      background: #4CAF50;
      padding: 30px;
      text-align: center;
      color: white;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        // Login สำเร็จ -> ไปหน้า POS
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        // แสดงข้อความ Error จาก Server (ถ้ามี)
        this.errorMessage = err.error?.message || 'เข้าสู่ระบบไม่สำเร็จ';
      }
    });
  }
}