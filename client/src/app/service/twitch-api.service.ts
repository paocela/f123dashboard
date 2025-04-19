import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DreandosTwitchInterface } from "@genezio-sdk/f123dashboard" 

@Injectable({
  providedIn: 'root',
})
export class TwitchApiService {
  private clientId: string = '';
  private clientSecret = ''; //'u74utsozjjc2foy3q13sbn32uem5uq'; // Replace with your Twitch Client Secret
  private tokenUrl = ''; // 'https://id.twitch.tv/oauth2/token';
  private apiUrl = ''; // 'https://api.twitch.tv/helix';
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {
  
  }

  async initializeClient() {
    this.clientId = await DreandosTwitchInterface.getClientId(),
    this.clientSecret = await DreandosTwitchInterface.getClientSecret(),
    this.tokenUrl = await DreandosTwitchInterface.getTokenUrl(),
    this.apiUrl = await DreandosTwitchInterface.getApiUrl()
  }

  // Get OAuth Token
  getAccessToken(): Observable<any> {
    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    body.set('grant_type', 'client_credentials');

    return this.http.post(this.tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  // Fetch Stream Information
  getStreamInfo(channelName: string): Observable<any> {
    if (!this.accessToken) {
      throw new Error('Access token is not set. Call getAccessToken() first.');
    }

    const headers = new HttpHeaders({
      'Client-ID': this.clientId,
      Authorization: `Bearer ${this.accessToken}`,
    });

    return this.http.get(`${this.apiUrl}/streams?user_login=${channelName}`, {
      headers,
    });
  }

  // Set Access Token
  setAccessToken(token: string): void {
    this.accessToken = token;
  }
}