import type { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../config/logger.js';
import { FeatureFlagsService } from '../services/feature-flags.service.js';

const featureFlagsService = new FeatureFlagsService(pool);

export class FeatureFlagsController {
  async getFlags(_req: Request, res: Response): Promise<void> {
    try {
      res.json(await featureFlagsService.getFlags());
    } catch (error) {
      logger.error('Error getting feature flags', { error });
      res.status(500).json({ success: false, message: 'Failed to get feature flags' });
    }
  }
}

export const featureFlagsController = new FeatureFlagsController();