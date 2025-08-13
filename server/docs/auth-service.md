# AuthService Documentation

## Overview
The `AuthService` class provides comprehensive authentication and session management functionality for the F123 Dashboard application. It handles user registration, login, password management, token validation, and session lifecycle management using JWT tokens and PostgreSQL database storage.

## Features
- User registration with validation
- Secure login with password hashing
- JWT token generation and validation
- Session management with expiration
- Password change functionality
- Token refresh mechanism
- Session cleanup and logout
- User agent tracking
- Account activation/deactivation

## Database Tables Used
- `fanta_player` - User account information
- `user_sessions` - Active user sessions

## Configuration
The service requires the following environment variables:
- `RACEFORFEDERICA_DB_DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing

## Constants
- `TOKEN_EXPIRY_DAYS = 7` - Session expiration in days
- `TOKEN_EXPIRY_JWT = '7d'` - JWT token expiration

## Methods

### Constructor
```typescript
constructor()
```
Initializes the PostgreSQL connection pool and validates required environment variables.

**Throws:**
- `Error` - If JWT_SECRET environment variable is not set

### Public Methods

#### `login(username: string, password: string, userAgent?: string): Promise<string>`
Authenticates a user and creates a new session.

**Parameters:**
- `username` - User's username
- `password` - User's password (plain text)
- `userAgent` - Optional user agent string

**Returns:**
- JSON string containing:
  - `success: boolean` - Operation success status
  - `message: string` - Success/error message
  - `user: object` - User information (if successful)
  - `token: string` - JWT token (if successful)

**Validation:**
- Checks if username and password are provided
- Validates user exists and is active
- Verifies password hash

**Example Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John",
    "surname": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `register(username: string, name: string, surname: string, password: string, userAgent?: string): Promise<string>`
Registers a new user account.

**Parameters:**
- `username` - Desired username (3-30 characters, alphanumeric + underscore)
- `name` - User's first name
- `surname` - User's last name
- `password` - Password (minimum 8 characters with complexity requirements)
- `userAgent` - Optional user agent string

**Returns:**
- JSON string with registration result and JWT token

**Password Requirements:**
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character

**Username Requirements:**
- 3-30 characters
- Only alphanumeric characters and underscores
- Must be unique

#### `validateToken(jwtToken: string): Promise<string>`
Validates a JWT token and returns user information.

**Parameters:**
- `jwtToken` - JWT token to validate

**Returns:**
- JSON string containing:
  - `valid: boolean` - Token validity
  - `userId: number` - User ID (if valid)
  - `username: string` - Username (if valid)

#### `changePassword(jwtToken: string, currentPassword: string, newPassword: string): Promise<string>`
Changes user's password after validating current password.

**Parameters:**
- `jwtToken` - Valid JWT token
- `currentPassword` - Current password
- `newPassword` - New password (must meet complexity requirements)

**Returns:**
- JSON string with operation result

**Validation:**
- Validates JWT token
- Verifies current password
- Ensures new password meets requirements
- Prevents reusing current password

#### `refreshToken(oldJwtToken: string, userAgent?: string): Promise<string>`
Refreshes an existing JWT token.

**Parameters:**
- `oldJwtToken` - Current JWT token
- `userAgent` - Optional user agent string

**Returns:**
- JSON string with new JWT token

#### `logout(jwtToken: string): Promise<string>`
Logs out the current session.

**Parameters:**
- `jwtToken` - JWT token to invalidate

**Returns:**
- JSON string with logout result

#### `logoutAllSessions(jwtToken: string): Promise<string>`
Logs out all sessions for the current user.

**Parameters:**
- `jwtToken` - Valid JWT token

**Returns:**
- JSON string with operation result

#### `getUserSessions(jwtToken: string): Promise<string>`
Retrieves all active sessions for the current user.

**Parameters:**
- `jwtToken` - Valid JWT token

**Returns:**
- JSON string with session information

#### `cleanupExpiredSessions(): Promise<string>`
Cleans up expired sessions from the database.

**Returns:**
- JSON string with cleanup result

**Maintenance:**
- Marks expired sessions as inactive
- Deletes sessions older than 30 days

### Private Methods

#### `hashPassword(password: string): string`
Hashes a password using SHA-256.

#### `comparePassword(password: string, hashedPassword: string): boolean`
Compares a plain text password with a hashed password.

#### `generateSessionToken(): string`
Generates a secure random session token.

#### `generateJWTToken(userId: number, username: string): string`
Creates a JWT token with user information.

#### `createSession(userId: number, userAgent?: string): Promise<string>`
Creates a new session record and returns JWT token.

#### `validateSession(jwtToken: string): Promise<{valid: boolean; userId?: number; username?: string}>`
Validates a session and updates last activity.

#### `invalidateSession(jwtToken: string): Promise<void>`
Invalidates all sessions for a user.

#### `cleanExpiredSessions(): Promise<void>`
Internal method to clean expired sessions.

#### `sanitizeUserAgent(userAgent?: string): string | undefined`
Sanitizes user agent string for database storage.

#### `validateLoginInput(username: string, password: string): void`
Validates login input parameters.

#### `validateRegisterInput(username: string, name: string, surname: string, password: string): void`
Validates registration input parameters.

#### `validateChangePasswordInput(currentPassword: string, newPassword: string): void`
Validates password change input parameters.

## Error Handling
All public methods return JSON strings with error information rather than throwing exceptions. Common error scenarios:
- Invalid credentials
- Expired tokens
- Account disabled
- Username already exists
- Password requirements not met
- Database connection errors

## Security Features
- Password hashing using SHA-256
- JWT token expiration
- Session timeout (7 days)
- User agent tracking
- Account activation/deactivation
- Session invalidation on logout
- Automatic cleanup of expired sessions

## Usage Example
```typescript
const authService = new AuthService();

// Register new user
const registerResult = await authService.register(
  'john_doe',
  'John',
  'Doe',
  'SecurePass123!',
  'Mozilla/5.0...'
);

// Login
const loginResult = await authService.login(
  'john_doe',
  'SecurePass123!',
  'Mozilla/5.0...'
);

// Validate token
const tokenResult = await authService.validateToken(jwtToken);

// Change password
const changeResult = await authService.changePassword(
  jwtToken,
  'SecurePass123!',
  'NewSecurePass456!'
);

// Logout
const logoutResult = await authService.logout(jwtToken);
```

## Database Schema Requirements

### fanta_player Table
```sql
CREATE TABLE fanta_player (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    password_updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

### user_sessions Table
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES fanta_player(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE
);
```

## Deployment
The service is deployed using the `@GenezioDeploy()` decorator and can be called from the client application through the Genezio SDK.
