import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct base URL', () => {
    expect(service.getBaseUrl()).toBeDefined();
  });

  it('should construct endpoint URLs correctly', () => {
    const endpoint = 'AuthService/login';
    const url = service.getEndpointUrl(endpoint);
    expect(url).toContain(endpoint);
  });

  it('should create headers with content type', () => {
    const headers = service.createHeaders(false);
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should create headers with user agent when requested', () => {
    const headers = service.createHeaders(true);
    expect(headers['User-Agent']).toBeDefined();
  });

  it('should create auth headers with bearer token', () => {
    const token = 'test-token';
    const headers = service.createAuthHeaders(token);
    expect(headers['Authorization']).toBe(`Bearer ${token}`);
  });
});
