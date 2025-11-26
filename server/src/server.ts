import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import morgan from 'morgan';
import cron from 'node-cron';
import logger, { stream } from './config/logger.js';
import { EmailService } from './services/mail.service.js';

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

// HTTP request logging with Morgan + Winston
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
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
import { deployRouter } from './routes/deploy.routes.js';
import { existsSync } from 'fs';

app.use('/api/database', databaseRouter);
app.use('/api/auth', authRouter);
app.use('/api/fanta', fantaRouter);
app.use('/api/twitch', twitchRouter);
app.use('/api/playground', playgroundRouter);
app.use('/api/deploy', deployRouter);

// Serve Angular static files in production
if (process.env.NODE_ENV === 'production') {
  // Production build structure: dist/server/server.js -> dist/client/browser/
  const angularDistPath = path.join(__dirname, '../client/browser');
  
  logger.info(`📂 Attempting to serve static files from: ${angularDistPath}`);
  
  if (existsSync(angularDistPath)) {
    app.use(express.static(angularDistPath));

    // All other routes return the Angular app
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(angularDistPath, 'index.html'));
    });
    
    logger.info(`✅ Serving Angular static files from: ${angularDistPath}`);
  } else {
    logger.warn(`⚠️  Angular build not found at: ${angularDistPath}`);
  }
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack, url: req.url, method: req.method });
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Initialize Email Service
const emailService = new EmailService();

// Schedule cron job to send upcoming race emails daily at 18:00 (6:00 PM)
// cron.schedule('0 18 * * *', async () => {
//   logger.info('🕐 Running scheduled task: sendIncomingRaceMail');
//   try {
//     await emailService.sendIncomingRaceMail();
//     logger.info('✅ Scheduled email task completed successfully');
//   } catch (error) {
//     logger.error('❌ Error running scheduled email task:', error);
//   }
// }, {
//   timezone: 'Europe/Rome' // Adjust timezone as needed
// });

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔧 Health check: http://localhost:${PORT}/api/health`);
//logger.info('⏰ Cron job scheduled: sendIncomingRaceMail at 18:00 daily');
});

export default app;
