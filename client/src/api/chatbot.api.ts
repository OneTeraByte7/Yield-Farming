import api from './axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatbotApi = {
  /**
   * Send a message to the chatbot
   */
  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<{ response: string }> {
    const response = await api.post('/chatbot/message', {
      message,
      conversationHistory,
    });
    return response.data.data;
  },
};
