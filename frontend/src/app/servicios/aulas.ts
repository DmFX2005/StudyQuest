import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class Aulas {

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

  getAulasProfesor() {
    const url = this.servG.baseUrl + 'aulasprofesor';
    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }

  postAula(objAula: any) {
    const url = this.servG.baseUrl + 'postaula';
    return this.http.post<any>(url, objAula, { headers: this.obtenerHeaders() });
  }

  putAula(id: number, objAula: any) {
    const url = this.servG.baseUrl + 'putaula/' + id;
    return this.http.put<any>(url, objAula, { headers: this.obtenerHeaders() });
  }

  getEstudiantesDeAula(aulaId: number) {
    const url = this.servG.baseUrl + 'estudiantesaulas/' + aulaId ;
    return this.http.get<any>(url, { headers: this.obtenerHeaders() });
  }

  agregarEstudianteAula(aulaId: number, estudianteId: number) {
    const url = this.servG.baseUrl + 'postestudiantesaulas/' + aulaId ;
    const body = { estudiante_id: estudianteId };
    return this.http.post<any>(url, body, { headers: this.obtenerHeaders() });
  }

  eliminarEstudianteDeAula(aulaId: number, estudianteId: number) {
    const url = this.servG.baseUrl + `deleteestudiantes/${aulaId}/${estudianteId}`;
    return this.http.delete<any>(url, { headers: this.obtenerHeaders() });
  }
}
