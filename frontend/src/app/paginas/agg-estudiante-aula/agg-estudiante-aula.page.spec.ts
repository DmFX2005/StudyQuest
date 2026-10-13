import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AggEstudianteAulaPage } from './agg-estudiante-aula.page';

describe('AggEstudianteAulaPage', () => {
  let component: AggEstudianteAulaPage;
  let fixture: ComponentFixture<AggEstudianteAulaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AggEstudianteAulaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
