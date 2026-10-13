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
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonInput,
  IonText,
  IonDatetime,
  ModalController,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Usuarios } from 'src/app/servicios/usuarios';

@Component({
  selector: 'app-datos-perfil',
  standalone: true,
  templateUrl: './datos-perfil.page.html',
  styleUrls: ['./datos-perfil.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonInput,
    IonText,
    IonDatetime,
  ],
})
export class DatosPerfilPage implements OnInit {

  @Input() objetoPerfil: any = {};
  @Input() titulo: string = 'Editar perfil';

  perfilForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private servG: General,
    private servU: Usuarios
  ) {}

  ngOnInit() {
    this.perfilForm = this.fb.group({
      nombre: [this.objetoPerfil?.nombre || '', Validators.required],
      apellido: [this.objetoPerfil?.apellido || '', Validators.required],
      fecha_nacimiento: [this.objetoPerfil?.fecha_nacimiento || null],
      nivel_educativo: [this.objetoPerfil?.nivel_educativo || ''],
      institucion: [this.objetoPerfil?.institucion || ''],
      grado_grupo: [this.objetoPerfil?.grado_grupo || ''],
      area_docente: [this.objetoPerfil?.area_docente || ''],
      telefono_contacto: [this.objetoPerfil?.telefono_contacto || ''],
    });
  }

  esInvalido(campo: string): boolean {
    const c = this.perfilForm.get(campo);
    return !!(c && c.invalid && c.touched);
  }

  mensajeError(campo: string): string {
    const c = this.perfilForm.get(campo);
    if (c?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    return '';
  }

  async guardarPerfil() {
    if (this.perfilForm.invalid) {
      Object.values(this.perfilForm.controls).forEach(c => c.markAsTouched());
      this.servG.fun_mensaje('Corrige los campos marcados en rojo');
      return;
    }

    const v = this.perfilForm.value;

    let fecha = v.fecha_nacimiento;
    if (fecha && typeof fecha === 'string') {
      fecha = fecha.slice(0, 10);
    }

    const objEnviar = {
      nombre: v.nombre,
      apellido: v.apellido,
      fecha_nacimiento: fecha || null,
      nivel_educativo: v.nivel_educativo || null,
      institucion: v.institucion || null,
      grado_grupo: v.grado_grupo || null,
      area_docente: v.area_docente || null,
      telefono_contacto: v.telefono_contacto || null,
    };

    this.servU.updateMyPerfil(objEnviar).subscribe({
      next: (resp: any) => {
        this.servG.fun_mensaje('Perfil actualizado correctamente');
        this.salir(true);
      },
      error: (err: any) => {
        console.error('Error al actualizar perfil:', err);
        this.servG.fun_mensaje('Error al actualizar perfil', 'danger');
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
