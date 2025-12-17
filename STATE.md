# IAContabil - Estado do Projeto

> Documentação completa do estado atual do projeto IAContabil (Sistema de Gestão de Notas Fiscais)

**Última atualização:** 17 de dezembro de 2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Ambientes e Deploy](#ambientes-e-deploy)
6. [Integrações](#integrações)
7. [Autenticação e Perfis](#autenticação-e-perfis)
8. [Funcionalidades Implementadas](#funcionalidades-implementadas)
9. [Issues Conhecidos](#issues-conhecidos)
10. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

**IAContabil** é um sistema de gestão de notas fiscais que conecta clientes e operadores administrativos.

### Objetivo
Permitir que clientes solicitem emissão de notas fiscais para suas empresas cadastradas, e que operadores processem essas solicitações anexando os PDFs das notas fiscais.

### Fluxo Principal
1. **Cliente** cadastra suas empresas
2. **Cliente** cria solicitação de nota fiscal (valor, data, empresa)
3. **Sistema** envia email para admin (iaappcontabil@gmail.com)
4. **Operacional** visualiza solicitação pendente
5. **Operacional** anexa PDF da nota fiscal
6. **Sistema** envia email para cliente com nota anexada
7. **Cliente** recebe email e pode baixar a nota

---

## 🏗️ Arquitetura

### Frontend (React + TypeScript)
```
┌─────────────────────────────────────┐
│         React Application           │
│  (Vite + TypeScript + Tailwind)    │
├─────────────────────────────────────┤
│  - Páginas (User/Operational)       │
│  - Componentes (Shadcn/ui)          │
│  - Hooks (Recoil State)             │
│  - HTTP Client (Axios)              │
└─────────────────────────────────────┘
          │
          ↓ API REST
┌─────────────────────────────────────┐
│         Backend (Node.js)           │
│   (Express + TypeScript + Prisma)  │
├─────────────────────────────────────┤
│  - Routes                           │
│  - Use Cases (Clean Architecture)   │
│  - Repositories (Prisma)            │
│  - Email Service (Resend)           │
└─────────────────────────────────────┘
          │
          ↓
┌─────────────────────────────────────┐
│     PostgreSQL Database (Neon)      │
└─────────────────────────────────────┘
```

### Padrões Arquiteturais
- **Frontend:** Component-based architecture, Custom Hooks, State Management (Recoil)
- **Backend:** Clean Architecture, Repository Pattern, Factory Pattern, Dependency Injection

---

## 🛠️ Stack Tecnológica

### Frontend (`/iacontabil`)
```json
{
  "runtime": "React 18.3.1",
  "bundler": "Vite 6.0.11",
  "language": "TypeScript 5.6.2",
  "styling": "Tailwind CSS 3.4.17",
  "components": "Shadcn/ui",
  "state": "Recoil 0.7.7",
  "forms": "React Hook Form + Zod",
  "routing": "React Router DOM 7.1.1",
  "http": "Axios",
  "notifications": "Sonner",
  "icons": "Lucide React"
}
```

### Backend (`/iacontabil-api`)
```json
{
  "runtime": "Node.js >=18.0.0",
  "framework": "Express 5.2.1",
  "language": "TypeScript 5.9.3",
  "orm": "Prisma 6.19.1",
  "database": "PostgreSQL",
  "auth": "JWT (jsonwebtoken 9.0.3)",
  "password": "bcryptjs 3.0.3",
  "email": "Resend",
  "upload": "Multer 2.0.2",
  "validation": "Zod 4.2.0"
}
```

### Infraestrutura
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render (Free Tier)
- **Database:** Neon PostgreSQL (Serverless)
- **Email Service:** Resend (3.000 emails/mês grátis)
- **File Storage:** Filesystem local (⚠️ efêmero no Render - migrar para Cloudinary)

---

## 📁 Estrutura de Pastas

### Frontend
```
iacontabil/
├── src/
│   ├── presentation/
│   │   ├── pages/
│   │   │   ├── public/          # Login, Registro
│   │   │   ├── user/            # Dashboard, Solicitações, Empresas
│   │   │   └── operational/     # Dashboard Operacional, Processamento
│   │   ├── components/
│   │   │   ├── layout-intern/   # Sidebars, Layouts
│   │   │   └── ui/              # Componentes Shadcn
│   │   ├── routes/              # Rotas e Guards
│   │   └── hooks/               # Custom Hooks
│   ├── main/
│   │   ├── factories/           # Factory Pattern para HTTP Clients
│   │   └── config/              # Configurações (API endpoints)
│   ├── lib/
│   │   ├── utils/               # Máscaras, Helpers
│   │   └── validations/         # Schemas Zod
│   ├── hooks/                   # Hooks de negócio
│   ├── types/                   # TypeScript types
│   └── assets/                  # Imagens, logos
├── public/
└── vercel.json                  # Config Vercel
```

### Backend
```
iacontabil-api/
├── src/
│   ├── main/
│   │   ├── server.ts           # Entry point
│   │   ├── routes/             # Express routes
│   │   ├── middlewares/        # Auth, Role-based
│   │   ├── factories/          # Dependency injection
│   │   └── config/             # Environment config
│   ├── domain/
│   │   ├── models/             # Domain entities
│   │   └── usecases/           # Use case interfaces
│   ├── data/
│   │   ├── usecases/           # Use case implementations
│   │   └── protocols/          # Repository interfaces
│   └── infra/
│       ├── db/prisma/          # Prisma repositories
│       └── email/              # Email service e templates
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── uploads/                    # Arquivos upload (⚠️ efêmero)
└── render.yaml                 # Config Render
```

---

## 🌐 Ambientes e Deploy

### Desenvolvimento Local

**Frontend:**
```bash
cd iacontabil
npm run dev
# http://localhost:3000
```

**Backend:**
```bash
cd iacontabil-api
npm run dev
# http://localhost:3333
```

**Banco de Dados:**
```bash
# Rodar migrations
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio
```

### Produção

**Frontend (Vercel)**
- URL: https://ia-app-contabil-front-jl4ibv4t9-jmmelons-projects.vercel.app/
- Deploy: Automático via GitHub (branch main)
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite

**Variáveis de Ambiente (Vercel):**
```env
VITE_API_URL=https://iacontabil-api.onrender.com
VITE_ENV=production
```

**Backend (Render)**
- URL: https://iacontabil-api.onrender.com
- Deploy: Automático via GitHub (branch main)
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npm start`
- Plan: Free (⚠️ hiberna após inatividade)

**Variáveis de Ambiente (Render):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_qO3c5ugNvLYM@ep-square-firefly-aeppsfoo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<gerado automaticamente>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://ia-app-contabil-front-jl4ibv4t9-jmmelons-projects.vercel.app
PORT=3333
RESEND_API_KEY=re_GpMKcygL_CwZjXv8RWzRDRPemqVZuPUVd
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Database (Neon PostgreSQL)**
- Endpoint: ep-square-firefly-aeppsfoo-pooler.us-east-2.aws.neon.tech
- Database: neondb
- User: neondb_owner
- Plan: Free Tier (3 GB storage)
- ⚠️ **Suspende automaticamente** após inatividade (acordar via console ou query)

---

## 🔌 Integrações

### Resend (Email Service)

**Configuração:**
- API Key: `re_GpMKcygL_CwZjXv8RWzRDRPemqVZuPUVd`
- From Email: `onboarding@resend.dev`
- Limite: 3.000 emails/mês (grátis)

**Emails Implementados:**

1. **Nova Solicitação → Admin**
   - Destinatário: `iaappcontabil@gmail.com`
   - Trigger: Cliente cria solicitação
   - Conteúdo: Dados do usuário, empresa, valor, data, observações
   - Template: `/src/infra/email/templates/nova-solicitacao-email.ts`

2. **Nota Processada → Cliente**
   - Destinatário: Email do cliente que criou a solicitação
   - Trigger: Operacional anexa PDF da nota
   - Conteúdo: Dados da nota, link de download
   - Anexo: PDF da nota fiscal
   - Template: `/src/infra/email/templates/nota-processada-email.ts`

3. **Boas-Vindas (não usado ainda)**
   - Template: `/src/infra/email/templates/welcome-email.ts`

**Upgrade Futuro:**
- Domínio personalizado (grátis): `noreply@iacontabil.com.br`
- Requer configuração DNS (SPF, DKIM, DMARC)

### Multer (Upload de Arquivos)

**Configuração:**
- Destino: `/uploads` (⚠️ efêmero no Render)
- Tipo aceito: PDF
- Tamanho máximo: 5 MB
- Nome: `nota-{timestamp}-{random}.pdf`

**⚠️ Problema Conhecido:**
- Arquivos são salvos no filesystem do Render
- Render tem filesystem efêmero (arquivos somem ao reiniciar)
- **Solução:** Migrar para Cloudinary (25 GB grátis)

---

## 🔐 Autenticação e Perfis

### Sistema de Autenticação

**Fluxo:**
1. Usuário envia email + senha para `/auth/login`
2. Backend valida credenciais (bcrypt)
3. Backend gera JWT token
4. Frontend armazena token no `localStorage`
5. Frontend usa token no header `Authorization: Bearer {token}`

**JWT Payload:**
```json
{
  "userId": "uuid",
  "email": "usuario@email.com",
  "role": "USER" | "OPERATIONAL" | "ADMIN"
}
```

### Perfis (Roles)

**Schema Prisma:**
```prisma
enum UserRole {
  CLIENTE      // ⚠️ Não usado (legado)
  OPERACIONAL  // ✅ Operador do sistema
  ADMIN        // ✅ Administrador
}
```

**Backend usa:**
- `USER` - Clientes (padrão)
- `OPERATIONAL` - Operadores
- `ADMIN` - Administradores

**Frontend mapeia:**
- `USER` ou `CLIENTE` → `cliente`
- `OPERATIONAL` ou `OPERACIONAL` → `operacional`
- `ADMIN` → `admin`

**Mapeamento:** `/src/hooks/useUserRole.ts`

### Permissões

| Ação | Cliente (USER) | Operacional | Admin |
|------|----------------|-------------|-------|
| Ver próprias empresas | ✅ | ❌ | ✅ |
| Cadastrar empresa | ✅ | ❌ | ✅ |
| Deletar própria empresa | ✅ | ❌ | ✅ |
| Ver próprias solicitações | ✅ | ❌ | ✅ |
| Criar solicitação | ✅ | ❌ | ✅ |
| Cancelar própria solicitação | ✅ | ❌ | ✅ |
| Ver todas solicitações | ❌ | ✅ | ✅ |
| Processar solicitação | ❌ | ✅ | ✅ |
| Anexar PDF | ❌ | ✅ | ✅ |

**Implementação:** `/src/main/middlewares/role.middleware.ts`

### Usuários do Sistema

**Usuário Operacional:**
- Email: `iaappcontabil@gmail.com`
- Senha: `Lordsk@531`
- Role: `OPERACIONAL`
- Criação: Via SQL no Neon (ver seção "Criação de Usuário Operacional")

---

## ✅ Funcionalidades Implementadas

### Cliente (USER)

**Dashboard**
- ✅ Cards de estatísticas (total emitidas, processando, valor total)
- ✅ Gráfico de notas por mês
- ✅ Lista de últimas solicitações
- ✅ Loading states e skeleton loaders
- ✅ Integração com API real

**Empresas**
- ✅ Listar empresas cadastradas
- ✅ Cadastrar nova empresa (nome, CNPJ, email, telefone, endereço completo)
- ✅ Deletar empresa (com AlertDialog de confirmação)
- ✅ Máscaras: CNPJ, telefone, CEP
- ✅ Validação com Zod

**Solicitações**
- ✅ Listar solicitações (pendentes, processadas, canceladas)
- ✅ Criar nova solicitação (empresa, valor, data, observações)
- ✅ Cancelar solicitação pendente (com AlertDialog)
- ✅ Baixar PDF de nota processada
- ✅ Máscara de moeda
- ✅ Exibição de nome da empresa correto

**Perfil**
- ✅ Visualizar dados do usuário
- ✅ Editar nome, email, telefone
- ✅ Máscara de telefone

**Autenticação**
- ✅ Login com email/senha
- ✅ Registro de novo usuário
- ✅ Logout (limpa localStorage)
- ✅ Redirecionamento baseado em role

### Operacional

**Dashboard**
- ✅ Estatísticas de solicitações pendentes, processadas
- ✅ Lista de solicitações recentes

**Solicitações**
- ✅ Listar todas solicitações
- ✅ Filtrar por status (pendentes, processadas)
- ✅ Anexar PDF (upload)
- ✅ Marcar como processada
- ✅ Visualizar detalhes completos (empresa, cliente, valor)

### Sistema

**Emails Automáticos**
- ✅ Email para admin ao criar solicitação
- ✅ Email para cliente ao processar nota (com PDF anexado)
- ✅ Templates HTML profissionais
- ✅ Fallback gracioso (não quebra se email falhar)

**UI/UX**
- ✅ Design responsivo (mobile + desktop)
- ✅ Dark mode suportado
- ✅ Componentes Shadcn/ui (Card, Button, Input, Select, Table, etc)
- ✅ AlertDialog ao invés de confirm() do browser
- ✅ Toasts de notificação (Sonner)
- ✅ Loading states
- ✅ Skeleton loaders

**Validação e Máscaras**
- ✅ Zod schemas para validação
- ✅ Máscaras: telefone, CNPJ, CEP, moeda
- ✅ Validação client-side e server-side

**Segurança**
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ CORS configurado
- ✅ Validação de entrada (Zod)

---

## ⚠️ Issues Conhecidos

### Críticos (Resolver Urgente)

1. **Arquivos em filesystem efêmero (Render)**
   - **Problema:** PDFs são salvos em `/uploads` que é apagado ao reiniciar
   - **Impacto:** Perda de todas as notas fiscais ao redeploy
   - **Solução:** Migrar para Cloudinary (25 GB grátis)
   - **Prioridade:** 🔴 ALTA

2. **Banco Neon suspende automaticamente**
   - **Problema:** Após inatividade, banco entra em SUSPENDED
   - **Impacto:** Primeiras requisições falham até banco acordar (~5-10s)
   - **Solução:** Implementar health check ou upgrade para plano pago
   - **Prioridade:** 🟡 MÉDIA

### Menores

3. **Rota /seed/create-operational não carrega**
   - **Problema:** Rota não registrada corretamente após deploy
   - **Workaround:** Criar usuário via SQL direto no Neon
   - **Solução:** Investigar ordem de importação das rotas
   - **Prioridade:** 🟢 BAIXA

4. **Informações de usuário hardcoded nos sidebars**
   - **Problema:** Email e nome são fixos ("Usuário", "usuario@email.com")
   - **Solução:** Buscar dados reais do usuário logado
   - **Prioridade:** 🟡 MÉDIA

5. **DevRoleSwitcher ainda presente**
   - **Problema:** Componente de dev ainda renderiza em produção
   - **Solução:** Garantir que `import.meta.env.PROD` funciona
   - **Prioridade:** 🟢 BAIXA

---

## 🚀 Próximos Passos

### Urgentes

1. **Migrar upload para Cloudinary**
   - Criar conta no Cloudinary
   - Instalar SDK
   - Atualizar código de upload
   - Testar upload/download
   - Migrar arquivos existentes (se houver)

2. **Buscar dados reais do usuário**
   - Criar endpoint `/users/me`
   - Buscar dados ao carregar sidebar
   - Exibir nome e email reais
   - Cache no Recoil state

3. **Implementar recuperação de senha**
   - Endpoint `/auth/forgot-password`
   - Endpoint `/auth/reset-password`
   - Email com link de reset
   - Página de reset no frontend

### Melhorias

4. **Dashboard com dados reais**
   - Gráficos dinâmicos (Chart.js ou Recharts)
   - Filtros por período
   - Exportar relatórios

5. **Edição de empresa**
   - Página de edição
   - Validação
   - Atualização

6. **Pesquisa e filtros**
   - Buscar solicitações por nome da empresa
   - Filtrar por período, status
   - Paginação

7. **Notificações em tempo real**
   - WebSockets ou Server-Sent Events
   - Notificar operacional de nova solicitação
   - Notificar cliente de nota processada

8. **Logs e auditoria**
   - Registrar todas ações (criar, editar, deletar)
   - Histórico de alterações
   - Logs de acesso

### Futuro

9. **Multi-tenant**
   - Suporte para múltiplos escritórios contábeis
   - Isolamento de dados
   - Gerenciamento de permissões

10. **Integração fiscal**
    - API da Receita Federal (validar CNPJ)
    - Emissão automática de nota (API NF-e)
    - Validação de documentos

11. **Mobile app**
    - React Native
    - Push notifications
    - Upload de documentos via câmera

---

## 📝 Scripts Úteis

### Criar Usuário Operacional (SQL)

Execute no **SQL Editor do Neon**:

```sql
-- Criar ou atualizar usuário operacional
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'iaappcontabil@gmail.com',
  '$2b$10$oY5rqt/u8FYWrH/6rHVwjekelkiZcVFiVWOgPHOegDwSBMPOF5ODm',
  'Operacional IAContabil',
  'OPERACIONAL',
  NOW(),
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  password = EXCLUDED.password,
  role = 'OPERACIONAL',
  "updatedAt" = NOW();

-- Verificar
SELECT id, email, name, role FROM users WHERE email = 'iaappcontabil@gmail.com';
```

### Build Local

```bash
# Frontend
cd iacontabil
npm run build
npm run preview

# Backend
cd iacontabil-api
npm run build
npm start
```

### Prisma

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar migration
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Deploy migrations (produção)
npm run prisma:deploy
```

---

## 🔗 Links Importantes

- **Frontend (Produção):** https://ia-app-contabil-front-jl4ibv4t9-jmmelons-projects.vercel.app/
- **Backend (Produção):** https://iacontabil-api.onrender.com
- **Health Check:** https://iacontabil-api.onrender.com/health

**Dashboards:**
- Vercel: https://vercel.com/dashboard
- Render: https://dashboard.render.com
- Neon: https://console.neon.tech
- Resend: https://resend.com/emails

**Repositórios:**
- Frontend: https://github.com/JMMeloN/ia-app-contabil-front
- Backend: https://github.com/JMMeloN/ia-app-contabil-api

---

## 👥 Equipe

- **Desenvolvedor:** JMMeloN
- **IA Assistant:** Claude Code (Anthropic)

---

## 📄 Licença

ISC

---

**Última Atualização:** 17 de dezembro de 2025, 19:45 BRT
