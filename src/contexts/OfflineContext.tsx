import React, { createContext, useContext, useState, useEffect } from 'react';

interface OfflineContextType {
  isOffline: boolean;
  setOfflineMode: (offline: boolean) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);

  const setOfflineMode = (offline: boolean) => {
    setIsOffline(offline);
    if (offline) {
      localStorage.setItem('offlineMode', 'true');
    } else {
      localStorage.removeItem('offlineMode');
    }
  };

  useEffect(() => {
    // Verificar se estava em modo offline antes
    const wasOffline = localStorage.getItem('offlineMode') === 'true';
    if (wasOffline) {
      setIsOffline(true);
    }
  }, []);

  return (
    <OfflineContext.Provider value={{ isOffline, setOfflineMode }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline deve ser usado dentro de um OfflineProvider');
  }
  return context;
};
