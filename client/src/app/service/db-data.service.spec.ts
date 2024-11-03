import { TestBed } from '@angular/core/testing';

import { DbDataService } from './db-data.service';

describe('DbDataService', () => {
  let service: DbDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
