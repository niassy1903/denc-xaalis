import { Router } from 'express';
import authRoutes from './auth.routes.ts';
import tontineRoutes from './tontine.routes.ts';
import cotisationRoutes from './cotisation.routes.ts';
import tourRoutes from './tour.routes.ts';
import transactionRoutes from './transaction.routes.ts';
import litigeRoutes from './litige.routes.ts';
import notificationRoutes from './notification.routes.ts';
import adminRoutes from './admin.routes.ts';
import seedRoutes from './seed.routes.ts';
import { getDBStatus } from '../config/db.ts';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Denc Xaalis API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: getDBStatus(),
  });
});

router.use('/auth', authRoutes);
router.use('/tontines', tontineRoutes);
router.use('/cotisations', cotisationRoutes);
router.use('/tours', tourRoutes);
router.use('/transactions', transactionRoutes);
router.use('/litiges', litigeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/seed', seedRoutes);

export default router;
