import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TareaPage } from './tarea.page';

describe('TareaPage', () => {
  let component: TareaPage;
  let fixture: ComponentFixture<TareaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TareaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
