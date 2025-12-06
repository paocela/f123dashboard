# Authentication Flow Documentation

## Overview

The Express.js backend uses JWT (JSON Web Tokens) for stateless authentication with session management stored in PostgreSQL. The authentication system includes two middleware functions for protecting routes.

## Architecture

```
Client Request → Express Server → Auth Middleware → Controller → Service → Database
                                   ↓ (if auth fails)
                                   401/403 Response
```

## Middleware Functions

### 1. `authMiddleware`

**Purpose**: Validates JWT tokens and ensures the user is authenticated.

**Location**: `server/src/middleware/auth.middleware.ts`

**How it works**:
1. Extracts the `Authorization` header from the request
2. Validates the header format (`Bearer <token>`)
3. Verifies the JWT signature using `process.env.JWT_SECRET`
4. Decodes the token to extract user information
5. Attaches user data to `req.user` for downstream use
6. Calls `next()` to proceed to the controller

**Response codes**:
- `401 Unauthorized`: Token missing, invalid, or expired
- `500 Internal Server Error`: JWT_SECRET not configured or other errors

**Usage in routes**:
```typescript
import { authMiddleware } from '../middleware/auth.middleware.js';

// Protected route - requires valid JWT token
router.post('/profile', authMiddleware, (req, res) => {
  // req.user is now available with { userId, username, isAdmin }
  controller.getProfile(req, res);
});
```

### 2. `adminMiddleware`

**Purpose**: Ensures the authenticated user has administrator privileges.

**Location**: `server/src/middleware/auth.middleware.ts`

**How it works**:
1. Checks if `req.user` exists (should be set by `authMiddleware`)
2. Verifies that `req.user.isAdmin === true`
3. Returns `403 Forbidden` if user is not an admin
4. Calls `next()` if user is an admin

**Response codes**:
- `401 Unauthorized`: No user attached to request (missing `authMiddleware`)
- `403 Forbidden`: User is authenticated but not an admin

**Usage in routes**:
```typescript
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

// Admin-only route - requires valid JWT + admin flag
router.post('/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  // req.user exists and req.user.isAdmin is true
  controller.getAllUsers(req, res);
});
```

**IMPORTANT**: `adminMiddleware` must **always** be used together with `authMiddleware` and come **after** it:
```typescript
// ✅ Correct
router.post('/admin-endpoint', authMiddleware, adminMiddleware, controller);

// ❌ Wrong - adminMiddleware needs req.user from authMiddleware
router.post('/admin-endpoint', adminMiddleware, controller);
```

## Request Object Extension

