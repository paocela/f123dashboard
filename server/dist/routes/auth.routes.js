import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
// Public endpoints (no auth required)
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/validate-token', (req, res) => authController.validateToken(req, res));
router.post('/users', (req, res) => authController.getUsers(req, res));
// Protected endpoints (requires authentication)
router.post('/refresh-token', authMiddleware, (req, res) => authController.refreshToken(req, res));
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));
router.post('/logout-all', authMiddleware, (req, res) => authController.logoutAllSessions(req, res));
router.post('/sessions', authMiddleware, (req, res) => authController.getUserSessions(req, res));
router.post('/change-password', authMiddleware, (req, res) => authController.changePassword(req, res));
router.post('/update-user-info', authMiddleware, (req, res) => authController.updateUserInfo(req, res));
// Admin-only endpoints (requires authentication + admin privileges)
router.post('/admin-change-password', authMiddleware, adminMiddleware, (req, res) => authController.adminChangePassword(req, res));
router.post('/cleanup-sessions', authMiddleware, adminMiddleware, (req, res) => authController.cleanupExpiredSessions(req, res));
export { router as authRouter };
