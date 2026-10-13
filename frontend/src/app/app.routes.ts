import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./paginas/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./paginas/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'inicio',
    loadComponent: () => import('./paginas/inicio/inicio.page').then( m => m.InicioPage)
  },
  {
    path: 'tareas',
    loadComponent: () => import('./paginas/tareas/tareas.page').then( m => m.TareasPage)
  },
  {
    path: 'flashcards',
    loadComponent: () => import('./paginas/flashcards/flashcards.page').then( m => m.FlashcardsPage)
  },
  {
    path: 'pomodoro',
    loadComponent: () => import('./paginas/pomodoro/pomodoro.page').then( m => m.PomodoroPage)
  },
  {
    path: 'tarjeta',
    loadComponent: () => import('./paginas/tarjeta/tarjeta.page').then( m => m.TarjetaPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./paginas/perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'mis-estudiantes/:id',
    loadComponent: () => import('./paginas/mis-estudiantes/mis-estudiantes.page').then( m => m.MisEstudiantesPage)
  },
  {
    path: 'hijos',
    loadComponent: () => import('./paginas/hijos/hijos.page').then( m => m.HijosPage)
  },
  {
    path: 'recompensas',
    loadComponent: () => import('./paginas/recompensas/recompensas.page').then( m => m.RecompensasPage)
  },
  {
    path: 'calendario',
    loadComponent: () => import('./paginas/calendario/calendario.page').then( m => m.CalendarioPage)
  },
  {
    path: 'tarea',
    loadComponent: () => import('./paginas/tarea/tarea.page').then( m => m.TareaPage)
  },
  {
    path: 'mazo/:id',
    loadComponent: () => import('./paginas/mazo/mazo.page').then( m => m.MazoPage)
  },
  {
    path: 'mazo-modal',
    loadComponent: () => import('./paginas/mazo-modal/mazo-modal.page').then( m => m.MazoModalPage)
  },
  {
    path: 'tareas-hijo',
    loadComponent: () => import('./paginas/tareas-hijo/tareas-hijo.page').then( m => m.TareasHijoPage)
  },
  {
    path: 'datos-perfil',
    loadComponent: () => import('./paginas/datos-perfil/datos-perfil.page').then( m => m.DatosPerfilPage)
  },
  {
    path: 'hijo',
    loadComponent: () => import('./paginas/hijo/hijo.page').then( m => m.HijoPage)
  },
  {
    path: 'asignar-tareas',
    loadComponent: () => import('./paginas/asignar-tareas/asignar-tareas.page').then( m => m.AsignarTareasPage)
  },
  {
    path: 'aulas',
    loadComponent: () => import('./paginas/aulas/aulas.page').then( m => m.AulasPage)
  },
  {
    path: 'revisar-tareas',
    loadComponent: () => import('./paginas/revisar-tareas/revisar-tareas.page').then( m => m.RevisarTareasPage)
  },
  {
    path: 'aula',
    loadComponent: () => import('./paginas/aula/aula.page').then( m => m.AulaPage)
  },
  {
    path: 'agg-estudiante-aula',
    loadComponent: () => import('./paginas/agg-estudiante-aula/agg-estudiante-aula.page').then( m => m.AggEstudianteAulaPage)
  },
];
