import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserCog } from 'lucide-react';

const Users = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">Gerenciar usuários e permissões</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Gestão de Usuários
            </CardTitle>
            <CardDescription>
              Esta funcionalidade será implementada com a integração do backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <UserCog className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                O módulo de gerenciamento de usuários permitirá criar, editar e gerenciar
                permissões de acesso ao sistema. Será integrado com o backend via API REST.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Users;
