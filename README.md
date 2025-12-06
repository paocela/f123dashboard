<p align="center">
  <img src="client/src/assets/images/logo_raceforfederica.png" width="100">
  <img src="client/src/assets/images/readme/f1_evolution.gif" width="400">
  <img src="client/src/assets/images/logo_raceforfederica.png" width="100">
</p>

# F1 Dashboard RaceForFederica

Full-stack dashboard for the Esport F1 23 championship (friendly, but not so much...)

**Architecture**: Angular 18+ frontend + Express.js backend + PostgreSQL database

## Preview 🧐

| **Dashboard**                                              | **Championship**                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| ![dashboard](client/src/assets/images/readme/dashboard.png) | ![championship](client/src/assets/images/readme/campionato.png) |
| **Pilots**                                                   | **Fantasy F1**                                               |
| ![pilots](client/src/assets/images/readme/piloti.png) | ![fanta](client/src/assets/images/readme/fanta.png) |
| **Fantasy F1 Vote**                                          | **Fantasy F1 Result**                                        |
| ![fanta_voto](client/src/assets/images/readme/fanta_voto.png) | ![fanta_risultato](client/src/assets/images/readme/fanta_risultato.png) |

## Project Structure 📁

```
f123dashboard/
├── client/          # Angular 18+ frontend (standalone components)
├── server/          # Express.js backend with TypeScript
├── shared/          # Shared TypeScript types used by both client and server
└── docs/            # Documentation
```

## Building and Running 🛠️

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Setup

1. **Install dependencies** (from root):
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   
   Create `server/.env` based on `server/.env.example`:
   ```env
   RACEFORFEDERICA_DB_DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secret-key
   MAIL_USER=email@example.com
   MAIL_PASS=email-password
   RACEFORFEDERICA_DREANDOS_SECRET=twitch-secret
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

3. **Build shared types package**:
   ```bash
   cd shared
   npm run build
   cd ..
   ```

### Development

**Option 1: Run both frontend and backend concurrently** (from root):
```bash
npm run dev
```

**Option 2: Run separately**:

Backend (from `server/`):
```bash
npm run dev
```

Frontend (from `client/`):
```bash
npm start
```

- Frontend runs on `http://localhost:4200`
- Backend API runs on `http://localhost:3000`
- API requests are proxied in development via `client/proxy.conf.json`

### Production Build

```bash
# Build all packages
npm run build

# Start production server (serves both API and Angular app)
cd server
npm start
```

The Express server serves the Angular build from `/` and API endpoints from `/api/*`.

## Architecture 🏗️

### Backend (Express.js)

**Pattern**: Service → Controller → Route

- **Services** (`server/src/services/`): Business logic and database queries
- **Controllers** (`server/src/controllers/`): Request/response handlers
- **Routes** (`server/src/routes/`): API endpoint definitions
- **Middleware** (`server/src/middleware/`): Authentication (JWT), error handling
- **Config** (`server/src/config/`): Database pool, logger (Winston)

### Frontend (Angular)

- **Standalone Components**: Modern Angular 18+ architecture
- **CoreUI**: UI component library
- **Services**: Use `ApiService` for all HTTP calls to Express backend
- **Shared Types**: Import from `@f123dashboard/shared` package

### Shared Types Package

- **Location**: `shared/src/models/`
- **Purpose**: Single source of truth for TypeScript types
- **Usage**: Both client and server import from `@f123dashboard/shared`
- **Build**: Run `npm run build` in `shared/` after modifying types

### Authentication

- **JWT tokens** with 24-hour expiration
- **Middleware chain**: `authMiddleware` → `adminMiddleware` for protected routes
- **Session management**: Tokens stored in `user_sessions` table

### Logging

- **Development**: Colorized console logs (level: debug)
- **Production**: JSON file logs in `server/logs/` (level: info)
- **Configuration**: Set `LOG_LEVEL` in `.env`

## API Documentation 📚

API endpoints are mounted at `/api/*`:

- `/api/auth/*` - Authentication (login, register, token management)
- `/api/database/*` - Database queries (drivers, tracks, championships)
- `/api/fanta/*` - Fantasy F1 votes and results
- `/api/twitch/*` - Twitch stream integration
- `/api/playground/*` - Playground best scores

See `server/docs/` for detailed API documentation.

## Testing 🧪

### Postman Collections

Pre-configured Postman collections are available in `server/docs/postman/`:
- `F123Dashboard.postman_collection.json` - All API endpoints
- `F123Dashboard.postman_environment.json` - Local environment
- `F123Dashboard.postman_environment.prod.json` - Production environment

Auto-authentication flow is implemented. See `server/docs/postman/POSTMAN_README.md` for details.

## Database Notes 📋

- **Result Structure**: Entry-based tables with position fields (not separate columns per position)
- **Session Types**: Race, Sprint, Qualifying, Free Practice, Full Race
- To reset a sequence:
  ```sql
  SELECT pg_get_serial_sequence('table_name', 'column_name');
  ALTER SEQUENCE public.sequence_name RESTART WITH 1;
  ```
- See `.github/instructions/db.instructions.md` for complete schema documentation

## Migration Status ✅

This project has been successfully migrated from Genezio to self-hosted Express.js:

- ✅ Express.js backend with TypeScript
- ✅ Shared types package (`@f123dashboard/shared`)
- ✅ JWT authentication with session management
- ✅ Winston logging (console + file)
- ✅ Development proxy configuration
- ✅ Production build serving Angular app
- ✅ All services migrated (Auth, Database, Fanta, Twitch, Playground)
- ⏳ CI/CD deployment workflow (pending)

See `.github/prompts/plan-fullBackendMigration.prompt.md` and `.github/prompts/plan-frontendMigration.prompt.md` for migration details.

## Credits 🙇

Credits for this small but fun project goes to:

- [Paolo Celada](https://github.com/paocela)
- [Federico Degioanni](https://github.com/FAST-man-33)
- [Andrea Dominici](https://github.com/DomiJAR)
