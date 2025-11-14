import { Router } from 'express';
import { databaseController } from '../controllers/database.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
// Public read endpoints (no authentication required)
// Driver endpoints
router.post('/drivers', (req, res) => databaseController.getAllDrivers(req, res));
router.post('/drivers-data', (req, res) => databaseController.getDriversData(req, res));
// Championship endpoints
router.post('/championship', (req, res) => databaseController.getChampionship(req, res));
router.post('/cumulative-points', (req, res) => databaseController.getCumulativePoints(req, res));
// Track endpoints
router.post('/tracks', (req, res) => databaseController.getAllTracks(req, res));
// Race result endpoints
router.post('/race-results', (req, res) => databaseController.getRaceResult(req, res));
// Season endpoints
router.post('/seasons', (req, res) => databaseController.getAllSeasons(req, res));
// Constructor endpoints
router.post('/constructors', (req, res) => databaseController.getConstructors(req, res));
router.post('/constructor-grand-prix-points', (req, res) => databaseController.getConstructorGrandPrixPoints(req, res));
// Admin-only write endpoints (requires authentication + admin privileges)
router.post('/set-gp-result', authMiddleware, adminMiddleware, (req, res) => databaseController.setGpResult(req, res));
export { router as databaseRouter };
