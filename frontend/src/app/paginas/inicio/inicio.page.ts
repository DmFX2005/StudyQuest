import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { General } from 'src/app/servicios/general';
import { Menu } from 'src/app/servicios/menu';
import { Tareas } from 'src/app/servicios/tareas';

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class InicioPage implements OnInit {

  menus: any[] = [];
  cargandoMenu: boolean = false;

  tareasPendientes: any[] = [];
  tareasHoy: any[] = [];
  cargandoTareas: boolean = false;

  constructor(
    public servG: General,
    private servM: Menu,
    private servT: Tareas,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarMenu();
    this.cargarResumenSegunRol();
  }

  ionviewWillEnter() {
    this.cargarResumenSegunRol();
  }

  get nombreUsuario(): string {
    const u = this.servG.usuario;
    return u?.perfil?.nombre || u?.email || 'Explorador';
  }

  get rolPrincipal(): string {
    const u = this.servG.usuario;
    if (u?.roles && u.roles.length > 0) {
      return u.roles[0];
    }
    return '';
  }

  cargarMenu() {
    this.cargandoMenu = true;
    this.servM.getMenu().subscribe({
      next: (respuesta: any) => {
        this.menus = respuesta?.data || [];
        this.cargandoMenu = false;
      },
      error: (err: any) => {
        console.error('Error cargando menú', err);
        this.cargandoMenu = false;
        this.servG.fun_mensaje('No se pudo cargar el menú.', 'danger');
      }
    });
  }

  cargarResumenSegunRol() {
    if (this.rolPrincipal === 'ESTUDIANTE') {
      this.cargarTareasPendientes();
    }
  }

  cargarTareasPendientes() {
    this.cargandoTareas = true;
    this.servT.getMisTareas('PENDIENTE').subscribe({
      next: (resp: any) => {
        const lista = resp?.data || [];
        this.tareasPendientes = lista;

        // tareas que vencen hoy
        const hoyStr = new Date().toISOString().slice(0, 10); 
        this.tareasHoy = lista.filter((t: any) => {
          if (!t.vence_en) return false;
          const fecha = (t.vence_en as string).slice(0, 10);
          return fecha === hoyStr;
        });

        this.cargandoTareas = false;
      },
      error: (err: any) => {
        console.error('Error cargando tareas', err);
        this.cargandoTareas = false;
        this.servG.fun_mensaje('No se pudo cargar tus tareas.', 'danger');
      }
    });
  }

  abrirRuta(ruta: string) {
    if (!ruta) {
      this.servG.fun_mensaje('Opción aún no disponible.', 'medium');
      return;
    }
    this.servG.irPagina(ruta);
  }

  irPerfil() {
    this.router.navigateByUrl('/perfil');
  }

  irTareas() {
    this.router.navigateByUrl('/tareas');
  }

  logout() {
    this.servG.token = null;
    this.servG.usuario = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usr_id');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
