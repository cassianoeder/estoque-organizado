# Guia Completo de Implementação - Backend n8n para Sistema de Estoque

Este guia detalha passo a passo como criar todos os workflows necessários no n8n para o sistema de estoque funcionar completamente.

---

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
3. [Autenticação e Segurança](#autenticação-e-segurança)
4. [Workflows por Endpoint](#workflows-por-endpoint)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Configuração Inicial

### 1. Configure a URL do Backend no Frontend

Abra o arquivo `src/config/api.ts` e configure a URL do seu n8n:

```typescript
export const API_BASE_URL = 'http://localhost:5678/webhook';
```

**Exemplos válidos:**
- `http://localhost:5678/webhook` (desenvolvimento local)
- `http://192.168.1.100:5678/webhook` (IP local)
- `https://n8n.seudominio.com/webhook` (produção)
- `https://sua-instancia.app.n8n.cloud/webhook` (n8n Cloud)

✅ O sistema aceita HTTP/HTTPS, IP/domínio, qualquer porta
✅ Não adicione barra (/) no final

### 2. Instale Dependências no n8n

Para os workflows funcionarem, você precisa instalar as seguintes bibliotecas no n8n:

**Via npm (se self-hosted):**
```bash
npm install jsonwebtoken bcryptjs
```

**Via n8n Cloud:**
- Acesse Settings → Community Nodes
- Instale os pacotes necessários

### 3. Configure Variáveis de Ambiente

No n8n, vá em **Settings → Variables** e adicione:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `JWT_SECRET` | `sua_chave_secreta_aqui` | Chave para assinar tokens JWT |
| `DB_HOST` | `localhost` ou IP do banco | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | `estoque_db` | Nome do banco |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `sua_senha` | Senha do banco |

---

## 🗄️ Estrutura do Banco de Dados

### Criação das Tabelas

Execute os seguintes comandos SQL no seu PostgreSQL:

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sector', 'user')),
    sector VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Setores
CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('box', 'material', 'equipment', 'document', 'other')),
    sector VARCHAR(100) NOT NULL,
    location_building VARCHAR(100),
    location_room VARCHAR(100),
    location_cabinet VARCHAR(100),
    location_shelf VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'borrowed', 'lost')),
    current_user VARCHAR(100),
    last_user VARCHAR(100),
    last_movement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observations TEXT,
    is_public BOOLEAN DEFAULT true,
    authorized_sectors TEXT[], -- Array de setores autorizados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico
CREATE TABLE item_history (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    user_name VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observations TEXT
);

-- Índices para melhor performance
CREATE INDEX idx_items_sector ON items(sector);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_history_item ON item_history(item_id);
CREATE INDEX idx_users_username ON users(username);
```

### Dados Iniciais (Opcional)

```sql
-- Inserir setores padrão
INSERT INTO sectors (name, description) VALUES
('TI', 'Tecnologia da Informação'),
('Secretaria', 'Secretaria Escolar'),
('Biblioteca', 'Biblioteca'),
('Laboratório', 'Laboratório de Ciências');

