import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { Button } from '@/components/ui/button';

export const OfflineAlert = () => {
  const { isOffline, setOfflineMode } = useOffline();

  if (!isOffline) return null;

  const handleRetry = () => {
    setOfflineMode(false);
    window.location.reload();
  };

  return (
    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950 mb-4">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          Modo Offline
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRetry}
          className="ml-auto"
        >
          <Wifi className="h-3 w-3 mr-1" />
          Tentar Reconectar
        </Button>
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        Não foi possível conectar ao backend. O sistema está funcionando com dados locais.
        Algumas funcionalidades podem estar limitadas.
      </AlertDescription>
    </Alert>
  );
};
