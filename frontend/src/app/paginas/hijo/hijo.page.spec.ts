import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HijoPage } from './hijo.page';

describe('HijoPage', () => {
  let component: HijoPage;
  let fixture: ComponentFixture<HijoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HijoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
