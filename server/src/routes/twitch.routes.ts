import { Router } from 'express';
import { twitchController } from '../controllers/twitch.controller.js';

const router = Router();

router.post('/stream-info', (req, res) => twitchController.getStreamInfo(req, res));

export { router as twitchRouter };
