import { Router } from 'express';
import { register, login, getMe, updateProfile, logout, getCaptcha } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import { authRateLimiter, sanitizeInput } from '../middlewares/security.middleware.ts';

const router = Router();

router.use(sanitizeInput);

// Captcha challenge for bots protection
router.get('/captcha', getCaptcha);

// Sensitive auth endpoints with brute force rate limiting
router.post('/register', authRateLimiter(8, 15 * 60 * 1000), register);
router.post('/login', authRateLimiter(10, 15 * 60 * 1000), login);

router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.post('/logout', logout);

export default router;
