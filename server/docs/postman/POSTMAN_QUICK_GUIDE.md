# Postman Collection - Quick Reference Guide

## 🚀 Setup in 3 Steps

### Step 1: Import Files
```
Postman → Import → Select Files:
  ✅ F123Dashboard.postman_collection.json
  ✅ F123Dashboard.postman_environment.json
  ✅ F123Dashboard.postman_environment.prod.json
```

### Step 2: Select Environment
```
Top-right dropdown → "F123 Dashboard - Local"
```

### Step 3: Enable Auto-Login
```
Eye icon (👁️) → Edit → Set:
  - auto_login_username: "your_username"
  - auto_login_password: "your_password"
```

## 🤖 Auto-Authentication

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│  You: Run ANY Request                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Pre-Request Script (Automatic)                         │
├─────────────────────────────────────────────────────────┤
│  1. Do we have a JWT token?                             │
│     ├─ NO → Auto-login with saved credentials           │
│     └─ YES → Validate token                             │
│         ├─ VALID → Continue                             │
│         └─ EXPIRED → Auto-login                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Request Executes with Valid Token                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Test Script (Automatic)                                │
├─────────────────────────────────────────────────────────┤
│  1. Extract JWT token from response (if present)        │
│  2. Save user info (ID, admin status)                   │
│  3. Handle errors (401 → clear token)                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Done! Ready for next request                           │
└─────────────────────────────────────────────────────────┘
```

### What You See in Console

#### ✅ First Time (Auto-Login)
```
No JWT token found. Attempting auto-login...
✅ Auto-login successful! Token saved.
User ID: 1
Is Admin: true
```

#### ✅ Subsequent Requests (Token Valid)
```
✅ Token is valid
```

#### ⚠️ Token Expired
```
Token expired or invalid. Attempting auto-login...
✅ Auto-login successful! Token saved.
```

## 📁 Collection Structure

```
F123 Dashboard API
│
├── 🏥 Health Check
│   └── Health Check (GET, no auth)
│
├── 🔐 Authentication
│   ├── Public (no auth required)
│   │   ├── Login ⭐ (saves token automatically)
│   │   ├── Register
│   │   └── Validate Token
│   │
│   ├── Protected (requires token)
│   │   ├── Refresh Token
│   │   ├── Logout
│   │   ├── Logout All Sessions
│   │   ├── Get User Sessions
│   │   ├── Change Password
│   │   └── Update User Info
│   │
│   └── Admin Only (requires admin)
│       ├── Get All Users
│       ├── Admin Change Password
│       └── Cleanup Expired Sessions
│
├── 💾 Database (public endpoints)
│   ├── Drivers
│   │   ├── Get All Drivers
│   │   └── Get Drivers Data
│   │
│   ├── Championship
│   │   ├── Get Championship
│   │   └── Get Cumulative Points
│   │
│   ├── Tracks
│   │   └── Get All Tracks
│   │
│   ├── Race Results
│   │   └── Get Race Results
│   │
│   ├── Seasons
│   │   └── Get All Seasons
│   │
│   ├── Constructors
│   │   ├── Get Constructors
│   │   └── Get Constructor Grand Prix Points
│   │
│   └── Admin
│       └── Set GP Result (admin only)
│
├── 🏎️ Fanta (Fantasy) (requires auth)
│   ├── Get Fanta Vote
│   └── Set Fanta Vote
│
├── 📺 Twitch (public)
│   └── Get Stream Info
│
└── 🎮 Playground
    ├── Get Playground Leaderboard (public)
    └── Set User Best Score (requires auth)
```

## 🔑 Variables Reference

### Collection Variables (auto-managed)

| Variable | Type | Description | Auto-Populated |
|----------|------|-------------|----------------|
| `base_url` | string | API base URL | ❌ Manual |
| `jwt_token` | secret | JWT authentication token | ✅ Yes |
| `user_id` | string | Current user ID | ✅ Yes |
| `season_id` | string | Default season ID | ❌ Manual |
| `is_admin` | boolean | Admin flag | ✅ Yes |
| `auto_login_username` | string | Auto-login username | ⚙️ Optional |
| `auto_login_password` | secret | Auto-login password | ⚙️ Optional |

### Usage in Requests

```
URL:  {{base_url}}/api/auth/login
Body: "userId": {{user_id}}
Auth: Bearer {{jwt_token}}
```

## 🧪 Testing Workflows

### Workflow 1: First Time User Registration

```
1. Register (Public)
   POST /api/auth/register
   Body: username, password, name, surname
   
