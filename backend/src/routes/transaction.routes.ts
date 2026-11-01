import { Router } from 'express';
import { getMyTransactions, depositWallet } from '../controllers/transaction.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

router.use(authMiddleware);

router.get('/my', getMyTransactions);
router.post('/deposit', depositWallet);

export default router;
