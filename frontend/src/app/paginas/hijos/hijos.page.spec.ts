import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HijosPage } from './hijos.page';

describe('HijosPage', () => {
  let component: HijosPage;
  let fixture: ComponentFixture<HijosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HijosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
