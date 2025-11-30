import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Item } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Package, MapPin, User, Clock, Info } from 'lucide-react';

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
}

export const ItemDetailsDialog = ({
  open,
  onOpenChange,
  item,
}: ItemDetailsDialogProps) => {
  if (!item) return null;

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      available: { variant: "default", label: "Disponível" },
      borrowed: { variant: "secondary", label: "Emprestado" },
      lost: { variant: "destructive", label: "Perdido" }
    };
    
    const config = configs[status] || configs.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item.name}
          </DialogTitle>
          <DialogDescription>Detalhes completos do item</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {getStatusBadge(item.status)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Tipo</p>
              <p className="text-sm text-muted-foreground">{item.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Setor</p>
              <p className="text-sm text-muted-foreground">{item.sector}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localização Física
            </p>
            <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
              {item.location.building && <p>Prédio: {item.location.building}</p>}
              {item.location.room && <p>Sala: {item.location.room}</p>}
              {item.location.cabinet && <p>Armário: {item.location.cabinet}</p>}
              {item.location.shelf && <p>Prateleira: {item.location.shelf}</p>}
            </div>
          </div>

          {item.currentUser && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Usuário Atual
              </p>
              <p className="text-sm text-muted-foreground">{item.currentUser}</p>
            </div>
          )}

          {item.lastUser && (
            <div>
              <p className="text-sm font-medium mb-2">Último Usuário</p>
              <p className="text-sm text-muted-foreground">{item.lastUser}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Última Movimentação
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(item.lastMovement), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </p>
          </div>

          {item.observations && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Observações
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {item.observations}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Visibilidade</p>
            <Badge variant={item.isPublic ? "default" : "secondary"}>
              {item.isPublic ? "Público" : "Restrito"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
