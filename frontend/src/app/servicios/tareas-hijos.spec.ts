import { TestBed } from '@angular/core/testing';

import { TareasHijos } from './tareas-hijos';

describe('TareasHijos', () => {
  let service: TareasHijos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TareasHijos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
