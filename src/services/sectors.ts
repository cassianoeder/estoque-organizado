import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';
import { Sector } from '@/types';

export const sectorsService = {
  async getAll(): Promise<Sector[]> {
    return api.get<Sector[]>(API_ENDPOINTS.SECTORS);
  },

  async getById(id: string): Promise<Sector> {
    return api.get<Sector>(API_ENDPOINTS.SECTORS_BY_ID(id));
  },

  async create(sector: Partial<Sector>): Promise<Sector> {
    return api.post<Sector>(API_ENDPOINTS.SECTORS, sector);
  },

  async update(id: string, sector: Partial<Sector>): Promise<Sector> {
    return api.put<Sector>(API_ENDPOINTS.SECTORS_BY_ID(id), sector);
  },

  async delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.SECTORS_BY_ID(id));
  },
};
