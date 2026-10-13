import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  ModalController
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Tareas } from 'src/app/servicios/tareas';

@Component({
  selector: 'app-tarea',
  templateUrl: './tarea.page.html',
  styleUrls: ['./tarea.page.scss'],
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
export class TareaPage implements OnInit {
  tareaForm!: FormGroup;

  @Input() objetoTarea: any;
  @Input() titulo!: string;
  @Input() id: number = 0;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private servG: General,
    private servT: Tareas
  ) {}

  ngOnInit() {
    this.tareaForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      prioridad: ['MEDIA', Validators.required], 
      estado: ['PENDIENTE'],
      vence_en: [''], 
    });

    if (this.id > 0 && this.objetoTarea) {
      this.tareaForm.patchValue({
        titulo: this.objetoTarea.titulo,
        descripcion: this.objetoTarea.descripcion,
        prioridad: this.objetoTarea.prioridad || 'MEDIA',
        estado: this.objetoTarea.estado || 'PENDIENTE',
        vence_en: this.objetoTarea.vence_en
          ? this.objetoTarea.vence_en.slice(0, 16) // para input datetime-local
          : '',
      });
    }
  }

  isInvalid(campo: string): boolean {
    const control = this.tareaForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(campo: string): string {
    const control = this.tareaForm.get(campo);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    return '';
  }

  async registrarTarea() {
    if (this.tareaForm.invalid) {
      Object.values(this.tareaForm.controls).forEach((c) => c.markAsTouched());
      this.servG.fun_mensaje('Por favor, corrige los campos marcados en rojo.');
      return;
    }

    const v = this.tareaForm.value;

    const payload: any = {
      titulo: v.titulo,
      descripcion: v.descripcion || null,
      prioridad: v.prioridad, 
      estado: v.estado,
      vence_en: v.vence_en || null,
    };

    if (this.id === 0) {
      this.servT.postTareaPersonal(payload).subscribe({
        next: (resp: any) => {
          const t = resp?.data || {};
          this.servG.fun_mensaje('Tarea creada con éxito.');
          this.fun_Salir(t.tarea_id || 0);
        },
        error: (err: any) => {
          console.error(err);
          this.servG.fun_mensaje('Error al crear tarea.', 'danger');
        },
      });
    } else {
      this.servT.putTareaPersonal(this.id, payload).subscribe({
        next: (resp: any) => {
          const t = resp?.data || {};
          this.servG.fun_mensaje('Tarea actualizada con éxito.');
          this.fun_Salir(t.tarea_id || this.id);
        },
        error: (err: any) => {
          console.error(err);
          this.servG.fun_mensaje('Error al actualizar tarea.', 'danger');
        },
      });
    }
  }

  fun_cancelar() {
    this.modalCtrl.dismiss();
  }

  fun_Salir(id: number) {
    this.modalCtrl.dismiss({ tarea_id: id });
  }
}
