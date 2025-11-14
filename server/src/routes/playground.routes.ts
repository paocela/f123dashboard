import { Router } from 'express';
import { playgroundController } from '../controllers/playground.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public endpoint - anyone can view leaderboard
router.post('/leaderboard', (req, res) => playgroundController.getPlaygroundLeaderboard(req, res));

// Protected endpoint - only authenticated users can submit scores
router.post('/score', authMiddleware, (req, res) => playgroundController.setUserBestScore(req, res));

export { router as playgroundRouter };
