import axios from 'axios';
export class TwitchService {
    constructor() {
        this.clientId = '76pgow7h813kegw9ivqb9c63anh2uc';
        this.clientSecret = process.env.RACEFORFEDERICA_DREANDOS_SECRET ?? "";
        this.tokenUrl = 'https://id.twitch.tv/oauth2/token';
        this.apiUrl = 'https://api.twitch.tv/helix';
        this.accessToken = null;
        this.tokenExpiration = 0;
    }
    async getAccessToken() {
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
            const response = await axios.post(this.tokenUrl, body.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            this.accessToken = response.data.access_token;
            this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
            return this.accessToken;
        }
        catch (error) {
            throw new Error(`Failed to fetch access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getStreamInfo(channelName) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(`${this.apiUrl}/streams?user_login=${channelName}`, {
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to fetch stream info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
