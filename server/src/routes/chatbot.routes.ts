import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All chatbot routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/chatbot/message
 * @desc    Chat with global website assistant
 * @access  Private
 */
router.post('/message', ChatbotController.sendMessage);

export default router;
