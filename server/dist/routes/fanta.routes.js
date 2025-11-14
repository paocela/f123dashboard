import { Router } from 'express';
import { fantaController } from '../controllers/fanta.controller.js';
const router = Router();
router.post('/votes', (req, res) => fantaController.getFantaVote(req, res));
router.post('/set-vote', (req, res) => fantaController.setFantaVoto(req, res));
export { router as fantaRouter };
