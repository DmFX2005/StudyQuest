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
  IonButton,
  IonIcon,
  IonText,
  IonAvatar,
  ModalController,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Hijos } from 'src/app/servicios/hijos';
import { HijoPage } from '../hijo/hijo.page';

import { addIcons } from 'ionicons';
import { personOutline, addOutline } from 'ionicons/icons';

addIcons({ personOutline, addOutline });

@Component({
  selector: 'app-hijos',
  standalone: true,
  templateUrl: './hijos.page.html',
  styleUrls: ['./hijos.page.scss'],
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
    IonButton,
    IonIcon,
    IonText,
    IonAvatar,
  ],
})
export class HijosPage implements OnInit {

  hijos: any[] = [];
  cargando: boolean = false;

  constructor(
    public servG: General,
    private servH: Hijos,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.recuperarHijos();
  }

  recuperarHijos() {
    this.cargando = true;
    this.servH.getMisHijos().subscribe({
      next: (resp: any) => {
        this.hijos = resp?.data || [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al recuperar hijos:', err);
        this.servG.fun_mensaje('No se pudieron recuperar los hijos', 'danger');
        this.cargando = false;
      },
    });
  }

  inicialesHijo(h: any): string {
    const nombre = (h.nombre || '').trim();
    const apellido = (h.apellido || '').trim();
    const n1 = nombre ? nombre[0] : '';
    const a1 = apellido ? apellido[0] : '';
    const base = (n1 + a1).toUpperCase();
    return base || (h.email ? h.email[0].toUpperCase() : '?');
  }

  nombreHijo(h: any): string {
    const nombre = (h.nombre || '').trim();
    const apellido = (h.apellido || '').trim();
    const full = (nombre + ' ' + apellido).trim();
    return full || h.email || '';
  }

  async fun_addHijo() {
    const modal = await this.modalCtrl.create({
      component: HijoPage,
      componentProps: {
        titulo: 'Agregar hijo',
        objetoHijo: {},
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data && data.vinculoCreado) {
      this.recuperarHijos();
    }
  }

}
