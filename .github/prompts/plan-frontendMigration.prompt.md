# Plan: Angular Frontend Migration to Express.js Backend

This document provides a comprehensive roadmap for migrating the Angular frontend from Genezio SDK to the new Express.js backend API.

## Current State Analysis

### Genezio Dependencies Found:
- **Package**: `@genezio-sdk/f123dashboard` - Used throughout the application
- **Services Using Genezio**:
  - `auth.service.ts` - Uses `AuthService` from Genezio SDK
  - `db-data.service.ts` - Uses `PostgresService`, `FantaService` from Genezio SDK
  - `fanta.service.ts` - Uses Genezio types
  - `season.service.ts` - Uses `PostgresService`, `Season` from Genezio SDK
  - `twitch-api.service.ts` - Uses `DreandosTwitchInterface` from Genezio SDK
  - `playground.service.ts` - Uses `PlaygroundInterface` from Genezio SDK

### Components Using Genezio Types:
- Multiple components import types from `@genezio-sdk/f123dashboard`
- These will need to import from local type definitions instead

## Migration Goals

1. **Remove Genezio Dependency**: Eliminate `@genezio-sdk/f123dashboard` and `genezio` packages
2. **Create Shared Types Package**: Single source of truth for types used by both frontend and backend
3. **Update Environment Configuration**: Configure API URLs for dev and production
4. **Setup Proxy Configuration**: Handle `/api/*` requests in development
5. **Refactor Services**: Update all services to use HttpClient instead of Genezio SDK
6. **Concurrent Development**: Enable running frontend and backend simultaneously
7. **Update Build Process**: Ensure production builds work correctly

---

## Phase 1: Environment & Configuration Setup

### 1.1 Create Proxy Configuration for Development

**File**: `client/proxy.conf.json`
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Purpose**: Redirect all `/api/*` requests to the Express backend during development, avoiding CORS issues.

### 1.2 Update Angular Configuration

**File**: `client/angular.json`

