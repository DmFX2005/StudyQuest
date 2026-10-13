import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class Calendario {

  constructor(
    private servG: General,
    private http: HttpClient
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // GET /api/calendario/estudiante?from=YYYY-MM-DD&to=YYYY-MM-DD
  getCalendario(from?: string, to?: string) {
    let url = this.servG.baseUrl + 'calendarioestudiantes';

    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<any>(url, { headers: this.getHeaders() });
  }
}
