import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = this.configService.apiBaseUrl;
  }

  /**
   * Get the base URL for API calls
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the full URL for a specific endpoint
   */
  getEndpointUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  }

  /**
   * Make a POST request to an endpoint
   */
  post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    headers = { ...headers, ...this.setHeaderToken() };
    const options = headers ? { headers: new HttpHeaders(headers) } : {};
    return this.http.post<T>(this.getEndpointUrl(endpoint), body, options);
  }

  /**
   * Make a GET request to an endpoint
   */
  get<T>(endpoint: string, headers?: Record<string, string>): Observable<T> {
    headers = { ...headers, ...this.setHeaderToken() };
    const options = headers ? { headers: new HttpHeaders(headers) } : {};
    return this.http.get<T>(this.getEndpointUrl(endpoint), options);
  }

  /**
   * Make a PUT request to an endpoint
   */
  put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    headers = { ...headers, ...this.setHeaderToken() };
    const options = headers ? { headers: new HttpHeaders(headers) } : {};
    return this.http.put<T>(this.getEndpointUrl(endpoint), body, options);
  }

  /**
   * Make a DELETE request to an endpoint
   */
  delete<T>(endpoint: string, headers?: Record<string, string>): Observable<T> {
    headers = { ...headers, ...this.setHeaderToken() };
    const options = headers ? { headers: new HttpHeaders(headers) } : {};
    return this.http.delete<T>(this.getEndpointUrl(endpoint), options);
  }

  private setHeaderToken(): Record<string, string> {
    const match = document.cookie.match(/(^|;) ?authToken=([^;]*)(;|$)/);
    return match ? this.createAuthHeaders(match[2]) : this.createHeaders();
  }

  /**
   * Create headers with authentication token
   */
  createAuthHeaders(token: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Create headers for API requests
   */
  createHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    };
  }
}
