# Winston Logging Implementation

## Overview

The Express.js backend now uses Winston for structured, professional logging across all services. Winston provides flexible log levels, formatted output, and supports both console and file transports.

## Features

- **Structured Logging**: JSON-formatted logs with timestamps and metadata
- **Multiple Log Levels**: error, warn, info, http, debug
- **Console Output**: Colorized console logs for development
- **File Output**: Persistent logs in production (error.log, combined.log)
- **HTTP Request Logging**: Integrated with Morgan middleware
- **Log Rotation**: Automatic rotation when files reach 5MB (max 5 files)
- **Environment-Aware**: Different behavior in development vs production

## Log Levels

Winston uses the following log levels (in order of priority):

1. **error** (0): Critical errors that need immediate attention
2. **warn** (1): Warning messages for potentially harmful situations
3. **info** (2): Informational messages about application state
4. **http** (3): HTTP request/response logs
5. **debug** (4): Detailed debug information for development

## Configuration

### Environment Variables

Add to your `.env` file:

```env
LOG_LEVEL=debug          # error, warn, info, http, or debug
NODE_ENV=development     # development or production
```

### Log Level Behavior

- **Development** (default): `debug` - shows all logs
- **Production**: `info` - shows info, warn, and error logs

## Usage

### In Services and Controllers

```typescript
import logger from '../config/logger.js';

// Error logging
logger.error('Database connection failed', { 
  error: err.message, 
  stack: err.stack,
  context: 'additional data'
});

// Warning logging
logger.warn('API rate limit approaching', { 
  current: 95, 
  limit: 100 
});

// Info logging
logger.info('Server started successfully', { 
  port: 3000, 
  environment: 'production' 
});

// HTTP logging (handled automatically by Morgan)
// No manual HTTP logging needed - Morgan handles this

// Debug logging
logger.debug('Processing user request', { 
  userId: 123, 
  action: 'updateProfile' 
});
```

### Best Practices

#### ✅ DO:

```typescript
// Include context and structured data
logger.error('Failed to save user', { 
  userId: user.id, 
  error: err.message,
  stack: err.stack 
});

// Use appropriate log levels
logger.warn('Cache miss', { key: cacheKey });
logger.info('User logged in', { userId: user.id });
logger.debug('Cache state', { size: cache.size, hits: cache.hits });

// Log errors with stack traces
logger.error('Unexpected error', { 
  error: err instanceof Error ? err.message : 'Unknown error',
  stack: err instanceof Error ? err.stack : undefined
});
```

#### ❌ DON'T:

```typescript
// Don't use console.log/console.error
console.log('User logged in'); // ❌

// Don't log sensitive data
logger.info('User login', { password: user.password }); // ❌

// Don't use string concatenation
logger.error('Error: ' + err.message); // ❌ Use structured data instead

// Don't log without context
logger.error(err); // ❌ Include metadata
```

## Log Formats

### Development (Console)

Colorized output with readable format:
```
2025-11-14 10:45:23 [info]: 🚀 Server running on http://localhost:3000
2025-11-14 10:45:24 [http]: POST /api/auth/login 200 245 - 125.5 ms
2025-11-14 10:45:25 [error]: Database query failed
  Error: Connection timeout
    at Pool.query (...)
```

### Production (Files)

JSON format for log aggregation tools:
```json
{
  "level": "error",
  "message": "Database query failed",
  "timestamp": "2025-11-14 10:45:25",
  "error": "Connection timeout",
  "stack": "Error: Connection timeout\n    at Pool.query (...)",
  "userId": 123
}
```

## Log Files (Production Only)

Logs are stored in `server/logs/` directory:

- **error.log**: Error-level logs only
- **combined.log**: All logs (info, warn, error, http)

Both files:
- Max size: 5MB
- Max files: 5 (automatic rotation)
- Format: JSON for easy parsing

## HTTP Request Logging

Morgan middleware automatically logs all HTTP requests:

```
POST /api/auth/login 200 245 - 125.5 ms
GET /api/database/drivers 200 1024 - 45.2 ms
POST /api/fanta/votes 401 - - 12.1 ms
```

Format: `METHOD PATH STATUS CONTENT_LENGTH - RESPONSE_TIME`

## Integration Points

Winston logging is integrated throughout the application:

### 1. Server Startup (`server.ts`)
```typescript
logger.info('🚀 Server running on http://localhost:3000');
logger.info('📦 Environment: development');
logger.info('🔧 Health check: http://localhost:3000/api/health');
```

### 2. Database Connection (`config/db.ts`)
```typescript
logger.info('Database connected successfully', { timestamp: res.rows[0].now });
logger.error('Database connection error', { error: err.message, stack: err.stack });
```

### 3. Authentication Middleware (`middleware/auth.middleware.ts`)
```typescript
logger.error('Auth middleware error', { 
  error: error.message,
  stack: error.stack
});
```

### 4. All Controllers
```typescript
logger.error('Error getting users:', error);
logger.error('Error during login:', error);
logger.error('Error setting fanta vote:', error);
// etc.
```

## Monitoring and Analysis

### Viewing Logs in Development

Logs appear in the console with colors:
```bash
npm run dev
```

### Viewing Logs in Production

```bash
# View error logs
tail -f server/logs/error.log

# View all logs
tail -f server/logs/combined.log

# Search for specific errors
grep "Database" server/logs/error.log

# View logs in JSON format
cat server/logs/combined.log | jq '.'
```

### Log Aggregation

Production logs are in JSON format, making them compatible with:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Datadog**
- **CloudWatch** (AWS)
- **Stackdriver** (GCP)

Example Logstash configuration:
```json
{
  "input": {
    "file": {
      "path": "/path/to/server/logs/combined.log",
      "codec": "json"
    }
  }
}
```

## Troubleshooting

### No logs appearing in console

Check `LOG_LEVEL` environment variable:
```bash
echo $LOG_LEVEL
```

Set to `debug` for maximum verbosity:
```env
LOG_LEVEL=debug
```

### Log files not being created

1. Ensure `NODE_ENV=production`:
```env
NODE_ENV=production
```

2. Check `server/logs/` directory exists:
```bash
mkdir -p server/logs
```

3. Check file permissions:
```bash
ls -la server/logs/
```

### Too many logs

Reduce log level in production:
```env
LOG_LEVEL=warn  # Only warnings and errors
```

## Performance Considerations

- **Console logging**: Minimal performance impact in development
- **File logging**: Asynchronous writes in production (non-blocking)
- **Log rotation**: Automatic cleanup prevents disk space issues
- **Structured data**: Use objects for metadata, not string concatenation

## Security

⚠️ **Never log sensitive data**:
- Passwords (plain or hashed)
- JWT tokens
- API keys
- Credit card numbers
- Personal identification numbers

✅ **Safe to log**:
- User IDs
- Request methods and paths
- Response status codes
- Error messages (without sensitive details)
- Timestamps and durations

---

**Summary**: Winston provides production-ready logging with minimal configuration. Use structured logging with appropriate levels and context for effective debugging and monitoring.
