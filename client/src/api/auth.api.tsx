import api from './axios';
import { AuthResponse } from '@/types';

export const authApi = {
  register: async (email: string, username: string, password: string) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      { email, username, password }
    );
    return response.data.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      { email, password }
    );
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },
};