-- Inserir usuário admin padrão (senha: senha123)
-- Hash gerado com bcrypt: $2a$10$abcdef...
INSERT INTO users (username, password_hash, name, email, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye1M5Fv8sGF6Uqv0qX3hKqD6cKsxOZlYO', 'Administrador', 'admin@colegio.com', 'admin');
```

---

## 🔐 Autenticação e Segurança

### Como Funciona o JWT

1. Usuário faz login com username e senha
2. Backend valida credenciais e gera um token JWT
3. Token é enviado em todas as requisições no header `Authorization: Bearer {token}`
4. Backend valida token antes de processar a requisição

### Estrutura do Token JWT

```javascript
{
  "userId": "1",
  "username": "admin",
  "role": "admin",
  "sector": "TI", // opcional
  "iat": 1701234567,
  "exp": 1701320967
}
```

---

## 📡 Workflows por Endpoint

## 1. LOGIN - `POST /login`

### Estrutura do Workflow

```
1. Webhook (POST)
   ↓
2. Code Node (Validar Input)
   ↓
3. Postgres (Buscar Usuário)
   ↓
4. Code Node (Validar Senha)
   ↓
5. Code Node (Gerar JWT)
   ↓
6. Respond to Webhook
```

### Configuração Detalhada

#### Node 1: Webhook
- **Path**: `/login`
- **Method**: `POST`
- **Response Mode**: `When Last Node Finishes`
- **Options**: Enable CORS

#### Node 2: Code Node - Validar Input
```javascript
// Extrair dados do body
const body = $input.item.json.body;

// Validar se campos existem
if (!body.username || !body.password) {
  return [{
    json: {
      error: true,
      status: 400,
      message: "Username e password são obrigatórios"
    }
  }];
}

// Retornar dados limpos
return [{
  json: {
    username: body.username.trim().toLowerCase(),
    password: body.password
  }
}];
```

#### Node 3: Postgres - Buscar Usuário
- **Operation**: Execute Query
- **Query**:
```sql
SELECT id, username, password_hash, name, email, role, sector
FROM users
WHERE username = $1
```
- **Query Parameters**: `{{ $json.username }}`

#### Node 4: Code Node - Validar Senha
```javascript
const bcrypt = require('bcryptjs');

const user = $input.first().json;
const inputPassword = $node["Code1"].json.password;

// Verificar se usuário existe
if (!user || !user.id) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Usuário ou senha incorretos"
    }
  }];
}

// Validar senha
const isValid = bcrypt.compareSync(inputPassword, user.password_hash);

if (!isValid) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Usuário ou senha incorretos"
    }
  }];
}

// Remover password_hash antes de retornar
delete user.password_hash;

return [{
  json: {
    user: user,
    validPassword: true
  }
}];
```

#### Node 5: Code Node - Gerar JWT
```javascript
const jwt = require('jsonwebtoken');

const user = $json.user;
const secret = $env.JWT_SECRET;

// Gerar token
const token = jwt.sign(
  {
    userId: user.id.toString(),
    username: user.username,
    role: user.role,
    sector: user.sector
  },
  secret,
  { expiresIn: '24h' }
);

return [{
  json: {
    user: {
      id: user.id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      sector: user.sector
    },
    token: token
  }
}];
```

#### Node 6: Respond to Webhook
- **Response Code**: `{{ $json.error ? $json.status : 200 }}`
- **Response Body**:
```javascript
{{
  $json.error 
    ? { message: $json.message }
    : { user: $json.user, token: $json.token }
}}
```

---

## 2. LOGOUT - `POST /logout`

### Estrutura do Workflow

```
1. Webhook (POST)
   ↓
2. Code Node (Validar Token)
   ↓
3. Respond to Webhook
```

### Configuração Detalhada

#### Node 1: Webhook
- **Path**: `/logout`
- **Method**: `POST`
- **Response Mode**: `When Last Node Finishes`

#### Node 2: Code Node - Validar Token
```javascript
const jwt = require('jsonwebtoken');

const authHeader = $input.item.json.headers.authorization;
const token = authHeader?.replace('Bearer ', '');

if (!token) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token não fornecido"
    }
  }];
}

try {
  jwt.verify(token, $env.JWT_SECRET);
  
  // Logout bem-sucedido
  return [{
    json: {
      message: "Logout realizado com sucesso"
    }
  }];
} catch (error) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token inválido"
    }
  }];
}
```

#### Node 3: Respond to Webhook
- **Response Code**: `{{ $json.error ? $json.status : 200 }}`
- **Response Body**: `{{ $json }}`

---

## 3. LISTAR ITENS - `GET /items`

### Estrutura do Workflow

```
1. Webhook (GET)
   ↓
2. Code Node (Validar Token & Extrair User)
   ↓
3. Postgres (Buscar Itens)
   ↓
4. Code Node (Filtrar por Permissões)
   ↓
