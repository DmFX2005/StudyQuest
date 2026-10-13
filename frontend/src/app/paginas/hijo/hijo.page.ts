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
import { Hijos } from 'src/app/servicios/hijos';

@Component({
  selector: 'app-hijo',
  standalone: true,
  templateUrl: './hijo.page.html',
  styleUrls: ['./hijo.page.scss'],
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
export class HijoPage implements OnInit {

  @Input() objetoHijo: any = {};
  @Input() titulo: string = 'Vincular hijo';

  hijoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private servG: General,
    private servH: Hijos
  ) {}

  ngOnInit() {
    this.hijoForm = this.fb.group({
      emailHijo: [this.objetoHijo?.email || '', [Validators.required, Validators.email]],
    });

    console.log('objetoHijo:', this.objetoHijo);
  }

  esInvalido(campo: string): boolean {
    const c = this.hijoForm.get(campo);
    return !!(c && c.invalid && c.touched);
  }

  mensajeError(campo: string): string {
    const c = this.hijoForm.get(campo);
    if (c?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    if (c?.hasError('email')) {
      return 'Ingrese un correo válido.';
    }
    return '';
  }

  async guardarVinculo() {
    if (this.hijoForm.invalid) {
      Object.values(this.hijoForm.controls).forEach(ctrl => ctrl.markAsTouched());
      this.servG.fun_mensaje('Corrige los campos marcados en rojo');
      return;
    }

    const email = this.hijoForm.value.emailHijo;

    this.servH.postVinculoHijo(email).subscribe({
      next: (resp: any) => {
        console.log('resp vinculo:', resp);
        this.servG.fun_mensaje('Vínculo padre-hijo creado correctamente');
        this.salir(true);
      },
      error: (err: any) => {
        console.error('Error al crear vínculo:', err);
        const msg = err?.error?.message || 'Error al crear vínculo';
        this.servG.fun_mensaje(msg, 'danger');
      },
    });
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  salir(vinculoCreado: boolean) {
    this.modalCtrl.dismiss({ vinculoCreado });
  }
}
