import { TwitchService } from '../services/twitch.service.js';
const twitchService = new TwitchService();
export class TwitchController {
    async getStreamInfo(req, res) {
        try {
            const { channelName } = req.body;
            if (!channelName) {
                res.status(400).json({
                    success: false,
                    message: 'Channel name is required'
                });
                return;
            }
            const streamInfo = await twitchService.getStreamInfo(channelName);
            res.json(streamInfo);
        }
        catch (error) {
            console.error('Error getting stream info:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get stream info'
            });
        }
    }
}
export const twitchController = new TwitchController();
