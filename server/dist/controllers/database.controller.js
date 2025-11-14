import { DatabaseService } from '../services/database.service.js';
import pool from '../config/db.js';
import logger from '../config/logger.js';
const databaseService = new DatabaseService(pool);
export class DatabaseController {
    async getAllDrivers(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const drivers = await databaseService.getAllDrivers(seasonId);
            res.json(drivers);
        }
        catch (error) {
            logger.error('Error getting all drivers:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get drivers'
            });
        }
    }
    async getDriversData(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const drivers = await databaseService.getDriversData(seasonId);
            res.json(drivers);
        }
        catch (error) {
            logger.error('Error getting drivers data:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get drivers data'
            });
        }
    }
    async getChampionship(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const championship = await databaseService.getChampionship(seasonId);
            res.json(championship);
        }
        catch (error) {
            logger.error('Error getting championship:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get championship'
            });
        }
    }
    async getCumulativePoints(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const points = await databaseService.getCumulativePoints(seasonId);
            res.json(points);
        }
        catch (error) {
            logger.error('Error getting cumulative points:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get cumulative points'
            });
        }
    }
    async getAllTracks(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const tracks = await databaseService.getAllTracks(seasonId);
            res.json(tracks);
        }
        catch (error) {
            logger.error('Error getting all tracks:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get tracks'
            });
        }
    }
    async getRaceResult(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const results = await databaseService.getRaceResult(seasonId);
            res.json(results);
        }
        catch (error) {
            logger.error('Error getting race results:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get race results'
            });
        }
    }
    async getAllSeasons(req, res) {
        try {
            const seasons = await databaseService.getAllSeasons();
            res.json(seasons);
        }
        catch (error) {
            logger.error('Error getting all seasons:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get seasons'
            });
        }
    }
    async getConstructors(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const constructors = await databaseService.getConstructors(seasonId);
            res.json(constructors);
        }
        catch (error) {
            logger.error('Error getting constructors:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get constructors'
            });
        }
    }
    async getConstructorGrandPrixPoints(req, res) {
        try {
            const seasonId = req.body?.seasonId ? parseInt(req.body.seasonId) : undefined;
            const points = await databaseService.getConstructorGrandPrixPoints(seasonId);
            res.json(points);
        }
        catch (error) {
            logger.error('Error getting constructor grand prix points:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get constructor points'
            });
        }
    }
    async setGpResult(req, res) {
        try {
            const { trackId, hasSprint, raceResult, raceDnfResult, sprintResult, sprintDnfResult, qualiResult, fpResult, seasonId } = req.body;
            const result = await databaseService.setGpResult(trackId, hasSprint, raceResult, raceDnfResult, sprintResult, sprintDnfResult, qualiResult, fpResult, seasonId);
            if (result.success) {
                res.json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            logger.error('Error setting GP result:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to set GP result'
            });
        }
    }
}
export const databaseController = new DatabaseController();
