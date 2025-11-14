import { Router } from 'express';
import { playgroundController } from '../controllers/playground.controller.js';
const router = Router();
router.post('/leaderboard', (req, res) => playgroundController.getPlaygroundLeaderboard(req, res));
router.post('/set-score', (req, res) => playgroundController.setUserBestScore(req, res));
export { router as playgroundRouter };
