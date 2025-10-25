import api from './axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserProfile {
  investmentAmount?: number;
  expectedReturns?: number;
  targetApy?: number;
}

export interface Pool {
  id: string;
  name: string;
  apy: number;
  // Add other relevant fields as needed
}

/**
 * Chat with AI Strategy Advisor
 */
export const aiApi = {
  async chat(
    message: string,
    conversationHistory: ChatMessage[] = [],
    userProfile?: UserProfile,
    availablePools?: Pool[]
  ): Promise<{ response: string }> {
    const response = await api.post('/ai/chat', {
      message,
      conversationHistory,
      userProfile,
      availablePools,
    });
    return response.data.data;
  },

  /**
   * Generate investment strategies using AI
   */
  async generateStrategies(
    userProfile: {
      investmentAmount: number;
      expectedReturns: number;
      targetApy: number;
    },
    availablePools: Pool[]
  ): Promise<{ strategies: string }> {
  const response = await api.post('/ai/strategies', {
      userProfile,
      availablePools,
    });
    return response.data.data;
  },
};
