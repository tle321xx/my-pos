import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

// Import Component ทั้งหมด
import { ProductsComponent } from '../admin/products/products.component';
import { PeopleComponent } from '../back-office/people/people.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component'; // <--- 1. Import
import { SalesHistoryComponent } from './pages/sales-history/sales-history.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      // 2. ใช้ Component จริงแทน Redirect เดิม
      { path: 'dashboard', component: DashboardComponent }, 
      
      { path: 'products', component: ProductsComponent },
      { path: 'people', component: PeopleComponent },
      { path: 'sales', component: SalesHistoryComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule { }