import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI Strategy Advisor
 * @access  Private
 */
router.post('/chat', AIController.chat);

/**
 * @route   POST /api/ai/strategies
 * @desc    Generate investment strategies
 * @access  Private
 */
router.post('/strategies', AIController.generateStrategies);

export default router;
