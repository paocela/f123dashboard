import { GenezioDeploy } from "@genezio/types";
import { Observable } from 'rxjs';
import axios from 'axios';

interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
}

interface TwitchStreamResponse {
    data: Array<{
        id: string;
        user_id: string;
        user_login: string;
        type: string;
        title: string;
        viewer_count: number;
        started_at: string;
        language: string;
        thumbnail_url: string;
    }>;
}

@GenezioDeploy()
export class DreandosTwitchInterface {
    private clientId: string = '76pgow7h813kegw9ivqb9c63anh2uc'; // Replace with your Twitch Client ID
    private clientSecret: string  = process.env.RACEFORFEDERICA_DREANDOS_SECRET ?? "";
    private tokenUrl = 'https://id.twitch.tv/oauth2/token';
    private apiUrl = 'https://api.twitch.tv/helix';
    private accessToken: string | null = null;
    private tokenExpiration: number = 0;
    

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiration) {
            return this.accessToken;
        }

        const body = new URLSearchParams();
        body.set('client_id', this.clientId);
        body.set('client_secret', this.clientSecret);
        body.set('grant_type', 'client_credentials');
    
        try {
            const response = await axios.post<TwitchTokenResponse>(
                this.tokenUrl,
                body.toString(),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
            return this.accessToken;
        } catch (error) {
            throw new Error(`Failed to fetch access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getStreamInfo(channelName: string): Promise<string> {
     
      return this.getAccessToken()
        .then(token => {
          return axios.get<TwitchStreamResponse>(
            `${this.apiUrl}/streams?user_login=${channelName}`,
            {
              headers: {
                'Client-ID': this.clientId,
                'Authorization': `Bearer ${token}`
              }
            }
          );
        })
        .then(response => {
          return JSON.stringify(response.data);
        })
        .catch(error => {
          throw new Error(`Failed to fetch access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
  
  }
}
