# 🎉 API Completa - Todas as Funcionalidades

## ✅ Funcionalidades Implementadas

### 🔐 Autenticação
- ✅ POST `/auth/register` - Registro de usuários
- ✅ POST `/auth/login` - Login com JWT

### 👤 Perfil de Usuário
- ✅ PUT `/users/profile` - Atualizar perfil (nome, email)
- ✅ PUT `/users/password` - Trocar senha

### 🏢 Empresas (CRUD Completo)
- ✅ GET `/companies` - Listar empresas do usuário
- ✅ POST `/companies` - Cadastrar nova empresa
- ✅ PUT `/companies/:id` - Atualizar empresa
- ✅ DELETE `/companies/:id` - Deletar empresa

### 📄 Solicitações de Notas Fiscais
- ✅ GET `/requests` - Listar solicitações (filtro por status)
- ✅ POST `/requests` - Criar solicitação (CLIENTE)
- ✅ PATCH `/requests/:id/status` - Atualizar status (OPERACIONAL/ADMIN)
- ✅ DELETE `/requests/:id/cancel` - Cancelar solicitação (CLIENTE)

### 📎 Upload e Download de Arquivos
- ✅ POST `/upload/:requestId` - Upload de nota fiscal PDF (OPERACIONAL/ADMIN)
- ✅ GET `/files/:filename` - Download de arquivo (autenticado)
- ✅ Limitação: apenas PDFs, máximo 5MB

## 📡 Detalhes dos Endpoints

### Perfil de Usuário

#### PUT /users/profile
Atualizar informações do perfil

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Novo Nome",
  "email": "novo@email.com"
}
```

#### PUT /users/password
Trocar senha

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "currentPassword": "senha-atual",
  "newPassword": "nova-senha"
}
```

### Empresas

#### PUT /companies/:id
Atualizar empresa

**Headers:**
```
Authorization: Bearer {token}
```

**Body (todos os campos opcionais):**
```json
{
  "nome": "Novo Nome",
  "email": "novo@email.com",
  "telefone": "(11) 99999-8888"
}
```

#### DELETE /companies/:id
Deletar empresa

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** 204 No Content

### Solicitações

#### DELETE /requests/:id/cancel
Cancelar solicitação (apenas o próprio cliente que criou)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "CANCELADA",
  ...
}
```

**Regras:**
- Apenas o cliente que criou pode cancelar
- Não pode cancelar se já está PROCESSADA
- Não pode cancelar se já está CANCELADA

### Upload de Arquivos

#### POST /upload/:requestId
Upload de nota fiscal PDF (apenas OPERACIONAL e ADMIN)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
file: [arquivo.pdf]
```

**Response:**
```json
{
  "message": "Arquivo enviado com sucesso",
  "request": {
    "id": "uuid",
    "status": "PROCESSADA",
    "arquivoUrl": "http://localhost:3333/files/nota-123456789.pdf",
    ...
  }
}
```

**Regras:**
- Apenas arquivos PDF
- Tamanho máximo: 5MB
- Automaticamente muda o status da solicitação para PROCESSADA
- Gera URL pública para download

#### GET /files/:filename
Download de arquivo

**Response:** Arquivo PDF (download automático)

## 🔒 Controle de Acesso

### CLIENTE
- ✅ Gerenciar empresas (CRUD)
- ✅ Criar solicitações
- ✅ Ver apenas suas próprias solicitações
- ✅ Cancelar suas próprias solicitações (se pendentes)
- ✅ Atualizar perfil e senha

### OPERACIONAL
- ✅ Ver TODAS as solicitações
- ✅ Fazer upload de notas fiscais
- ✅ Alterar status das solicitações
- ✅ Atualizar perfil e senha

### ADMIN
- ✅ Todos os acessos de OPERACIONAL
- ✅ Acesso total ao sistema

## 📝 Exemplos de Uso

### 1. Atualizar Nome do Usuário

```bash
curl -X PUT http://localhost:3333/users/profile \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Santos"
  }'
```

### 2. Trocar Senha

```bash
curl -X PUT http://localhost:3333/users/password \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "senha123",
    "newPassword": "novaSenha456"
  }'
```

### 3. Atualizar Empresa

```bash
curl -X PUT http://localhost:3333/companies/UUID_DA_EMPRESA \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "(11) 98888-7777",
    "email": "novoemail@empresa.com"
  }'
```

### 4. Deletar Empresa

```bash
curl -X DELETE http://localhost:3333/companies/UUID_DA_EMPRESA \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 5. Cancelar Solicitação

```bash
curl -X DELETE http://localhost:3333/requests/UUID_DA_SOLICITACAO/cancel \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 6. Upload de Nota Fiscal

```bash
curl -X POST http://localhost:3333/upload/UUID_DA_SOLICITACAO \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@/caminho/para/nota.pdf"
```

### 7. Download de Nota Fiscal

```bash
curl -X GET http://localhost:3333/files/nota-123456789.pdf \
  -H "Authorization: Bearer SEU_TOKEN" \
  --output nota.pdf
```

## 🚀 Próximos Passos (Opcionais)

- [ ] Paginação nas listagens
- [ ] Busca e filtros avançados
- [ ] Notificações por email
- [ ] Refresh token
- [ ] Logs estruturados
- [ ] Testes automatizados
- [ ] Documentação Swagger/OpenAPI
- [ ] Rate limiting
- [ ] Compressão de arquivos

## 🎊 API 100% Funcional!

Todas as funcionalidades principais foram implementadas com:
- ✅ Clean Architecture
- ✅ Validações com Zod
- ✅ Controle de acesso por perfil
- ✅ Upload/Download de arquivos
- ✅ Segurança com JWT
- ✅ Tratamento de erros
- ✅ CRUD completo
