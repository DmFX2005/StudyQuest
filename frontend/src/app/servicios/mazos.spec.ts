import { TestBed } from '@angular/core/testing';

import { Mazos } from './mazos';

describe('Mazos', () => {
  let service: Mazos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mazos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
