import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  IonSegment,
  IonSegmentButton,
  IonChip
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { TareasProfe } from 'src/app/servicios/tareas-profe';

import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  personOutline,
  documentTextOutline,
  refreshOutline
} from 'ionicons/icons';

addIcons({
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  personOutline,
  documentTextOutline,
  refreshOutline
});

@Component({
  selector: 'app-revisar-tareas',
  standalone: true,
  templateUrl: './revisar-tareas.page.html',
  styleUrls: ['./revisar-tareas.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
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
    IonSegment,
    IonSegmentButton,
    IonChip
  ]
})
export class RevisarTareasPage implements OnInit {

  estadoFiltro: string = 'ENTREGADA'; 
  cargando: boolean = false;
  tareas: any[] = [];

  constructor(
    public servG: General,
    private servT: TareasProfe
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarTareas();
  }

  cambioFiltro(ev: any) {
    this.estadoFiltro = ev.detail.value;
    this.cargarTareas();
  }

  cargarTareas() {
    this.cargando = true;
    this.tareas = [];

    this.servT.getTareasParaRevisar(this.estadoFiltro).subscribe({
      next: (resp: any) => {
        this.tareas = resp?.data || [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar tareas para revisar:', err);
        this.servG.fun_mensaje('Error al cargar tareas', 'danger');
        this.cargando = false;
      }
    });
  }

  nombreCompleto(t: any): string {
    const n = (t.estudiante_nombre || '').trim();
    const a = (t.estudiante_apellido || '').trim();
    const full = (n + ' ' + a).trim();
    return full || t.estudiante_email || '';
  }

  formatoFecha(fecha: string | null): string {
    if (!fecha) return '';
    return fecha.slice(0, 10);
  }

  async aceptarTarea(t: any) {
    const confirmar = confirm(`¿Marcar como ACEPTADA la tarea "${t.titulo}"?`);
    if (!confirmar) return;

    this.servT.postRevisarTarea(t.tarea_id, 'ACEPTADA', null).subscribe({
      next: (resp: any) => {
        this.servG.fun_mensaje('Tarea aceptada correctamente', 'success');
        this.cargarTareas();
      },
      error: (err: any) => {
        console.error('Error al aceptar tarea:', err);
        const msg = err?.error?.message || 'Error al aceptar tarea';
        this.servG.fun_mensaje(msg, 'danger');
      }
    });
  }

  async devolverTarea(t: any) {
    const confirmar = confirm(`¿Devolver la tarea "${t.titulo}" para corregir?`);
    if (!confirmar) return;

    const observaciones = prompt('Observaciones para el estudiante (opcional):') || null;

    this.servT.postRevisarTarea(t.tarea_id, 'RECHAZADA', observaciones).subscribe({
      next: (resp: any) => {
        this.servG.fun_mensaje('Tarea devuelta al estudiante', 'success');
        this.cargarTareas();
      },
      error: (err: any) => {
        console.error('Error al devolver tarea:', err);
        const msg = err?.error?.message || 'Error al devolver tarea';
        this.servG.fun_mensaje(msg, 'danger');
      }
    });
  }

  refrescar() {
    this.cargarTareas();
  }
}
