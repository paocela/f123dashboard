import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show loading on first show() call', (done) => {
    service.loading$.subscribe(loading => {
      expect(loading).toBeTrue();
      done();
    });
    service.show();
  });

  it('should hide loading after matching hide() calls', (done) => {
    service.show();
    service.show();
    service.hide();
    service.loading$.subscribe(loading => {
      expect(loading).toBeTrue();
    });
    service.hide();
    service.loading$.subscribe(loading => {
      expect(loading).toBeFalse();
      done();
    });
  });

  it('should not affect loading state when hide() is called without show()', (done) => {
    service.hide();
    service.loading$.subscribe(loading => {
      expect(loading).toBeFalse();
      done();
    });
  });
});