# Documentação da API - Sistema de Estoque

## Configuração Inicial

1. Abra o arquivo `src/config/api.ts`
2. Altere a constante `API_BASE_URL` para o endereço do seu n8n:

```typescript
export const API_BASE_URL = 'https://seu-dominio.com/webhook';
```

Exemplos:
- Desenvolvimento local: `'http://localhost:5678/webhook'`
- n8n Cloud: `'https://sua-instancia.app.n8n.cloud/webhook'`
- Servidor próprio: `'https://n8n.seudominio.com/webhook'`

---

## Endpoints da API

Todos os endpoints devem ser criados como webhooks no n8n. O caminho completo será: `{API_BASE_URL}{endpoint}`

### Autenticação

Headers obrigatórios em requisições autenticadas:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 1. AUTENTICAÇÃO

### POST `/login`
Autentica um usuário no sistema

**Request Body:**
```json
{
  "username": "admin",
  "password": "senha123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "1",
    "username": "admin",
    "name": "Administrador",
    "email": "admin@colegio.com",
    "role": "admin",
    "sector": "TI" // Opcional, apenas para role 'sector'
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Usuário ou senha incorretos"
}
```

---

### POST `/logout`
Encerra a sessão do usuário

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## 2. ITENS DO ESTOQUE

### GET `/items`
Lista todos os itens do estoque (com filtro por permissões no backend)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- `sector`: Filtrar por setor
- `status`: Filtrar por status (available, borrowed, lost)
- `search`: Buscar por nome

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "name": "Projetor Epson",
    "type": "equipment",
    "sector": "TI",
    "location": {
      "building": "Prédio A",
      "room": "Sala 101",
      "cabinet": "Armário 1",
      "shelf": "Prateleira 2"
    },
    "status": "available",
    "currentUser": "",
    "lastUser": "João Silva",
    "lastMovement": "2025-11-28T10:30:00Z",
    "observations": "Em bom estado",
    "isPublic": true,
    "authorizedSectors": [],
    "createdAt": "2025-01-15T08:00:00Z",
    "updatedAt": "2025-11-28T10:30:00Z"
  }
]
```

---

### GET `/items/{id}`
Busca um item específico por ID

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": "1",
  "name": "Projetor Epson",
  "type": "equipment",
  "sector": "TI",
  "location": {
    "building": "Prédio A",
    "room": "Sala 101",
    "cabinet": "Armário 1",
    "shelf": "Prateleira 2"
  },
  "status": "available",
  "currentUser": "",
  "lastUser": "João Silva",
  "lastMovement": "2025-11-28T10:30:00Z",
  "observations": "Em bom estado",
  "isPublic": true,
  "authorizedSectors": [],
  "createdAt": "2025-01-15T08:00:00Z",
  "updatedAt": "2025-11-28T10:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Item não encontrado"
}
```

---

### POST `/items`
Cria um novo item no estoque

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Projetor Epson",
  "type": "equipment",
  "sector": "TI",
  "location": {
    "building": "Prédio A",
    "room": "Sala 101",
    "cabinet": "Armário 1",
    "shelf": "Prateleira 2"
  },
  "status": "available",
  "currentUser": "",
  "observations": "Novo equipamento",
  "isPublic": true,
  "authorizedSectors": []
}
```

**Response (201 Created):**
```json
{
  "id": "15",
  "name": "Projetor Epson",
  "type": "equipment",
  // ... todos os campos
  "createdAt": "2025-11-30T15:00:00Z",
  "updatedAt": "2025-11-30T15:00:00Z"
}
```

---

### PUT `/items/{id}`
Atualiza um item existente

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Projetor Epson - Atualizado",
  "observations": "Manutenção realizada",
  "status": "available"
}
```

**Response (200 OK):**
```json
{
  "id": "15",
  // ... item atualizado
  "updatedAt": "2025-11-30T16:00:00Z"
}
```

---

### DELETE `/items/{id}`
Remove um item do estoque

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Item removido com sucesso"
}
```

---

### GET `/items/{id}/history`
Busca o histórico de movimentações de um item

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": "h1",
    "itemId": "1",
    "action": "borrowed",
    "user": "João Silva",
    "timestamp": "2025-11-25T10:00:00Z",
    "observations": "Emprestado para evento"
  },
  {
    "id": "h2",
    "itemId": "1",
    "action": "returned",
    "user": "João Silva",
    "timestamp": "2025-11-28T15:00:00Z",
    "observations": "Devolvido em bom estado"
  }
]
```

**Ações possíveis:**
- `created`: Item criado
- `updated`: Item atualizado
- `borrowed`: Item emprestado
- `returned`: Item devolvido
- `lost`: Item marcado como perdido
- `found`: Item encontrado

---

### POST `/items/move`
Movimenta um item (emprestar, devolver, marcar como perdido)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "itemId": "1",
  "userId": "user123",
  "status": "borrowed",
  "observations": "Emprestado para aula"
}
```

**Response (200 OK):**
```json
{
  "id": "1",
  // ... item atualizado com novo status
  "currentUser": "user123",
  "lastMovement": "2025-11-30T16:30:00Z"
}
```

---

## 3. USUÁRIOS

### GET `/users`
Lista todos os usuários (apenas admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "username": "admin",
    "name": "Administrador",
    "email": "admin@colegio.com",
    "role": "admin",
    "sector": null,
    "createdAt": "2025-01-01T00:00:00Z"
  },
  {
    "id": "2",
    "username": "secretaria",
    "name": "João Silva",
    "email": "secretaria@colegio.com",
    "role": "sector",
    "sector": "Secretaria",
    "createdAt": "2025-01-05T00:00:00Z"
  }
]
```

