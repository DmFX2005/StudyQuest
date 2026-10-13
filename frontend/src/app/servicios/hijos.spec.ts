import { TestBed } from '@angular/core/testing';

import { Hijos } from './hijos';

describe('Hijos', () => {
  let service: Hijos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Hijos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
