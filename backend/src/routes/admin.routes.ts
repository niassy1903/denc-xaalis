import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  createAdminUser,
  getAllTontinesAdmin,
  getAllTransactionsAdmin,
  getAllLitigesAdmin,
  getAuditLogs,
} from '../controllers/admin.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import { roleMiddleware } from '../middlewares/role.middleware.ts';

const router = Router();

// Routes réservées strictement au rôle 'admin'
router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.post('/create-admin', createAdminUser);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId/role', updateUserRole);
router.get('/tontines', getAllTontinesAdmin);
router.get('/transactions', getAllTransactionsAdmin);
router.get('/litiges', getAllLitigesAdmin);
router.get('/audit-logs', getAuditLogs);

export default router;