5. Respond to Webhook
```

### Configuração Detalhada

#### Node 1: Webhook
- **Path**: `/items`
- **Method**: `GET`
- **Response Mode**: `When Last Node Finishes`

#### Node 2: Code Node - Validar Token
```javascript
const jwt = require('jsonwebtoken');

const authHeader = $input.item.json.headers.authorization;
const token = authHeader?.replace('Bearer ', '');

if (!token) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token não fornecido"
    }
  }];
}

try {
  const decoded = jwt.verify(token, $env.JWT_SECRET);
  
  return [{
    json: {
      user: decoded,
      authorized: true
    }
  }];
} catch (error) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token inválido ou expirado"
    }
  }];
}
```

#### Node 3: Postgres - Buscar Itens
- **Operation**: Execute Query
- **Query**:
```sql
SELECT 
  id,
  name,
  type,
  sector,
  jsonb_build_object(
    'building', location_building,
    'room', location_room,
    'cabinet', location_cabinet,
    'shelf', location_shelf
  ) as location,
  status,
  current_user,
  last_user,
  last_movement,
  observations,
  is_public,
  authorized_sectors,
  created_at,
  updated_at
FROM items
ORDER BY updated_at DESC
```

#### Node 4: Code Node - Filtrar por Permissões
```javascript
const user = $node["Code_ValidateToken"].json.user;
const items = $input.all().map(item => item.json);

// Admin vê tudo
if (user.role === 'admin') {
  return items.map(item => ({ json: item }));
}

// Filtrar itens baseado em permissões
const filteredItems = items.filter(item => {
  // Itens públicos: todos podem ver
  if (item.is_public) return true;
  
  // Setor: vê itens do seu setor ou autorizados
  if (user.role === 'sector') {
    if (item.sector === user.sector) return true;
    if (item.authorized_sectors?.includes(user.sector)) return true;
  }
  
  return false;
});

return filteredItems.map(item => ({ json: item }));
```

#### Node 5: Respond to Webhook
- **Response Code**: `{{ $json.error ? $json.status : 200 }}`
- **Response Body**:
```javascript
{{
  $json.error 
    ? { message: $json.message }
    : $input.all().map(item => item.json)
}}
```

---

## 4. BUSCAR ITEM POR ID - `GET /items/{id}`

### Estrutura do Workflow

```
1. Webhook (GET)
   ↓
2. Code Node (Validar Token & Extrair ID)
   ↓
3. Postgres (Buscar Item)
   ↓
4. Code Node (Verificar Permissão)
   ↓
5. Respond to Webhook
```

### Configuração Detalhada

#### Node 1: Webhook
- **Path**: `/items/:id`
- **Method**: `GET`
- **Response Mode**: `When Last Node Finishes`

#### Node 2: Code Node - Validar Token e Extrair ID
```javascript
const jwt = require('jsonwebtoken');

const authHeader = $input.item.json.headers.authorization;
const token = authHeader?.replace('Bearer ', '');
const itemId = $input.item.json.params.id;

if (!token) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token não fornecido"
    }
  }];
}

if (!itemId) {
  return [{
    json: {
      error: true,
      status: 400,
      message: "ID do item não fornecido"
    }
  }];
}

try {
  const decoded = jwt.verify(token, $env.JWT_SECRET);
  
  return [{
    json: {
      user: decoded,
      itemId: itemId,
      authorized: true
    }
  }];
} catch (error) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token inválido"
    }
  }];
}
```

#### Node 3: Postgres - Buscar Item
- **Operation**: Execute Query
- **Query**:
```sql
SELECT 
  id,
  name,
  type,
  sector,
  jsonb_build_object(
    'building', location_building,
    'room', location_room,
    'cabinet', location_cabinet,
    'shelf', location_shelf
  ) as location,
  status,
  current_user,
  last_user,
  last_movement,
  observations,
  is_public,
  authorized_sectors,
  created_at,
  updated_at
