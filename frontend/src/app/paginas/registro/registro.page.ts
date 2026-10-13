import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonChip,
  IonIcon,
  IonText,
  IonProgressBar,
} from '@ionic/angular/standalone';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { General } from 'src/app/servicios/general';
import { Registro } from 'src/app/servicios/registro';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonChip,
    IonIcon,
    IonText,
    IonProgressBar,
  ],
})
export class RegistroPage implements OnInit {
  registroForm!: FormGroup;

  step = 0;
  totalSteps = 5; 

  roles = [
    { codigo: 'ESTUDIANTE', label: 'Estudiante', icon: 'school' },
    { codigo: 'PROFESOR', label: 'Profesor', icon: 'easel' },
    { codigo: 'PADRE', label: 'Padre / Madre / Tutor', icon: 'people' },
  ];

  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private router: Router,
    private servG: General,
    private servR: Registro
  ) {}

  ngOnInit() {
    this.registroForm = this.fb.group({
      
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],

      rol: ['', Validators.required],

      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      fecha_nacimiento: [''],
      telefono_contacto: [''],

      nivel_educativo: [''],
      institucion: [''],
      grado_grupo: [''],
      area_docente: [''],
    });
  }

  get rolSeleccionado() {
    return this.registroForm.get('rol')?.value;
  }

  get porcentajeProgreso() {
    return (this.step + 1) / this.totalSteps;
  }

  seleccionarRol(codigo: string) {
    this.registroForm.get('rol')?.setValue(codigo);
  }

  isInvalid(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(campo: string): string {
    const control = this.registroForm.get(campo);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    if (campo === 'email' && control?.hasError('email')) {
      return 'Ingrese un correo válido.';
    }
    if (campo === 'password' && control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    return '';
  }

  async siguientePaso() {
    // Validaciones por paso
    if (this.step === 1) {
      const email = this.registroForm.get('email');
      const password = this.registroForm.get('password');
      const confirmPassword = this.registroForm.get('confirmPassword');

      email?.markAsTouched();
      password?.markAsTouched();
      confirmPassword?.markAsTouched();

      if (this.isInvalid('email') || this.isInvalid('password') || this.isInvalid('confirmPassword')) {
        this.servG.fun_mensaje('Completa los datos de tu cuenta.', 'warning');
        return;
      }

      if (password?.value !== confirmPassword?.value) {
        this.servG.fun_mensaje('Las contraseñas no coinciden.', 'danger');
        return;
      }
    }

    if (this.step === 2) {
      const rol = this.registroForm.get('rol');
      rol?.markAsTouched();
      if (!rol?.value) {
        this.servG.fun_mensaje('Elige un rol para continuar.', 'warning');
        return;
      }
    }

    if (this.step === 3) {
      this.registroForm.get('nombre')?.markAsTouched();
      this.registroForm.get('apellido')?.markAsTouched();

      if (this.isInvalid('nombre') || this.isInvalid('apellido')) {
        this.servG.fun_mensaje('Completa tu nombre y apellido.', 'warning');
        return;
      }
    }

    if (this.step < this.totalSteps - 1) {
      this.step++;
    }
  }

  pasoAnterior() {
    if (this.step > 0) {
      this.step--;
    }
  }

  async registrar() {
    const password = this.registroForm.get('password')?.value;
    const confirmPassword = this.registroForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.servG.fun_mensaje('Las contraseñas no coinciden.', 'danger');
      return;
    }

    if (
      this.registroForm.get('email')?.invalid ||
      this.registroForm.get('rol')?.invalid ||
      this.registroForm.get('nombre')?.invalid ||
      this.registroForm.get('apellido')?.invalid
    ) {
      Object.values(this.registroForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      this.servG.fun_mensaje('Por favor, revisa los campos marcados.', 'warning');
      return;
    }

    const v = this.registroForm.value;

    const payload = {
      email: v.email,
      password: v.password,
      rol: v.rol,
      perfil: {
        nombre: v.nombre || null,
        apellido: v.apellido || null,
        fecha_nacimiento: v.fecha_nacimiento || null,
        nivel_educativo: v.nivel_educativo || null,
        institucion: v.institucion || null,
        grado_grupo: v.grado_grupo || null,
        area_docente: v.area_docente || null,
        telefono_contacto: v.telefono_contacto || null,
      },
    };

    const loading = await this.loadingCtrl.create({
      message: 'Creando tu StudyQuest...',
      spinner: 'crescent',
      animated: false,
    });
    await loading.present();

    this.servR.postRegistro(payload).subscribe({
      next: async (respuesta: any) => {
        await loading.dismiss();

        if (respuesta?.message === 'Usuario registrado correctamente') {
          this.servG.token = respuesta.token;
          this.servG.usuario = respuesta.usuario;

          localStorage.setItem('token', respuesta.token);
          localStorage.setItem('usr_id', respuesta.usuario.id);

          this.servG.fun_mensaje('¡Cuenta creada con éxito! 🎉');
          this.router.navigateByUrl('/inicio', { replaceUrl: true });
        } else {
          this.servG.fun_mensaje(
            respuesta?.error || 'No se pudo completar el registro.',
            'danger'
          );
        }
      },
      error: async (err: any) => {
        await loading.dismiss();
        console.error('Error registro:', err);
        this.servG.fun_mensaje(
          err?.error?.error || 'Error interno al registrar.',
          'danger'
        );
      },
    });
  }
}
