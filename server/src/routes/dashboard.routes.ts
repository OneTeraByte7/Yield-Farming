import { Router } from 'express';
import {
  getDashboardOverview,
  getRewardHistory,
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', getDashboardOverview);
router.get('/rewards-history', getRewardHistory);

export default router;