import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class Hijos {

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

  // GET /api/vinculos/hijos  (ajusta la ruta según la que tengas en tu backend)
  getMisHijos() {
    const url = this.servG.baseUrl + 'mis-hijos';
    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }

  // POST /api/vinculos/padre-hijo  (usar crearVinculoPadreHijo)
  postVinculoHijo(emailHijo: string) {
    const url = this.servG.baseUrl + 'postpadre-hijo';
    const body = { emailHijo };
    return this.http.post<any>(url, body, { headers: this.obtenerHeaders() });
  }
}
