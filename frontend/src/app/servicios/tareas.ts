import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class Tareas {

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

  getMisTareas(estado?: string) {
    let url = this.servG.baseUrl + 'tareas';
    if (estado) {
      url += `?estado=${estado}`;
    }
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  postTareaPersonal(objTarea: any) {
    const url = this.servG.baseUrl + 'posttarea';
    return this.http.post<any>(url, objTarea, { headers: this.getHeaders() });
  }

  putTareaPersonal(id: number, objTarea: any) {
    const url = this.servG.baseUrl + 'puttarea/' + id;
    return this.http.put<any>(url, objTarea, { headers: this.getHeaders() });
  }

  deleteTareaPersonal(id: number) {
    const url = this.servG.baseUrl + 'deletetarea/' + id;
    return this.http.delete<any>(url, { headers: this.getHeaders() });
  }

  completarTareaPersonal(id: number) {
    const url = this.servG.baseUrl + 'posttarea/' + id + '/completar';
    return this.http.post<any>(url, {}, { headers: this.getHeaders() });
  }

  completarTareaProfesor(id: number) {
    const url = this.servG.baseUrl + 'postentregar/' + id ;
    return this.http.post<any>(url, {}, { headers: this.getHeaders() });
  }
}