FROM items
WHERE id = $1
```
- **Query Parameters**: `{{ $json.itemId }}`

#### Node 4: Code Node - Verificar Permissão
```javascript
const user = $node["Code_ValidateToken"].json.user;
const item = $input.first()?.json;

if (!item || !item.id) {
  return [{
    json: {
      error: true,
      status: 404,
      message: "Item não encontrado"
    }
  }];
}

// Admin vê tudo
if (user.role === 'admin') {
  return [{ json: item }];
}

// Verificar permissões
const hasPermission = 
  item.is_public || 
  (user.role === 'sector' && (
    item.sector === user.sector ||
    item.authorized_sectors?.includes(user.sector)
  ));

if (!hasPermission) {
  return [{
    json: {
      error: true,
      status: 403,
      message: "Sem permissão para visualizar este item"
    }
  }];
}

return [{ json: item }];
```

#### Node 5: Respond to Webhook
- **Response Code**: `{{ $json.error ? $json.status : 200 }}`
- **Response Body**: `{{ $json }}`

---

## 5. CRIAR ITEM - `POST /items`

### Estrutura do Workflow

```
1. Webhook (POST)
   ↓
2. Code Node (Validar Token & Dados)
   ↓
3. Postgres (Inserir Item)
   ↓
4. Postgres (Criar Histórico)
   ↓
5. Respond to Webhook
```

### Configuração Detalhada

#### Node 1: Webhook
- **Path**: `/items`
- **Method**: `POST`
- **Response Mode**: `When Last Node Finishes`

#### Node 2: Code Node - Validar Token e Dados
```javascript
const jwt = require('jsonwebtoken');

const authHeader = $input.item.json.headers.authorization;
const token = authHeader?.replace('Bearer ', '');
const body = $input.item.json.body;

if (!token) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token não fornecido"
    }
  }];
}

try {
  const user = jwt.verify(token, $env.JWT_SECRET);
  
  // Apenas admin pode criar itens
  if (user.role !== 'admin') {
    return [{
      json: {
        error: true,
        status: 403,
        message: "Sem permissão para criar itens"
      }
    }];
  }
  
  // Validar campos obrigatórios
  if (!body.name || !body.type || !body.sector) {
    return [{
      json: {
        error: true,
        status: 400,
        message: "Campos obrigatórios: name, type, sector"
      }
    }];
  }
  
  return [{
    json: {
      user: user,
      itemData: {
        name: body.name,
        type: body.type,
        sector: body.sector,
        location_building: body.location?.building || '',
        location_room: body.location?.room || '',
        location_cabinet: body.location?.cabinet || '',
        location_shelf: body.location?.shelf || '',
        status: body.status || 'available',
        current_user: body.currentUser || '',
        observations: body.observations || '',
        is_public: body.isPublic !== undefined ? body.isPublic : true,
        authorized_sectors: body.authorizedSectors || []
      }
    }
  }];
} catch (error) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token inválido"
    }
  }];
}
```

#### Node 3: Postgres - Inserir Item
- **Operation**: Execute Query
- **Query**:
```sql
INSERT INTO items (
  name, type, sector, location_building, location_room, 
  location_cabinet, location_shelf, status, current_user, 
  observations, is_public, authorized_sectors
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING 
  id,
  name,
  type,
  sector,
  jsonb_build_object(
    'building', location_building,
    'room', location_room,
    'cabinet', location_cabinet,
    'shelf', location_shelf
  ) as location,
  status,
  current_user,
  last_user,
  last_movement,
  observations,
  is_public,
  authorized_sectors,
  created_at,
  updated_at
```
- **Query Parameters**:
```javascript
{{ $json.itemData.name }},
{{ $json.itemData.type }},
{{ $json.itemData.sector }},
{{ $json.itemData.location_building }},
{{ $json.itemData.location_room }},
{{ $json.itemData.location_cabinet }},
{{ $json.itemData.location_shelf }},
{{ $json.itemData.status }},
{{ $json.itemData.current_user }},
{{ $json.itemData.observations }},
{{ $json.itemData.is_public }},
{{ JSON.stringify($json.itemData.authorized_sectors) }}
```

#### Node 4: Postgres - Criar Histórico
- **Operation**: Execute Query
- **Query**:
```sql
INSERT INTO item_history (item_id, action, user_name, observations)
VALUES ($1, 'created', $2, $3)
```
- **Query Parameters**:
```javascript
{{ $json.id }},
{{ $node["Code_ValidateToken"].json.user.username }},
'Item criado no sistema'
```

#### Node 5: Respond to Webhook
- **Response Code**: `{{ $json.error ? $json.status : 201 }}`
- **Response Body**: `{{ $json }}`

---

## 6. ATUALIZAR ITEM - `PUT /items/{id}`

### Estrutura do Workflow

```
1. Webhook (PUT)
   ↓
2. Code Node (Validar Token & Dados)
   ↓
3. Postgres (Buscar Item Atual)
   ↓
4. Code Node (Verificar Permissão)
   ↓
5. Postgres (Atualizar Item)
   ↓
6. Postgres (Criar Histórico)
   ↓
7. Respond to Webhook
```

### Configuração Detalhada

#### Node 2: Code Node - Validar Token e Dados
```javascript
const jwt = require('jsonwebtoken');

const authHeader = $input.item.json.headers.authorization;
const token = authHeader?.replace('Bearer ', '');
const itemId = $input.item.json.params.id;
const body = $input.item.json.body;

if (!token || !itemId) {
  return [{
    json: {
      error: true,
      status: 400,
      message: "Token ou ID do item não fornecido"
    }
  }];
}

try {
  const user = jwt.verify(token, $env.JWT_SECRET);
  
  return [{
    json: {
      user: user,
      itemId: itemId,
      updateData: body
    }
  }];
} catch (error) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token inválido"
    }
  }];
}
```

#### Node 4: Code Node - Verificar Permissão
```javascript
const user = $node["Code_ValidateToken"].json.user;
const item = $input.first()?.json;

