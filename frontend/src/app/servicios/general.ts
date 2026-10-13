import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import{ToastController} from '@ionic/angular/standalone'
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class General {
  public baseUrl=environment.apiUrl;
  // public uploadsURL = 'http://localhost:3000';
  public token:any;
  public usuario:any;

  constructor(private ruoter:Router,private toast: ToastController) { 
    //Al iniciar el servicio, leer lo que haya en localStorage para que asi no se elimine los datos al recargar
    const usuarioLS = localStorage.getItem('usuario');

    if (usuarioLS) {
      try {
        this.usuario = JSON.parse(usuarioLS);
      } catch {
        this.usuario = null;
      }
    }
   }
  
  irPagina(url:any){
   this.ruoter.navigateByUrl(url);
  }
  
  async fun_mensaje(mensaje:string,color:string="success",tiempo:number=1500){
    let t= await this.toast.create({
      message:mensaje,
      duration:tiempo,
      color:color
    });
    t.present();
  }
}
