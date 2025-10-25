import { Router } from 'express';
import {
  getAllPools,
  getPoolById,
  createPool,
  updatePool,
  syncPoolsFromExternal,
  cleanupDuplicatePools,
} from '../controllers/pool.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllPools);
router.get('/:id', getPoolById);

// Admin routes
router.post('/', authenticate, isAdmin, createPool);
router.put('/:id', authenticate, isAdmin, updatePool);
// Admin route to manually trigger sync
router.post('/sync', authenticate, isAdmin, syncPoolsFromExternal);
// Admin route to cleanup duplicate pools
router.post('/cleanup-duplicates', authenticate, isAdmin, cleanupDuplicatePools);

export default router;