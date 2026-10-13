import { Component, Input, OnInit } from '@angular/core';
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
  ModalController,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Aulas } from 'src/app/servicios/aulas';

@Component({
  selector: 'app-aula',
  standalone: true,
  templateUrl: './aula.page.html',
  styleUrls: ['./aula.page.scss'],
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
  ],
})
export class AulaPage implements OnInit {

  @Input() id: number = 0;
  @Input() titulo: string = 'Aula';
  @Input() objetoAula: any = {};

  aulaForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private servG: General,
    private servA: Aulas
  ) {}

  ngOnInit() {
    this.aulaForm = this.fb.group({
      nombre: [this.objetoAula?.nombre || '', Validators.required],
    });
  }

  esInvalido(campo: string): boolean {
    const c = this.aulaForm.get(campo);
    return !!(c && c.invalid && c.touched);
  }

  mensajeError(campo: string): string {
    const c = this.aulaForm.get(campo);
    if (c?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    return '';
  }

  guardarAula() {
    if (this.aulaForm.invalid) {
      Object.values(this.aulaForm.controls).forEach(c => c.markAsTouched());
      this.servG.fun_mensaje('Corrige los campos marcados en rojo');
      return;
    }

    const datos = this.aulaForm.value;

    if (this.id === 0) {
      // crear
      this.servA.postAula(datos).subscribe({
        next: (resp: any) => {
          const aula = resp?.data;
          this.servG.fun_mensaje('Aula creada correctamente');
          this.salir(aula?.aula_id || 0);
        },
        error: (err: any) => {
          console.error('Error al crear aula:', err);
          this.servG.fun_mensaje('Error al crear aula', 'danger');
        }
      });
    } else {
      this.servA.putAula(this.id, datos).subscribe({
        next: (resp: any) => {
          const aula = resp?.data || {};
          this.servG.fun_mensaje('Aula actualizada correctamente');
          this.salir(aula.aula_id || this.id);
        },
        error: (err: any) => {
          console.error('Error al actualizar aula:', err);
          this.servG.fun_mensaje('Error al actualizar aula', 'danger');
        }
      });
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  salir(aulaId: number) {
    this.modalCtrl.dismiss({ aula_id: aulaId });
  }
}
