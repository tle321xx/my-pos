// src/app/features/back-office/components/main-layout/main-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // เพิ่ม Router
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  currentUser: any;
  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }
  logout() { this.authService.logout(); }
}