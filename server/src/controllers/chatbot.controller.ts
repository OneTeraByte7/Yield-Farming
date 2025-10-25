import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class ChatbotController {
  /**
   * Chat with global website assistant
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const { message, conversationHistory } = req.body;

      if (!message || typeof message !== 'string') {
        return sendError(res, 'Message is required', 400);
      }

      const response = await ChatbotService.chat(
        message,
        conversationHistory || []
      );

      return sendSuccess(res, { response }, 'Chatbot response generated successfully');
    } catch (error: any) {
      console.error('Chatbot Error:', error);
      return sendError(res, error.message || 'Failed to process chatbot message', 500);
    }
  }
}