if (!item || !item.id) {
  return [{
    json: {
      error: true,
      status: 404,
      message: "Item não encontrado"
    }
  }];
}

// Admin pode editar tudo
if (user.role === 'admin') {
  return [{
    json: {
      canEdit: true,
      item: item
    }
  }];
}

// Setor pode editar itens do seu setor
if (user.role === 'sector' && item.sector === user.sector) {
  return [{
    json: {
      canEdit: true,
      item: item
    }
  }];
}

return [{
  json: {
    error: true,
    status: 403,
    message: "Sem permissão para editar este item"
  }
}];
```

#### Node 5: Postgres - Atualizar Item
- **Operation**: Execute Query
- **Query**:
```sql
UPDATE items
SET 
  name = COALESCE($2, name),
  type = COALESCE($3, type),
  sector = COALESCE($4, sector),
  location_building = COALESCE($5, location_building),
  location_room = COALESCE($6, location_room),
  location_cabinet = COALESCE($7, location_cabinet),
  location_shelf = COALESCE($8, location_shelf),
  status = COALESCE($9, status),
  current_user = COALESCE($10, current_user),
  observations = COALESCE($11, observations),
  is_public = COALESCE($12, is_public),
  authorized_sectors = COALESCE($13, authorized_sectors),
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING 
  id,
  name,
  type,
  sector,
  jsonb_build_object(
    'building', location_building,
    'room', location_room,
    'cabinet', location_cabinet,
    'shelf', location_shelf
  ) as location,
  status,
  current_user,
  last_user,
  last_movement,
  observations,
  is_public,
  authorized_sectors,
  created_at,
  updated_at
```

---

## 7. DELETAR ITEM - `DELETE /items/{id}`

### Estrutura do Workflow

```
1. Webhook (DELETE)
   ↓
2. Code Node (Validar Token - Apenas Admin)
   ↓
3. Postgres (Deletar Item)
   ↓
