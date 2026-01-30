---
applyTo: '**'
---

# Angular Code Generation Instructions

## General
- Use Angular 18+ standalone components, as in this project.
- Use SCSS for stylesheets.
- Use the `app-` prefix for selectors.
- Place new components in the appropriate `src/app/views/` or `src/components/` subfolder.
- Place new services in `src/app/service/`.
- Use strict typing and follow the existing TypeScript conventions.
- Use CoreUI components and directives where possible (see imports in existing components).
- Use `CoreUI` and project-specific SCSS variables and mixins.
- Use `standalone: true` in all new components.
- Use `ChangeDetectionStrategy.OnPush` for performance in components that do not require default change detection.
- Use Angular CLI commands for scaffolding (e.g., `ng generate component`, `ng generate service`).
- Use `ApiService` for all HTTP API calls to the Express backend.
- Import types from `@f123dashboard/shared` package for type definitions.
- Use simple methods .
- Use constant and do not repeat yourself.
- Make the code simple to read with clear variable and method names.
- Comments shuld be avoided and used only to explain public class/method /variable with TSDoc standard.

## Components
- Place view components in `src/app/views/<feature>/`.
- Place reusable UI components in `src/components/`.
- Use the `@Component` decorator with `standalone: true` and proper `imports` array.
- Use CoreUI and project-specific components in the `imports` array as needed.
- Use `templateUrl` and `styleUrl` for external HTML and SCSS files, named after the component.
- Use `OnInit` lifecycle hook for initialization logic.
- Use `@Input()` and `@Output()` for component communication and event emission.
- Use `RouterLink` for navigation.
- Use PascalCase for component class names and kebab-case for filenames.
- Register new components in the appropriate `routes.ts` for lazy loading.
- Import all required modules and directives explicitly in the `imports` array.
- Use `ChangeDetectionStrategy.OnPush` for performance unless mutation is required.

## Services
- Place new services in `src/app/service/`.
- Use `@Injectable({ providedIn: 'root' })` for singleton services.
- Use `ApiService` for all API calls to the Express backend (never use `HttpClient` directly).
- Use RxJS `firstValueFrom()` to convert Observables to Promises when needed.
- Use RxJS for asynchronous operations and state management.
- Inject services using the `inject()` function for modern Angular.
- Name services with the `Service` suffix (e.g., `UserService`).
- Import all types from `@f123dashboard/shared` package.

## Routing
- Add new routes in `src/app/app.routes.ts` and/or feature-specific `routes.ts` files.
- Use lazy loading for feature modules/components.
- Use route `data` for titles and metadata.

## Testing
- Place unit tests alongside the code, using the `.spec.ts` suffix.
- Use Angular's `TestBed` for setting up tests.
- Test creation and basic logic for all components and services.

## Folder Structure
- Follow the existing structure:
  - `src/app/views/` for main app views
  - `src/app/service/` for services
  - `src/components/` for reusable components
  - `src/app/icons/` for icon sets
  - `src/assets/` for images and static assets
  - `src/scss/` for global styles

## Style
- Use SCSS for all styles.
- Use CoreUI and project SCSS variables and mixins.
- Keep styles modular and component-scoped.

## Example CLI Commands
- Generate a component: `ng generate component app/views/example --standalone --style=scss`
- Generate a service: `ng generate service app/service/example`

