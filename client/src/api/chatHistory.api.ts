import api from './axios';
import { isAxiosError } from 'axios';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface InvestmentProfile {
  // flexible object for investment profile returned by the API
  [key: string]: unknown;
}

export interface Strategy {
  // flexible object for a strategy returned by the API
  [key: string]: unknown;
}

export interface ChatHistoryItem {
  id: string;
  user_id: string;
  chat_title: string;
  messages: Message[];
  investment_profile?: InvestmentProfile;
  strategies?: Strategy[];
  created_at: string;
  updated_at: string;
}

export interface SaveChatData {
  messages: Message[];
  investmentProfile?: InvestmentProfile;
  strategies?: Strategy[];
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

      // try common shapes: { chats: ChatHistoryItem[] } or directly an array
      if (Array.isArray(response.data)) {
        return response.data as ChatHistoryItem[];
      } else if (Array.isArray(response.data.chats)) {
        return response.data.chats as ChatHistoryItem[];
      } else if (Array.isArray(response.data.chatHistory)) {
        return response.data.chatHistory as ChatHistoryItem[];
      }

      // fallback: return empty array if shape unexpected
      return [];
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error fetching chat history:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error fetching chat history:', error.message);
      } else {
        console.error('Error fetching chat history:', String(error));
      }
      return [];
    }
  },

  /**
   * Get a specific chat by ID
   */
  async getChatById(chatId: string): Promise<ChatHistoryItem> {
    try {
      const response = await api.get(`/chat-history/${chatId}`);
      // expect response.data.chat or response.data
      return (response.data.chat ?? response.data) as ChatHistoryItem;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error fetching chat by id:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error fetching chat by id:', error.message);
      } else {
        console.error('Error fetching chat by id:', String(error));
      }
      throw error;
    }
  },

  /**
   * Save a new chat or update existing
   */
  async saveChat(data: SaveChatData): Promise<ChatHistoryItem> {
    try {
      const response = await api.post('/chat-history', data);
      console.log('Save chat response:', response.data);
      return (response.data.chat ?? response.data) as ChatHistoryItem;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error saving chat:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error saving chat:', error.message);
      } else {
        console.error('Error saving chat:', String(error));
      }
      throw error;
    }
  },

  /**
   * Update chat title
   */
  async updateChatTitle(chatId: string, title: string): Promise<ChatHistoryItem> {
    try {
      const response = await api.patch(`/chat-history/${chatId}`, { title });
      return (response.data.chat ?? response.data) as ChatHistoryItem;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error updating chat title:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error updating chat title:', error.message);
      } else {
        console.error('Error updating chat title:', String(error));
      }
      throw error;
    }
  },

  /**
   * Delete a chat
   */
  async deleteChat(chatId: string): Promise<void> {
    try {
      await api.delete(`/chat-history/${chatId}`);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Error deleting chat:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error deleting chat:', error.message);
      } else {
        console.error('Error deleting chat:', String(error));
      }
      throw error;
    }
  },
};
