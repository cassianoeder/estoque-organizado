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
  Plus
} from 'lucide-react';
import { Item } from '@/types';
import { itemsService } from '@/services/items';
import { sectorsService } from '@/services/sectors';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Inventory = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do estoque.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar itens baseado em permissões e filtros
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filtro de busca
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro de status
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Filtro de setor
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

  const handleExport = () => {
    // TODO: Implementar exportação real via API
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            )}
          </div>
        </div>

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
                        <Button variant="ghost" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(user?.role === 'admin' || user?.sector === item.sector) && (
                          <Button variant="ghost" size="icon" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Histórico">
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
