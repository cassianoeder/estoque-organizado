import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';
import { User } from '@/types';

export const usersService = {
  async getAll(): Promise<User[]> {
    return api.get<User[]>(API_ENDPOINTS.USERS);
  },

  async getById(id: string): Promise<User> {
    return api.get<User>(API_ENDPOINTS.USERS_BY_ID(id));
  },

  async create(user: Partial<User>): Promise<User> {
    return api.post<User>(API_ENDPOINTS.USERS, user);
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    return api.put<User>(API_ENDPOINTS.USERS_BY_ID(id), user);
  },

  async delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.USERS_BY_ID(id));
  },
};