The middleware extends the Express `Request` type to include user information:

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        isAdmin?: boolean;
      };
    }
  }
}
```

Controllers can access this data:
```typescript
export const someController = {
  getProfile: (req: Request, res: Response) => {
    const userId = req.user!.userId;  // Safe to use after authMiddleware
    const isAdmin = req.user!.isAdmin;
    // ... use userId and isAdmin
  }
};
```

## Route Security Matrix

### Auth Routes (`/api/auth/*`)

| Endpoint | Method | Auth Required | Admin Required | Description |
|----------|--------|---------------|----------------|-------------|
| `/login` | POST | ❌ No | ❌ No | User login |
| `/register` | POST | ❌ No | ❌ No | User registration |
| `/validate-token` | POST | ❌ No | ❌ No | Token validation |
| `/refresh-token` | POST | ✅ Yes | ❌ No | Refresh JWT token |
| `/logout` | POST | ✅ Yes | ❌ No | Logout current session |
| `/logout-all` | POST | ✅ Yes | ❌ No | Logout all sessions |
| `/sessions` | POST | ✅ Yes | ❌ No | Get user sessions |
| `/change-password` | POST | ✅ Yes | ❌ No | Change own password |
| `/update-user-info` | POST | ✅ Yes | ❌ No | Update own profile |
| `/users` | POST | ✅ Yes | ✅ Yes | Get all users |
| `/admin-change-password` | POST | ✅ Yes | ✅ Yes | Change another user's password |
| `/cleanup-sessions` | POST | ✅ Yes | ✅ Yes | Clean expired sessions |

### Database Routes (`/api/database/*`)

| Endpoint | Method | Auth Required | Admin Required | Description |
|----------|--------|---------------|----------------|-------------|
| `/drivers` | POST | ❌ No | ❌ No | Get all drivers |
| `/drivers-data` | POST | ❌ No | ❌ No | Get driver details |
| `/championship` | POST | ❌ No | ❌ No | Get championship standings |
| `/cumulative-points` | POST | ❌ No | ❌ No | Get cumulative points |
| `/tracks` | POST | ❌ No | ❌ No | Get all tracks |
| `/race-results` | POST | ❌ No | ❌ No | Get race results |
| `/seasons` | POST | ❌ No | ❌ No | Get all seasons |
| `/constructors` | POST | ❌ No | ❌ No | Get constructors |
| `/constructor-grand-prix-points` | POST | ❌ No | ❌ No | Get constructor points |
| `/set-gp-result` | POST | ✅ Yes | ✅ Yes | Create/update race results |

### Fanta Routes (`/api/fanta/*`)

| Endpoint | Method | Auth Required | Admin Required | Description |
|----------|--------|---------------|----------------|-------------|
| `/votes` | POST | ✅ Yes | ❌ No | Get user's fantasy votes |
| `/set-vote` | POST | ✅ Yes | ❌ No | Submit fantasy vote |

### Playground Routes (`/api/playground/*`)

| Endpoint | Method | Auth Required | Admin Required | Description |
|----------|--------|---------------|----------------|-------------|
| `/leaderboard` | POST | ❌ No | ❌ No | View game leaderboard |
| `/score` | POST | ✅ Yes | ❌ No | Submit game score |

### Twitch Routes (`/api/twitch/*`)

| Endpoint | Method | Auth Required | Admin Required | Description |
|----------|--------|---------------|----------------|-------------|
| `/stream-info` | POST | ❌ No | ❌ No | Get Twitch stream info |

## Client-Side Integration

### Storing the JWT Token

After successful login, store the JWT token in the Angular app:

```typescript
// In auth.service.ts
login(username: string, password: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>('/api/auth/login', { username, password })
    .pipe(
      tap(response => {
        if (response.success && response.token) {
          // Store token in sessionStorage or localStorage
          sessionStorage.setItem('jwt_token', response.token);
        }
      })
    );
}
```

### Sending Authenticated Requests

Include the JWT token in the `Authorization` header:

```typescript
// In api.service.ts or http.interceptor.ts
const token = sessionStorage.getItem('jwt_token');
const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

this.http.post('/api/fanta/votes', { raceId: 123 }, { headers })
  .subscribe(response => {
    // Handle response
  });
```

### HTTP Interceptor (Recommended)

Create an interceptor to automatically add the token to all requests:

```typescript
// http.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('jwt_token');
  
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  
  return next(req);
};
```

## Token Structure

The JWT token contains the following payload:

```json
{
  "userId": 123,
  "username": "john_doe",
  "isAdmin": false,
  "iat": 1699900000,
  "exp": 1699986400
}
```

- `userId`: Database user ID
- `username`: User's username
- `isAdmin`: Admin flag (optional, defaults to false)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Error Handling

### 401 Unauthorized
**Causes**:
- Missing Authorization header
- Invalid token format
- Token expired
- Invalid signature

**Client action**: Redirect to login page, clear stored token

### 403 Forbidden
**Causes**:
- Valid token but insufficient privileges (not an admin)

**Client action**: Show "Access Denied" message, don't clear token

## Security Best Practices

1. **Always use HTTPS in production** to prevent token interception
2. **Set appropriate token expiration times** (e.g., 24 hours for regular tokens)
3. **Implement refresh token mechanism** to avoid frequent re-authentication
4. **Never expose JWT_SECRET** - store in environment variables only
5. **Validate tokens on every protected request** - don't trust client-side checks
6. **Implement rate limiting** on auth endpoints to prevent brute force attacks
7. **Log authentication failures** for security monitoring

## Testing Authentication

### Test with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Response contains token:
# { "success": true, "token": "eyJhbGc...", "user": {...} }

# Use token in protected request
curl -X POST http://localhost:3000/api/fanta/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"raceId":1,"seasonId":1}'
```

### Test with Postman

1. **Login**: POST to `/api/auth/login` with credentials in body
2. **Copy token** from response
3. **Set Authorization**: In subsequent requests, go to "Authorization" tab → Select "Bearer Token" → Paste token
4. **Send request** to protected endpoints

---

## Summary

The authentication system provides three levels of access:
1. **Public** - No authentication required (login, register, view data)
2. **Authenticated** - Valid JWT token required (user-specific actions)
3. **Admin** - Valid JWT token + admin flag required (administrative actions)

The middleware chain ensures security at the route level, preventing unauthorized access before controllers are reached.
