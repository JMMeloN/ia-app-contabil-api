# 🚀 Guia de Início Rápido

## Passo 1: Subir o banco de dados PostgreSQL

```bash
docker-compose up -d
```

Isso vai criar um container PostgreSQL com:
- **Usuário**: iacontabil
- **Senha**: iacontabil123
- **Banco**: iacontabil
- **Porta**: 5432

## Passo 2: Instalar dependências

```bash
npm install
```

## Passo 3: Configurar Prisma

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar tabelas no banco
npm run prisma:migrate

# Popular banco com dados de teste
npm run prisma:seed
```

## Passo 4: Iniciar o servidor

```bash
npm run dev
```

O servidor estará rodando em: **http://localhost:3333**

## 🧪 Testar a API

### 1. Fazer login

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@iacontabil.com",
    "password": "cliente123"
  }'
```

**Resposta:**
```json
{
  "user": {
    "id": "...",
    "email": "cliente@iacontabil.com",
    "name": "João Silva",
    "role": "CLIENTE",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Listar empresas (copie o token do login)

```bash
curl -X GET http://localhost:3333/companies \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Listar solicitações

```bash
curl -X GET http://localhost:3333/requests \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 👤 Usuários de Teste

Após rodar o seed, você terá:

**Cliente:**
- Email: `cliente@iacontabil.com`
- Senha: `cliente123`
- Role: `CLIENTE`

**Operacional:**
- Email: `operacional@iacontabil.com`
- Senha: `operacional123`
- Role: `OPERACIONAL`

**Admin:**
- Email: `admin@iacontabil.com`
- Senha: `admin123`
- Role: `ADMIN`

## 🔧 Comandos Úteis

```bash
# Ver logs do banco
docker-compose logs -f postgres

# Parar o banco
docker-compose down

# Parar o banco e remover volumes (apaga os dados)
docker-compose down -v

# Abrir Prisma Studio (visualizador de dados)
npm run prisma:studio

# Rebuild do projeto
npm run build

# Rodar em produção
npm start
```

## 🌐 Integração com Frontend

O frontend React já está configurado para se conectar na API. Certifique-se de:

1. Backend rodando em `http://localhost:3333`
2. Frontend rodando em `http://localhost:3000`
3. CORS está configurado para aceitar requisições do frontend

## ✅ Checklist

- [ ] Docker instalado e rodando
- [ ] PostgreSQL iniciado (`docker-compose up -d`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Prisma configurado (`npm run prisma:generate && npm run prisma:migrate`)
- [ ] Banco populado (`npm run prisma:seed`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Teste de login funcionando

## 🐛 Problemas Comuns

### Erro: "Port 5432 already in use"
- Você já tem um PostgreSQL rodando localmente
- Solução: Pare o PostgreSQL local ou mude a porta no `docker-compose.yml`

### Erro: "Can't reach database server"
- O container do PostgreSQL não está rodando
- Solução: `docker-compose up -d`

### Erro ao rodar migrations
- O banco pode não estar pronto ainda
- Solução: Aguarde alguns segundos e tente novamente

## 📚 Próximos Passos

Agora você pode:
- Explorar os endpoints da API
- Conectar o frontend React
- Adicionar novos recursos
- Implementar testes

Para mais detalhes, consulte o [README.md](./README.md)
