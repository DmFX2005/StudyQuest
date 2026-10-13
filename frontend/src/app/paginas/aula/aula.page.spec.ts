import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AulaPage } from './aula.page';

describe('AulaPage', () => {
  let component: AulaPage;
  let fixture: ComponentFixture<AulaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AulaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
