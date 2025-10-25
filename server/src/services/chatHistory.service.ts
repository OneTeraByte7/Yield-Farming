import { supabase } from '../config/supabase';

export interface ChatHistoryData {
  id?: string;
  user_id: string;
  chat_title: string;
  messages: any[];
  investment_profile?: any;
  strategies?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateChatData {
  user_id: string;
  chat_title: string;
  messages: any[];
  investment_profile?: any;
  strategies?: any[];
}

export interface UpdateChatData {
  chat_title?: string;
  messages?: any[];
  investment_profile?: any;
  strategies?: any[];
}

export class ChatHistoryService {
  /**
   * Get all chat history for a user
   */
  static async getUserChats(userId: string): Promise<ChatHistoryData[]> {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific chat by ID
   */
  static async getChatById(chatId: string, userId: string): Promise<ChatHistoryData | null> {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No chat found
      }
      throw new Error(`Failed to fetch chat: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new chat
   */
  static async createChat(chatData: CreateChatData): Promise<ChatHistoryData> {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .insert([chatData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing chat
   */
  static async updateChat(
    chatId: string,
    userId: string,
    updates: UpdateChatData
  ): Promise<ChatHistoryData> {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .update(updates)
      .eq('id', chatId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chat: ${error.message}`);
    }

    return data;
  }

  /**
   * Update chat title only
   */
  static async updateChatTitle(
    chatId: string,
    userId: string,
    title: string
  ): Promise<ChatHistoryData> {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .update({ chat_title: title })
      .eq('id', chatId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chat title: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a chat
   */
  static async deleteChat(chatId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_chat_history')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete chat: ${error.message}`);
    }
  }

  /**
   * Generate a title for a chat based on the first user message
   */
  static generateChatTitle(messages: any[]): string {
    const firstUserMessage = messages.find((msg) => msg.role === 'user');
    if (firstUserMessage && firstUserMessage.content) {
      // Take first 50 characters of the message
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? `${title}...` : title;
    }
    return `Chat ${new Date().toLocaleDateString()}`;
  }

  /**
   * Save or update a chat session
   */
  static async saveChat(
    userId: string,
    messages: any[],
    investmentProfile?: any,
    strategies?: any[],
    chatId?: string
  ): Promise<ChatHistoryData> {
    const chatTitle = this.generateChatTitle(messages);

    if (chatId) {
      // Update existing chat
      return this.updateChat(chatId, userId, {
        messages,
        investment_profile: investmentProfile,
        strategies,
      });
    } else {
      // Create new chat
      return this.createChat({
        user_id: userId,
        chat_title: chatTitle,
        messages,
        investment_profile: investmentProfile,
        strategies,
      });
    }
  }
}
