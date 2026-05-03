# IAContabil API

Backend Node.js com TypeScript e Clean Architecture para o sistema de solicitação de notas fiscais.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Zod** - Validação de dados
- **Bcrypt** - Hash de senhas
- **NFe.io** - Emissão de notas fiscais de serviço
- **Cloudinary** - Storage de arquivos (PDFs)
- **Resend** - Envio de emails
- **Vitest** - Testes unitários

## 📁 Arquitetura

O projeto segue os princípios da **Clean Architecture**:

```
src/
├── domain/          # Camada de domínio (entidades e interfaces)
│   ├── models/      # Modelos de dados
│   └── usecases/    # Interfaces dos casos de uso
├── data/            # Camada de dados (implementação dos casos de uso)
│   ├── protocols/   # Interfaces de repositórios
│   └── usecases/    # Implementação dos casos de uso
├── infra/           # Camada de infraestrutura
│   ├── db/prisma/   # Repositórios Prisma
│   ├── email/       # Serviço de email (Resend)
│   └── external/    # Clientes de APIs externas
└── main/            # Camada principal
    ├── config/      # Configurações
    ├── factories/   # Factories (injeção de dependência)
    ├── middlewares/ # Middlewares Express
    ├── routes/      # Rotas da API
    └── server.ts    # Servidor Express
```

## 🗄️ Banco de Dados

### Schema

- **users** - Usuários do sistema (CLIENTE, OPERACIONAL, ADMIN)
- **companies** - Empresas cadastradas pelos clientes
- **requests** - Solicitações de notas fiscais
- **payers** - Tomadores (destinatários das notas fiscais)
- **nbs** - Nomenclatura Brasileira de Serviços
- **cnaes** - Classificação Nacional de Atividades Econômicas

## 🔧 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis:

```bash
cp .env.example .env
```

Variáveis importantes:
- `DATABASE_URL` - String de conexão do PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT
- `PORT` - Porta do servidor (padrão: 3333)
- `CORS_ORIGIN` - Origem permitida para CORS (padrão: http://localhost:3000)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Upload de arquivos
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` - Envio de emails
- `NFEIO_API_KEY`, `NFEIO_COMPANY_ID`, `NFEIO_BASE_URL` - Emissão de notas fiscais
- `LISTACNAE_URL`, `LISTACNAE_BEARER_TOKEN` - API externa de CNAEs (fallback quando banco local estiver vazio)

### 3. Configurar banco de dados

```bash
# Subir PostgreSQL via Docker
docker-compose up -d

# Gerar client do Prisma
npm run prisma:generate

# Rodar migrations
npm run prisma:migrate

# (Opcional) Popular banco com dados de desenvolvimento
npm run prisma:seed

# (Opcional) Abrir Prisma Studio
npm run prisma:studio
```

## 🏃 Executar

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
# Build
npm run build

# Start
npm start
```

## 📡 API Endpoints

### Autenticação

#### POST /auth/register
Criar novo usuário

```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

#### POST /auth/login
Fazer login

```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "name": "Nome do Usuário",
    "role": "CLIENTE"
  },
  "accessToken": "jwt-token"
}
```

### Empresas (requer autenticação)

#### GET /companies
Listar empresas do usuário autenticado

**Headers:**
```
Authorization: Bearer {token}
```

#### POST /companies
Cadastrar nova empresa

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nome": "Empresa ABC Ltda",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@empresa.com",
  "telefone": "(11) 98765-4321",
  "endereco": "Rua Exemplo, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567"
}
```

### Solicitações (requer autenticação)

#### GET /requests
Listar solicitações

**Headers:**
```
Authorization: Bearer {token}
```

**Query params (opcional):**
- `status` - PENDENTE | PROCESSADA | CANCELADA

**Comportamento:**
- **CLIENTE**: Lista apenas suas próprias solicitações
- **OPERACIONAL/ADMIN**: Lista todas as solicitações

#### POST /requests
Criar nova solicitação (apenas CLIENTE)

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "valor": 2500.00,
  "dataEmissao": "2024-01-15",
  "observacoes": "Observações opcionais",
  "companyId": "uuid-da-empresa"
}
```

#### PATCH /requests/:id/status
Atualizar status da solicitação (apenas OPERACIONAL/ADMIN)

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "status": "PROCESSADA",
  "arquivoUrl": "https://url-do-arquivo.pdf"
}
```

### Tomadores / Payers (requer autenticação)

#### GET /payers
Listar tomadores do usuário autenticado

#### POST /payers
Cadastrar novo tomador

```json
{
  "name": "Nome do Tomador",
  "document": "12345678000190",
  "email": "tomador@email.com"
}
```

#### PUT /payers/:id
Atualizar tomador

#### DELETE /payers/:id
Remover tomador

### Upload de PDF (OPERACIONAL / ADMIN)

#### POST /upload/:requestId
Enviar PDF de nota fiscal para uma solicitação. Utiliza `multipart/form-data` com campo `file` (somente PDF, máx 10MB).

### NBS - Nomenclatura Brasileira de Serviços (requer autenticação)

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/nbs` | Autenticado |
| `GET` | `/nbs/:id` | Autenticado |
| `POST` | `/nbs` | OPERACIONAL / ADMIN |
| `PUT` | `/nbs/:id` | OPERACIONAL / ADMIN |
| `DELETE` | `/nbs/:id` | ADMIN |

### CNAEs (requer autenticação)

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| `GET` | `/cnaes` | Autenticado | Aceita `?search=termo`. Retorna do banco local; se vazio, busca na API externa, salva e retorna |
| `GET` | `/cnaes/:id` | Autenticado | |
| `POST` | `/cnaes` | OPERACIONAL / ADMIN | Cadastro individual |
| `POST` | `/cnaes/import` | OPERACIONAL / ADMIN | Importação em lote (array de objetos) |
| `PUT` | `/cnaes/:id` | OPERACIONAL / ADMIN | |
| `DELETE` | `/cnaes/:id` | ADMIN | |

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)** para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer {seu-token-jwt}
```

## 👥 Perfis de Usuário

- **CLIENTE** - Pode criar empresas e solicitar notas fiscais
- **OPERACIONAL** - Pode visualizar todas as solicitações e alterar status
- **ADMIN** - Acesso total ao sistema

## 🧪 Testes

```bash
npm test                # Roda todos os testes uma vez
npm run test:watch      # Modo watch (desenvolvimento)
npm run test:coverage   # Relatório de cobertura de código
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento com hot-reload
npm run build            # Build para produção
npm start                # Executar versão de produção
npm test                 # Rodar testes
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Cobertura de testes
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Rodar migrations
npm run prisma:deploy    # Aplicar migrations (produção)
npm run prisma:seed      # Popular banco com dados de desenvolvimento
npm run prisma:studio    # Abrir Prisma Studio
```

## 📝 Próximos Passos

- [x] Implementar upload de arquivos (multipart/form-data)
- [x] Adicionar testes unitários
- [ ] Implementar paginação nas listagens
- [ ] Adicionar busca e filtros avançados
- [ ] Implementar refresh token
- [ ] Adicionar logs estruturados
- [ ] Documentação com Swagger/OpenAPI

## 📄 Licença

ISC
