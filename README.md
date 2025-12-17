# IAContabil API

Backend Node.js com TypeScript e Clean Architecture para o sistema de solicitação de notas fiscais.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Zod** - Validação de dados
- **Bcrypt** - Hash de senhas

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
│   └── http/        # Clientes HTTP
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

### 3. Configurar banco de dados

```bash
# Gerar client do Prisma
npm run prisma:generate

# Rodar migrations
npm run prisma:migrate

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

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)** para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer {seu-token-jwt}
```

## 👥 Perfis de Usuário

- **CLIENTE** - Pode criar empresas e solicitar notas fiscais
- **OPERACIONAL** - Pode visualizar todas as solicitações e alterar status
- **ADMIN** - Acesso total ao sistema

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento com hot-reload
npm run build            # Build para produção
npm start                # Executar versão de produção
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Rodar migrations
npm run prisma:studio    # Abrir Prisma Studio
```

## 📝 Próximos Passos

- [ ] Implementar upload de arquivos (multipart/form-data)
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar paginação nas listagens
- [ ] Adicionar busca e filtros avançados
- [ ] Implementar refresh token
- [ ] Adicionar logs estruturados
- [ ] Documentação com Swagger/OpenAPI

## 📄 Licença

ISC