Add proxy configuration to the development server options:
```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### 1.3 Update Environment Files

**File**: `client/src/environments/environment.ts` (Development)
```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api'  // Will be proxied to http://localhost:3000/api
};
```

**File**: `client/src/environments/environment.prod.ts` (Production)
```typescript
export const environment = {
  production: true,
  apiBaseUrl: '/api'  // Same origin in production (Express serves both)
};
```

**Rationale**: Using `/api` as a relative path allows the same configuration to work in both development (via proxy) and production (same server).

---

## Phase 2: Shared Types Package (Recommended Approach)

### 2.0 Why Shared Package?

**Benefits**:
- ✅ **Single Source of Truth**: Types defined once, used by both frontend and backend
- ✅ **Type Safety Across Stack**: Compile-time errors if frontend/backend types drift
- ✅ **Easy Maintenance**: Update types in one place, both apps get the changes
- ✅ **Scalable**: Easy to add more consumers (mobile app, CLI tools, etc.)
- ✅ **No Duplication**: Zero code duplication between client and server

### 2.1 Create Shared Package Structure

**File**: `shared/package.json`
```json
{
  "name": "@f123dashboard/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

**File**: `shared/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.2 Extract Types from Server Services

Copy exact type definitions from `server/src/services/*.ts` to the shared package:

**File**: `shared/src/models/auth.ts`

```typescript
// Extracted from server/src/services/auth.service.ts

export type User = {
  id: number;
  username: string;
  name: string;
  surname: string;
  mail?: string;
  image?: string;
  isAdmin?: boolean;
}

export type LoginRequest = {
  username: string;
  password: string;
  userAgent?: string;
}

export type RegisterRequest = {
  username: string;
  name: string;
  surname: string;
  password: string;
  mail: string;
  image: string;
}

export type AuthResponse = {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  jwtToken: string;
}

export type AdminChangePasswordRequest = {
  userName: string;
  newPassword: string;
  jwtToken: string;
}

export type ChangePasswordResponse = {
  success: boolean;
  message: string;
}

export type TokenValidationResponse = {
  valid: boolean;
  userId?: number;
  username?: string;
  name?: string;
  surname?: string;
  mail?: string;
  image?: string;
  isAdmin?: boolean;
}

export type RefreshTokenResponse = {
  success: boolean;
  token?: string;
  message: string;
}

export type LogoutResponse = {
  success: boolean;
  message: string;
}

export type UpdateUserInfoRequest = {
  name?: string;
  surname?: string;
  mail?: string;
  image?: string;
  jwt: string;
}

export type UserSession = {
  sessionToken: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

export type SessionsResponse = {
  success: boolean;
  message?: string;
  sessions?: UserSession[];
}
```

**File**: `shared/src/models/database.ts`
```typescript
// Extracted from server/src/services/database.service.ts

export type DriverData = {
  driver_id: number;
  driver_username: string;
  driver_name: string;
  driver_surname: string;
  driver_description: string;
  driver_license_pt: number;
  driver_consistency_pt: number;
  driver_fast_lap_pt: number;
  drivers_dangerous_pt: number;
  driver_ingenuity_pt: number;
  driver_strategy_pt: number;
  driver_color: string;
  car_name: string;
  car_overall_score: number;
  total_sprint_points: number;
  total_free_practice_points: number;
  total_qualifying_points: number;
  total_full_race_points: number;
  total_race_points: number;
  total_points: number;
}

export type Driver = {
  id: number;
  username: string;
  first_name: string;
  surname: string;
}

export type SessionResult = {
  position: number;
  driver_username: string;
  fast_lap: boolean | null;
}

export type ChampionshipData = {
  gran_prix_id: number;
  track_name: string;
  gran_prix_date: Date;
  gran_prix_has_sprint: number;
  gran_prix_has_x2: number;
  track_country: string;
  sessions: {
    free_practice?: SessionResult[];
    qualifying?: SessionResult[];
    race?: SessionResult[];
    sprint?: SessionResult[];
    full_race?: SessionResult[];
  };
  fastLapDrivers: {
    race?: string;
    sprint?: string;
    full_race?: string;
  };
}

export type Season = {
  id: number;
  description: string;
  startDate?: Date;
  endDate?: Date;
}

export type TrackData = {
  track_id: number;
  name: string;
  date: string;
  has_sprint: number;
  has_x2: number;
  country: string;
  besttime_driver_time: string;
  username: string;
}

export type CumulativePointsData = {
  date: string;
  track_name: string;
  driver_id: number;
  driver_username: string;
  driver_color: string;
  cumulative_points: number;
}

export type RaceResult = {
  id: number;
  track_id: number;
  id_1_place: number;
  id_2_place: number;
  id_3_place: number;
  id_4_place: number;
  id_5_place: number;
  id_6_place: number;
  id_7_place: number;
  id_8_place: number;
  id_fast_lap: number;
  list_dnf: string;
}

export type Constructor = {
  constructor_id: number;
  constructor_name: string;
  constructor_color: string;
  driver_1_id: number;
  driver_1_username: string;
  driver_1_tot_points: number;
  driver_2_id: number;
  driver_2_username: string;
  driver_2_tot_points: number;
  constructor_tot_points: number;
  constructor_race_points?: number;
  constructor_full_race_points?: number;
  constructor_sprint_points?: number;
  constructor_qualifying_points?: number;
  constructor_free_practice_points?: number;
}

export type ConstructorGrandPrixPoints = {
  constructor_id: number;
  constructor_name: string;
  grand_prix_id: number;
  grand_prix_date: string;
  track_name: string;
  track_id: number;
  season_id: number;
  season_description: string;
  driver_id_1: number;
  driver_id_2: number;
  driver_1_points: number;
  driver_2_points: number;
  constructor_points: number;
}
```

**File**: `shared/src/models/fanta.ts`
```typescript
// Extracted from server/src/services/fanta.service.ts

export type FantaVote = {
  fanta_player_id: number;
  username: string;
  track_id: number;
  id_1_place: number;
  id_2_place: number;
  id_3_place: number;
  id_4_place: number;
  id_5_place: number;
  id_6_place: number;
  id_7_place: number;
  id_8_place: number;
  id_fast_lap: number;
  id_dnf: number;
  season_id?: number;
  constructor_id: number;
}
```

**File**: `shared/src/models/playground.ts`
```typescript
// Extracted from server/src/services/playground.service.ts

export type PlaygroundBestScore = {
  user_id: number;
  username: string;
  image: string;
  best_score: number;
  best_date: Date;
}
```

**File**: `shared/src/models/twitch.ts`
```typescript
// Extracted from server/src/services/twitch.service.ts

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
```

**File**: `shared/src/index.ts`
```typescript
// Barrel export for all shared types
export * from './models/auth';
export * from './models/database';
export * from './models/fanta';
export * from './models/playground';
export * from './models/twitch';
```

### 2.3 Update Root package.json for Workspaces

**File**: `package.json` (root)
```json
{
  "name": "f123dashboard",
  "private": true,
  "workspaces": [
    "client",
    "server",
    "shared"
  ],
  "scripts": {
    "start:client": "npm start --prefix client",
    "start:server": "npm run dev --prefix server",
    "start:dev": "concurrently \"npm run start:server\" \"npm run start:client\"",
    "build:shared": "npm run build --prefix shared",
    "build:client": "npm run build --prefix client",
    "build:server": "npm run build --prefix server",
    "build": "npm run build:shared && npm run build:server && npm run build:client",
    "test:client": "npm test --prefix client",
    "test:server": "npm test --prefix server"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.2",
    "@types/node": "^24.2.1",
    "concurrently": "^9.1.0",
    "sass": "^1.89.2"
  }
}
```

### 2.4 Update Server to Use Shared Types

**File**: `server/package.json`
```json
{
  "dependencies": {
    "@f123dashboard/shared": "file:../shared",
    // ... other dependencies
  }
}
```

**Update Server Services** - Example for `server/src/services/auth.service.ts`:

**Before**:
```typescript
export type User = {
  id: number;
  username: string;
  // ... rest of type
}
// ... all other type definitions
```

**After**:
```typescript
import type { 
  User, 
  LoginRequest, 
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,
  AdminChangePasswordRequest,
  ChangePasswordResponse,
  TokenValidationResponse,
  RefreshTokenResponse,
  LogoutResponse,
  UpdateUserInfoRequest,
  UserSession,
  SessionsResponse
} from '@f123dashboard/shared';

// Remove all type definitions - they're now imported from shared
export class AuthService {
  // Implementation unchanged
}
```

### 2.5 Update Client to Use Shared Types

**File**: `client/package.json`
```json
{
  "dependencies": {
    "@f123dashboard/shared": "file:../shared",
    // ... other dependencies
  }
}
```

**File**: `client/tsconfig.app.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": [],
    "paths": {
      "@f123dashboard/shared": ["../shared/src"]
    }
  }
}
```

**Update Angular Services** - Example for `client/src/app/service/auth.service.ts`:

**Before**:
```typescript
import { User, LoginRequest, AuthResponse } from '@genezio-sdk/f123dashboard';
```

**After**:
```typescript
import type { User, LoginRequest, AuthResponse } from '@f123dashboard/shared';
```

**Update Angular Components**:

**Before**:
```typescript
import { User, FantaVote } from '@genezio-sdk/f123dashboard';
```

**After**:
```typescript
import type { User, FantaVote } from '@f123dashboard/shared';
```

---

## Phase 3: Service Migration

### 3.1 Update AuthService

**File**: `client/src/app/service/auth.service.ts`

**Changes**:
1. Remove Genezio imports
2. Import types from local model
3. Update all SDK calls to use `ApiService` with HttpClient
4. Update API endpoints to match Express routes

**Example refactoring**:
```typescript
// Before:
import { AuthService as BackendAuthService } from "@genezio-sdk/f123dashboard";
const response = await BackendAuthService.login(loginRequest);

// After:
import type { LoginRequest, AuthResponse } from '@f123dashboard/shared';
const response = await firstValueFrom(
  this.apiService.post<AuthResponse>('/auth/login', loginRequest)
);
```

**API Endpoints Mapping**:
- `login()` → `POST /api/auth/login`
- `register()` → `POST /api/auth/register`
- `validateToken()` → `POST /api/auth/validate`
- `refreshToken()` → `POST /api/auth/refresh`
- `logout()` → `POST /api/auth/logout`
- `changePassword()` → `POST /api/auth/change-password`
- `updateUserInfo()` → `PUT /api/auth/update-info`
- `getUserSessions()` → `GET /api/auth/sessions`
- `terminateSession()` → `DELETE /api/auth/sessions/:sessionId`
- `terminateAllOtherSessions()` → `DELETE /api/auth/sessions/others`

### 3.2 Update DbDataService

**File**: `client/src/app/service/db-data.service.ts`

**Changes**:
1. Remove Genezio imports
2. Import types from local model
3. Inject `ApiService`
4. Update all `PostgresService` calls to HTTP requests

**Example refactoring**:
```typescript
// Before:
import { PostgresService } from "@genezio-sdk/f123dashboard";
const drivers = await PostgresService.getAllDrivers();

// After:
import type { DriverData } from '@f123dashboard/shared';
import { ApiService } from './api.service';

private apiService = inject(ApiService);

async getAllDrivers(): Promise<DriverData[]> {
  return firstValueFrom(
    this.apiService.get<DriverData[]>('/database/drivers')
  );
}
```

**API Endpoints Mapping**:
- `getAllDrivers()` → `GET /api/database/drivers`
- `getChampionship()` → `GET /api/database/championship`
- `getCumulativePoints()` → `GET /api/database/cumulative-points`
- `getAllTracks()` → `GET /api/database/tracks`
- `getRaceResults()` → `GET /api/database/race-results`
- `getUsers()` → `GET /api/database/users`
- `getConstructors()` → `GET /api/database/constructors`
- `getConstructorGrandPrixPoints()` → `GET /api/database/constructor-points`
- `getSeasons()` → `GET /api/database/seasons`

### 3.3 Update FantaService

**File**: `client/src/app/service/fanta.service.ts`

**Changes**:
1. Remove Genezio type imports
2. Import types from local model
3. Update to use `ApiService` for any direct backend calls

**API Endpoints Mapping** (if needed):
- `getFantaVotes()` → `GET /api/fanta/votes`
- `submitFantaVote()` → `POST /api/fanta/votes`
- `updateFantaVote()` → `PUT /api/fanta/votes/:id`
- `deleteFantaVote()` → `DELETE /api/fanta/votes/:id`

### 3.4 Update SeasonService

**File**: `client/src/app/service/season.service.ts`

**Changes**:
1. Remove Genezio imports
2. Import types from local model
3. Update to use `ApiService`

**Example**:
```typescript
// Before:
import { PostgresService, Season } from "@genezio-sdk/f123dashboard";
this.seasons = await PostgresService.getSeasons();

// After:
import type { Season } from '@f123dashboard/shared';
import { ApiService } from './api.service';

this.seasons = await firstValueFrom(
  this.apiService.get<Season[]>('/database/seasons')
);
```

### 3.5 Update TwitchApiService

**File**: `client/src/app/service/twitch-api.service.ts`

**Changes**:
1. Remove Genezio imports
2. Import types from local model
3. Update to use `ApiService`

**API Endpoints Mapping**:
- `getStreamStatus()` → `GET /api/twitch/stream/dreandos`

### 3.6 Update PlaygroundService

**File**: `client/src/app/service/playground.service.ts`

**Changes**:
1. Remove Genezio imports
2. Import types from local model
3. Update to use `ApiService`

**API Endpoints Mapping**:
- `getBestScores()` → `GET /api/playground/best-scores`
- `submitScore()` → `POST /api/playground/scores`

---

## Phase 4: Component Updates

### 4.1 Update All Component Imports

Replace all imports of Genezio types with shared package imports:

```typescript
// Before:
import { User, FantaVote } from '@genezio-sdk/f123dashboard';

// After:
import type { User, FantaVote } from '@f123dashboard/shared';
```

**Components to Update**:
- `admin.component.ts`
- `admin-change-password.component.ts`
- `albo-d-oro.component.ts`
- `championship.component.ts`
- `dashboard.component.ts`
- `dashboard-charts-data.ts`
- `fanta.component.ts`
- `piloti.component.ts`
- `playground.component.ts`
- `leaderboard.component.ts`
- `login.component.ts`
- `registration-modal.component.ts`
- `vote-history-table.component.ts`

---

## Phase 5: Package Management

### 5.1 Update Root package.json

**File**: `package.json` (root)

Update scripts to run both frontend and backend:

```json
{
  "scripts": {
    "start:client": "npm start --prefix client",
    "start:server": "npm run dev --prefix server",
    "start:dev": "concurrently \"npm run start:server\" \"npm run start:client\"",
    "build:client": "npm run build --prefix client",
    "build:server": "npm run build --prefix server",
    "build": "npm run build:server && npm run build:client",
    "test:client": "npm test --prefix client",
    "test:server": "npm test --prefix server"
  },
  "devDependencies": {
    "concurrently": "^9.1.0"
  }
}
```

**Install concurrently**:
```bash
npm install --save-dev concurrently
```

### 5.2 Update Client package.json

**File**: `client/package.json`

**Remove**:
```json
"@genezio-sdk/f123dashboard": "^1.0.0-prod",
"genezio": "^2.6.3"
```

**Update Scripts**:
```json
{
  "scripts": {
    "start": "ng serve -o --host 0.0.0.0 --proxy-config proxy.conf.json",
    "build": "ng build --configuration production",
    "build:dev": "ng build --configuration development"
  }
}
```

---

## Phase 6: Build & Deployment Configuration

### 6.1 Update Angular Build Configuration

**File**: `client/angular.json`

Ensure the production build outputs to `dist/browser` (as referenced in Express server):

```json
"build": {
  "builder": "@angular/build:application",
  "options": {
    "outputPath": "dist",
    "index": "src/index.html",
    "browser": "src/main.ts",
    ...
  }
}
```

### 6.2 Verify Express Static File Serving

**File**: `server/src/server.ts`

Ensure Express serves Angular in production:

```typescript
if (process.env.NODE_ENV === 'production') {
  const angularDistPath = path.join(__dirname, '../../../client/dist/browser');
  app.use(express.static(angularDistPath));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(angularDistPath, 'index.html'));
  });
}
```

---

## Phase 7: Testing & Validation

### 7.1 Development Testing

1. **Start Backend**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend** (in separate terminal):
   ```bash
   cd client
   npm start
   ```

3. **Or use concurrent script** (from root):
   ```bash
   npm run start:dev
   ```

4. **Verify**:
   - Frontend opens at `http://localhost:4200`
   - API requests proxy to `http://localhost:3000/api/*`
   - No CORS errors
   - Authentication works
   - All data loads correctly

### 7.2 Production Build Testing

1. **Build Both**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

3. **Verify**:
   - Server runs on configured port
   - Angular app loads from Express
   - API requests work on same origin
   - All routes work (Angular routing handled correctly)

---

## Migration Checklist

### Phase 1: Configuration ✓
- [ ] **1.1**: Create `client/proxy.conf.json` for development proxy
- [ ] **1.2**: Update `client/angular.json` to use proxy configuration
- [ ] **1.3**: Update environment files (`environment.ts`, `environment.prod.ts`)

### Phase 2: Shared Types Package ✓
- [ ] **2.1**: Create `shared/` directory structure
- [ ] **2.2**: Create `shared/package.json` and `shared/tsconfig.json`
- [ ] **2.3**: Extract auth types to `shared/src/models/auth.ts`
- [ ] **2.4**: Extract database types to `shared/src/models/database.ts`
- [ ] **2.5**: Extract fanta types to `shared/src/models/fanta.ts`
- [ ] **2.6**: Extract playground types to `shared/src/models/playground.ts`
- [ ] **2.7**: Extract twitch types to `shared/src/models/twitch.ts`
- [ ] **2.8**: Create barrel export `shared/src/index.ts`
- [ ] **2.9**: Update root `package.json` with workspaces config
- [ ] **2.10**: Build shared package (`cd shared && npm run build`)
- [ ] **2.11**: Update `server/package.json` to depend on `@f123dashboard/shared`
- [ ] **2.12**: Update server services to import from `@f123dashboard/shared`
- [ ] **2.13**: Remove type definitions from server services
- [ ] **2.14**: Update `client/package.json` to depend on `@f123dashboard/shared`
- [ ] **2.15**: Update `client/tsconfig.app.json` with path mapping
- [ ] **2.16**: Update Angular services to import from `@f123dashboard/shared`
- [ ] **2.17**: Update Angular components to import from `@f123dashboard/shared`

### Phase 3: Service Migration ✓
- [ ] **3.1**: Refactor `auth.service.ts` to use HttpClient
- [ ] **3.2**: Refactor `db-data.service.ts` to use HttpClient
- [ ] **3.3**: Refactor `fanta.service.ts` to use HttpClient
- [ ] **3.4**: Refactor `season.service.ts` to use HttpClient
- [ ] **3.5**: Refactor `twitch-api.service.ts` to use HttpClient
- [ ] **3.6**: Refactor `playground.service.ts` to use HttpClient

### Phase 4: Component Updates ✓
- [ ] **4.1**: Update all component imports (14 components identified)

### Phase 5: Package Management ✓
- [ ] **5.1**: Update root `package.json` with workspaces and concurrent scripts
- [ ] **5.2**: Install `concurrently` package
- [ ] **5.3**: Remove Genezio dependencies from `client/package.json`
- [ ] **5.4**: Update client scripts for proxy usage
- [ ] **5.5**: Run `npm install` from root to link workspaces

### Phase 6: Build & Deployment ✓
- [ ] **6.1**: Verify Angular build configuration
- [ ] **6.2**: Verify Express static file serving

### Phase 7: Testing ✓
- [ ] **7.1**: Test development mode with proxy
- [ ] **7.2**: Test concurrent development (frontend + backend)
- [ ] **7.3**: Test production build
- [ ] **7.4**: Test all API endpoints
- [ ] **7.5**: Test authentication flow
- [ ] **7.6**: Test all user-facing features

---

## Expected File Structure After Migration

```
f123dashboard/
├── client/                              # Angular app
│   ├── proxy.conf.json                 # NEW: Development proxy config
│   ├── angular.json                    # UPDATED: Added proxy config
│   ├── package.json                    # UPDATED: Removed Genezio, added shared
│   ├── tsconfig.app.json               # UPDATED: Path mapping for shared
│   └── src/
│       ├── environments/
│       │   ├── environment.ts          # UPDATED: Use /api
│       │   └── environment.prod.ts     # UPDATED: Use /api
│       └── app/
│           └── service/
│               ├── api.service.ts      # EXISTING: Already using HttpClient
│               ├── auth.service.ts     # UPDATED: Import from @f123dashboard/shared
│               ├── db-data.service.ts  # UPDATED: Import from @f123dashboard/shared
│               ├── fanta.service.ts    # UPDATED: Import from @f123dashboard/shared
│               ├── season.service.ts   # UPDATED: Import from @f123dashboard/shared
│               ├── twitch-api.service.ts # UPDATED: Import from @f123dashboard/shared
│               └── playground.service.ts # UPDATED: Import from @f123dashboard/shared
├── server/                              # Express backend
│   ├── package.json                    # UPDATED: Added shared dependency
│   └── src/
│       ├── server.ts                   # EXISTING: Already serves Angular
│       └── services/
│           ├── auth.service.ts         # UPDATED: Import types from @f123dashboard/shared
│           ├── database.service.ts     # UPDATED: Import types from @f123dashboard/shared
│           ├── fanta.service.ts        # UPDATED: Import types from @f123dashboard/shared
│           ├── playground.service.ts   # UPDATED: Import types from @f123dashboard/shared
│           └── twitch.service.ts       # UPDATED: Import types from @f123dashboard/shared
├── shared/                              # NEW: Shared TypeScript types
│   ├── src/
│   │   ├── models/
│   │   │   ├── auth.ts                 # NEW: Auth types
│   │   │   ├── database.ts             # NEW: Database types
│   │   │   ├── fanta.ts                # NEW: Fanta types
│   │   │   ├── playground.ts           # NEW: Playground types
│   │   │   └── twitch.ts               # NEW: Twitch types
│   │   └── index.ts                    # NEW: Barrel export
│   ├── dist/                            # Compiled JavaScript + .d.ts files
│   ├── package.json                    # NEW: Shared package config
│   └── tsconfig.json                   # NEW: TypeScript config
└── package.json                        # UPDATED: Workspaces + concurrent scripts
```

---

## Key Benefits of This Approach

1. **No CORS Issues**: Proxy in dev, same origin in prod
2. **Type Safety**: All types defined locally with TypeScript
3. **Independent Development**: Frontend and backend can run simultaneously
4. **Simple Deployment**: Single Express server serves everything
5. **Clean Architecture**: Clear separation of concerns
6. **Easy Testing**: Can test frontend and backend independently
7. **Production Ready**: Optimized build process for deployment

---

## Troubleshooting Guide

### Issue: Proxy Not Working
- Verify `proxy.conf.json` is in the `client/` directory
- Check `angular.json` has correct proxy config reference
- Restart `ng serve` after config changes

### Issue: Type Errors After Migration
- Verify all types are defined in `backend-types.ts`
- Check import paths are correct
- Ensure barrel export is working

### Issue: API Calls Failing
- Verify backend is running on port 3000
- Check network tab for actual request URLs
- Verify API endpoint paths match backend routes

### Issue: Production Build Not Serving
- Check `NODE_ENV=production` is set
- Verify Angular dist path in `server.ts`
- Check Express static middleware is configured correctly

---

## Next Steps After Migration

1. **Update Documentation**: Document new API structure
2. **Setup CI/CD**: Configure GitHub Actions for deployment
3. **Add API Tests**: Create integration tests for API endpoints
4. **Monitoring**: Add logging and monitoring for production
5. **Performance**: Optimize bundle size and API responses
