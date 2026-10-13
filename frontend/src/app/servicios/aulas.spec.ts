import { TestBed } from '@angular/core/testing';

import { Aulas } from './aulas';

describe('Aulas', () => {
  let service: Aulas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aulas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
