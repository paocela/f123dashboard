import { Request, Response } from 'express';
import { PlaygroundService } from '../services/playground.service.js';
import pool from '../config/db.js';
import logger from '../config/logger.js';

const playgroundService = new PlaygroundService(pool);

export class PlaygroundController {
  async getPlaygroundLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const leaderboard = await playgroundService.getPlaygroundLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      logger.error('Error getting playground leaderboard:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get leaderboard'
      });
    }
  }

  async setUserBestScore(req: Request, res: Response): Promise<void> {
    try {
      await playgroundService.setUserBestScore(req.body);
      res.json({
        success: true,
        message: 'Best score saved successfully'
      });
    } catch (error) {
      logger.error('Error setting best score:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to set best score'
      });
    }
  }
}

export const playgroundController = new PlaygroundController();
