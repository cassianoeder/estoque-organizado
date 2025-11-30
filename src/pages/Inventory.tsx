import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  History,
  Plus,
  Trash2
} from 'lucide-react';
import { Item, Sector } from '@/types';
import { itemsService } from '@/services/items';
import { sectorsService } from '@/services/sectors';
import { ItemFormDialog } from '@/components/ItemFormDialog';
import { ItemDetailsDialog } from '@/components/ItemDetailsDialog';
import { ItemHistoryDialog } from '@/components/ItemHistoryDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOffline } from '@/contexts/OfflineContext';
import { OfflineAlert } from '@/components/OfflineAlert';
import { mockItems, mockSectors } from '@/lib/mockData';

const Inventory = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const { isOffline, setOfflineMode } = useOffline();

  // Estados dos modais
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, sectorsData] = await Promise.all([
        itemsService.getAll(),
        sectorsService.getAll()
      ]);
      
      const visibleItems = itemsData.filter(item => hasPermission(item));
      setItems(visibleItems);
      setSectors(sectorsData);
      setOfflineMode(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setOfflineMode(true);
      setItems(mockItems.filter(item => hasPermission(item)));
      setSectors(mockSectors);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar itens baseado em permissões e filtros
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (sectorFilter !== 'all' && item.sector !== sectorFilter) {
        return false;
      }
      return true;
    });
  }, [items, searchTerm, statusFilter, sectorFilter]);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: "default" | "secondary" | "destructive"; label: string; className?: string }> = {
      available: { variant: "default", label: "Disponível", className: "bg-success text-success-foreground" },
      borrowed: { variant: "secondary", label: "Emprestado", className: "bg-warning text-warning-foreground" },
      lost: { variant: "destructive", label: "Perdido" }
    };
    
    const config = configs[status] || configs.available;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      box: 'Caixa',
      material: 'Material',
      equipment: 'Equipamento',
      document: 'Documento',
      other: 'Outro'
    };
    return types[type] || type;
  };

  const handleNewItem = () => {
    setSelectedItem(null);
    setFormDialogOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setFormDialogOpen(true);
  };

  const handleViewItem = (item: Item) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleHistoryItem = (item: Item) => {
    setSelectedItem(item);
    setHistoryDialogOpen(true);
  };

  const handleDeleteItem = (item: Item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSaveItem = async (itemData: Partial<Item>) => {
    if (isOffline) {
      toast({
        variant: 'destructive',
        title: 'Modo Offline',
        description: 'Não é possível salvar alterações em modo offline',
      });
      return;
    }

    if (selectedItem) {
      await itemsService.update(selectedItem.id, itemData);
    } else {
      await itemsService.create(itemData);
    }
    await loadData();
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    if (isOffline) {
      toast({
        variant: 'destructive',
        title: 'Modo Offline',
        description: 'Não é possível excluir itens em modo offline',
      });
      return;
    }

    try {
      await itemsService.delete(selectedItem.id);
      toast({
        title: 'Sucesso',
        description: 'Item removido com sucesso',
      });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível remover o item',
      });
    }
  };

  const handleExport = () => {
    toast({
      title: 'Exportação',
      description: 'Funcionalidade de exportação será implementada em breve.',
    });
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Estoque</h1>
            <p className="text-muted-foreground">
              Gerenciamento completo de itens
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            {user?.role === 'admin' && (
              <Button onClick={handleNewItem} disabled={isOffline}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            )}
          </div>
        </div>

        <OfflineAlert />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="borrowed">Emprestado</SelectItem>
              <SelectItem value="lost">Perdido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os setores</SelectItem>
              {sectors.map(sector => (
                <SelectItem key={sector.id} value={sector.name}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Mostrando <strong>{filteredItems.length}</strong> de <strong>{items.length}</strong> itens
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Movimentação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum item encontrado com os filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getTypeLabel(item.type)}</TableCell>
                    <TableCell>{item.sector}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {[item.location.building, item.location.room].filter(Boolean).join(' - ')}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(item.lastMovement), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Visualizar"
                          onClick={() => handleViewItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(user?.role === 'admin' || user?.sector === item.sector) && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Editar"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Histórico"
                          onClick={() => handleHistoryItem(item)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        {user?.role === 'admin' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Excluir"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <ItemFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        item={selectedItem || undefined}
        sectors={sectors}
        onSave={handleSaveItem}
      />

      <ItemDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        item={selectedItem}
      />

      <ItemHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        itemId={selectedItem?.id || null}
        itemName={selectedItem?.name || ''}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir item"
        description={`Tem certeza que deseja excluir "${selectedItem?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
};

export default Inventory;
