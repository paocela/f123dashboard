import { Router } from 'express';
import { featureFlagsController } from '../controllers/feature-flags.controller.js';

const router = Router();

router.get('/', (req, res) => featureFlagsController.getFlags(req, res));

export { router as featureFlagsRouter };