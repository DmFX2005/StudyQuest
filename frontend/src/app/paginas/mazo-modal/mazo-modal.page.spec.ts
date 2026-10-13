import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MazoModalPage } from './mazo-modal.page';

describe('MazoModalPage', () => {
  let component: MazoModalPage;
  let fixture: ComponentFixture<MazoModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MazoModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
