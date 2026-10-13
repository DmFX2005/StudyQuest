import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class Usuarios {

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

  getMe() {
    const url = this.servG.baseUrl + 'me';
    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }

  updateMyPerfil(objPerfil: any) {
    const url = this.servG.baseUrl + 'putperfil';
    return this.http.put<any>(url, objPerfil, { headers: this.obtenerHeaders() });
  }

  buscarEstudiantes(q: string) {
    const url = this.servG.baseUrl + 'getbuscarestudiantes?q=' + encodeURIComponent(q);
    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }

}