## References
- [CoreUI Angular Docs](https://coreui.io/angular/docs/)
- [Angular CLI Docs](https://angular.io/cli)

## Additional Project-Specific Instructions

### File and Folder Structure
- Place new features under `app` in a dedicated folder (e.g., `feature-name/`).
- For shared or reusable components, use `components`.
- Services should be placed in `service`.

### Routing
- Define routes in a `routes.ts` file within the feature folder.
- Use lazy loading with `loadComponent: () => import('./feature.component').then(m => m.FeatureComponent)`.
- Add route metadata (e.g., `data: { title: $localize`Feature` }`).
- Add new routes in `src/app/app.routes.ts` and/or feature-specific `routes.ts` files.

### State and Data
- Use services for data access and business logic.
- Use RxJS `BehaviorSubject` or `signal` for reactive state.
- Store user/session data in `sessionStorage` or `localStorage` as needed.

### Testing
- Place test files alongside the component/service with a `.spec.ts` suffix.
- Use Angular's `TestBed` for setting up tests.
- Mock dependencies and services as needed.
- Test creation and basic logic for all components and services.

### Naming Conventions
- Use English for all code, comments, and documentation.
- Use descriptive, self-explanatory names for variables, methods, and classes.
- Use PascalCase for class names and file names (e.g., `FantaComponent`, `LeaderboardComponent`).
- Use camelCase for variables and methods.
- Use kebab-case for file and folder names (e.g., `leaderboard.component.ts`).

### Imports and Exports
- Use relative imports within the same feature/module.
- Use path aliases (as configured in `tsconfig.app.json`) for shared components.

### UI and Theming
- Use CoreUI Angular components and directives for UI consistency.
- Use SCSS for styles and follow the existing theme structure in `scss/`.
- Use CoreUI and project SCSS variables and mixins.
- Keep styles modular and component-scoped.


### Internationalization
- Use Angular `$localize` for all user-facing strings.

### Miscellaneous
- Avoid direct DOM manipulation; use Angular templates and bindings.
- Use Angular lifecycle hooks (`ngOnInit`, etc.) as needed.
- Prefer Angular forms (`ReactiveFormsModule` or `FormsModule`) for user input.

## Commit Message Convention
- Follow the conventional commit message format as described in `.github/COMMIT_CONVENTION.md`.
- Use a clear header with type, optional scope, and subject: `<type>(<scope>): <subject>`.
- Types include: `feat`, `fix`, `perf`, `docs`, `chore`, `style`, `refactor`, `test`, and `revert`.
- Use the imperative, present tense in the subject (e.g., "add feature" not "added feature").
- Reference issues and breaking changes in the footer as needed.
- See the `.github/COMMIT_CONVENTION.md` file for detailed examples and rules.

## Backend Architecture
- **Express Backend**: `server/` contains the Express.js backend
  - `server/src/services/` - Business logic services
  - `server/src/controllers/` - Request/response handlers
  - `server/src/routes/` - API route definitions
  - `server/src/middleware/` - Authentication and other middleware
  - `server/src/config/` - Database and configuration files
- **Shared Types**: `shared/` contains TypeScript type definitions
  - `shared/src/models/` - Type definitions (auth, database, fanta, playground, twitch)
  - `shared/src/index.ts` - Barrel export for all types
  - Both client and server import from `@f123dashboard/shared`
- **Angular Client**: `client/` contains the Angular application
  - Uses `ApiService` for all HTTP calls to Express backend
  - Imports types from `@f123dashboard/shared`
  
## API Communication
- **Development**: Angular dev server proxies `/api/*` requests to `http://localhost:3000`
- **Production**: Express serves the built Angular app and handles `/api/*` routes
- **Endpoints**: All API routes are prefixed with `/api/` (e.g., `/api/database/drivers`, `/api/auth/login`)
- **Authentication**: JWT tokens passed via `Authorization: Bearer <token>` header
- Use `ApiService.post<T>()`, `ApiService.get<T>()`, etc. for type-safe API calls

## Type Definitions
- **Never** define types inline in services or components
- **Always** import types from `@f123dashboard/shared`
- Example: `import type { User, DriverData, FantaVote } from '@f123dashboard/shared';`
- Use `type` imports for better tree-shaking and clarity

## Development Workflow
- **Shared Package**: Run `npm run build` in `shared/` after modifying types
- **Server**: Run `npm run dev` in `server/` for development with auto-reload
- **Client**: Run `npm start` in `client/` for Angular dev server with proxy
- **Full Build**: Run `npm run build` from root to build all packages in order

---