4. Respond to Webhook
```

### Configuração Detalhada

#### Node 2: Code Node - Validar Token (Apenas Admin)
```javascript
const jwt = require('jsonwebtoken');

const authHeader = $input.item.json.headers.authorization;
const token = authHeader?.replace('Bearer ', '');
const itemId = $input.item.json.params.id;

if (!token || !itemId) {
  return [{
    json: {
      error: true,
      status: 400,
      message: "Token ou ID não fornecido"
    }
  }];
}

try {
  const user = jwt.verify(token, $env.JWT_SECRET);
  
  if (user.role !== 'admin') {
    return [{
      json: {
        error: true,
        status: 403,
        message: "Apenas administradores podem deletar itens"
      }
    }];
  }
  
  return [{
    json: {
      itemId: itemId,
      authorized: true
    }
  }];
} catch (error) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token inválido"
    }
  }];
}
```

#### Node 3: Postgres - Deletar Item
- **Operation**: Execute Query
- **Query**:
```sql
DELETE FROM items WHERE id = $1
```
- **Query Parameters**: `{{ $json.itemId }}`

---

## 8. HISTÓRICO DO ITEM - `GET /items/{id}/history`

### Estrutura do Workflow

```
1. Webhook (GET)
   ↓
2. Code Node (Validar Token)
   ↓
3. Postgres (Buscar Histórico)
   ↓
4. Respond to Webhook
```

### Configuração Detalhada

#### Node 3: Postgres - Buscar Histórico
- **Operation**: Execute Query
- **Query**:
```sql
SELECT 
  id,
  item_id as "itemId",
  action,
  user_name as "user",
  timestamp,
  observations
FROM item_history
WHERE item_id = $1
ORDER BY timestamp DESC
```
- **Query Parameters**: `{{ $json.itemId }}`

---

## 9. MOVIMENTAR ITEM - `POST /items/move`

### Estrutura do Workflow

```
1. Webhook (POST)
   ↓
2. Code Node (Validar Token & Dados)
   ↓
3. Postgres (Atualizar Status do Item)
   ↓
4. Postgres (Registrar Histórico)
   ↓
5. Respond to Webhook
```

### Configuração Detalhada

#### Node 2: Code Node - Validar Dados
```javascript
const jwt = require('jsonwebtoken');

const authHeader = $input.item.json.headers.authorization;
const token = authHeader?.replace('Bearer ', '');
const body = $input.item.json.body;

if (!token) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token não fornecido"
    }
  }];
}

try {
  const user = jwt.verify(token, $env.JWT_SECRET);
  
  if (!body.itemId || !body.status) {
    return [{
      json: {
        error: true,
        status: 400,
        message: "itemId e status são obrigatórios"
      }
    }];
  }
  
  // Determinar ação para histórico
  const actionMap = {
    'borrowed': 'borrowed',
    'available': 'returned',
    'lost': 'lost'
  };
  
  return [{
    json: {
      user: user,
      itemId: body.itemId,
      status: body.status,
      userId: body.userId || '',
      observations: body.observations || '',
      action: actionMap[body.status] || 'updated'
    }
  }];
} catch (error) {
  return [{
    json: {
      error: true,
      status: 401,
      message: "Token inválido"
    }
  }];
}
```

#### Node 3: Postgres - Atualizar Item
- **Operation**: Execute Query
- **Query**:
```sql
UPDATE items
SET 
  status = $1,
  current_user = $2,
  last_user = $3,
  last_movement = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $4
RETURNING 
  id,
  name,
  type,
  sector,
  jsonb_build_object(
    'building', location_building,
    'room', location_room,
    'cabinet', location_cabinet,
    'shelf', location_shelf
  ) as location,
  status,
  current_user,
  last_user,
  last_movement,
  observations,
  is_public,
  authorized_sectors,
  created_at,
  updated_at
