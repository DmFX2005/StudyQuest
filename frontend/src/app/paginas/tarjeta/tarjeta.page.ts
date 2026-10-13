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
  ModalController,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Mazos } from 'src/app/servicios/mazos';

@Component({
  selector: 'app-tarjeta',
  templateUrl: './tarjeta.page.html',
  styleUrls: ['./tarjeta.page.scss'],
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
  ],
})
export class TarjetaPage implements OnInit {
  tarjetaForm!: FormGroup;

  @Input() mazoId!: number;
  @Input() objetoTarjeta: any;
  @Input() titulo!: string;
  @Input() id: number = 0;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private servG: General,
    private servM: Mazos
  ) {}

  ngOnInit() {
    this.tarjetaForm = this.fb.group({
      frente: ['', Validators.required],
      reverso: ['', Validators.required],
      pista: [''],
    });

    if (this.id > 0 && this.objetoTarjeta) {
      this.tarjetaForm.patchValue({
        frente: this.objetoTarjeta.frente,
        reverso: this.objetoTarjeta.reverso,
        pista: this.objetoTarjeta.pista,
      });
    }
  }

  isInvalid(campo: string): boolean {
    const control = this.tarjetaForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(campo: string): string {
    const control = this.tarjetaForm.get(campo);
    if (control?.hasError('required')) return 'Este campo es obligatorio.';
    return '';
  }

  registrarTarjeta() {
    if (this.tarjetaForm.invalid) {
      Object.values(this.tarjetaForm.controls).forEach((c) => c.markAsTouched());
      this.servG.fun_mensaje(
        'Por favor, corrija los campos marcados en rojo.'
      );
      return;
    }

    const v = this.tarjetaForm.value;
    const payload: any = {
      frente: v.frente,
      reverso: v.reverso,
      pista: v.pista || null,
    };

    if (this.id === 0) {
      // crear tarjeta
      this.servM.postTarjeta(this.mazoId, payload).subscribe({
        next: (resp: any) => {
          const t = resp?.data || {};
          this.servG.fun_mensaje('Tarjeta creada con éxito.');
          this.fun_Salir(t.tarjeta_id || 0);
        },
        error: (err: any) => {
          console.error(err);
          this.servG.fun_mensaje('Error al crear tarjeta.', 'danger');
        },
      });
    } else {
      // actualizar tarjeta
      this.servM.putTarjeta(this.id, payload).subscribe({
        next: (resp: any) => {
          const t = resp?.data || {};
          this.servG.fun_mensaje('Tarjeta actualizada con éxito.');
          this.fun_Salir(t.tarjeta_id || this.id);
        },
        error: (err: any) => {
          console.error(err);
          this.servG.fun_mensaje('Error al actualizar tarjeta.', 'danger');
        },
      });
    }
  }

  fun_cancelar() {
    this.modalCtrl.dismiss();
  }

  fun_Salir(id: number) {
    this.modalCtrl.dismiss({ tarjeta_id: id });
  }
}
