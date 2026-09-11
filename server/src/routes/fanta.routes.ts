import { Router } from 'express';
import { fantaController } from '../controllers/fanta.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { fantaEnabledMiddleware } from '../middleware/fanta-enabled.middleware.js';

const router = Router();

// Fanta endpoints no authentication
router.post('/votes', fantaEnabledMiddleware, (req, res) => fantaController.getFantaVote(req, res));
router.post('/set-vote', authMiddleware, fantaEnabledMiddleware, (req, res) => fantaController.setFantaVoto(req, res));

export { router as fantaRouter };
