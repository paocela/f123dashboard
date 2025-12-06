# Auto-Authentication Implementation Guide

## Overview

This Postman collection implements **intelligent auto-authentication** using Postman's event system. It automatically manages JWT tokens, validates them before requests, and re-authenticates when needed.

## Architecture

### Event Hooks

The collection uses two main event hooks:

1. **Pre-Request Script** (Collection Level)
   - Runs **before** every request in the collection
   - Handles token validation and auto-login

2. **Test Script** (Collection Level)
   - Runs **after** every response
   - Extracts and saves tokens, handles errors

### Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     REQUEST INITIATED                        │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│              PRE-REQUEST SCRIPT EXECUTES                     │
├──────────────────────────────────────────────────────────────┤
│  Check: Is this an auth endpoint? (/login, /register, etc.) │
│    └─ YES → Skip auto-authentication                        │
│    └─ NO  → Continue to token check                         │
│                                                              │
│  Check: Do we have a JWT token in variables?                │
│    ├─ NO  → Execute Auto-Login                              │
│    └─ YES → Validate Token via API                          │
│         ├─ VALID   → Continue with request                  │
│         └─ INVALID → Execute Auto-Login                     │
│                                                              │
│  Auto-Login Process:                                        │
│    1. Get credentials from variables                        │
│    2. Send POST to /api/auth/login                          │
│    3. Extract token from response                           │
│    4. Save token to collection variables                    │
│    5. Save user info (id, admin status)                     │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│              ACTUAL REQUEST EXECUTES                         │
│          (with valid Bearer token in header)                 │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                TEST SCRIPT EXECUTES                          │
├──────────────────────────────────────────────────────────────┤
│  Check response status:                                      │
│    200/201 → Success                                         │
│      └─ Extract JWT token (if present)                      │
│      └─ Extract user info (if present)                      │
│      └─ Save to collection variables                        │
│                                                              │
│    401 → Unauthorized                                        │
│      └─ Clear invalid token                                 │
│      └─ Log warning message                                 │
│                                                              │
│    Other → Process normally                                 │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    REQUEST COMPLETE                          │
│              (Ready for next request)                        │
└──────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Collection Variables

The following variables are used for authentication:

```javascript
{
  jwt_token: "eyJhbGc...",           // Current JWT token (auto-managed)
  user_id: "1",                      // Current user ID (auto-managed)
  is_admin: "true",                  // Admin status (auto-managed)
  auto_login_username: "testuser",   // Login credentials (user-configured)
  auto_login_password: "pass123"     // Login credentials (user-configured)
}
```

### 2. Pre-Request Script

Located at: **Collection Settings → Pre-request Scripts**

```javascript
// Skip auth endpoints
const authEndpoints = ['/login', '/register', '/validate-token', '/health'];
const currentPath = pm.request.url.getPath();
const isAuthEndpoint = authEndpoints.some(endpoint => currentPath.includes(endpoint));

if (isAuthEndpoint) {
    console.log('Skipping auto-login for auth endpoint');
    return;
}

const jwtToken = pm.collectionVariables.get('jwt_token');

// Auto-login function
function autoLogin() {
    const username = pm.collectionVariables.get('auto_login_username');
    const password = pm.collectionVariables.get('auto_login_password');
    
    if (!username || !password) {
        console.log('Auto-login credentials not set.');
        return;
    }
    
    console.log('Attempting auto-login...');
    
    pm.sendRequest({
        url: pm.collectionVariables.get('base_url') + '/api/auth/login',
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        body: {
            mode: 'raw',
            raw: JSON.stringify({ username, password })
        }
    }, function (err, response) {
        if (err) {
            console.error('Auto-login failed:', err);
            return;
        }
        
        const jsonResponse = response.json();
        
        if (jsonResponse.success && jsonResponse.jwtToken) {
            pm.collectionVariables.set('jwt_token', jsonResponse.jwtToken);
            pm.collectionVariables.set('user_id', jsonResponse.user.id);
            pm.collectionVariables.set('is_admin', jsonResponse.user.is_admin);
            console.log('✅ Auto-login successful!');
        } else {
            console.error('❌ Auto-login failed:', jsonResponse.message);
        }
    });
}

// Check token validity
if (!jwtToken || jwtToken === '') {
    console.log('No JWT token found. Attempting auto-login...');
    autoLogin();
} else {
    // Validate existing token
    pm.sendRequest({
        url: pm.collectionVariables.get('base_url') + '/api/auth/validate-token',
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        body: {
            mode: 'raw',
            raw: JSON.stringify({ jwtToken })
        }
    }, function (err, response) {
        if (err) {
            console.error('Token validation error:', err);
            autoLogin();
            return;
        }
        
        const jsonResponse = response.json();
        
        if (!jsonResponse.valid) {
            console.log('Token expired or invalid. Attempting auto-login...');
            autoLogin();
        } else {
            console.log('✅ Token is valid');
        }
    });
}
```

