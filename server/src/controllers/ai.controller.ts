import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class AIController {
  /**
   * Chat with AI Strategy Advisor
   */
  static async chat(req: Request, res: Response) {
    try {
      const { message, conversationHistory, userProfile, availablePools } = req.body;

      if (!message || typeof message !== 'string') {
        return sendError(res, 'Message is required', 400);
      }

      const response = await AIService.chatWithAdvisor(
        message,
        conversationHistory || [],
        userProfile,
        availablePools
      );

      return sendSuccess(res, { response }, 'AI response generated successfully');
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      return sendError(res, error.message || 'Failed to process AI chat', 500);
    }
  }

  /**
   * Generate investment strategies
   */
  static async generateStrategies(req: Request, res: Response) {
    try {
      const { userProfile, availablePools } = req.body;

      if (!userProfile || !userProfile.investmentAmount || !userProfile.expectedReturns || !userProfile.targetApy) {
        return sendError(res, 'Complete user profile is required', 400);
      }

      if (!availablePools || !Array.isArray(availablePools)) {
        return sendError(res, 'Available pools data is required', 400);
      }

      const strategiesJson = await AIService.generateStrategies(userProfile, availablePools);

      return sendSuccess(res, { strategies: strategiesJson }, 'Strategies generated successfully');
    } catch (error: any) {
      console.error('Strategy Generation Error:', error);
      return sendError(res, error.message || 'Failed to generate strategies', 500);
    }
  }
}
