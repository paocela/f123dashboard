import { Router } from 'express';
import { featureFlagsController } from '../controllers/feature-flags.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', (req, res) => featureFlagsController.getFlags(req, res));
router.put('/free-practice', authMiddleware, adminMiddleware, (req, res) => featureFlagsController.setFreePracticeEnabled(req, res));

export { router as featureFlagsRouter };