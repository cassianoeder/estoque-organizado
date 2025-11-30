/**
 * Configuração da API
 * 
 * INSTRUÇÕES:
 * Configure a variável API_BASE_URL com o endereço completo do seu backend n8n.
 * O sistema aceita qualquer formato válido de URL.
 * 
 * EXEMPLOS VÁLIDOS:
 *    ✓ http://localhost:5678/webhook
 *    ✓ https://localhost:5678/webhook
 *    ✓ http://192.168.1.100:5678/webhook
 *    ✓ https://192.168.1.100:5678/webhook
 *    ✓ http://seu-dominio.com/webhook
 *    ✓ https://seu-dominio.com/webhook
 *    ✓ https://sua-instancia.app.n8n.cloud/webhook
 *    ✓ http://10.0.0.50:8080/api
 * 
 * NOTAS:
 * - Pode usar HTTP ou HTTPS
 * - Pode usar IP ou domínio
 * - Pode incluir porta customizada
 * - Não adicione barra (/) no final
 * - O sistema automaticamente normaliza a URL
 */

export const API_BASE_URL = 'http://localhost:5678/webhook';

/**
 * Normaliza a URL base da API removendo barras extras
 * @param url - URL base configurada
 * @returns URL normalizada sem trailing slash
 */
const normalizeApiUrl = (url: string): string => {
  // Remove espaços em branco
  let normalized = url.trim();
  
  // Remove trailing slashes
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
};

/**
 * URL base normalizada para uso nas requisições
 */
export const NORMALIZED_API_BASE_URL = normalizeApiUrl(API_BASE_URL);

/**
 * Valida se a URL configurada é válida
 * @returns true se a URL é válida
 */
export const validateApiUrl = (): { valid: boolean; error?: string } => {
  if (!API_BASE_URL || API_BASE_URL.trim() === '') {
    return { valid: false, error: 'URL da API não configurada' };
  }
  
  try {
    const url = new URL(NORMALIZED_API_BASE_URL);
    
    // Valida protocolo
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Protocolo inválido. Use http:// ou https://' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'URL inválida. Verifique o formato.' };
  }
};

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
