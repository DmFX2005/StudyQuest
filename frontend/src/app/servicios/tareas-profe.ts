import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class TareasProfe {

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

  postAsignarTareaProfesor(objTarea: any) {
    const url = this.servG.baseUrl + 'asignar';
    return this.http.post<any>(url, objTarea, { headers: this.obtenerHeaders() });
  }

  postAsignarTareaAula(objTarea: any) {
    const url = this.servG.baseUrl + 'asignarenaula';
    return this.http.post<any>(url, objTarea, { headers: this.obtenerHeaders() });
  }

  getTareasParaRevisar(estado: string = 'ENTREGADA') {
    let url = this.servG.baseUrl + 'tareaspararevisar';
    if (estado) {
      url += `?estado=${encodeURIComponent(estado)}`;
    }
    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }

  postRevisarTarea(id: number, decision: string, observaciones: string | null = null) {
    const url = this.servG.baseUrl + 'postrevisar/' + id ;
    const body = { decision, observaciones };
    return this.http.post<any>(url, body, { headers: this.obtenerHeaders() });
  }
}
