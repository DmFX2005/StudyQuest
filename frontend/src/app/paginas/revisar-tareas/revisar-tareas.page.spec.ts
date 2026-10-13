import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevisarTareasPage } from './revisar-tareas.page';

describe('RevisarTareasPage', () => {
  let component: RevisarTareasPage;
  let fixture: ComponentFixture<RevisarTareasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisarTareasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
