import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service'; // import เพิ่ม

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [CommonModule, RouterOutlet, RouterModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLoggedIn = false;
  currentUser: any = null;

  constructor(private authService: AuthService) {
    // Subscribe ดูสถานะ User แบบ Real-time
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}