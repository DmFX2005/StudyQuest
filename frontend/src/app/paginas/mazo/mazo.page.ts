import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonCard,
  IonCardContent,
  ModalController
} from '@ionic/angular/standalone';

import { ActivatedRoute } from '@angular/router';
import { General } from 'src/app/servicios/general';
import { Mazos } from 'src/app/servicios/mazos';
import { TarjetaPage } from '../tarjeta/tarjeta.page';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-mazo',
  templateUrl: './mazo.page.html',
  styleUrls: ['./mazo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    IonCard,
    IonCardContent,
  ],
})
export class MazoPage implements OnInit {
  mazoId!: number;
  mazo: any = null;
  tarjetas: any[] = [];
  cargando: boolean = false;

  currentIndex: number = 0;
  isFlipped: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public servG: General,
    private servM: Mazos,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.mazoId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ionViewWillEnter() {
    this.cargarMazoYTarjetas();
  }

  cargarMazoYTarjetas() {
    this.cargando = true;

    this.servM.getTarjetasDeMazo(this.mazoId).subscribe({
      next: (resp: any) => {
        this.tarjetas = resp?.data || [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar tarjetas del mazo:', err);
        this.servG.fun_mensaje('No se pudieron cargar las tarjetas', 'danger');
        this.cargando = false;
      },
    });
  }

  get totalTarjetas(): number {
    return this.tarjetas.length;
  }

  get tarjetaActual(): any {
    if (this.tarjetas.length === 0) return null;
    return this.tarjetas[this.currentIndex];
  }

  flipCard() {
    if (!this.tarjetaActual) return;
    this.isFlipped = !this.isFlipped;
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  nextCard() {
    if (this.currentIndex < this.tarjetas.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
    }
  }

  async fun_addTarjeta() {
    const modal = await this.modalCtrl.create({
      component: TarjetaPage,
      componentProps: {
        mazoId: this.mazoId,
        objetoTarjeta: {},
        titulo: 'Nueva tarjeta',
        id: 0,
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.tarjeta_id > 0) {
      this.cargarMazoYTarjetas();
    }
  }

  async fun_editarTarjetaActual() {
    if (!this.tarjetaActual) return;

    const modal = await this.modalCtrl.create({
      component: TarjetaPage,
      componentProps: {
        mazoId: this.mazoId,
        objetoTarjeta: this.tarjetaActual,
        titulo: 'Editar tarjeta',
        id: this.tarjetaActual.tarjeta_id,
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.tarjeta_id > 0) {
      this.cargarMazoYTarjetas();
    }
  }

  async fun_eliminarTarjetaActual() {
    if (!this.tarjetaActual) return;

    const conf = confirm('¿Eliminar esta tarjeta?');
    if (!conf) return;

    try {
      const resp = await firstValueFrom(
        this.servM.deleteTarjeta(this.tarjetaActual.tarjeta_id)
      );
      console.log(resp);
      this.servG.fun_mensaje('Tarjeta eliminada correctamente');
      this.cargarMazoYTarjetas();
    } catch (err) {
      console.error(err);
      this.servG.fun_mensaje('Error al eliminar tarjeta', 'danger');
    }
  }
}
