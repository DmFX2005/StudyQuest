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
  IonSegment,
  IonSegmentButton,
  IonText,
  IonSpinner,
  ModalController,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';

import { General } from 'src/app/servicios/general';
import { Tareas } from 'src/app/servicios/tareas';
import { TareaPage } from '../tarea/tarea.page';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
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
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonSpinner,
    IonRow,
    IonCol,
  ],
})
export class TareasPage implements OnInit {
  tareas: any[] = [];
  cargando: boolean = false;

  filtroEstado: string = 'PENDIENTE';

  constructor(
    public servG: General,
    private servT: Tareas,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.recuperarTareas();
  }

  cambiarFiltro(ev: any) {
    this.filtroEstado = ev.detail.value;
    this.recuperarTareas();
  }

  recuperarTareas() {
    this.cargando = true;
    this.servT.getMisTareas(this.filtroEstado).subscribe({
      next: (resp: any) => {
        this.tareas = resp?.data || [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al recuperar tareas:', err);
        this.servG.fun_mensaje('No se pudieron recuperar las tareas', 'danger');
        this.cargando = false;
      },
    });
  }

  async fun_addTarea() {
    const modal = await this.modalCtrl.create({
      component: TareaPage,
      componentProps: {
        objetoTarea: {},
        titulo: 'Nueva tarea',
        id: 0,
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.tarea_id > 0) {
      this.recuperarTareas();
    }
  }

  async fun_editarTarea(t: any) {
    if (t.origen_tarea === 'PROFESOR') {
      this.servG.fun_mensaje('No se puede editar una tarea asignada por el profesor', 'warning');
      return;
    }
    const modal = await this.modalCtrl.create({
      component: TareaPage,
      componentProps: {
        objetoTarea: t,
        titulo: 'Editar tarea',
        id: t.tarea_id,
      },
      backdropDismiss: false,
      mode: 'ios',
      showBackdrop: true,
      animated: true,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.tarea_id > 0) {
      this.recuperarTareas();
    }
  }

  async fun_completarTarea(t: any) {
    const confirmacion = confirm('¿Marcar esta tarea como completada?');
    if (!confirmacion) return;

    try {
      if (t.origen_tarea === 'PROFESOR') {
        const resp = await firstValueFrom(this.servT.completarTareaProfesor(t.tarea_id));
        console.log('Respuesta completar profesor:', resp);
      } else {
        const resp = await firstValueFrom(this.servT.completarTareaPersonal(t.tarea_id));
        console.log('Respuesta completar:', resp);
      }
      this.servG.fun_mensaje('Tarea completada 🎉');
      this.recuperarTareas();
    } catch (err) {
      console.error('Error al completar tarea:', err);
      this.servG.fun_mensaje('Error al completar la tarea', 'danger');
    }
  }

  async fun_eliminarTarea(id: number) {
    const confirmacion = confirm('¿Estás seguro de eliminar esta tarea?');
    if (!confirmacion) return;

    try {
      if (this.tareas.find(t => t.tarea_id === id)?.origen_tarea === 'PROFESOR') {
        this.servG.fun_mensaje('No se puede eliminar una tarea asignada por el profesor', 'warning');
      } else {
        const resp = await firstValueFrom(this.servT.deleteTareaPersonal(id));
        console.log('Respuesta eliminar:', resp);
        this.servG.fun_mensaje('Tarea eliminada correctamente');
        this.recuperarTareas();
      }
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      this.servG.fun_mensaje('Error al eliminar la tarea', 'danger');
    }
  }
}
