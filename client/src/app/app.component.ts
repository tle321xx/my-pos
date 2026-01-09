import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router'; // import RouterModule เพื่อใช้ routerLink

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [CommonModule, RouterOutlet, RouterModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // ควบคุมการเลือกเมนู
  currentMenu = 'pos';
}