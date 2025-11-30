/**
 * Configuração da API
 * 
 * INSTRUÇÕES:
 * 1. Altere a variável API_BASE_URL para o endereço do seu backend n8n
 * 2. Exemplos:
 *    - Desenvolvimento local: 'http://localhost:5678/webhook'
 *    - Produção: 'https://seu-dominio.com/webhook'
 *    - n8n Cloud: 'https://sua-instancia.app.n8n.cloud/webhook'
 */

export const API_BASE_URL = 'http://localhost:5678/webhook';

/**
 * Endpoints da API
 * Ajuste conforme os webhooks configurados no n8n
 */
export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: '/login',
  LOGOUT: '/logout',
  
  // Itens
  ITEMS: '/items',
  ITEMS_BY_ID: (id: string) => `/items/${id}`,
  ITEMS_HISTORY: (id: string) => `/items/${id}/history`,
  ITEMS_MOVE: '/items/move',
  
  // Usuários
  USERS: '/users',
  USERS_BY_ID: (id: string) => `/users/${id}`,
  
  // Setores
  SECTORS: '/sectors',
  SECTORS_BY_ID: (id: string) => `/sectors/${id}`,
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
};

/**
 * Timeout padrão para requisições (em ms)
 */
export const API_TIMEOUT = 30000;
