import { Router } from 'express';
import {
  createTontine,
  getMyTontines,
  getAllPublicTontines,
  getTontineById,
  joinTontineByCode,
  startTontine,
  randomizeDrawOrder,
  updateMembreRoleInTontine,
} from '../controllers/tontine.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

router.use(authMiddleware);

router.post('/', createTontine);
router.get('/my', getMyTontines);
router.get('/public', getAllPublicTontines);
router.get('/:id', getTontineById);
router.post('/join', joinTontineByCode);
router.post('/:id/start', startTontine);
router.post('/:id/randomize', randomizeDrawOrder);
router.put('/:id/membres/:membreId/role', updateMembreRoleInTontine);

export default router;