2. Login (Public)
   POST /api/auth/login
   Body: username, password
   Result: Token saved automatically ✅
   
3. Any Protected Endpoint
   All subsequent requests use saved token ✅
```

### Workflow 2: Existing User with Auto-Login

```
1. Set auto_login credentials once (eye icon → edit)
   
2. Run ANY request
   - Token missing? → Auto-login ✅
   - Token expired? → Auto-login ✅
   - Token valid? → Use it ✅
```

### Workflow 3: Admin Testing

```
1. Login with admin account
   
2. Test admin endpoints
   - Get All Users
   - Admin Change Password
   - Cleanup Sessions
   - Set GP Result
   
All use same authentication ✅
```

### Workflow 4: Fantasy Game Testing

```
1. Login (get token)
   
2. Get Drivers (see available drivers)
   POST /api/database/drivers
   
3. Submit Fantasy Vote
   POST /api/fanta/set-vote
   Body: positions 1-8, fast_lap_id, dnf_id, team_id
   
4. Get Vote Back
   POST /api/fanta/votes
   Verify your submission ✅
```

## 🐛 Troubleshooting

### ❌ "Auto-login credentials not set"
**Solution:** Set `auto_login_username` and `auto_login_password` in collection variables

### ❌ "401 Unauthorized"
**Possible Causes:**
- Token expired → Auto-login should handle this
- Auto-login failed → Check credentials
- Invalid endpoint → Check URL

**Manual Fix:**
1. Clear `jwt_token` variable
2. Run Login request manually
3. Check console for errors

### ❌ "403 Forbidden"
**Cause:** Endpoint requires admin privileges

**Solution:** Login with admin account

### ❌ "Token validation error"
**Cause:** Server not running or network error

**Solution:**
1. Verify server is running: `GET /api/health`
2. Check `base_url` is correct
3. Check network connection

### ❌ Requests failing silently
**Check Console:**
1. Postman → View → Show Postman Console (Ctrl+Alt+C)
2. Look for auto-authentication logs
3. Check for error messages

## 🎯 Best Practices

### ✅ DO
- Use auto-login for development testing
- Keep credentials in environment variables
- Use Collection Runner for batch testing
- Check Postman Console for debug info
- Use different environments for dev/prod

### ❌ DON'T
- Commit credentials to version control
- Share collections with hardcoded passwords
- Use production credentials in local environment
- Disable auto-authentication scripts (unless needed)

## 🔥 Power User Tips

### Tip 1: Batch Testing with Collection Runner
```
1. Click "..." on collection → Run collection
2. Select environment
3. Set iterations
4. All requests auto-authenticate ✅
```

### Tip 2: Newman CLI Integration
```bash
# Install Newman
npm install -g newman

# Run collection
newman run F123Dashboard.postman_collection.json \
  -e F123Dashboard.postman_environment.json \
  --env-var "auto_login_username=testuser" \
  --env-var "auto_login_password=pass123"
```

### Tip 3: Custom Test Scripts
Add to individual requests:
```javascript
pm.test("Response time < 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);
});

pm.test("Specific data validation", function () {
    const data = pm.response.json();
    pm.expect(data.drivers).to.be.an('array');
    pm.expect(data.drivers.length).to.be.above(0);
});
```

### Tip 4: Environment Switching
Switch between local/prod instantly:
- Local: `http://localhost:3000`
- Production: `https://api.yoursite.com`

Same collection works for both! 🎉

## 📊 Response Examples

### Success Response (Login)
```json
{
  "success": true,
  "message": "Login successful",
  "jwtToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "testuser",
    "name": "John",
    "surname": "Doe",
    "is_admin": false
  }
}
```

### Error Response (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Error Response (403)
```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

**Need Help?** Check the full POSTMAN_README.md for detailed documentation.

**Version:** 1.0.0  
**Last Updated:** November 2025
