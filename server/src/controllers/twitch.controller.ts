import { Request, Response } from 'express';
import { TwitchService } from '../services/twitch.service.js';
import logger from '../config/logger.js';

const twitchService = new TwitchService();

export class TwitchController {
  async getStreamInfo(req: Request, res: Response): Promise<void> {
    try {
      const { channelName } = req.body;
      
      if (!channelName) {
        res.status(400).json({
          success: false,
          message: 'Channel name is required'
        });
        return;
      }

      const streamInfo = await twitchService.getStreamInfo(channelName);
      res.json(streamInfo);
    } catch (error) {
      logger.error('Error getting stream info:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get stream info'
      });
    }
  }
}

export const twitchController = new TwitchController();
