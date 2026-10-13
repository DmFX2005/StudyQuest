import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonAvatar,
  IonChip,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { General } from 'src/app/servicios/general';
import { Usuarios } from 'src/app/servicios/usuarios';
import { DatosPerfilPage } from '../datos-perfil/datos-perfil.page';

import { addIcons } from 'ionicons';
import { logOutOutline, createOutline, personCircleOutline } from 'ionicons/icons';

addIcons({ logOutOutline, createOutline, personCircleOutline });

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonText,
    IonButton,
    IonAvatar,
    IonChip,
    IonIcon,
  ],
})
export class PerfilPage implements OnInit {

  usuario: any = null;   

  cargando: boolean = false;

  constructor(
    public servG: General,
    private servU: Usuarios,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    this.cargando = true;
    this.servU.getMe().subscribe({
      next: (resp: any) => {
        this.usuario = resp?.data || null;

        if (this.usuario) {
          const usrLocal = {
            id: this.usuario.usuario_id,
            email: this.usuario.email,
            roles: this.usuario.roles || [],
            perfil: this.usuario.perfil || null
          };
          this.servG.usuario = usrLocal;
          localStorage.setItem('usuario', JSON.stringify(usrLocal));
        }

        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar usuario:', err);
        this.servG.fun_mensaje('No se pudo cargar la información del perfil', 'danger');
        this.cargando = false;
      }
    });
  }

  get nombreCompleto(): string {
    const p = this.usuario?.perfil || {};
    const nom = p.nombre || '';
    const ape = p.apellido || '';
    const full = (nom + ' ' + ape).trim();
    return full || this.usuario?.email || '';
  }

  get iniciales(): string {
    const p = this.usuario?.perfil || {};
    const nom = (p.nombre || '').trim();
    const ape = (p.apellido || '').trim();
    const n1 = nom ? nom[0] : '';
    const a1 = ape ? ape[0] : '';
    const base = (n1 + a1).toUpperCase();
    return base || (this.usuario?.email ? this.usuario.email[0].toUpperCase() : '?');
  }

  async editarPerfil() {
    if (!this.usuario) return;

    const modal = await this.modalCtrl.create({
      component: DatosPerfilPage,
      componentProps: {
        objetoPerfil: this.usuario.perfil || {},
        titulo: 'Editar perfil',
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data && data.actualizado) {
      this.cargarUsuario();
    }
  }

  cerrarSesion() {
    this.servG.token = null;
    this.servG.usuario = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usr_id');
    // localStorage.removeItem('usuario');

    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
