## Plan: Full Backend Migration to Express.js

This document provides a complete roadmap for migrating the Genezio-based backend to a self-hosted Express.js server. It covers the initial setup, service refactoring, secure secret management, and deployment strategy.

### 1. Why Express.js is the Best Choice

-   **Minimal Migration Effort**: Your existing class-based services map almost directly to Express route handlers, minimizing the need for complex refactoring.
-   **Ideal for Your Architecture**: The backend is stateless and database-focused, which is a perfect fit for Express's simple request/response model.
-   **Simplified Deployment**: Since the Angular frontend and the backend will be on the same machine, Express can serve both, eliminating CORS issues and simplifying the deployment process.

### 2. Proposed Architecture

```
f123dashboard/
├── client/                    # Angular app (unchanged for now)
├── server/
│   ├── src/
│   │   ├── server.ts         # Express app entry point
│   │   ├── config/
│   │   │   └── db.ts         # Centralized database connection
│   │   ├── routes/           # API routes (e.g., auth.routes.ts)
│   │   ├── controllers/      # Request/response handlers
│   │   ├── services/         # Your existing service logic
│   │   └── middleware/       # Auth, error handling, etc.
│   ├── .env                   # Local environment variables (ignored by Git)
│   ├── .env.example           # Template for environment variables
│   ├── .gitignore             # To ignore .env and node_modules
│   └── package.json
└── ...
```

### 3. Secure Secret Management

We will adopt a professional workflow for managing secrets.

-   **Local Development**: Use a `server/.env` file for local database credentials and keys. This file **must** be added to your `.gitignore` to prevent it from ever being committed to your repository.
-   **Production & CI/CD**: Use **GitHub Actions Secrets** (`Settings` > `Secrets and variables` > `Actions`). These are encrypted and provide the most secure way to manage production credentials for automated workflows.

### 4. Step-by-Step Migration Plan

#### Phase 1: Setup Express Server & Secure Configuration
1.  **Initialize Project**: In the `server/` directory, run `npm init -y` and install dependencies:
    ```bash
    npm install express cors pg jsonwebtoken dotenv
    npm install --save-dev @types/express @types/cors @types/pg @types/jsonwebtoken tsx typescript
    ```
2.  **Configure Secrets**:
    -   Update the root `.gitignore` file to ensure it ignores `.env` files by adding the line `server/.env`.
    -   Create a `server/.env.example` file with placeholder values.
3.  **Create Server Entrypoint** (`server/src/server.ts`): Set up the basic Express app, apply middleware, and define a basic health-check route.
4.  **Centralize DB Connection** (`server/src/config/db.ts`): Create and export a `pg.Pool` instance that reads its configuration from the environment variables.

#### Phase 2: Migrate All Services to the New Architecture
For each of the original service files (`auth_interface.ts`, `db_interface.ts`, `fanta_interface.ts`, `twitch_interface.ts`, `playground_interface.ts`), perform the following steps:

1.  **Refactor the Service**:
    -   Move the file to `server/src/services/` and rename it (e.g., `db_interface.ts` becomes `database.service.ts`).
    -   Remove the `@GenezioDeploy` decorator.
    -   Modify the class to accept the database pool via its constructor instead of creating a new one.

2.  **Create the Controller**:
    -   Create a corresponding controller file in `server/src/controllers/` (e.g., `database.controller.ts`).
    -   The controller will import the service, handle the Express `req` and `res` objects, and call the appropriate service methods, wrapping the logic in a `try...catch` block for error handling.

3.  **Define the Routes**:
    -   Create a router file in `server/src/routes/` (e.g., `database.routes.ts`).
    -   Define the API endpoints (e.g., `/drivers`, `/tracks`) and map them to the controller functions.
    -   Mount the router in `server.ts` under a base path (e.g., `app.use('/api/database', databaseRouter)`).

#### Phase 3: Update Angular Frontend
1.  **Modify `ApiService`**: Update `client/src/app/service/api.service.ts` to use Angular's `HttpClient`.
2.  **Replace Genezio Calls**: Replace all calls from the Genezio SDK with HTTP requests to your new Express endpoints (e.g., `this.api.post('/api/database/drivers', ...)`).

#### Phase 4: Implement Authentication & Deployment
1.  **JWT Middleware**: Create `server/src/middleware/auth.middleware.ts` to protect routes. It will validate the `Authorization` header.
2.  **Deployment Workflow**: Create a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
    -   Builds the Angular client.
    -   Builds the Express server.
    -   Securely connects to your server (e.g., via SSH).
    -   Injects the GitHub Actions Secrets into a `.env` file on the server.
    -   Starts or restarts the application using a process manager like `pm2`.

### 5. Migration Checklist

Complete the following tasks in order:

-   [X] **Phase 1.1**: Install Express dependencies and TypeScript types
-   [X] **Phase 1.2**: Update root `.gitignore` to include `server/.env`
-   [X] **Phase 1.3**: Create `server/.env.example` with placeholder values
-   [X] **Phase 1.4**: Create `server/src/config/db.ts` for centralized database connection
-   [X] **Phase 1.5**: Create `server/src/server.ts` Express app entry point
-   [X] **Phase 2.1**: Migrate `db_interface.ts` → `database.service.ts` + controller + routes
-   [X] **Phase 2.2**: Migrate `auth_interface.ts` → `auth.service.ts` + controller + routes
-   [X] **Phase 2.3**: Create `server/src/middleware/auth.middleware.ts` for JWT validation
-   [X] **Phase 2.4**: Migrate `fanta_interface.ts` → `fanta.service.ts` + controller + routes
-   [X] **Phase 2.6**: Migrate `playground_interface.ts` → `playground.service.ts` + controller + routes
-   [X] **Phase 3.1**: Refactor `client/src/app/service/api.service.ts` to use HttpClient
-   [X] **Phase 3.2**: Update all Angular service calls to use new Express API endpoints
-   [X] **Phase 2.5**: Migrate `twitch_interface.ts` → `twitch.service.ts` + controller + routes
-   [X] **Phase 4.1**: Test all API endpoints locally
-   [ ] **Phase 4.2**: Create GitHub Actions workflow for automated deployment
-   [ ] **Phase 4.3**: Configure GitHub Actions Secrets for production environment
-   [ ] **Phase 4.4**: Deploy and verify production environment
