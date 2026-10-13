import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisEstudiantesPage } from './mis-estudiantes.page';

describe('MisEstudiantesPage', () => {
  let component: MisEstudiantesPage;
  let fixture: ComponentFixture<MisEstudiantesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisEstudiantesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
