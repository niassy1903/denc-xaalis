import { Router } from 'express';
import { getToursByTontine, payoutTour } from '../controllers/tour.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

router.use(authMiddleware);

router.get('/tontine/:tontineId', getToursByTontine);
router.post('/:tourId/payout', payoutTour);

export default router;
