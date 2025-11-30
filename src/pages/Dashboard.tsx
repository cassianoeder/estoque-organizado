import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Building2,
  Clock
} from 'lucide-react';
import { DashboardStats } from '@/types';
import { dashboardService } from '@/services/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as estatísticas do dashboard.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      available: { variant: "default", label: "Disponível" },
      borrowed: { variant: "secondary", label: "Emprestado" },
      lost: { variant: "destructive", label: "Perdido" }
    };
    
    const config = variants[status] || variants.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading || !stats) {
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
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Itens"
            value={stats.totalItems}
            icon={Package}
            variant="default"
            description="Itens cadastrados"
          />
          <StatsCard
            title="Disponíveis"
            value={stats.availableItems}
            icon={CheckCircle}
            variant="success"
            description="Prontos para uso"
          />
          <StatsCard
            title="Emprestados"
            value={stats.borrowedItems}
            icon={AlertCircle}
            variant="warning"
            description="Em uso no momento"
          />
          <StatsCard
            title="Perdidos"
            value={stats.lostItems}
            icon={XCircle}
            variant="destructive"
            description="Não localizados"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Items by Sector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Itens por Setor
              </CardTitle>
              <CardDescription>
                Distribuição do estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.itemsBySector.map((item) => (
                  <div key={item.sector} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.sector}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(item.count / stats.totalItems) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Movimentações Recentes
              </CardTitle>
              <CardDescription>
                Últimas alterações no estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-muted-foreground">
                          {item.sector}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(item.updatedAt), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
