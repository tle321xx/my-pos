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
  currentUser: any = null; 
  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }

  ngOnInit() {
    // [4] Subscribe เพื่อดูว่าใคร Login อยู่
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  logout() { this.authService.logout(); }
}