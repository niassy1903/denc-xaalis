import { Router } from 'express';
import {
  getMyCotisations,
  getCotisationsByTontine,
  payCotisation,
  validateCotisation,
} from '../controllers/cotisation.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

router.use(authMiddleware);

router.get('/my', getMyCotisations);
router.get('/tontine/:tontineId', getCotisationsByTontine);
router.post('/:cotisationId/pay', payCotisation);
router.put('/:cotisationId/validate', validateCotisation);

export default router;
