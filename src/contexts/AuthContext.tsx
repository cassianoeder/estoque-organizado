import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Item, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock de usuários para desenvolvimento
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Administrador',
    role: 'admin',
    email: 'admin@colegio.com'
  },
  {
    id: '2',
    username: 'secretaria',
    name: 'João Silva',
    role: 'sector',
    sector: 'Secretaria',
    email: 'secretaria@colegio.com'
  },
  {
    id: '3',
    username: 'usuario',
    name: 'Maria Santos',
    role: 'user',
    email: 'usuario@colegio.com'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // TODO: Integrar com API real
    // Mock de autenticação
    const foundUser = mockUsers.find(u => u.username === username);
    
    if (foundUser && password === 'senha123') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (item: Item): boolean => {
    if (!user) return false;
    
    // Admin vê tudo
    if (user.role === 'admin') return true;
    
    // Item público, todos veem
    if (item.isPublic) return true;
    
    // Setor específico vê apenas seus itens ou autorizados
    if (user.role === 'sector' && user.sector) {
      return item.sector === user.sector || item.authorizedSectors.includes(user.sector);
    }
    
    // Usuário comum só vê públicos
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
