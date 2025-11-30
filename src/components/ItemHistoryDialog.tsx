import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ItemHistory } from '@/types';
import { itemsService } from '@/services/items';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, Package } from 'lucide-react';

interface ItemHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  itemName: string;
}

export const ItemHistoryDialog = ({
  open,
  onOpenChange,
  itemId,
  itemName,
}: ItemHistoryDialogProps) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<ItemHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && itemId) {
      loadHistory();
    }
  }, [open, itemId]);

  const loadHistory = async () => {
    if (!itemId) return;

    try {
      setLoading(true);
      const data = await itemsService.getHistory(itemId);
      setHistory(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar o histórico do item',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Criado',
      updated: 'Atualizado',
      borrowed: 'Emprestado',
      returned: 'Devolvido',
      lost: 'Marcado como perdido',
      found: 'Encontrado',
    };
    return labels[action] || action;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Movimentações
          </DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma movimentação registrada
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="relative pl-8 pb-4 border-l-2 border-muted last:border-0"
              >
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getActionLabel(entry.action)}</span>
                  </div>

                  {entry.user && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{entry.user}</span>
                    </div>
                  )}

                  {entry.observations && (
                    <p className="text-sm text-muted-foreground">{entry.observations}</p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.timestamp), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
