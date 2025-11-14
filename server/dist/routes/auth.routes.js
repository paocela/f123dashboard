import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
const router = Router();
// Public endpoints (no auth required)
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/validate-token', (req, res) => authController.validateToken(req, res));
// Session management
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/logout-all', (req, res) => authController.logoutAllSessions(req, res));
router.post('/sessions', (req, res) => authController.getUserSessions(req, res));
router.post('/cleanup-sessions', (req, res) => authController.cleanupExpiredSessions(req, res));
// Password management
router.post('/change-password', (req, res) => authController.changePassword(req, res));
router.post('/admin-change-password', (req, res) => authController.adminChangePassword(req, res));
// User management
router.post('/users', (req, res) => authController.getUsers(req, res));
router.post('/update-user-info', (req, res) => authController.updateUserInfo(req, res));
export { router as authRouter };
