import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // --- Staff ---
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
  createUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, formData);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  // --- Customers ---
  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers`);
  }
  createCustomer(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers`, formData);
  }
  getCustomerHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers/${id}/history`);
  }
  updateCustomer(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/${id}`, data);
  }
}
