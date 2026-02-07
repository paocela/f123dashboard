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
    let emissionCount = 0;
    service.loading$.subscribe(loading => {
      emissionCount++;
      // First emission is the initial false, second is true after show()
      if (emissionCount === 2) {
        expect(loading).toBeTrue();
        done();
      }
    });
    service.show();
  });

  it('should hide loading after matching hide() calls', (done) => {
    let emissionCount = 0;
    service.loading$.subscribe(loading => {
      emissionCount++;
      // 1st: initial false
      // 2nd: true after first show()
      // 3rd: false after second hide()
      if (emissionCount === 3) {
        expect(loading).toBeFalse();
        done();
      }
    });
    service.show();
    service.show();
    service.hide();
    service.hide();
  });

  it('should not affect loading state when hide() is called without show()', (done) => {
    let emitted = false;
    service.loading$.subscribe(loading => {
      if (!emitted) {
        emitted = true;
        expect(loading).toBeFalse();
        done();
      }
    });
    service.hide();
  });
});