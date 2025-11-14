# F123 Dashboard API - Postman Collection

🚀 **Smart Auto-Authentication Enabled** - No manual token management required!

This directory contains Postman collections and environments for testing the F123 Dashboard backend API with intelligent auto-authentication.

## ⚡ Quick Start (TL;DR)

1. Import all 3 JSON files into Postman
2. Select "F123 Dashboard - Local" environment
3. Edit collection variables: Set `auto_login_username` and `auto_login_password`
4. Run any request - authentication happens automatically!

## ✨ Key Features

- 🤖 **Auto-Authentication** - Automatically logs in when token is missing/expired
- 🔄 **Token Validation** - Validates tokens before each request
- 💾 **Auto-Save** - Saves tokens and user info automatically
- 🧪 **Test Scripts** - Built-in tests for all endpoints
- 🌍 **Multiple Environments** - Local and production configurations
- 📝 **Comprehensive Docs** - 40+ documented endpoints

## Files

### Collection & Environment Files
- **F123Dashboard.postman_collection.json** - Complete API collection with all endpoints
- **F123Dashboard.postman_environment.json** - Local development environment variables
- **F123Dashboard.postman_environment.prod.json** - Production environment variables (template)

### Documentation Files
- **POSTMAN_README.md** - This file - Comprehensive guide
- **POSTMAN_QUICK_GUIDE.md** - Visual quick reference with diagrams
- **POSTMAN_AUTO_AUTH_IMPLEMENTATION.md** - Technical implementation details
- **POSTMAN_FLOW_DIAGRAMS.md** - Visual authentication flows
- **POSTMAN_FILE_INDEX.md** - Navigation guide for all documentation

## Quick Start

### 1. Import into Postman

#### Option A: Import via Postman App
1. Open Postman
2. Click "Import" button (top left)
3. Select all three JSON files:
   - `F123Dashboard.postman_collection.json`
   - `F123Dashboard.postman_environment.json`
   - `F123Dashboard.postman_environment.prod.json`
4. Click "Import"

#### Option B: Import via URL (if hosted on GitHub)
1. Open Postman
2. Click "Import" → "Link"
3. Paste the raw GitHub URL of the collection file
4. Click "Continue" and "Import"

### 2. Select Environment

1. In Postman, look at the top-right corner
2. Select "F123 Dashboard - Local" from the environment dropdown
3. The environment variables will be automatically configured

### 3. Configure Environment Variables

Click the eye icon (👁️) next to the environment selector to view/edit variables:

- **base_url**: API server URL (default: `http://localhost:3000`)
- **jwt_token**: JWT token (auto-populated after login)
- **user_id**: User ID (auto-populated after login)
- **season_id**: Season ID for queries (default: `1`)
- **is_admin**: Admin flag (auto-populated after login)
- **auto_login_username**: Username for auto-authentication (optional)
- **auto_login_password**: Password for auto-authentication (optional)

### 4. Enable Auto-Authentication (Optional but Recommended)

To enable automatic JWT token management:

1. Click the eye icon (👁️) next to environment selector
2. Edit the following variables:
   - **auto_login_username**: Your test username (e.g., `testuser`)
   - **auto_login_password**: Your test password (e.g., `password123`)
3. Click "Save"

**Benefits of Auto-Authentication:**
- Automatically logs in when token is missing or expired
- Validates token before each request
- Seamlessly refreshes authentication
- No manual token management needed

## Collection Structure

The collection is organized into the following folders:

### 🏥 Health Check
- **Health Check** - Verify server is running

### 🔐 Authentication
- **Public** - No authentication required
  - Login (auto-saves JWT token)
  - Register
  - Validate Token
- **Protected** - Requires JWT token
  - Refresh Token
  - Logout
  - Logout All Sessions
  - Get User Sessions
  - Change Password
  - Update User Info
- **Admin Only** - Requires admin privileges
  - Get All Users
  - Admin Change Password
  - Cleanup Expired Sessions

### 💾 Database
- **Drivers** - Driver information
  - Get All Drivers
  - Get Drivers Data
- **Championship** - Championship standings
  - Get Championship
  - Get Cumulative Points
- **Tracks** - Track information
  - Get All Tracks
- **Race Results** - Race results
  - Get Race Results
- **Seasons** - Season information
  - Get All Seasons
- **Constructors** - Team information
  - Get Constructors
  - Get Constructor Grand Prix Points
- **Admin** - Admin operations
  - Set GP Result

### 🏎️ Fanta (Fantasy)
- Get Fanta Vote
- Set Fanta Vote

