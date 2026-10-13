import { Component, Input } from '@angular/core';
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonList,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Aulas } from 'src/app/servicios/aulas';
import { Usuarios } from 'src/app/servicios/usuarios';

import { addIcons } from 'ionicons';
import { searchOutline, personAddOutline } from 'ionicons/icons';

addIcons({ searchOutline, personAddOutline });

@Component({
  selector: 'app-agregar-estudiante-aula',
  standalone: true,
  templateUrl: './agg-estudiante-aula.page.html',
  styleUrls: ['./agg-estudiante-aula.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonList,
    IonIcon,
  ],
})
export class AggEstudianteAulaPage {

  @Input() aulaId: number = 0;

  buscarForm!: FormGroup;
  resultados: any[] = [];
  buscando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private servG: General,
    private servA: Aulas,
    private servU: Usuarios
  ) {
    this.buscarForm = this.fb.group({
      q: ['', Validators.required],
    });
  }

  esInvalido(campo: string): boolean {
    const c = this.buscarForm.get(campo);
    return !!(c && c.invalid && c.touched);
  }

  mensajeError(campo: string): string {
    const c = this.buscarForm.get(campo);
    if (c?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    return '';
  }

  buscarEstudiantes() {
    if (this.buscarForm.invalid) {
      Object.values(this.buscarForm.controls).forEach(c => c.markAsTouched());
      this.servG.fun_mensaje('Ingrese un texto de búsqueda');
      return;
    }

    const q = this.buscarForm.value.q;
    this.buscando = true;

    this.servU.buscarEstudiantes(q).subscribe({
      next: (resp: any) => {
        this.resultados = resp?.data || [];
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

  agregarEstudiante(e: any) {
    if (!this.aulaId || !e?.id) {
      this.servG.fun_mensaje('Datos incompletos para agregar estudiante', 'danger');
      return;
    }

    this.servA.agregarEstudianteAula(this.aulaId, e.id).subscribe({
      next: (resp: any) => {
        this.servG.fun_mensaje('Estudiante agregado al aula', 'success');
        this.salir(true);
      },
      error: (err: any) => {
        console.error('Error al agregar estudiante al aula:', err);
        const msg = err?.error?.message || 'Error al agregar estudiante';
        this.servG.fun_mensaje(msg, 'danger');
      }
    });
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  salir(actualizado: boolean) {
    this.modalCtrl.dismiss({ actualizado });
  }
}
