import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonText,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonRange,
  IonList,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Gamificacion } from 'src/app/servicios/gamificacion';

type EstadoPomodoro = 'configuracion' | 'corriendo' | 'finalizado';

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  templateUrl: './pomodoro.page.html',
  styleUrls: ['./pomodoro.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonText,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonRange,
    IonList,
  ],
})
export class PomodoroPage implements OnInit, OnDestroy {

  minutosSeleccionados: number = 25;      
  xpEstimado: number = 0;

  estado: EstadoPomodoro = 'configuracion';
  segundosTotales: number = 0;
  segundosRestantes: number = 0;
  temporizadorId: any = null;

  xpGanado: number | null = null;

  resumenXP: any = null;
  ultimosEventos: any[] = [];

  constructor(
    public servG: General,
    private servGamificacion: Gamificacion
  ) {}

  ngOnInit() {
    this.calcularXpEstimado();
    this.cargarResumen();
  }

  ionViewWillLeave() {
    this.limpiarTemporizador();
  }

  ngOnDestroy() {
    this.limpiarTemporizador();
  }

  calcularXpEstimado() {
    const m = this.minutosSeleccionados;

    if (m < 10 || m > 120) {
      this.xpEstimado = 0;
      return;
    }

    this.xpEstimado = Math.round(5 + (m - 10) * (95 / 110));
  }

  formatoTiempo(segundos: number): string {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    const mm = m < 10 ? '0' + m : '' + m;
    const ss = s < 10 ? '0' + s : '' + s;
    return `${mm}:${ss}`;
  }

  get tiempoRestanteFormateado(): string {
    return this.formatoTiempo(this.segundosRestantes);
  }

  get progreso(): number {
    if (!this.segundosTotales) return 0;
    return ((this.segundosTotales - this.segundosRestantes) / this.segundosTotales) * 100;
  }

  limpiarTemporizador() {
    if (this.temporizadorId) {
      clearInterval(this.temporizadorId);
      this.temporizadorId = null;
    }
  }

  seleccionarMinutosRapido(min: number) {
    this.minutosSeleccionados = min;
    this.calcularXpEstimado();
  }

  cambioRango(event: any) {
    const valor = event.detail.value;
    this.minutosSeleccionados = Number(valor);
    this.calcularXpEstimado();
  }


  iniciarPomodoro() {
    if (this.minutosSeleccionados < 10 || this.minutosSeleccionados > 120) {
      this.servG.fun_mensaje('El rango válido es de 10 a 120 minutos', 'warning');
      return;
    }

    this.limpiarTemporizador();
    this.segundosTotales = this.minutosSeleccionados * 60;
    this.segundosRestantes = this.segundosTotales;
    this.estado = 'corriendo';
    this.xpGanado = null;

    this.temporizadorId = setInterval(() => {
      this.segundosRestantes--;
      if (this.segundosRestantes <= 0) {
        this.segundosRestantes = 0;
        this.limpiarTemporizador();
        this.finalizarSesion(true); 
      }
    }, 1000);
  }

  cancelarPomodoro() {
    this.limpiarTemporizador();
    this.estado = 'configuracion';
    this.segundosTotales = 0;
    this.segundosRestantes = 0;
    this.xpGanado = null;
  }

  finalizarSesion(desdeTemporizador: boolean = false) {
    this.limpiarTemporizador();

    if (!desdeTemporizador) {
      this.estado = 'configuracion';
      this.servG.fun_mensaje('Sesión cancelada antes de terminar');
      return;
    }

    this.estado = 'finalizado';

    this.servGamificacion.registrarPomodoro(this.minutosSeleccionados).subscribe({
      next: (resp: any) => {
        this.xpGanado = resp?.xp_otorgado ?? null;
        this.servG.fun_mensaje(`¡Buen trabajo! Ganaste ${this.xpGanado} XP`, 'success');
        this.cargarResumen();
      },
      error: (err: any) => {
        console.error('Error al registrar pomodoro:', err);
        this.servG.fun_mensaje('Error al registrar la sesión de estudio', 'danger');
      },
    });
  }

  cargarResumen() {
    this.servGamificacion.obtenerResumen().subscribe({
      next: (resp: any) => {
        this.resumenXP = resp?.resumen || null;
      },
      error: (err: any) => {
        console.error('Error al obtener resumen XP:', err);
      },
    });

    this.servGamificacion.obtenerEventos(5).subscribe({
      next: (resp: any) => {
        this.ultimosEventos = (resp?.data || []).filter(
          (e: any) => e.fuente_tipo === 'POMODORO'
        );
      },
      error: (err: any) => {
        console.error('Error al obtener eventos de gamificación:', err);
      },
    });
  }
}
