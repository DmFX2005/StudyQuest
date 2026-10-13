import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from './general';

@Injectable({
  providedIn: 'root'
})
export class Menu {

  constructor(
    private servG: General,
    private http: HttpClient
  ) {}

  getMenu() {
    const url = this.servG.baseUrl + 'menu';
    const token = localStorage.getItem('token');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    return this.http.get<any>(url, { headers });
  }
}
