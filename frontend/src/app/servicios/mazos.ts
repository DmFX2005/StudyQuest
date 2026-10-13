import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from 'src/app/servicios/general';

@Injectable({
  providedIn: 'root'
})
export class Mazos {

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

  // MAZOS
  getMazos() {
    const url = this.servG.baseUrl + 'flashcards';
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  postMazo(objMazo: any) {
    const url = this.servG.baseUrl + 'postflashcard';
    return this.http.post<any>(url, objMazo, { headers: this.getHeaders() });
  }

  putMazo(id: number, objMazo: any) {
    const url = this.servG.baseUrl + 'putflashcard/' + id;
    return this.http.put<any>(url, objMazo, { headers: this.getHeaders() });
  }

  deleteMazo(id: number) {
    const url = this.servG.baseUrl + 'deleteflashcard/' + id;
    return this.http.delete<any>(url, { headers: this.getHeaders() });
  }

  // TARJETAS
  getTarjetasDeMazo(id: number) {
    const url = this.servG.baseUrl + 'tarjetas/' + id ;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  postTarjeta(id: number, objTarjeta: any) {
    const url = this.servG.baseUrl + 'posttarjeta/' + id ;
    return this.http.post<any>(url, objTarjeta, { headers: this.getHeaders() });
  }

  putTarjeta(id: number, objTarjeta: any) {
    const url = this.servG.baseUrl + 'puttarjeta/' + id;
    return this.http.put<any>(url, objTarjeta, { headers: this.getHeaders() });
  }

  deleteTarjeta(id: number) {
    const url = this.servG.baseUrl + 'deletetarjeta/' + id;
    return this.http.delete<any>(url, { headers: this.getHeaders() });
  }
}
