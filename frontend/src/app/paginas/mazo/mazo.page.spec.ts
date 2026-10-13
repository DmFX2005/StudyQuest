import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MazoPage } from './mazo.page';

describe('MazoPage', () => {
  let component: MazoPage;
  let fixture: ComponentFixture<MazoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MazoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
