import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { General } from './general';

@Injectable({
  providedIn: 'root'
})
export class Login {

  constructor( private servG: General, private http: HttpClient) {}

  postLogin(data: { email: string; password: string }) {
    const url = `${this.servG.baseUrl}auth/login`;
    console.log('URL login:', url);
    return this.http.post(url, data);
  }
}
