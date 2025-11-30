import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users as UsersIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { User, Sector } from '@/types';
import { usersService } from '@/services/users';
import { sectorsService } from '@/services/sectors';
import { UserFormDialog } from '@/components/UserFormDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useOffline } from '@/contexts/OfflineContext';
import { OfflineAlert } from '@/components/OfflineAlert';
import { mockUsers, mockSectors } from '@/lib/mockData';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOffline, setOfflineMode } = useOffline();
  
  // Estados dos modais
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, sectorsData] = await Promise.all([
        usersService.getAll(),
        sectorsService.getAll()
      ]);
      setUsers(usersData);
      setSectors(sectorsData);
      setOfflineMode(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setOfflineMode(true);
      setUsers(mockUsers);
      setSectors(mockSectors);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      admin: { variant: "default", label: "Administrador" },
      sector: { variant: "secondary", label: "Setor" },
      user: { variant: "outline", label: "Usuário" }
    };
    
    const config = variants[role] || variants.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setFormDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (isOffline) {
      toast({
        variant: 'destructive',
        title: 'Modo Offline',
        description: 'Não é possível salvar alterações em modo offline',
      });
      return;
    }

    if (selectedUser) {
      await usersService.update(selectedUser.id, userData);
    } else {
      await usersService.create(userData);
    }
    await loadData();
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    if (isOffline) {
      toast({
        variant: 'destructive',
        title: 'Modo Offline',
        description: 'Não é possível excluir usuários em modo offline',
      });
      return;
    }

    try {
      await usersService.delete(selectedUser.id);
      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso',
      });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível remover o usuário',
      });
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
            <h1 className="text-3xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema
            </p>
          </div>
          {currentUser?.role === 'admin' && (
            <Button onClick={handleNewUser} disabled={isOffline}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          )}
        </div>

        <OfflineAlert />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Lista de Usuários
            </CardTitle>
            <CardDescription>
              Total: {users.length} usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.sector && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Setor: {user.sector}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(user.role)}
                    {currentUser?.role === 'admin' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        user={selectedUser || undefined}
        sectors={sectors}
        onSave={handleSaveUser}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir "${selectedUser?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
};

export default Users;
