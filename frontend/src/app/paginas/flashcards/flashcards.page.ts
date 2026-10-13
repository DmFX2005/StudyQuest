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
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  ModalController,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { General } from 'src/app/servicios/general';
import { Mazos } from 'src/app/servicios/mazos';
import { firstValueFrom } from 'rxjs';
import { MazoModalPage } from '../mazo-modal/mazo-modal.page';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.page.html',
  styleUrls: ['./flashcards.page.scss'],
  standalone: true,
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
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    IonRow,
    IonCol,
  ],
})
export class FlashcardsPage implements OnInit {
  mazos: any[] = [];
  cargando: boolean = false;

  constructor(
    public servG: General,
    private servM: Mazos,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.recuperarMazos();
  }

  recuperarMazos() {
    this.cargando = true;
    this.servM.getMazos().subscribe({
      next: (resp: any) => {
        this.mazos = resp?.data || [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al recuperar mazos:', err);
        this.servG.fun_mensaje('No se pudieron cargar los mazos', 'danger');
        this.cargando = false;
      },
    });
  }

  fun_estudiarMazo(m: any) {
    this.router.navigateByUrl(`/mazo/${m.mazo_id}`);
  }

  async fun_eliminarMazo(id: number) {
    const conf = confirm('¿Eliminar este mazo y sus tarjetas?');
    if (!conf) return;

    try {
      const resp = await firstValueFrom(this.servM.deleteMazo(id));
      console.log(resp);
      this.servG.fun_mensaje('Mazo eliminado correctamente');
      this.recuperarMazos();
    } catch (err) {
      console.error(err);
      this.servG.fun_mensaje('Error al eliminar mazo', 'danger');
    }
  }

  async fun_addMazo() {
    const modal = await this.modalCtrl.create({
      component: MazoModalPage,
      componentProps: {
        objetoMazo: {},
        titulo: 'Nuevo mazo',
        id: 0
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    console.log('retorna mazo:', data);

    if (data && data.mazo_id > 0) {
      this.recuperarMazos();
    }
  }

  async fun_editarMazo(m: any) {
    const modal = await this.modalCtrl.create({
      component: MazoModalPage,
      componentProps: {
        objetoMazo: m,
        titulo: 'Editar mazo',
        id: m.mazo_id
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.mazo_id > 0) {
      this.recuperarMazos();
    }
  }
}
