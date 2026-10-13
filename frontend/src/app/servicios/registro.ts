import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from './general';

@Injectable({
  providedIn: 'root'
})
export class Registro {

  constructor(
    private servG: General,
    private http: HttpClient
  ) {}

  postRegistro(data: any) {
    const url = `${this.servG.baseUrl}auth/register`;
    console.log('URL registro:', url);
    return this.http.post(url, data);
  }
}