---

### GET `/users/{id}`
Busca um usuário específico

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": "1",
  "username": "admin",
  "name": "Administrador",
  "email": "admin@colegio.com",
  "role": "admin",
  "sector": null,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### POST `/users`
Cria um novo usuário (apenas admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "username": "novo_usuario",
  "name": "Maria Santos",
  "email": "maria@colegio.com",
  "password": "senha_inicial",
  "role": "user",
  "sector": null
}
```

**Response (201 Created):**
```json
{
  "id": "10",
  "username": "novo_usuario",
  "name": "Maria Santos",
  "email": "maria@colegio.com",
  "role": "user",
  "sector": null,
  "createdAt": "2025-11-30T16:00:00Z"
}
```

---

### PUT `/users/{id}`
Atualiza um usuário

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Maria Santos Silva",
  "email": "maria.santos@colegio.com"
}
```

**Response (200 OK):**
```json
{
  "id": "10",
  // ... usuário atualizado
}
```

---

### DELETE `/users/{id}`
Remove um usuário (apenas admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Usuário removido com sucesso"
}
```

---

## 4. SETORES

### GET `/sectors`
Lista todos os setores

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "name": "TI",
    "description": "Tecnologia da Informação",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  {
    "id": "2",
    "name": "Secretaria",
    "description": "Secretaria escolar",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

---

### GET `/sectors/{id}`
Busca um setor específico

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": "1",
  "name": "TI",
  "description": "Tecnologia da Informação",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### POST `/sectors`
Cria um novo setor (apenas admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Biblioteca",
  "description": "Setor da biblioteca escolar"
}
```

**Response (201 Created):**
```json
{
  "id": "8",
  "name": "Biblioteca",
  "description": "Setor da biblioteca escolar",
  "createdAt": "2025-11-30T16:00:00Z"
}
```

---

### PUT `/sectors/{id}`
Atualiza um setor (apenas admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Biblioteca Central",
  "description": "Biblioteca central do colégio"
}
```

**Response (200 OK):**
```json
{
  "id": "8",
  // ... setor atualizado
}
```

---

### DELETE `/sectors/{id}`
Remove um setor (apenas admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Setor removido com sucesso"
}
```

---

## 5. DASHBOARD

### GET `/dashboard/stats`
Retorna estatísticas para o dashboard

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "totalItems": 150,
  "availableItems": 120,
  "borrowedItems": 25,
  "lostItems": 5,
  "itemsBySector": [
    {
      "sector": "TI",
      "count": 45
    },
    {
      "sector": "Secretaria",
      "count": 30
    }
  ],
  "recentItems": [
    {
      "id": "1",
      "name": "Projetor Epson",
      "sector": "TI",
      "status": "borrowed",
      "updatedAt": "2025-11-30T10:00:00Z"
    }
  ]
}
```

---

## Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Não autenticado
- **403 Forbidden**: Sem permissão
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro no servidor

---

## Regras de Permissão

### Admin (`role: 'admin'`)
- Acesso total a todos os recursos
- Pode criar, editar e deletar tudo

### Setor (`role: 'sector'`)
- Vê todos os itens públicos
- Vê itens do seu setor ou setores autorizados
- Pode editar itens do seu setor
- Não pode criar/deletar usuários

### Usuário (`role: 'user'`)
- Vê apenas itens públicos (`isPublic: true`)
- Pode visualizar histórico
- Não pode editar ou deletar

---

## Implementação no n8n

### Exemplo de Workflow para Login

1. **Webhook** → Trigger no caminho `/login`
2. **HTTP Request ou Database Query** → Buscar usuário por username
3. **Code Node** → Validar senha (bcrypt)
4. **Code Node** → Gerar JWT token
5. **Respond to Webhook** → Retornar user + token

### Exemplo de Workflow para GET `/items`

1. **Webhook** → Trigger no caminho `/items` (GET)
2. **Code Node** → Extrair e validar token do header
3. **Database Query** → Buscar itens
4. **Code Node** → Filtrar por permissões do usuário
5. **Respond to Webhook** → Retornar array de itens

### Autenticação JWT

No n8n, use Code Node para validar tokens:

```javascript
const jwt = require('jsonwebtoken');
const token = $input.item.json.headers.authorization?.replace('Bearer ', '');

try {
  const decoded = jwt.verify(token, 'SEU_SECRET_KEY');
  return { json: { user: decoded, authorized: true } };
} catch (error) {
  return { json: { authorized: false, error: 'Token inválido' } };
}
```

---

## Variáveis de Ambiente Recomendadas

No n8n, configure as seguintes variáveis:
- `JWT_SECRET`: Chave para assinar tokens
- `DB_CONNECTION`: String de conexão do banco
- `TOKEN_EXPIRATION`: Tempo de expiração do token (ex: '24h')

---

## Notas Importantes

1. **CORS**: Configure CORS no n8n para permitir requisições do frontend
2. **Validação**: Valide todos os dados de entrada
3. **Segurança**: Use HTTPS em produção
4. **Rate Limiting**: Implemente limite de requisições
5. **Logs**: Registre todas as operações importantes
6. **Backup**: Faça backup regular do banco de dados
