import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignarTareasPage } from './asignar-tareas.page';

describe('AsignarTareasPage', () => {
  let component: AsignarTareasPage;
  let fixture: ComponentFixture<AsignarTareasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarTareasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
