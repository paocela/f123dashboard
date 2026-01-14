import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { gpEditController } from '../controllers/gp-edit.controller.js';

export const gpEditRouter = Router();

// Retrieve current data
gpEditRouter.post('/list', authMiddleware, adminMiddleware, (req, res) => gpEditController.getUpcomingGps(req, res));
gpEditRouter.post('/tracks', authMiddleware, adminMiddleware, (req, res) => gpEditController.getAllTracks(req, res));

// Actions
gpEditRouter.post('/create', authMiddleware, adminMiddleware, (req, res) => gpEditController.createGp(req, res));
gpEditRouter.post('/update/:id', authMiddleware, adminMiddleware, (req, res) => gpEditController.updateGp(req, res));
gpEditRouter.post('/delete/:id', authMiddleware, adminMiddleware, (req, res) => gpEditController.deleteGp(req, res));
gpEditRouter.post('/bulk-update-date', authMiddleware, adminMiddleware, (req, res) => gpEditController.bulkUpdateGpDate(req, res));
