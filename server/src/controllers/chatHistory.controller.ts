import { Response } from 'express';
import { AuthRequest } from '../types';
import { ChatHistoryService } from '../services/chatHistory.service';

export class ChatHistoryController {
  /**
   * Get all chats for the authenticated user
   */
  static async getUserChats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const chats = await ChatHistoryService.getUserChats(userId);

      res.json({
        success: true,
        chats,
      });
    } catch (error: any) {
      console.error('Error fetching user chats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch chat history',
      });
    }
  }

  /**
   * Get a specific chat by ID
   */
  static async getChatById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { chatId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const chat = await ChatHistoryService.getChatById(chatId, userId);

      if (!chat) {
        res.status(404).json({
          success: false,
          error: 'Chat not found',
        });
        return;
      }

      res.json({
        success: true,
        chat,
      });
    } catch (error: any) {
      console.error('Error fetching chat:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch chat',
      });
    }
  }

  /**
   * Save a new chat or update existing
   */
  static async saveChat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { messages, investmentProfile, strategies, chatId } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({
          success: false,
          error: 'Messages array is required',
        });
        return;
      }

      const chat = await ChatHistoryService.saveChat(
        userId,
        messages,
        investmentProfile,
        strategies,
        chatId
      );

      res.json({
        success: true,
        chat,
      });
    } catch (error: any) {
      console.error('Error saving chat:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to save chat',
      });
    }
  }

  /**
   * Update chat title
   */
  static async updateChatTitle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { chatId } = req.params;
      const { title } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!title || typeof title !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Title is required',
        });
        return;
      }

      const updatedChat = await ChatHistoryService.updateChatTitle(chatId, userId, title);

      res.json({
        success: true,
        chat: updatedChat,
      });
    } catch (error: any) {
      console.error('Error updating chat title:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update chat title',
      });
    }
  }

  /**
   * Delete a chat
   */
  static async deleteChat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { chatId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await ChatHistoryService.deleteChat(chatId, userId);

      res.json({
        success: true,
        message: 'Chat deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete chat',
      });
    }
  }
}
