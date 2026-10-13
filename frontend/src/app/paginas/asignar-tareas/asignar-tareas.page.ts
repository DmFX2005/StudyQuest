import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

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
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonText,
  IonChip,
  IonList,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Usuarios } from 'src/app/servicios/usuarios';
import { TareasProfe } from 'src/app/servicios/tareas-profe';
import { Aulas } from 'src/app/servicios/aulas';

import { addIcons } from 'ionicons';
import {
  searchOutline,
  personOutline,
  sendOutline,
  schoolOutline
} from 'ionicons/icons';

addIcons({
  searchOutline,
  personOutline,
  sendOutline,
  schoolOutline
});

@Component({
  selector: 'app-asignar-tarea',
  standalone: true,
  templateUrl: './asignar-tareas.page.html',
  styleUrls: ['./asignar-tareas.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonText,
    IonChip,
    IonList,
    IonSegment,
    IonSegmentButton,
  ],
})
export class AsignarTareasPage implements OnInit {

  modoDestino: 'ESTUDIANTE' | 'AULA' = 'ESTUDIANTE';

  tareaForm!: FormGroup;

  buscarForm!: FormGroup;

  resultadosEstudiantes: any[] = [];
  buscando: boolean = false;
  estudianteSeleccionado: any = null;

  aulas: any[] = [];
  aulaSeleccionadaId: number | null = null;
  cargandoAulas: boolean = false;

  constructor(
    private fb: FormBuilder,
    public servG: General,
    private servU: Usuarios,
    private servT: TareasProfe,
    private servA: Aulas
  ) {}

  ngOnInit() {
    this.tareaForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      prioridad: ['MEDIA', Validators.required],
      vence_en: [''] // opcional
    });

    this.buscarForm = this.fb.group({
      q: ['', Validators.required]
    });

    this.cargarAulasProfesor();
  }

  cargarAulasProfesor() {
    this.cargandoAulas = true;
    this.servA.getAulasProfesor().subscribe({
      next: (resp: any) => {
        this.aulas = resp?.data || [];
        this.cargandoAulas = false;
      },
      error: (err: any) => {
        console.error('Error al cargar aulas del profesor:', err);
        this.servG.fun_mensaje('No se pudieron cargar las aulas', 'danger');
        this.cargandoAulas = false;
      }
    });
  }

  cambioModo(ev: any) {
    this.modoDestino = ev.detail.value;
  }

  esInvalidoBuscar(campo: string): boolean {
    const c = this.buscarForm.get(campo);
    return !!(c && c.invalid && c.touched);
  }

  mensajeErrorBuscar(campo: string): string {
    const c = this.buscarForm.get(campo);
    if (c?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    return '';
  }

  buscarEstudiantes() {
    if (this.buscarForm.invalid) {
      Object.values(this.buscarForm.controls).forEach(c => c.markAsTouched());
      this.servG.fun_mensaje('Ingrese un nombre o apellido para buscar');
      return;
    }

    const q = this.buscarForm.value.q;
    this.buscando = true;
    this.resultadosEstudiantes = [];

    this.servU.buscarEstudiantes(q).subscribe({
      next: (resp: any) => {
        this.resultadosEstudiantes = resp?.data || [];
        this.buscando = false;
      },
      error: (err: any) => {
        console.error('Error al buscar estudiantes:', err);
        this.servG.fun_mensaje('Error al buscar estudiantes', 'danger');
        this.buscando = false;
      }
    });
  }

  nombreCompleto(e: any): string {
    const n = (e.nombre || '').trim();
    const a = (e.apellido || '').trim();
    const full = (n + ' ' + a).trim();
    return full || e.email || '';
  }

  seleccionarEstudiante(e: any) {
    this.estudianteSeleccionado = e;
    this.servG.fun_mensaje('Estudiante seleccionado');
  }

  limpiarSeleccion() {
    this.estudianteSeleccionado = null;
  }

  esInvalidoTarea(campo: string): boolean {
    const c = this.tareaForm.get(campo);
    return !!(c && c.invalid && c.touched);
  }

  mensajeErrorTarea(campo: string): string {
    const c = this.tareaForm.get(campo);
    if (c?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    return '';
  }

  asignarTarea() {
    if (this.tareaForm.invalid) {
      Object.values(this.tareaForm.controls).forEach(c => c.markAsTouched());
      this.servG.fun_mensaje('Corrige los campos marcados en rojo', 'warning');
      return;
    }

    const valores = this.tareaForm.value;
    const venceEn = valores.vence_en || null;

    if (this.modoDestino === 'ESTUDIANTE') {
      if (!this.estudianteSeleccionado) {
        this.servG.fun_mensaje('Primero selecciona un estudiante', 'warning');
        return;
      }

      const objTarea: any = {
        estudiante_id: this.estudianteSeleccionado.id,
        titulo: valores.titulo,
        descripcion: valores.descripcion,
        prioridad: valores.prioridad || 'MEDIA',
        vence_en: venceEn
      };

      this.servT.postAsignarTareaProfesor(objTarea).subscribe({
        next: (resp: any) => {
          console.log('asignar tarea a estudiante:', resp);
          this.servG.fun_mensaje('Tarea asignada al estudiante', 'success');
          this.tareaForm.reset({
            titulo: '',
            descripcion: '',
            prioridad: 'MEDIA',
            vence_en: ''
          });
        },
        error: (err: any) => {
          console.error('Error al asignar tarea:', err);
          const msg = err?.error?.message || 'Error al asignar la tarea';
          this.servG.fun_mensaje(msg, 'danger');
        }
      });

    } else {

      if (!this.aulaSeleccionadaId) {
        this.servG.fun_mensaje('Selecciona un aula primero', 'warning');
        return;
      }

      const objTareaAula: any = {
        aula_id: this.aulaSeleccionadaId,
        titulo: valores.titulo,
        descripcion: valores.descripcion,
        prioridad: valores.prioridad || 'MEDIA',
        vence_en: venceEn
      };

      this.servT.postAsignarTareaAula(objTareaAula).subscribe({
        next: (resp: any) => {
          console.log('asignar tarea a aula:', resp);
          const mensaje = resp?.message || 'Tarea asignada al aula';
          this.servG.fun_mensaje(mensaje, 'success');
          this.tareaForm.reset({
            titulo: '',
            descripcion: '',
            prioridad: 'MEDIA',
            vence_en: ''
          });
        },
        error: (err: any) => {
          console.error('Error al asignar tarea al aula:', err);
          const msg = err?.error?.message || 'Error al asignar la tarea al aula';
          this.servG.fun_mensaje(msg, 'danger');
        }
      });
    }
  }
}
