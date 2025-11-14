import axios from 'axios';

export type TwitchTokenResponse = {
  access_token: string;
  expires_in: number;
}

export type TwitchStreamResponse = {
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

export class TwitchService {
  private clientId: string = '76pgow7h813kegw9ivqb9c63anh2uc';
  private clientSecret: string = process.env.RACEFORFEDERICA_DREANDOS_SECRET ?? "";
  private tokenUrl = 'https://id.twitch.tv/oauth2/token';
  private apiUrl = 'https://api.twitch.tv/helix';
  private accessToken: string | null = null;
  private tokenExpiration: number = 0;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiration) {
      return this.accessToken;
    }

    if (!this.clientSecret) {
      throw new Error("Twitch client secret is not set.");
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

  async getStreamInfo(channelName: string): Promise<TwitchStreamResponse> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get<TwitchStreamResponse>(
        `${this.apiUrl}/streams?user_login=${channelName}`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch stream info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
