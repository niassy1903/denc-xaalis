import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

router.use(authMiddleware);

router.get('/my', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
