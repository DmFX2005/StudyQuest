import { TestBed } from '@angular/core/testing';

import { TareasProfe } from './tareas-profe';

describe('TareasProfe', () => {
  let service: TareasProfe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TareasProfe);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
