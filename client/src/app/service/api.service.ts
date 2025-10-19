import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
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
  post<T>(endpoint: string, body: any, options?: any): any {
    return this.http.post<T>(this.getEndpointUrl(endpoint), body, options);
  }

  /**
   * Make a GET request to an endpoint
   */
  get<T>(endpoint: string, options?: any): any {
    return this.http.get<T>(this.getEndpointUrl(endpoint), options);
  }

  /**
   * Make a PUT request to an endpoint
   */
  put<T>(endpoint: string, body: any, options?: any): any {
    return this.http.put<T>(this.getEndpointUrl(endpoint), body, options);
  }

  /**
   * Make a DELETE request to an endpoint
   */
  delete<T>(endpoint: string, options?: any): any {
    return this.http.delete<T>(this.getEndpointUrl(endpoint), options);
  }

  /**
   * Create headers with authentication token
   */
  createAuthHeaders(token: string): any {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Create headers for API requests
   */
  createHeaders(): any {
    return {
      'Content-Type': 'application/json'
    };
  }
}
