# API and Configuration Services

This document describes the improved API and configuration management system in the F1 Dashboard application.

## Overview

The application now uses a centralized approach for handling:

- API base URLs and endpoints
- Environment-specific configurations  
- HTTP requests with consistent headers

## Services

### ConfigService

Manages application-wide configuration settings based on the environment.

**Key Features:**

- Environment-based configuration loading
- Production/development mode detection
- Token refresh timing configuration

**Usage:**

```typescript
import { ConfigService } from './config.service';

constructor(private configService: ConfigService) {}

// Get API base URL
const baseUrl = this.configService.apiBaseUrl;

// Check if production
const isProd = this.configService.isProduction;
```

### ApiService

Provides a centralized HTTP client for making API requests.

**Key Features:**

- Automatic base URL management
- Consistent header creation
- Type-safe HTTP methods
- Authentication header helpers

**Usage:**

```typescript
import { ApiService } from './api.service';

constructor(private apiService: ApiService) {}

// Make authenticated POST request
const response = await firstValueFrom(
  this.apiService.post<AuthResponse>('AuthService/login', requestBody, {
    headers: this.apiService.createAuthHeaders(token)
  })
);

// Get endpoint URL
const url = this.apiService.getEndpointUrl('AuthService/register');
```

## Environment Configuration

### Development (environment.ts)

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8083'
};
```

### Production (environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://f123dashboard.app.genez.io'
};
```

## Benefits

### Before (Problems)

- Hardcoded URL logic scattered across services
- Duplicate environment detection code
- Inconsistent header creation

### After (Solutions)

- ✅ Centralized configuration management
- ✅ Single source of truth for API URLs
- ✅ Consistent HTTP request handling
- ✅ Type-safe API calls
- ✅ Easy to test and mock
- ✅ Configurable token refresh timing

## Migration Guide

### For New Services

1. Inject `ApiService` instead of `HttpClient`
2. Use `apiService.post()`, `apiService.get()`, etc.
3. Use `ConfigService` for configuration values

### For Existing Services

1. Replace hardcoded base URL logic with `ApiService`
2. Use `apiService.createHeaders()` for consistent headers

## Testing

Both services include comprehensive unit tests:

- `api.service.spec.ts`
- `config.service.spec.ts`

Run tests with:

```bash
ng test
```

## Angular Configuration

The `angular.json` file is configured to automatically replace environment files during production builds:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

This ensures the correct configuration is used for each environment without code changes.
