// Twitch types
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
