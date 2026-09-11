import type { NextFunction, Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../config/logger.js';
import { FeatureFlagsService } from '../services/feature-flags.service.js';

const featureFlagsService = new FeatureFlagsService(pool);

export const fantaEnabledMiddleware = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fantaEnabled } = await featureFlagsService.getFlags();
    if (fantaEnabled) {
      next();
      return;
    }

    res.status(403).json({ success: false, message: 'Fanta is currently disabled' });
  } catch (error) {
    logger.error('Error checking Fanta feature flag', { error });
    res.status(500).json({ success: false, message: 'Failed to check Fanta availability' });
  }
};