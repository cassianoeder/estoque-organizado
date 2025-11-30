import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';
import { DashboardStats } from '@/types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS);
  },
};
