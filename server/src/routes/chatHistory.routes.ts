import { Router } from 'express';
import { ChatHistoryController } from '../controllers/chatHistory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/chat-history - Get all chats for user
router.get('/', ChatHistoryController.getUserChats);

// GET /api/chat-history/:chatId - Get specific chat
router.get('/:chatId', ChatHistoryController.getChatById);

// POST /api/chat-history - Save new chat or update existing
router.post('/', ChatHistoryController.saveChat);

// PATCH /api/chat-history/:chatId - Update chat title
router.patch('/:chatId', ChatHistoryController.updateChatTitle);

// DELETE /api/chat-history/:chatId - Delete chat
router.delete('/:chatId', ChatHistoryController.deleteChat);

export default router;