```
- **Query Parameters**:
```javascript
{{ $json.status }},
{{ $json.userId }},
{{ $json.user.username }},
{{ $json.itemId }}
```

#### Node 4: Postgres - Registrar Histórico
- **Operation**: Execute Query
- **Query**:
```sql
INSERT INTO item_history (item_id, action, user_name, observations)
VALUES ($1, $2, $3, $4)
```

---

## 10. USUÁRIOS - CRUD Completo

### GET /users
```
1. Webhook (GET /users)
   ↓
2. Code Node (Validar Token - Apenas Admin)
   ↓
3. Postgres (SELECT * FROM users)
   ↓
4. Code Node (Remover password_hash)
   ↓
5. Respond
```

### POST /users
```
1. Webhook (POST /users)
   ↓
2. Code Node (Validar Token & Hash Senha)
   ↓
3. Postgres (INSERT INTO users)
   ↓
4. Respond
```

**Código para Hash de Senha:**
```javascript
const bcrypt = require('bcryptjs');

const password = $json.password;
const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

return [{
  json: {
    ...($json),
    password_hash: hash
  }
}];
```

### PUT /users/{id}
```
1. Webhook (PUT /users/:id)
   ↓
2. Code Node (Validar Token)
   ↓
3. Postgres (UPDATE users)
   ↓
4. Respond
```

### DELETE /users/{id}
```
1. Webhook (DELETE /users/:id)
   ↓
2. Code Node (Validar Token - Apenas Admin)
   ↓
3. Postgres (DELETE FROM users)
   ↓
4. Respond
```

---

## 11. SETORES - CRUD Completo

### GET /sectors
```
1. Webhook (GET /sectors)
   ↓
2. Code Node (Validar Token)
   ↓
3. Postgres (SELECT * FROM sectors)
   ↓
4. Respond
```

### POST /sectors
```
1. Webhook (POST /sectors)
   ↓
2. Code Node (Validar Token - Apenas Admin)
   ↓
3. Postgres (INSERT INTO sectors)
   ↓
4. Respond
```

### PUT /sectors/{id}
```
1. Webhook (PUT /sectors/:id)
   ↓
2. Code Node (Validar Token - Apenas Admin)
   ↓
3. Postgres (UPDATE sectors)
   ↓
4. Respond
```

### DELETE /sectors/{id}
```
1. Webhook (DELETE /sectors/:id)
   ↓
2. Code Node (Validar Token - Apenas Admin)
   ↓
3. Postgres (DELETE FROM sectors)
   ↓
4. Respond
```

---

## 12. DASHBOARD STATS - `GET /dashboard/stats`

### Estrutura do Workflow

```
1. Webhook (GET)
   ↓
2. Code Node (Validar Token)
   ↓
3. Postgres (Contar Totais)
   ↓
4. Postgres (Itens por Setor)
   ↓
5. Postgres (Itens Recentes)
   ↓
6. Code Node (Montar Response)
   ↓
7. Respond
```

### Configuração Detalhada

#### Node 3: Postgres - Contar Totais
```sql
SELECT 
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE status = 'available') as available_items,
  COUNT(*) FILTER (WHERE status = 'borrowed') as borrowed_items,
  COUNT(*) FILTER (WHERE status = 'lost') as lost_items
FROM items
```

#### Node 4: Postgres - Itens por Setor
```sql
SELECT 
  sector,
  COUNT(*) as count
FROM items
GROUP BY sector
ORDER BY count DESC
```

#### Node 5: Postgres - Itens Recentes
```sql
SELECT 
  id,
  name,
  sector,
  status,
  updated_at as "updatedAt"
FROM items
ORDER BY updated_at DESC
LIMIT 10
```

#### Node 6: Code Node - Montar Response
```javascript
const totals = $node["Postgres_Totals"].json;
const bySector = $node["Postgres_BySector"].all().map(i => i.json);
const recent = $node["Postgres_Recent"].all().map(i => i.json);

