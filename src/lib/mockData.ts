import { Item, ItemHistory, Sector, DashboardStats } from '@/types';

// Mock de setores
export const mockSectors: Sector[] = [
  { id: '1', name: 'Secretaria', description: 'Setor administrativo' },
  { id: '2', name: 'Biblioteca', description: 'Acervo e empréstimos' },
  { id: '3', name: 'Laboratório', description: 'Equipamentos científicos' },
  { id: '4', name: 'TI', description: 'Tecnologia da Informação' },
  { id: '5', name: 'Almoxarifado', description: 'Materiais gerais' },
];

// Mock de itens do estoque
export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Projetor Epson EB-X41',
    type: 'equipment',
    sector: 'TI',
    location: { building: 'Prédio A', room: 'Sala 101', cabinet: 'Armário 1', shelf: 'Prateleira 2' },
    status: 'available',
    lastUser: 'João Silva',
    lastMovement: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    observations: 'Em bom estado, testado recentemente',
    isPublic: true,
    authorizedSectors: [],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Caixa de Documentos - Histórico Escolar 2023',
    type: 'box',
    sector: 'Secretaria',
    location: { building: 'Prédio B', room: 'Arquivo', cabinet: 'Armário 5', shelf: 'Prateleira 1' },
    status: 'available',
    lastUser: 'Maria Santos',
    lastMovement: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    observations: 'Documentos confidenciais',
    isPublic: false,
    authorizedSectors: ['Secretaria'],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Kit de Química - Ácidos e Bases',
    type: 'material',
    sector: 'Laboratório',
    location: { building: 'Prédio C', room: 'Lab 01', cabinet: 'Armário de Reagentes', shelf: 'Prateleira 3' },
    status: 'borrowed',
    currentUser: 'Prof. Carlos Mendes',
    lastUser: 'Prof. Carlos Mendes',
    lastMovement: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    observations: 'Emprestado para aula prática',
    isPublic: false,
    authorizedSectors: ['Laboratório'],
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'Notebook Dell Latitude 5420',
    type: 'equipment',
    sector: 'TI',
    location: { building: 'Prédio A', room: 'Sala TI', cabinet: 'Armário 2' },
    status: 'lost',
    lastUser: 'Ana Paula',
    lastMovement: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    observations: 'Não devolvido após empréstimo',
    isPublic: false,
    authorizedSectors: ['TI'],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    name: 'Resma de Papel A4',
    type: 'material',
    sector: 'Almoxarifado',
    location: { building: 'Prédio B', room: 'Almoxarifado', cabinet: 'Estante 1', shelf: 'Prateleira 1' },
    status: 'available',
    lastUser: 'Roberto Lima',
    lastMovement: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isPublic: true,
    authorizedSectors: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    name: 'Livro: Matemática Avançada Vol. 3',
    type: 'document',
    sector: 'Biblioteca',
    location: { building: 'Prédio A', room: 'Biblioteca', shelf: 'Estante 12' },
    status: 'borrowed',
    currentUser: 'Aluno: Pedro Henrique',
    lastUser: 'Aluno: Pedro Henrique',
    lastMovement: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    observations: 'Prazo: mais 5 dias',
    isPublic: true,
    authorizedSectors: [],
    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock de histórico
export const mockHistory: ItemHistory[] = [
  {
    id: '1',
    itemId: '3',
    action: 'borrowed',
    user: 'Prof. Carlos Mendes',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    details: 'Empréstimo para aula prática',
    previousStatus: 'available',
    newStatus: 'borrowed'
  },
  {
    id: '2',
    itemId: '1',
    action: 'returned',
    user: 'João Silva',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    details: 'Devolvido após uso em apresentação',
    previousStatus: 'borrowed',
    newStatus: 'available'
  }
];

// Mock de estatísticas do dashboard
export const getMockDashboardStats = (): DashboardStats => {
  const available = mockItems.filter(i => i.status === 'available').length;
  const borrowed = mockItems.filter(i => i.status === 'borrowed').length;
  const lost = mockItems.filter(i => i.status === 'lost').length;

  const itemsBySector = mockSectors.map(sector => ({
    sector: sector.name,
    count: mockItems.filter(i => i.sector === sector.name).length
  }));

  const recentItems = [...mockItems]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return {
    totalItems: mockItems.length,
    availableItems: available,
    borrowedItems: borrowed,
    lostItems: lost,
    itemsBySector,
    recentItems
  };
};
