# Simplified Database Maintenance Functions

## Overview

The authentication system includes a simple database maintenance function to keep the system performant by removing expired user sessions.

## Available Function

### `clean_expired_sessions()`
- **Purpose**: Removes expired user sessions from the `user_sessions` table
- **Logic**: Deletes sessions where `expires_at < NOW()`
- **Returns**: Number of deleted records
- **Frequency**: Should run daily or multiple times per day

## Usage Methods

### Method 1: Manual Database Execution

```sql
-- Run immediately to clean expired sessions
SELECT clean_expired_sessions();

-- Check the result
SELECT 'Sessions cleaned' as operation, clean_expired_sessions() as deleted_count;
```

### Method 2: System Cron Job

Create a shell script for automated cleanup:

```bash
#!/bin/bash
# File: /path/to/cleanup-sessions.sh

# Database connection details
DB_HOST="your-db-host"
DB_NAME="your-db-name"
DB_USER="your-db-user"
DB_PASSWORD="your-db-password"

# Run session cleanup
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT clean_expired_sessions();"

# Log the result
echo "$(date): Session cleanup completed" >> /var/log/session-cleanup.log
```

Then add to crontab:
```bash
# Run every 4 hours
0 */4 * * * /path/to/cleanup-sessions.sh
```

### Method 3: PostgreSQL Scheduled Jobs (if pg_cron is available)

```sql
-- Schedule session cleanup every 4 hours
SELECT cron.schedule('session-cleanup', '0 */4 * * *', 'SELECT clean_expired_sessions();');

-- View scheduled jobs
SELECT * FROM cron.job;

-- Remove a scheduled job
SELECT cron.unschedule('session-cleanup');
```

## Recommended Implementation

### Quick Start

1. **Test the function manually**:
   ```sql
   SELECT clean_expired_sessions();
   ```

2. **Set up automated cleanup**:
   ```bash
   # Add to crontab (crontab -e)
   0 */4 * * * psql -h your-host -U your-user -d your-database -c "SELECT clean_expired_sessions();"
   ```

### Monitoring

Check how many sessions are being cleaned:
```sql
-- Check current expired sessions
SELECT COUNT(*) as expired_sessions 
FROM user_sessions 
WHERE expires_at < NOW();

-- Check total sessions
SELECT COUNT(*) as total_sessions 
FROM user_sessions;
```

## Performance Tips

1. **Run during low-usage hours** if you have high session volume
2. **Monitor execution times** - if they get too long, increase frequency
3. **Check table size** before and after cleanup

## Emergency Cleanup

If the sessions table gets too large:
```sql
-- Clean in batches to avoid blocking
DELETE FROM user_sessions 
WHERE expires_at < NOW() - INTERVAL '1 day' 
LIMIT 10000;
```

This simplified approach focuses on the essential session cleanup functionality while maintaining system performance.
