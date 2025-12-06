import { Router } from 'express';
import { fantaController } from '../controllers/fanta.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Fanta endpoints no authentication
router.post('/votes', (req, res) => fantaController.getFantaVote(req, res));

// fanta endpoints require authentication (user-specific data)
router.post('/votes', (req, res) => fantaController.getFantaVote(req, res));
router.post('/set-vote', authMiddleware, (req, res) => fantaController.setFantaVoto(req, res));

export { router as fantaRouter };
