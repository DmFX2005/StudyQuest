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
  ModalController
} from '@ionic/angular/standalone';

import { ActivatedRoute } from '@angular/router';
import { General } from 'src/app/servicios/general';
import { Aulas } from 'src/app/servicios/aulas';
import { AggEstudianteAulaPage } from '../agg-estudiante-aula/agg-estudiante-aula.page';

import { addIcons } from 'ionicons';
import { personOutline, trashOutline, addOutline } from 'ionicons/icons';

addIcons({ personOutline, trashOutline, addOutline });

@Component({
  selector: 'app-mis-estudiantes',
  standalone: true,
  templateUrl: './mis-estudiantes.page.html',
  styleUrls: ['./mis-estudiantes.page.scss'],
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
export class MisEstudiantesPage implements OnInit {

  aulaId: number = 0;
  aulaInfo: any = null;
  estudiantes: any[] = [];
  cargando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public servG: General,
    private servA: Aulas,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.aulaId = Number(this.route.snapshot.paramMap.get('id')) || 0;
  }

  ionViewWillEnter() {
    if (this.aulaId > 0) {
      this.recuperarEstudiantes();
    }
  }

  recuperarEstudiantes() {
    this.cargando = true;
    this.servA.getEstudiantesDeAula(this.aulaId).subscribe({
      next: (resp: any) => {
        this.aulaInfo = resp?.aula || null;
        this.estudiantes = resp?.data || [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al recuperar estudiantes del aula:', err);
        this.servG.fun_mensaje('No se pudieron recuperar los estudiantes', 'danger');
        this.cargando = false;
      }
    });
  }

  nombreCompleto(e: any): string {
    const n = (e.nombre || '').trim();
    const a = (e.apellido || '').trim();
    const full = (n + ' ' + a).trim();
    return full || e.email || '';
  }

  iniciales(e: any): string {
    const n = (e.nombre || '').trim();
    const a = (e.apellido || '').trim();
    const base = ((n ? n[0] : '') + (a ? a[0] : '')).toUpperCase();
    return base || (e.email ? e.email[0].toUpperCase() : '?');
  }

  async fun_agregarEstudiante() {
    const modal = await this.modalCtrl.create({
      component: AggEstudianteAulaPage,
      componentProps: {
        aulaId: this.aulaId,
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.actualizado) {
      this.recuperarEstudiantes();
    }
  }

  async fun_eliminarEstudiante(e: any) {
    const confirmar = confirm(`¿Eliminar a ${this.nombreCompleto(e)} del aula?`);
    if (!confirmar) return;

    this.servA.eliminarEstudianteDeAula(this.aulaId, e.id).subscribe({
      next: (resp: any) => {
        this.servG.fun_mensaje('Estudiante eliminado del aula', 'success');
        this.recuperarEstudiantes();
      },
      error: (err: any) => {
        console.error('Error al eliminar estudiante del aula:', err);
        const msg = err?.error?.message || 'Error al eliminar estudiante';
        this.servG.fun_mensaje(msg, 'danger');
      }
    });
  }
}
