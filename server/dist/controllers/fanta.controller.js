import { FantaService } from '../services/fanta.service.js';
import pool from '../config/db.js';
import logger from '../config/logger.js';
const fantaService = new FantaService(pool);
export class FantaController {
    async getFantaVote(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const votes = await fantaService.getFantaVote(seasonId);
            res.json(votes);
        }
        catch (error) {
            logger.error('Error getting fanta votes:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get fanta votes'
            });
        }
    }
    async setFantaVoto(req, res) {
        try {
            const result = await fantaService.setFantaVoto(req.body);
            res.json(result);
        }
        catch (error) {
            logger.error('Error setting fanta vote:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to set fanta vote'
            });
        }
    }
}
export const fantaController = new FantaController();
