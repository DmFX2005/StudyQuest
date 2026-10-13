import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class TareasHijos {

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
  
  getTareasHijos(filtros?: { hijo_id?: number | null; estado?: string | null; origen?: string | null }) {
    let url = this.servG.baseUrl + 'tareahijos';

    const params: string[] = [];
    if (filtros?.hijo_id) {
      params.push(`hijo_id=${filtros.hijo_id}`);
    }
    if (filtros?.estado) {
      params.push(`estado=${encodeURIComponent(filtros.estado)}`);
    }
    if (filtros?.origen) {
      params.push(`origen=${encodeURIComponent(filtros.origen)}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }

  entregarTareaHijo(tareaId: number, notas: string | null = null) {
    const url = this.servG.baseUrl + `entregar-padre/${tareaId}`;
    const body = { notas };
    return this.http.post<any>(url, body, { headers: this.obtenerHeaders() });
  }
}
