import pg from 'pg';
import dotenv from 'dotenv';
import logger from './logger.js';
// Load environment variables
dotenv.config();
const { Pool } = pg;
// Create a singleton database connection pool
const pool = new Pool({
    connectionString: process.env.RACEFORFEDERICA_DB_DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});
// Handle pool errors
pool.on('error', (err) => {
    logger.error('Unexpected error on idle database client', { error: err.message, stack: err.stack });
    process.exit(-1);
});
// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        logger.error('Database connection error', { error: err.message, stack: err.stack });
    }
    else {
        logger.info('Database connected successfully', { timestamp: res.rows[0].now });
    }
});
export default pool;
