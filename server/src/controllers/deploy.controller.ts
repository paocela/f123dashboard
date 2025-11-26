import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DeployController {
  async deploy(req: Request, res: Response): Promise<void> {
    const deploySecret = req.headers['x-deploy-secret'];

    // 1. Validate Secret
    if (deploySecret !== process.env.DEPLOY_SECRET) {
      logger.warn('⛔ Unauthorized deployment attempt', { ip: req.ip });
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    logger.info('🚀 Deployment webhook received. Triggering deployment script...');

    // 2. Respond immediately to avoid timeout
    res.json({ success: true, message: 'Deployment started' });

    // 3. Execute Script
    // Go up from src/controllers to root/scripts
    const scriptPath = path.resolve(__dirname, '../../../deploy.sh');
    
    exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`❌ Deployment script log: ${stdout}`);
        logger.error(`❌ Deployment failed: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.warn(`Deployment stderr: ${stderr}`);
      }
      logger.info(`✅ Deployment success: ${stdout}`);
    });
  }
}

export const deployController = new DeployController();