### 📺 Twitch
- Get Stream Info

### 🎮 Playground
- Get Playground Leaderboard
- Set User Best Score

## Usage Guide

### 🚀 Auto-Authentication Features

This collection includes **intelligent auto-authentication** that makes testing seamless:

#### Collection-Level Pre-Request Script
Before **every** request (except login/register), the collection automatically:
1. **Checks if JWT token exists**
2. **Validates the token** by calling `/api/auth/validate-token`
3. **Auto-logs in** if token is missing or expired (when credentials are configured)
4. **Proceeds with the request** using the valid token

#### Collection-Level Test Script
After **every** response, the collection automatically:
1. **Extracts and saves JWT tokens** from responses
2. **Updates user information** (ID, admin status)
3. **Handles 401 errors** by clearing invalid tokens
4. **Logs authentication status** in the console

#### How to Enable Auto-Login

**Method 1: Automatic (Run Login Once)**
1. Edit the Login request body with your credentials
2. Run the Login request once
3. The collection saves your credentials automatically
4. All future requests will auto-authenticate

**Method 2: Manual Configuration**
1. Click the eye icon (👁️) → Edit collection variables
2. Set `auto_login_username` (e.g., `testuser`)
3. Set `auto_login_password` (e.g., `password123`)
4. Save

**Benefits:**
- ✅ No manual token copying
- ✅ No expired token errors
- ✅ Seamless testing workflow
- ✅ Works with Collection Runner
- ✅ Works with Newman CLI

### Authentication Flow

#### Option A: Manual Login (Traditional)

1. **Register a new user** (optional):
   
   ```http
   POST /api/auth/register
   ```

2. **Login**:
   
   ```http
   POST /api/auth/login
   ```
   
   The collection automatically saves the JWT token and user ID to variables.

3. **Use protected endpoints**:
   
   The collection uses Bearer token authentication automatically.

#### Option B: Auto-Login (Recommended)

1. **Configure credentials** (see above)
2. **Run any request** - authentication happens automatically
3. **Test freely** - no manual token management needed

### Testing Protected Endpoints

1. Run the "Login" request first
2. The JWT token is automatically saved
3. All subsequent protected requests will use this token
4. Token is sent in the Authorization header as: `Bearer {{jwt_token}}`

### Testing Admin Endpoints

1. Login with an admin account
2. The same JWT token is used
3. Admin middleware checks the `is_admin` flag in the database

### Working with Seasons

Most endpoints accept an optional `seasonId` parameter:

```json
{
  "seasonId": 1
}
```

You can change the default season in the environment variables.

## Environment Variables

### Collection Variables
These are set at the collection level and shared across all requests:

- `base_url` - API base URL
- `jwt_token` - JWT authentication token (auto-populated)
- `user_id` - Current user ID (auto-populated)
- `season_id` - Default season ID

### Using Variables in Requests

Variables are referenced using double curly braces:
- URL: `{{base_url}}/api/auth/login`
- Body: `"userId": {{user_id}}`

## Request Examples

### Login Example
```json
{
  "username": "testuser",
  "password": "password123"
}
```

### Register Example
```json
{
  "username": "newuser",
  "password": "password123",
  "name": "John",
  "surname": "Doe"
}
```

### Set Fantasy Vote Example
```json
{
  "userId": 1,
  "raceId": 1,
  "seasonId": 1,
  "1_place_id": 1,
  "2_place_id": 2,
  "3_place_id": 3,
  "4_place_id": 4,
  "5_place_id": 5,
  "6_place_id": 6,
  "7_place_id": 7,
  "8_place_id": 8,
  "fast_lap_id": 1,
  "dnf_id": 9,
  "team_id": 1
}
```

## 🤖 Auto-Authentication Deep Dive

### How It Works

The collection uses Postman's event scripts for intelligent authentication management:

#### Pre-Request Script (Runs before EVERY request)

```javascript
// 1. Check if current request is an auth endpoint (skip auto-login)
// 2. Get JWT token from collection variables
// 3. If no token exists → Auto-login
// 4. If token exists → Validate it
// 5. If token invalid/expired → Auto-login
// 6. Proceed with request
```

**Validation Flow:**
```
Request → Has Token? → Validate Token → Valid? → Use Token
              ↓                              ↓
         Auto-Login ← Need Credentials ← Invalid
```

#### Test Script (Runs after EVERY response)

```javascript
// 1. Check if response contains JWT token → Save it
// 2. Check if response contains user info → Save it
// 3. If 401 Unauthorized → Clear invalid token
// 4. Log authentication status
```

