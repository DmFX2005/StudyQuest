import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class Gamificacion {

  constructor(
    private servG: General,
    private http: HttpClient
  ) {}

  private obtenerHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  registrarPomodoro(minutos: number) {
    const url = this.servG.baseUrl + 'postpomodoro';
    const body = { minutos };
    return this.http.post<any>(url, body, { headers: this.obtenerHeaders() });
  }

  obtenerResumen() {
    const url = this.servG.baseUrl + 'resumenpomodoro';
    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }

  obtenerEventos(limit: number = 10) {
    const url = this.servG.baseUrl + `historialpomodoro?limit=${limit}`;
    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }
}
