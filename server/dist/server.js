import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Load environment variables
dotenv.config();
// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// API Routes
import { databaseRouter } from './routes/database.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { fantaRouter } from './routes/fanta.routes.js';
import { twitchRouter } from './routes/twitch.routes.js';
import { playgroundRouter } from './routes/playground.routes.js';
app.use('/api/database', databaseRouter);
app.use('/api/auth', authRouter);
app.use('/api/fanta', fantaRouter);
app.use('/api/twitch', twitchRouter);
app.use('/api/playground', playgroundRouter);
// Serve Angular static files in production
if (process.env.NODE_ENV === 'production') {
    const angularDistPath = path.join(__dirname, '../../../client/dist/browser');
    app.use(express.static(angularDistPath));
    // All other routes return the Angular app
    app.get('*', (req, res) => {
        res.sendFile(path.join(angularDistPath, 'index.html'));
    });
}
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
});
export default app;
