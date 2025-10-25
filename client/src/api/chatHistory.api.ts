import api from './axios';

export interface ChatHistoryItem {
  id: string;
  user_id: string;
  chat_title: string;
  messages: any[];
  investment_profile?: any;
  strategies?: any[];
  created_at: string;
  updated_at: string;
}

export interface SaveChatData {
  messages: any[];
  investmentProfile?: any;
  strategies?: any[];
  chatId?: string;
}

export const chatHistoryApi = {
  /**
   * Get all chats for the current user
   */
  async getUserChats(): Promise<ChatHistoryItem[]> {
    try {
      console.log('Fetching chat history from: /api/chat-history');
      const response = await api.get('/chat-history');
      console.log('Chat history response:', response.data);
      return response.data.chats || [];
    } catch (error: any) {
      console.error('Error fetching chat history:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Get a specific chat by ID
   */
  async getChatById(chatId: string): Promise<ChatHistoryItem> {
    const response = await api.get(`/chat-history/${chatId}`);
    return response.data.chat;
  },

  /**
   * Save a new chat or update existing
   */
  async saveChat(data: SaveChatData): Promise<ChatHistoryItem> {
    try {
      console.log('Saving chat:', data);
      const response = await api.post('/chat-history', data);
      console.log('Save chat response:', response.data);
      return response.data.chat;
    } catch (error: any) {
      console.error('Error saving chat:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update chat title
   */
  async updateChatTitle(chatId: string, title: string): Promise<ChatHistoryItem> {
    const response = await api.patch(`/chat-history/${chatId}`, { title });
    return response.data.chat;
  },

  /**
   * Delete a chat
   */
  async deleteChat(chatId: string): Promise<void> {
    await api.delete(`/chat-history/${chatId}`);
  },
};
