import { GenezioDeploy } from "@genezio/types";


@GenezioDeploy()
export class DreandosTwitchInterface {
    private clientId: string = '76pgow7h813kegw9ivqb9c63anh2uc'; // Replace with your Twitch Client ID
    private clientSecret?: string  = process.env.RACEFORFEDERICA_DREANDOS_SECRET;
    private tokenUrl = 'https://id.twitch.tv/oauth2/token';
    private apiUrl = 'https://api.twitch.tv/helix';
    
    async GetClientSecret(): Promise<string | undefined> {
        return this.clientSecret;
    }
    async GetClientId(): Promise<string> {
        return this.clientId;
    }
    async GetTokenUrl(): Promise<string> {
        return this.tokenUrl;
    }
    async GetApiUrl(): Promise<string> {
        return this.apiUrl;
    }

}