return [{
  json: {
    totalItems: parseInt(totals.total_items),
    availableItems: parseInt(totals.available_items),
    borrowedItems: parseInt(totals.borrowed_items),
    lostItems: parseInt(totals.lost_items),
    itemsBySector: bySector,
    recentItems: recent
  }
}];
```

---

## 🔧 Configurações Importantes do n8n

### CORS (Cross-Origin Resource Sharing)

Para cada webhook, adicione nas configurações:

**Options → Response Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

**Adicione um node IF após o Webhook:**
- **Condition**: `{{ $json.method }}` equals `OPTIONS`
- **Se TRUE**: Responder com status 200 e headers CORS
- **Se FALSE**: Continuar fluxo normal

---

## 🐛 Troubleshooting

### Erro: "Token inválido"
- Verifique se `JWT_SECRET` está configurado corretamente
- Certifique-se que o token está sendo enviado no header `Authorization: Bearer {token}`
- Token expira em 24h, faça login novamente

### Erro: "Failed to fetch"
- Verifique se o n8n está rodando e acessível
- Verifique a URL configurada em `src/config/api.ts`
- Certifique-se que CORS está configurado em todos os webhooks

### Erro: "Database connection failed"
- Verifique as variáveis de ambiente do banco (DB_HOST, DB_PORT, etc)
- Certifique-se que o PostgreSQL está rodando
- Verifique credenciais de acesso ao banco

### Itens não aparecem no frontend
- Verifique permissões (isPublic, authorizedSectors)
- Certifique-se que o token contém role e sector corretos
- Verifique logs no n8n para ver o que está sendo retornado

### Senha não valida no login
- Certifique-se que a senha foi hasheada com bcrypt ao criar usuário
- Use bcrypt.compareSync para comparar senhas
- Nunca armazene senhas em texto plano

---

## 📚 Recursos Adicionais

### Testando os Endpoints

Use **Postman** ou **cURL** para testar:

```bash
# Login
curl -X POST http://localhost:5678/webhook/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'

# Listar Itens (com token)
curl -X GET http://localhost:5678/webhook/items \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Logs no n8n

- Acesse cada execução do workflow em **Executions**
- Verifique os dados que entram e saem de cada node
- Use `console.log()` em Code Nodes para debug

### Backup do Banco

```bash
# Backup
pg_dump -U postgres estoque_db > backup.sql

# Restaurar
psql -U postgres estoque_db < backup.sql
```

---

## ✅ Checklist de Implementação

- [ ] Banco de dados PostgreSQL criado
- [ ] Tabelas criadas (users, items, sectors, item_history)
- [ ] Variáveis de ambiente configuradas no n8n
- [ ] Workflow de login implementado
- [ ] Workflow de logout implementado
- [ ] Workflow GET /items implementado
- [ ] Workflow GET /items/{id} implementado
- [ ] Workflow POST /items implementado
- [ ] Workflow PUT /items/{id} implementado
- [ ] Workflow DELETE /items/{id} implementado
- [ ] Workflow GET /items/{id}/history implementado
- [ ] Workflow POST /items/move implementado
- [ ] Workflows de usuários implementados
- [ ] Workflows de setores implementados
- [ ] Workflow de dashboard stats implementado
- [ ] CORS configurado em todos os webhooks
- [ ] Frontend conectado (src/config/api.ts)
- [ ] Testes realizados em todos os endpoints
- [ ] Usuário admin criado no banco

---

## 🎯 Próximos Passos

1. **Teste cada endpoint individualmente** com Postman
2. **Crie usuários de teste** com diferentes roles
3. **Implemente validações adicionais** conforme necessário
4. **Configure HTTPS** para produção
5. **Implemente rate limiting** para segurança
6. **Configure backups automáticos** do banco de dados

---

## 📞 Suporte

Para dúvidas sobre n8n, consulte:
- [Documentação oficial do n8n](https://docs.n8n.io)
- [Comunidade n8n](https://community.n8n.io)

Para dúvidas sobre o sistema:
- Consulte o código fonte em `src/`
- Verifique os tipos em `src/types/index.ts`
