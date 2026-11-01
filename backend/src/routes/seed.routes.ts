import { Router } from 'express';
import { seedDatabase } from '../controllers/seed.controller.ts';

const router = Router();

router.post('/', (req, res) => {
  seedDatabase(req, res);
});

export default router;
