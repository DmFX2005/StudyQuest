import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonText, IonSpinner, IonItem, IonLabel, IonIcon, IonList, IonButton, ModalController } from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Calendario } from 'src/app/servicios/calendario';
import { TareaPage } from '../tarea/tarea.page';


interface DiaCalendario {
  fecha: Date | null;        // null para celdas vacías porque no es día del mes
  iso: string | null;        
  numero: number | null;     
  esHoy: boolean;
  tareas: any[];
  recompensas: any[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonSpinner,
    IonItem,
    IonLabel,
    IonIcon,
    IonList,
    IonButton
],
})
export class CalendarioPage implements OnInit {

  cargando: boolean = false;
  errorRol: boolean = false;

  mesActual: Date = new Date();                
  semanasCalendario: DiaCalendario[][] = [];   

  tareas: any[] = [];
  recompensas: any[] = [];

  fechaSeleccionadaIso: string | null = null;
  tareasDiaSeleccionado: any[] = [];
  recompensasDiaSeleccionado: any[] = [];

  constructor(
    public servG: General,
    private servCalendario: Calendario,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarMesActual();
  }

  get nombreMesActual(): string {
    const opciones: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return this.mesActual.toLocaleDateString('es-ES', opciones);
  }

  cambiarMes(deltaMes: number) {
    const anio = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    this.mesActual = new Date(anio, mes + deltaMes, 1);
    this.cargarMesActual();
  }

  irAHoy() {
    this.mesActual = new Date();
    this.cargarMesActual();
  }


  cargarMesActual() {
    this.cargando = true;
    this.errorRol = false;

    const anio = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    const desde = primerDia.toISOString().slice(0, 10);
    const hasta = ultimoDia.toISOString().slice(0, 10);

    this.servCalendario.getCalendario(desde, hasta).subscribe({
      next: (resp: any) => {
        this.tareas = resp?.tareas || [];
        this.recompensas = resp?.recompensas || [];
        this.construirSemanas(primerDia, ultimoDia);
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error calendario:', err);
        this.cargando = false;

        if (err?.status === 403) {
          this.errorRol = true;
          this.servG.fun_mensaje('Solo ESTUDIANTE puede ver este calendario', 'warning');
        } else {
          this.servG.fun_mensaje('No se pudo cargar el calendario', 'danger');
        }
      }
    });
  }

  construirSemanas(primerDia: Date, ultimoDia: Date) {
    const dias: DiaCalendario[] = [];

    
    const mapaPorFecha: { [fecha: string]: { tareas: any[]; recompensas: any[] } } = {};

    this.tareas.forEach(t => {
      if (!t.vence_en) return;
      const clave = (t.vence_en as string).slice(0, 10);
      if (!mapaPorFecha[clave]) mapaPorFecha[clave] = { tareas: [], recompensas: [] };
      mapaPorFecha[clave].tareas.push(t);
    });

    this.recompensas.forEach(r => {
      if (!r.expira_en) return;
      const clave = (r.expira_en as string).slice(0, 10);
      if (!mapaPorFecha[clave]) mapaPorFecha[clave] = { tareas: [], recompensas: [] };
      mapaPorFecha[clave].recompensas.push(r);
    });

    const diaSemanaPrimero = primerDia.getDay(); 

    for (let i = 0; i < diaSemanaPrimero; i++) {
      dias.push({
        fecha: null,
        iso: null,
        numero: null,
        esHoy: false,
        tareas: [],
        recompensas: [],
      });
    }

    const hoyIso = new Date().toISOString().slice(0, 10);

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = new Date(primerDia.getFullYear(), primerDia.getMonth(), d);
      const iso = fecha.toISOString().slice(0, 10);
      const info = mapaPorFecha[iso] || { tareas: [], recompensas: [] };

      dias.push({
        fecha,
        iso,
        numero: d,
        esHoy: iso === hoyIso,
        tareas: info.tareas,
        recompensas: info.recompensas,
      });
    }

    while (dias.length % 7 !== 0) {
      dias.push({
        fecha: null,
        iso: null,
        numero: null,
        esHoy: false,
        tareas: [],
        recompensas: [],
      });
    }

    const semanas: DiaCalendario[][] = [];
    for (let i = 0; i < dias.length; i += 7) {
      semanas.push(dias.slice(i, i + 7));
    }
    this.semanasCalendario = semanas;

    let diaSeleccionado =
      dias.find(d => d.esHoy && d.iso) ||
      dias.find(d => d.iso && (d.tareas.length > 0 || d.recompensas.length > 0)) ||
      dias.find(d => d.iso);

    if (diaSeleccionado && diaSeleccionado.iso) {
      this.seleccionarDia(diaSeleccionado);
    } else {
      this.fechaSeleccionadaIso = null;
      this.tareasDiaSeleccionado = [];
      this.recompensasDiaSeleccionado = [];
    }
  }

  seleccionarDia(dia: DiaCalendario) {
    if (!dia.iso) return;
    this.fechaSeleccionadaIso = dia.iso;
    this.tareasDiaSeleccionado = dia.tareas || [];
    this.recompensasDiaSeleccionado = dia.recompensas || [];
  }

  esDiaSeleccionado(dia: DiaCalendario): boolean {
    return dia.iso != null && dia.iso === this.fechaSeleccionadaIso;
  }

  async abrirTarea(tarea: any) {
    const modal = await this.modalCtrl.create({
      component: TareaPage,
      componentProps: {
        objetoTarea: tarea,
        titulo: 'Editar tarea',
        id: tarea.tarea_id,
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data && data.tarea_id > 0) {
      this.cargarMesActual();
    }
  }
}