### Console Output

When auto-authentication is working, you'll see:

```
✅ Token is valid
```

Or when auto-login triggers:

```
No JWT token found. Attempting auto-login...
✅ Auto-login successful! Token saved.
User ID: 1
Is Admin: true
```

### Credential Storage

**Security Note:** Credentials are stored in collection/environment variables. For production testing:
- Use environment-specific variables
- Don't commit credentials to version control
- Consider using Postman Vault for sensitive data

## Tips & Best Practices

### 1. Enhanced Login Test Script

The Login request includes comprehensive test scripts:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.jwtToken) {
        pm.collectionVariables.set('jwt_token', response.jwtToken);
        pm.collectionVariables.set('user_id', response.user.id);
    }
}
```

### 2. Running Collections
You can run the entire collection or folders using the Collection Runner:
1. Click "..." next to collection name
2. Select "Run collection"
3. Choose which folders/requests to run
4. Set iterations and delays as needed

### 3. Automated Testing
Add tests to verify responses:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    pm.expect(pm.response.json()).to.have.property('success');
});
```

### 4. Pre-request Scripts
Use pre-request scripts to set up data before sending requests:
```javascript
pm.collectionVariables.set("timestamp", Date.now());
```

### 5. Multiple Environments
Switch between local, staging, and production by selecting different environments:
- F123 Dashboard - Local (localhost:3000)
- F123 Dashboard - Production (your production URL)

## Troubleshooting

### "401 Unauthorized" errors
- Ensure you've logged in first
- Check that JWT token is saved in environment variables
- Token may have expired - login again

### "403 Forbidden" errors
- Endpoint requires admin privileges
- Login with an admin account

### Connection errors
- Verify the server is running on the specified port
- Check `base_url` in environment variables
- Ensure there are no CORS issues

### Invalid season ID
- Check the `season_id` environment variable
- Use "Get All Seasons" to see available seasons

## Advanced Features

### Newman (CLI)
Run collections from command line using Newman:

```bash
npm install -g newman

# Run collection
newman run F123Dashboard.postman_collection.json \
  -e F123Dashboard.postman_environment.json

# Generate HTML report
newman run F123Dashboard.postman_collection.json \
  -e F123Dashboard.postman_environment.json \
  -r html
```

### CI/CD Integration
Integrate Postman tests in your CI/CD pipeline using Newman.

### Documentation
Generate API documentation from the collection:
1. Click collection name
2. Select "View documentation"
3. Click "Publish" to create public docs

## Support

For issues or questions:
- Check the server logs for detailed error messages
- Verify database connection in server configuration
- Review the API documentation in `docs/` folder

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | None | Health check |
| POST | `/api/auth/login` | None | User login |
| POST | `/api/auth/register` | None | User registration |
| POST | `/api/auth/validate-token` | None | Validate JWT |
| POST | `/api/auth/refresh-token` | User | Refresh JWT |
| POST | `/api/auth/logout` | User | Logout current session |
| POST | `/api/auth/logout-all` | User | Logout all sessions |
| POST | `/api/auth/sessions` | User | Get user sessions |
| POST | `/api/auth/change-password` | User | Change password |
| POST | `/api/auth/update-user-info` | User | Update user info |
| POST | `/api/auth/users` | Admin | Get all users |
| POST | `/api/auth/admin-change-password` | Admin | Change any user password |
| POST | `/api/auth/cleanup-sessions` | Admin | Cleanup expired sessions |
| POST | `/api/database/drivers` | None | Get all drivers |
| POST | `/api/database/drivers-data` | None | Get drivers data |
| POST | `/api/database/championship` | None | Get championship |
| POST | `/api/database/cumulative-points` | None | Get cumulative points |
| POST | `/api/database/tracks` | None | Get all tracks |
| POST | `/api/database/race-results` | None | Get race results |
| POST | `/api/database/seasons` | None | Get all seasons |
| POST | `/api/database/constructors` | None | Get constructors |
| POST | `/api/database/constructor-grand-prix-points` | None | Get constructor GP points |
| POST | `/api/database/set-gp-result` | Admin | Set GP result |
| POST | `/api/fanta/votes` | User | Get fantasy votes |
| POST | `/api/fanta/set-vote` | User | Set fantasy vote |
| POST | `/api/twitch/stream-info` | None | Get stream info |
| POST | `/api/playground/leaderboard` | None | Get leaderboard |
| POST | `/api/playground/score` | User | Set best score |

---

**Last Updated**: November 2025  
**Version**: 1.0.0
