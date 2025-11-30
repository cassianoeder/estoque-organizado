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
import { Sector } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SectorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector?: Sector;
  onSave: (sector: Partial<Sector>) => Promise<void>;
}

export const SectorFormDialog = ({
  open,
  onOpenChange,
  sector,
  onSave,
}: SectorFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Sector>>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (sector) {
      setFormData(sector);
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [sector, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha o nome do setor',
      });
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      toast({
        title: 'Sucesso',
        description: sector ? 'Setor atualizado com sucesso' : 'Setor cadastrado com sucesso',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o setor',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{sector ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do setor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do setor *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
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
