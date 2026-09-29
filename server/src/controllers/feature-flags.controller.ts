import type { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../config/logger.js';
import { FeatureFlagsService } from '../services/feature-flags.service.js';

const featureFlagsService = new FeatureFlagsService(pool);

export class FeatureFlagsController {
  async getFlags(req: Request, res: Response): Promise<void> {
    try {
      const seasonId = req.query.seasonId ? Number.parseInt(String(req.query.seasonId), 10) : undefined;
      res.json(await featureFlagsService.getFlags(seasonId));
    } catch (error) {
      logger.error('Error getting feature flags', { error });
      res.status(500).json({ success: false, message: 'Failed to get feature flags' });
    }
  }

  async setFreePracticeEnabled(req: Request, res: Response): Promise<void> {
    try {
      const { seasonId, enabled } = req.body;
      if ((seasonId !== undefined && !Number.isInteger(seasonId)) || typeof enabled !== 'boolean') {
        res.status(400).json({ success: false, message: 'A valid optional season ID and enabled flag are required' });
        return;
      }

      await featureFlagsService.setFreePracticeEnabled(seasonId, enabled);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error updating free practice feature flag', { error });
      res.status(500).json({ success: false, message: 'Failed to update free practice feature flag' });
    }
  }
}

export const featureFlagsController = new FeatureFlagsController();