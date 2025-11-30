import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Item, Sector } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item;
  sectors: Sector[];
  onSave: (item: Partial<Item>) => Promise<void>;
}

export const ItemFormDialog = ({
  open,
  onOpenChange,
  item,
  sectors,
  onSave,
}: ItemFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Item>>({
    name: '',
    type: 'material',
    sector: '',
    location: { building: '', room: '', cabinet: '', shelf: '' },
    status: 'available',
    currentUser: '',
    lastUser: '',
    observations: '',
    isPublic: true,
    authorizedSectors: [],
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        name: '',
        type: 'material',
        sector: '',
        location: { building: '', room: '', cabinet: '', shelf: '' },
        status: 'available',
        currentUser: '',
        lastUser: '',
        observations: '',
        isPublic: true,
        authorizedSectors: [],
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sector) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      toast({
        title: 'Sucesso',
        description: item ? 'Item atualizado com sucesso' : 'Item cadastrado com sucesso',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o item',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do item no estoque
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box">Caixa</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="equipment">Equipamento</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Setor Responsável *</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => setFormData({ ...formData, sector: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.name}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="borrowed">Emprestado</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Localização Física</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Prédio"
                value={formData.location?.building}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location!, building: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Sala"
                value={formData.location?.room}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location!, room: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Armário"
                value={formData.location?.cabinet}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location!, cabinet: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Prateleira"
                value={formData.location?.shelf}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location!, shelf: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentUser">Usuário Atual</Label>
            <Input
              id="currentUser"
              value={formData.currentUser}
              onChange={(e) => setFormData({ ...formData, currentUser: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
            <Label htmlFor="isPublic">Item público (visível para todos)</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
