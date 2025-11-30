// Tipos e interfaces do sistema

export type UserRole = 'admin' | 'sector' | 'user';

export type ItemStatus = 'available' | 'borrowed' | 'lost';

export type ItemType = 'box' | 'material' | 'equipment' | 'document' | 'other';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  sector?: string;
  email?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
}

export interface Location {
  building?: string;
  room?: string;
  cabinet?: string;
  shelf?: string;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  sector: string;
  location: Location;
  status: ItemStatus;
  currentUser?: string;
  lastUser?: string;
  lastMovement: string;
  observations?: string;
  isPublic: boolean;
  authorizedSectors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemHistory {
  id: string;
  itemId: string;
  action: 'created' | 'borrowed' | 'returned' | 'status_changed' | 'updated';
  user: string;
  date: string;
  details?: string;
  previousStatus?: ItemStatus;
  newStatus?: ItemStatus;
}

export interface DashboardStats {
  totalItems: number;
  availableItems: number;
  borrowedItems: number;
  lostItems: number;
  itemsBySector: { sector: string; count: number }[];
  recentItems: Item[];
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (item: Item) => boolean;
}
