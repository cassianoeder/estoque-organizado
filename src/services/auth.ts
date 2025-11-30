import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';
import { User } from '@/types';

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    return api.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
      username,
      password,
    });
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continua mesmo se o logout no servidor falhar
      console.error('Erro ao fazer logout no servidor:', error);
    }
  },
};
