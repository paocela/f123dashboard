import { Router } from 'express';
import { deployController } from '../controllers/deploy.controller.js';

const router = Router();

router.post('/', (req, res) => deployController.deploy(req, res));

export { router as deployRouter };
