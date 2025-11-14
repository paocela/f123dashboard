import pg from 'pg';
import dotenv from 'dotenv';
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
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    }
    else {
        console.log('Database connected successfully at:', res.rows[0].now);
    }
});
export default pool;
