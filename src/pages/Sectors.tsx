import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { Sector } from '@/types';
import { sectorsService } from '@/services/sectors';
import { SectorFormDialog } from '@/components/SectorFormDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

const Sectors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos modais
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      setLoading(true);
      const data = await sectorsService.getAll();
      setSectors(data);
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar setores',
        description: 'Não foi possível carregar a lista de setores.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewSector = () => {
    setSelectedSector(null);
    setFormDialogOpen(true);
  };

  const handleEditSector = (sector: Sector) => {
    setSelectedSector(sector);
    setFormDialogOpen(true);
  };

  const handleDeleteSector = (sector: Sector) => {
    setSelectedSector(sector);
    setDeleteDialogOpen(true);
  };

  const handleSaveSector = async (sectorData: Partial<Sector>) => {
    if (selectedSector) {
      await sectorsService.update(selectedSector.id, sectorData);
    } else {
      await sectorsService.create(sectorData);
    }
    await loadSectors();
  };

  const handleConfirmDelete = async () => {
    if (selectedSector) {
      try {
        await sectorsService.delete(selectedSector.id);
        toast({
          title: 'Sucesso',
          description: 'Setor removido com sucesso',
        });
        await loadSectors();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível remover o setor',
        });
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Setores</h1>
            <p className="text-muted-foreground">
              Gerencie os setores do colégio
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={handleNewSector}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Setor
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Setores
            </CardTitle>
            <CardDescription>
              Total: {sectors.length} setores cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectors.map((sector) => (
                <div
                  key={sector.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{sector.name}</p>
                    {sector.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {sector.description}
                      </p>
                    )}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditSector(sector)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteSector(sector)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SectorFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        sector={selectedSector || undefined}
        onSave={handleSaveSector}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir setor"
        description={`Tem certeza que deseja excluir "${selectedSector?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
};

export default Sectors;