### 3. Test Script

Located at: **Collection Settings → Tests**

```javascript
// Check for successful response
if (pm.response.code === 200 || pm.response.code === 201) {
    try {
        const jsonResponse = pm.response.json();
        
        // Save JWT token if present
        if (jsonResponse.jwtToken) {
            pm.collectionVariables.set('jwt_token', jsonResponse.jwtToken);
            console.log('🔑 JWT token updated from response');
        }
        
        // Save user information if present
        if (jsonResponse.user && jsonResponse.user.id) {
            pm.collectionVariables.set('user_id', jsonResponse.user.id);
            pm.collectionVariables.set('is_admin', jsonResponse.user.is_admin);
            console.log('👤 User info saved:', jsonResponse.user.username);
        }
    } catch (e) {
        // Response not JSON or doesn't contain expected fields
    }
}

// Handle 401 Unauthorized
if (pm.response.code === 401) {
    console.warn('⚠️ 401 Unauthorized - Token may be expired.');
    pm.collectionVariables.set('jwt_token', '');
}
```

### 4. Login Request Enhancement

Located at: **Authentication → Public → Login → Tests**

```javascript
// Test: Status code is 200
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

// Test: Response has success field
pm.test('Response has success field', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

if (pm.response.code === 200) {
    const response = pm.response.json();
    
    if (response.success && response.jwtToken) {
        // Save authentication data
        pm.collectionVariables.set('jwt_token', response.jwtToken);
        pm.collectionVariables.set('user_id', response.user.id);
        pm.collectionVariables.set('is_admin', response.user.is_admin);
        
        // Save credentials for auto-login
        const requestBody = JSON.parse(pm.request.body.raw);
        pm.collectionVariables.set('auto_login_username', requestBody.username);
        pm.collectionVariables.set('auto_login_password', requestBody.password);
        
        console.log('✅ Login successful!');
        console.log('🔑 JWT Token:', response.jwtToken.substring(0, 20) + '...');
        console.log('👤 User ID:', response.user.id);
        console.log('👤 Username:', response.user.username);
        console.log('🔐 Is Admin:', response.user.is_admin);
        console.log('💾 Auto-login credentials saved');
        
        // Additional tests
        pm.test('JWT token received', function () {
            pm.expect(response.jwtToken).to.be.a('string');
            pm.expect(response.jwtToken.length).to.be.above(0);
        });
        
        pm.test('User object received', function () {
            pm.expect(response.user).to.be.an('object');
            pm.expect(response.user.id).to.exist;
            pm.expect(response.user.username).to.exist;
        });
    }
}
```

## Security Considerations

### Credential Storage

**Development Environment:**
- Credentials stored in collection/environment variables
- Acceptable for local testing
- Use `.gitignore` to exclude environment files

**Production Environment:**
- Use Postman Vault for sensitive credentials
- Use environment-specific variables
- Rotate credentials regularly
- Consider using OAuth flows instead

### Token Exposure

**Mitigations:**
- Tokens marked as `secret` type in variables
- Tokens not logged in full (only first 20 chars)
- Console output can be disabled in production

### Network Security

- Auto-login uses HTTPS in production
- Tokens transmitted in Authorization header (industry standard)
- Server should use short-lived tokens with refresh mechanism

## Benefits

### Developer Experience
- ✅ Zero manual token management
- ✅ Seamless testing workflow
- ✅ Works with Collection Runner
- ✅ Works with Newman CLI
- ✅ Automatic token refresh

### Testing Efficiency
- ✅ Run entire collection without interruption
- ✅ No manual token copying between requests
- ✅ Automatic recovery from expired tokens
- ✅ Consistent authentication across all requests

