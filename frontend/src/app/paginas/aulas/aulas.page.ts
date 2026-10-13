import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonButton,
  IonIcon,
  IonText,
  ModalController
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { General } from 'src/app/servicios/general';
import { Aulas } from 'src/app/servicios/aulas';
import { AulaPage } from '../aula/aula.page';

import { addIcons } from 'ionicons';
import { addOutline, createOutline, peopleOutline, timeOutline } from 'ionicons/icons';

addIcons({ addOutline, createOutline, peopleOutline, timeOutline });

@Component({
  selector: 'app-aulas',
  standalone: true,
  templateUrl: './aulas.page.html',
  styleUrls: ['./aulas.page.scss'],
  imports: [
    CommonModule,
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
    IonButton,
    IonIcon,
    IonText,
  ],
})
export class AulasPage implements OnInit {

  aulas: any[] = [];
  cargando: boolean = false;

  constructor(
    public servG: General,
    private servA: Aulas,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.recuperarAulas();
  }

  recuperarAulas() {
    this.cargando = true;
    this.servA.getAulasProfesor().subscribe({
      next: (resp: any) => {
        this.aulas = resp?.data || [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al recuperar aulas:', err);
        this.servG.fun_mensaje('No se pudieron recuperar las aulas', 'danger');
        this.cargando = false;
      }
    });
  }

  async fun_addAula() {
    const modal = await this.modalCtrl.create({
      component: AulaPage,
      componentProps: {
        id: 0,
        titulo: 'Nueva aula',
        objetoAula: {}
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.aula_id > 0) {
      this.recuperarAulas();
    }
  }

  async fun_editarAula(aula: any) {
    const modal = await this.modalCtrl.create({
      component: AulaPage,
      componentProps: {
        id: aula.aula_id,
        titulo: 'Editar aula',
        objetoAula: aula
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.aula_id > 0) {
      this.recuperarAulas();
    }
  }

  fun_verEstudiantes(aula: any) {
    this.router.navigateByUrl(`/mis-estudiantes/${aula.aula_id}`);
  }
}
