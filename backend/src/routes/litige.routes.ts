import { Router } from 'express';
import { getLitigesByTontine, createLitige, resolveLitige } from '../controllers/litige.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

router.use(authMiddleware);

router.get('/tontine/:tontineId', getLitigesByTontine);
router.post('/', createLitige);
router.put('/:litigeId/resolve', resolveLitige);

export default router;
