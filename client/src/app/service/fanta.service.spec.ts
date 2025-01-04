import { TestBed } from '@angular/core/testing';

import { FantaService } from './fanta.service';

describe('FantaService', () => {
  let service: FantaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FantaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


