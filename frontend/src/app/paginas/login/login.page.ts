import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonIcon,
  IonButton,
  IonTabBar,
  IonFooter,
  IonLabel,
  IonInput,
  IonList,
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
import { Login } from 'src/app/servicios/login';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonLabel,
    IonFooter,
    IonTabBar,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonButton,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonInput,
    IonList,
  ],
})
export class LoginPage {
  loginForm: FormGroup;
  objLogin: any = { email: '', password: '' };

  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private router: Router,
    private servG: General,
    private servL: Login
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  irRegistro() {
    this.router.navigateByUrl('/registro');
  }

  async login() {
    if (this.loginForm.invalid) {
      this.servG.fun_mensaje('Complete todos los campos correctamente', 'warning');
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.objLogin = { email, password };

    const loading = this.loadingCtrl.create({
      message: 'Verificando...',
      spinner: 'crescent',
      animated: false,
    });
    loading.then(l => l.present());

    this.servL.postLogin(this.objLogin).subscribe({
      next: async (respuesta: any) => {

        loading.then(l => l.dismiss());

        if (respuesta?.message === 'Login exitoso') {
          this.servG.token = respuesta.token;
          this.servG.usuario = respuesta.usuario;

          localStorage.setItem('token', respuesta.token);
          localStorage.setItem('usr_id', respuesta.usuario.id);
          localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));

          this.servG.fun_mensaje('Inicio de sesión exitoso');

          this.router.navigateByUrl('/inicio', { replaceUrl: true });

        } else {
          this.servG.fun_mensaje(respuesta?.error || 'Usuario o contraseña incorrecta', 'danger');
        }
      },

      error: async (err: any) => {
        loading.then(l => l.dismiss());
        this.servG.fun_mensaje(
          err?.error?.error || 'Error al validar usuario o contraseña',
          'danger'
        );
      }
    });
  }
}
