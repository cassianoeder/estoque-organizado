import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';
import { Item, ItemHistory } from '@/types';

interface MoveItemPayload {
  itemId: string;
  userId: string;
  status: 'available' | 'borrowed' | 'lost';
  observations?: string;
}

export const itemsService = {
  async getAll(): Promise<Item[]> {
    return api.get<Item[]>(API_ENDPOINTS.ITEMS);
  },

  async getById(id: string): Promise<Item> {
    return api.get<Item>(API_ENDPOINTS.ITEMS_BY_ID(id));
  },

  async create(item: Partial<Item>): Promise<Item> {
    return api.post<Item>(API_ENDPOINTS.ITEMS, item);
  },

  async update(id: string, item: Partial<Item>): Promise<Item> {
    return api.put<Item>(API_ENDPOINTS.ITEMS_BY_ID(id), item);
  },

  async delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.ITEMS_BY_ID(id));
  },

  async getHistory(id: string): Promise<ItemHistory[]> {
    return api.get<ItemHistory[]>(API_ENDPOINTS.ITEMS_HISTORY(id));
  },

  async moveItem(payload: MoveItemPayload): Promise<Item> {
    return api.post<Item>(API_ENDPOINTS.ITEMS_MOVE, payload);
  },
};
