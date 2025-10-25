import { Router } from 'express';
import {
  stake,
  unstake,
  claimRewards,
  getActiveStakes,
} from '../controllers/stake.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/stake', stake);
router.post('/unstake', unstake);
router.post('/claim', claimRewards);
router.get('/active', getActiveStakes);

export default router;