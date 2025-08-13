# DreandosTwitchInterface Documentation

## Overview

The `DreandosTwitchInterface` class provides integration with the Twitch API to retrieve stream information. It handles authentication with Twitch's API and fetches live stream data for specified channels.

## Features

- Twitch API authentication using OAuth 2.0 Client Credentials flow
- Stream information retrieval for specific channels
- Automatic token management with expiration handling
- Error handling for API requests

## Configuration

The service requires the following configuration:

- `clientId`: Twitch Client ID (hardcoded in the service)
- `clientSecret`: Retrieved from `RACEFORFEDERICA_DREANDOS_SECRET` environment variable
- `tokenUrl`: Twitch OAuth token endpoint
- `apiUrl`: Twitch API base URL

## Authentication

The service uses OAuth 2.0 Client Credentials flow:

1. Exchanges client credentials for access token
2. Caches token with expiration time
3. Automatically refreshes token when expired

## Methods

### Constructor

```typescript
constructor()
```

Initializes the service with Twitch API configuration:

- Sets up client ID and secret
- Configures API endpoints
- Initializes token management variables

### Private Methods

#### `getAccessToken(): Promise<string>`

Handles Twitch API authentication and token management.

**Returns:**
- Promise resolving to access token string

**Functionality:**
- Checks if current token is valid and not expired
- Requests new token if needed using client credentials
- Caches token with expiration time
- Uses `client_credentials` grant type

**Token Request:**
- Endpoint: `https://id.twitch.tv/oauth2/token`
- Method: POST
- Content-Type: `application/x-www-form-urlencoded`
- Parameters:
  - `client_id`: Twitch Client ID
  - `client_secret`: Twitch Client Secret
  - `grant_type`: "client_credentials"

**Error Handling:**
- Throws error if client secret is not configured
- Throws error if token request fails
- Includes detailed error messages

**Example Token Response:**
```json
{
  "access_token": "abcdef123456",
  "expires_in": 3600
}
```

### Public Methods

#### `getStreamInfo(channelName: string): Promise<string>`

Retrieves stream information for a specific Twitch channel.

**Parameters:**
- `channelName: string` - Twitch channel username

**Returns:**
- Promise resolving to JSON string containing stream data

**API Request:**
- Endpoint: `https://api.twitch.tv/helix/streams?user_login={channelName}`
- Method: GET
- Headers:
  - `Client-ID`: Twitch Client ID
  - `Authorization`: Bearer {access_token}

**Response Format:**
The method returns a JSON string containing Twitch API response with stream data.

**Stream Data Fields:**
- `data`: Array of stream objects (empty if not live)
  - `id`: Stream ID
  - `user_id`: Channel user ID
  - `user_login`: Channel username
  - `type`: Stream type (usually "live")
  - `title`: Stream title
  - `viewer_count`: Current viewer count
  - `started_at`: Stream start time (ISO 8601)
  - `language`: Stream language
  - `thumbnail_url`: Stream thumbnail URL template

**Example Response (Live Stream):**
```json
{
  "data": [
    {
      "id": "123456789",
      "user_id": "987654321",
      "user_login": "channelname",
      "type": "live",
      "title": "Amazing F1 Race!",
      "viewer_count": 1500,
      "started_at": "2023-01-01T12:00:00Z",
      "language": "en",
      "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_channelname-{width}x{height}.jpg"
    }
  ]
}
```

**Example Response (Offline Stream):**
```json
{
  "data": []
}
```

**Error Handling:**
- Automatically handles token refresh if needed
- Throws error if authentication fails
- Throws error if stream info request fails
- Includes detailed error messages

**Example Usage:**
```typescript
const twitchService = new DreandosTwitchInterface();

try {
  const streamInfo = await twitchService.getStreamInfo('channelname');
  const streamData = JSON.parse(streamInfo);
  
  if (streamData.data.length > 0) {
    console.log('Channel is live!');
    console.log('Title:', streamData.data[0].title);
    console.log('Viewers:', streamData.data[0].viewer_count);
  } else {
    console.log('Channel is offline');
  }
} catch (error) {
  console.error('Error fetching stream info:', error);
}
```

## TypeScript Interfaces

### TwitchTokenResponse
```typescript
interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
}
```

### TwitchStreamResponse
```typescript
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
```

## Error Handling

The service implements comprehensive error handling:

- Environment variable validation
- API request error handling
- Token refresh error handling
- Detailed error messages for debugging

Common error scenarios:
- Missing client secret environment variable
- Invalid client credentials
- Network connectivity issues
- Invalid channel names
- Rate limiting from Twitch API

## Security Considerations

- Client secret is stored as environment variable
- Access tokens are cached in memory only
- Uses HTTPS for all API requests
- Client ID is hardcoded (consider making it configurable)

## Rate Limiting

Twitch API has rate limits:
- Client ID rate limit: 800 requests per minute
- Consider implementing request throttling for high-volume applications
- Monitor API usage to avoid hitting limits

## Environment Variables

Required environment variables:
- `RACEFORFEDERICA_DREANDOS_SECRET`: Twitch Client Secret

## Dependencies

- `axios`: HTTP client for API requests
- `@genezio/types`: Genezio deployment types

## Usage Example

```typescript
const twitchService = new DreandosTwitchInterface();

// Check if a channel is live
const checkStream = async (channelName: string) => {
  try {
    const streamInfo = await twitchService.getStreamInfo(channelName);
    const data = JSON.parse(streamInfo);
    
    if (data.data.length > 0) {
      const stream = data.data[0];
      return {
        isLive: true,
        title: stream.title,
        viewers: stream.viewer_count,
        startedAt: stream.started_at,
        thumbnailUrl: stream.thumbnail_url
      };
    } else {
      return {
        isLive: false
      };
    }
  } catch (error) {
    console.error('Error checking stream:', error);
    return {
      isLive: false,
      error: error.message
    };
  }
};

// Usage
const streamStatus = await checkStream('dreandos');
```

## Future Improvements

1. Make client ID configurable through environment variables
2. Implement request caching to reduce API calls
3. Add support for multiple channels in single request
4. Implement webhook support for real-time updates
5. Add retry logic for failed requests
6. Implement proper logging
7. Add support for other Twitch API endpoints
8. Implement rate limiting protection
9. Add user authentication support
10. Cache stream data for better performance

## Deployment

The service is deployed using the `@GenezioDeploy()` decorator and can be called from the client application through the Genezio SDK.

## Twitch API Documentation

For more information about Twitch API:
- [Twitch API Reference](https://dev.twitch.tv/docs/api/)
- [Authentication Guide](https://dev.twitch.tv/docs/authentication/)
- [Streams API](https://dev.twitch.tv/docs/api/reference#get-streams)
