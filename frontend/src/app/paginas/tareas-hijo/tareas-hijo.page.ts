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
  IonChip,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { TareasHijos } from 'src/app/servicios/tareas-hijos';

import { addIcons } from 'ionicons';
import {
  personOutline,
  listOutline,
  checkboxOutline,
  timeOutline,
  alertCircleOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';

addIcons({
  personOutline,
  listOutline,
  checkboxOutline,
  timeOutline,
  alertCircleOutline,
  checkmarkDoneOutline
});

interface GrupoTareasHijo {
  hijo_id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  tareas: any[];
}

@Component({
  selector: 'app-tareas-hijo',
  standalone: true,
  templateUrl: './tareas-hijo.page.html',
  styleUrls: ['./tareas-hijo.page.scss'],
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
    IonChip,
    IonSegment,
    IonSegmentButton,
  ],
})
export class TareasHijoPage implements OnInit {

  cargando: boolean = false;
  tareasPorHijo: GrupoTareasHijo[] = [];

  filtroEstado: string = 'TODAS'; 

  constructor(
    public servG: General,
    private servT: TareasHijos
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.recuperarTareas();
  }

  recuperarTareas() {
    this.cargando = true;

    const filtros: any = {};
    if (this.filtroEstado && this.filtroEstado !== 'TODAS') {
      filtros.estado = this.filtroEstado;
    }

    this.servT.getTareasHijos(filtros).subscribe({
      next: (resp: any) => {
        const data = resp?.data || [];
        this.tareasPorHijo = this.agruparPorHijo(data);
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al recuperar tareas de hijos:', err);
        this.servG.fun_mensaje('No se pudieron cargar las tareas de los hijos', 'danger');
        this.cargando = false;
      }
    });
  }

  agruparPorHijo(tareas: any[]): GrupoTareasHijo[] {
    const mapa = new Map<number, GrupoTareasHijo>();

    for (const t of tareas) {
      const hijoId = t.estudiante_id;
      if (!hijoId) continue;

      if (!mapa.has(hijoId)) {
        const nombre = (t.estudiante_nombre || '').trim();
        const apellido = (t.estudiante_apellido || '').trim();
        const nombreCompleto = (nombre + ' ' + apellido).trim() || `Estudiante #${hijoId}`;

        mapa.set(hijoId, {
          hijo_id: hijoId,
          nombre,
          apellido,
          nombreCompleto,
          tareas: []
        });
      }
      mapa.get(hijoId)!.tareas.push(t);
    }

    return Array.from(mapa.values());
  }

  inicialesHijo(grupo: GrupoTareasHijo): string {
    const n = grupo.nombre?.trim() || '';
    const a = grupo.apellido?.trim() || '';
    const base = ((n ? n[0] : '') + (a ? a[0] : '')).toUpperCase();
    return base || grupo.nombreCompleto[0]?.toUpperCase() || '?';
  }

  colorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'warning';
      case 'EN_PROGRESO':
        return 'tertiary';
      case 'ENTREGADA':
        return 'primary';
      case 'COMPLETADA':
        return 'success';
      default:
        return 'medium';
    }
  }

  iconoEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'alert-circle-outline';
      case 'EN_PROGRESO':
        return 'time-outline';
      case 'ENTREGADA':
        return 'checkbox-outline';
      case 'COMPLETADA':
        return 'checkmark-done-outline';
      default:
        return 'list-outline';
    }
  }

  cambioFiltroEstado(ev: any) {
    this.filtroEstado = ev.detail.value;
    this.recuperarTareas();
  }

  async marcarEntregada(t: any) {
    if (!t?.tarea_id) return;

    if (t.estado === 'ENTREGADA' || t.estado === 'COMPLETADA') {
      this.servG.fun_mensaje('Esta tarea ya está entregada o completada', 'medium');
      return;
    }

    const confirmar = confirm('¿Marcar esta tarea como entregada en nombre de tu hijo?');
    if (!confirmar) return;

    this.servT.entregarTareaHijo(t.tarea_id, 'Registrado por padre').subscribe({
      next: (resp: any) => {
        console.log('entregarTareaHijo resp:', resp);
        this.servG.fun_mensaje('Tarea marcada como entregada', 'success');
        this.recuperarTareas();
      },
      error: (err: any) => {
        console.error('Error al entregar tarea del hijo:', err);
        const msg = err?.error?.message || 'Error al marcar la tarea como entregada';
        this.servG.fun_mensaje(msg, 'danger');
      }
    });
  }
}