### CI/CD Integration
- ✅ Newman supports environment variables
- ✅ Credentials can be injected at runtime
- ✅ Automated API testing possible

## Usage Examples

### Example 1: Manual Testing

```bash
1. Open Postman
2. Import collection
3. Set auto_login_username and auto_login_password
4. Click any request and Send
5. Watch console for auto-authentication logs
```

### Example 2: Collection Runner

```bash
1. Right-click collection → Run
2. Select environment
3. Set iterations (e.g., 10)
4. Run
5. All requests automatically authenticate
```

### Example 3: Newman CLI

```bash
newman run F123Dashboard.postman_collection.json \
  -e F123Dashboard.postman_environment.json \
  --env-var "auto_login_username=testuser" \
  --env-var "auto_login_password=pass123" \
  -r html,cli
```

### Example 4: CI/CD Pipeline

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Newman
        run: npm install -g newman
      
      - name: Run API Tests
        run: |
          newman run server/F123Dashboard.postman_collection.json \
            -e server/F123Dashboard.postman_environment.json \
            --env-var "base_url=${{ secrets.API_URL }}" \
            --env-var "auto_login_username=${{ secrets.TEST_USERNAME }}" \
            --env-var "auto_login_password=${{ secrets.TEST_PASSWORD }}" \
            -r cli,json
```

## Troubleshooting

### Issue: Auto-login not working

**Symptoms:** Requests fail with 401, no auto-login attempts

**Solutions:**
1. Check `auto_login_username` and `auto_login_password` are set
2. Verify credentials are correct (test with manual login)
3. Check console for error messages
4. Ensure server is running and accessible

### Issue: Token validation fails

**Symptoms:** "Token validation error" in console

**Solutions:**
1. Verify server is running: `GET /api/health`
2. Check `base_url` is correct
3. Ensure `/api/auth/validate-token` endpoint is working
4. Check network connectivity

### Issue: Infinite loop of login attempts

**Symptoms:** Continuous auto-login attempts, no success

**Solutions:**
1. Check server logs for authentication errors
2. Verify login endpoint returns correct response format
3. Ensure `jwtToken` field exists in login response
4. Check password is correct

### Issue: Scripts not executing

**Symptoms:** No console output, manual token management needed

**Solutions:**
1. Check scripts are enabled: Settings → General → Allow scripts
2. Verify collection-level scripts exist
3. Re-import collection if scripts missing
4. Check Postman Console for script errors

## Customization

### Custom Authentication Endpoint

If your API uses different authentication endpoints:

```javascript
// In pre-request script, change:
url: pm.collectionVariables.get('base_url') + '/api/auth/login'

// To:
url: pm.collectionVariables.get('base_url') + '/your/custom/auth'
```

### Custom Token Field Name

If your API returns tokens with a different field name:

```javascript
// In test script, change:
if (jsonResponse.jwtToken) {

// To:
if (jsonResponse.accessToken) {  // or your field name
```

### Add Refresh Token Support

```javascript
// In pre-request script, add:
function refreshToken() {
    const refreshToken = pm.collectionVariables.get('refresh_token');
    
    pm.sendRequest({
        url: pm.collectionVariables.get('base_url') + '/api/auth/refresh',
        method: 'POST',
        body: {
            mode: 'raw',
            raw: JSON.stringify({ refreshToken })
        }
    }, function (err, response) {
        // Handle refresh token response
    });
}
```

## Best Practices

1. **Separate Environments**: Use different environments for dev/staging/prod
2. **Secure Credentials**: Never commit credentials to version control
3. **Token Expiration**: Set reasonable token expiration times server-side
4. **Error Handling**: Monitor Postman Console for authentication errors
5. **Testing**: Test auto-authentication with expired tokens
6. **Documentation**: Keep this guide updated with customizations

## Maintenance

### Updating Scripts

1. Export collection from Postman
2. Edit JSON file (or use Postman UI)
3. Re-import to apply changes
4. Test thoroughly

### Version Control

```bash
# Recommended .gitignore entries
*.postman_environment.json  # Contains credentials
*private*.json              # Private test data
```

### Monitoring

Use Postman Monitors to:
- Run tests on schedule
- Alert on failures
- Track API performance
- Validate authentication flow

---

**Version:** 1.0.0  
**Author:** F123 Dashboard Team  
**Last Updated:** November 2025
