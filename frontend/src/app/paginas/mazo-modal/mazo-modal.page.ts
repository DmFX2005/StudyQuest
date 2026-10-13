import { Component, OnInit, Input } from '@angular/core';
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
  IonItem,
  IonLabel,
  IonCardContent,
  IonCard,
  IonButton,
  IonCardTitle,
  IonCardHeader,
  IonInput,
  IonText,
  IonSelect,
  IonSelectOption,
  ModalController,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Mazos } from 'src/app/servicios/mazos';

@Component({
  selector: 'app-mazo-form',
  templateUrl: './mazo-modal.page.html',
  styleUrls: ['./mazo-modal.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonCard,
    IonCardContent,
    IonLabel,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonText,
    IonSelect,
    IonSelectOption,
  ],
})
export class MazoModalPage implements OnInit {
  mazoForm!: FormGroup;

  @Input() objetoMazo: any;
  @Input() titulo!: string;
  @Input() id: number = 0; // mazo_id

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private servG: General,
    private servM: Mazos
  ) {}

  ngOnInit() {
    this.mazoForm = this.fb.group({
      titulo: ['', Validators.required],
      alcance: ['PERSONAL', Validators.required], // PERSONAL | AULA | ESTUDIANTE
    });

    if (this.id > 0 && this.objetoMazo) {
      this.mazoForm.patchValue({
        titulo: this.objetoMazo.titulo,
        alcance: this.objetoMazo.alcance || 'PERSONAL',
      });
    }
  }

  isInvalid(campo: string): boolean {
    const control = this.mazoForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(campo: string): string {
    const control = this.mazoForm.get(campo);
    if (control?.hasError('required')) return 'Este campo es obligatorio.';
    return '';
  }

  registrarMazo() {
    if (this.mazoForm.invalid) {
      Object.values(this.mazoForm.controls).forEach((c) => c.markAsTouched());
      this.servG.fun_mensaje('Por favor, corrija los campos marcados en rojo.');
      return;
    }

    const v = this.mazoForm.value;
    const payload = {
      titulo: v.titulo,
      alcance: v.alcance,
    };

    if (this.id === 0) {
      // crear
      this.servM.postMazo(payload).subscribe({
        next: (resp: any) => {
          const m = resp?.data || {};
          this.servG.fun_mensaje('Mazo creado con éxito.');
          this.fun_Salir(m.mazo_id || 0);
        },
        error: (err: any) => {
          console.error(err);
          this.servG.fun_mensaje('Error al crear mazo.', 'danger');
        },
      });
    } else {
      // actualizar
      this.servM.putMazo(this.id, payload).subscribe({
        next: (resp: any) => {
          const m = resp?.data || {};
          this.servG.fun_mensaje('Mazo actualizado con éxito.');
          this.fun_Salir(m.mazo_id || this.id);
        },
        error: (err: any) => {
          console.error(err);
          this.servG.fun_mensaje('Error al actualizar mazo.', 'danger');
        },
      });
    }
  }

  fun_cancelar() {
    this.modalCtrl.dismiss();
  }

  fun_Salir(id: number) {
    this.modalCtrl.dismiss({ mazo_id: id });
  }
}
