# Arquitetura & Contrato da API — IAContabil

## 1. Visão Geral das Camadas (Clean Architecture)

```mermaid
flowchart TD
    subgraph CLIENT["Cliente HTTP"]
        HTTP["Browser / App / Postman"]
    end

    subgraph MAIN["Camada Main (src/main)"]
        SERVER["server.ts\nExpress App + CORS"]
        MW_AUTH["authMiddleware\nValida JWT → req.user"]
        MW_ROLE["roleMiddleware\nCLIENTE | OPERACIONAL | ADMIN"]
        ROUTES["Routes\n/auth /companies /requests\n/payers /upload /nbs /cnaes /users"]
        FACTORIES["Factories\nInjeção de Dependência"]
    end

    subgraph DOMAIN["Camada Domain (src/domain)"]
        MODELS["Models\nUserModel · CompanyModel\nRequestModel · PayerModel\nCnaeModel · NbsModel"]
        UC_IFACE["UseCase Interfaces\nLoginUseCase · RegisterUseCase\nCreateRequestUseCase · EmitInvoiceUseCase\n..."]
    end

    subgraph DATA["Camada Data (src/data)"]
        PROTOCOLS["Protocols (Interfaces)\nUserRepository · CompanyRepository\nRequestRepository · PayerRepository\nCnaeRepository · NbsRepository\nNFEIOService · CepService\nCnaeExternalService"]
        USECASES["UseCases (Db*)\nDbLogin · DbRegister\nDbCreateCompany · DbListCompanies\nDbCreateRequest · DbEmitInvoice\nDbCancelRequest · DbUpdateRequestStatus\nDbListCnaes · ..."]
    end

    subgraph INFRA["Camada Infra (src/infra)"]
        subgraph DB["db/prisma"]
            PRISMA_CLIENT["PrismaClient (singleton)"]
            REPO_USER["PrismaUserRepository"]
            REPO_COMP["PrismaCompanyRepository"]
            REPO_REQ["PrismaRequestRepository"]
            REPO_PAY["PrismaPayerRepository"]
            REPO_CNAE["PrismaCnaeRepository"]
            REPO_NBS["PrismaNbsRepository"]
        end
        subgraph EXT["external / integrations"]
            NFEIO["NFEIOService\napi.nfe.io/v1"]
            VIACEP["ViaCepService\nviacep.com.br"]
            CNAE_API["CnaeApiService\napi.listacnae.com.br"]
            RESEND["ResendEmailService\napi.resend.com"]
            CLOUDINARY["Cloudinary\n(via multer-storage)"]
        end
    end

    subgraph POSTGRES["PostgreSQL"]
        DB_TABLES["users · companies · requests\npayers · cnaes · nbs"]
    end

    HTTP --> SERVER
    SERVER --> MW_AUTH --> MW_ROLE --> ROUTES
    ROUTES --> FACTORIES
    FACTORIES --> USECASES
    USECASES --> PROTOCOLS
    PROTOCOLS -.implementado por.-> REPO_USER & REPO_COMP & REPO_REQ & REPO_PAY & REPO_CNAE & REPO_NBS
    PROTOCOLS -.implementado por.-> NFEIO & VIACEP & CNAE_API & RESEND
    REPO_USER & REPO_COMP & REPO_REQ & REPO_PAY & REPO_CNAE & REPO_NBS --> PRISMA_CLIENT --> DB_TABLES
    USECASES --> MODELS
    USECASES --> UC_IFACE
```

---

## 2. Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    users {
        TEXT id PK
        TEXT email UK
        TEXT password
        TEXT name
        UserRole role
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    companies {
        TEXT id PK
        TEXT nome
        TEXT nomeFantasia
        TEXT cnpj
        TEXT email
        TEXT telefone
        TEXT endereco
        TEXT rua
        TEXT numero
        TEXT bairro
        TEXT complemento
        TEXT cidade
        VARCHAR2 estado
        TEXT cep
        TIMESTAMP dataAbertura
        TEXT regimeTributario
        TEXT naturezaJuridica
        TEXT inscricaoMunicipal
        TEXT inscricaoEstadual
        TEXT regimeEspecialTributacao
        BIGINT numeroJuntaComercial
        TEXT rpsSerie
        BIGINT rpsNumero
        FLOAT aliquotaIss
        TEXT determinacaoImpostoFederal
        TEXT determinacaoImpostoMunicipal
        TEXT prefeituraLogin
        TEXT prefeituraSenha
        TEXT valorAutorizacao
        TEXT nfeioCompanyId UK
        TEXT cityServiceCode
        TEXT statusFiscal
        TEXT ambiente
        TEXT userId FK
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    requests {
        TEXT id PK
        FLOAT valor
        TIMESTAMP dataEmissao
        TEXT observacoes
        TEXT cnaeCode
        RequestStatus status
        TEXT arquivoUrl
        TEXT tomadorNome
        TEXT tomadorDocumento
        TEXT tomadorEmail
        TEXT nfeioInvoiceId
        TIMESTAMP processadoEm
        BOOLEAN emissaoAutomatica
        TEXT userId FK
        TEXT companyId FK
        TEXT payerId FK
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    payers {
        TEXT id PK
        TEXT name
        TEXT document
        TEXT email
        TEXT userId FK
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    cnaes {
        TEXT id PK
        TEXT codCnae UK
        TEXT descricaoCnae
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    nbs {
        TEXT id PK
        TEXT nbs UK
        TEXT descricaoNbs
        BOOLEAN psOnerosa
        BOOLEAN adqExterior
        TEXT indop
        TEXT localIncidencia
        TEXT cClassTrib
        TEXT nomeClassTrib
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    users ||--o{ companies : "possui"
    users ||--o{ requests : "solicita"
    users ||--o{ payers : "cadastra"
    companies ||--o{ requests : "emite"
    payers ||--o{ requests : "recebe (opcional)"
```

---

## 3. Fluxo de Autenticação

```mermaid
sequenceDiagram
    actor Cliente
    participant Route as /auth
    participant MW as authMiddleware
    participant UC as DbLogin / DbRegister
    participant Repo as PrismaUserRepository
    participant DB as PostgreSQL

    %% Register
    Cliente->>Route: POST /auth/register {email, password, name}
    Route->>UC: DbRegister.execute()
    UC->>Repo: findByEmail()
    Repo->>DB: SELECT
    DB-->>Repo: null (não existe)
    UC->>UC: bcrypt.hash(password, 10)
    UC->>Repo: create()
    Repo->>DB: INSERT users
    DB-->>Repo: UserModel
    Repo-->>UC: UserModel
    UC-->>Route: UserModel (sem password)
    Route-->>Cliente: 201 { user }

    %% Login
    Cliente->>Route: POST /auth/login {email, password}
    Route->>UC: DbLogin.execute()
    UC->>Repo: findByEmail()
    Repo->>DB: SELECT
    DB-->>Repo: UserWithPassword
    UC->>UC: bcrypt.compare(password, hash)
    UC->>UC: jwt.sign({userId, email, role})
    UC-->>Route: { user, accessToken, expiresAt }
    Route-->>Cliente: 200 { user, accessToken }

    %% Rota protegida
    Cliente->>MW: GET /auth/me (Bearer token)
    MW->>MW: jwt.verify(token)
    MW->>MW: popula req.user
    MW-->>Cliente: 200 { user }
```

---

## 4. Fluxo de Criação de Solicitação (com emissão automática)

```mermaid
sequenceDiagram
    actor Cliente
    participant Route as /requests
    participant UC as DbCreateRequest
    participant CompRepo as PrismaCompanyRepository
    participant ReqRepo as PrismaRequestRepository
    participant PayRepo as PrismaPayerRepository
    participant NFE as NFEIOService
    participant Email as ResendEmailService
    participant DB as PostgreSQL

    Cliente->>Route: POST /requests {valor, dataEmissao, companyId, emissaoAutomatica: true}
    Route->>UC: execute()

    UC->>CompRepo: findById(companyId)
    CompRepo->>DB: SELECT companies
    DB-->>CompRepo: Company

    UC->>UC: valida company.userId === req.userId

    alt payerId informado
        UC->>PayRepo: findById(payerId)
        PayRepo->>DB: SELECT payers
        DB-->>PayRepo: Payer
    else dados inline
        UC->>UC: usa tomadorNome / tomadorDocumento
    end

    UC->>ReqRepo: create(requestData)
    ReqRepo->>DB: INSERT requests
    DB-->>ReqRepo: Request (status=PENDENTE)

    alt emissaoAutomatica && company.nfeioCompanyId
        UC->>NFE: emitServiceInvoice(companyId, payload)
        NFE-->>UC: invoice {id, pdfUrl}

        UC->>ReqRepo: updateStatus(PROCESSADA, nfeioInvoiceId, arquivoUrl)
        ReqRepo->>DB: UPDATE requests

        UC->>NFE: getServiceInvoicePdfBinary()
        NFE-->>UC: pdfBuffer

        UC->>Email: send(cliente, nota-processada, anexo=pdf)
    else emissão manual
        UC->>Email: send(admin, nova-solicitacao)
    end

    UC-->>Route: Request
    Route-->>Cliente: 201 { request }
```

---

## 5. Fluxo de Emissão Manual de Nota

```mermaid
sequenceDiagram
    actor Operador
    participant Route as POST /requests/:id/emit-invoice
    participant MW as roleMiddleware
    participant UC as DbEmitInvoice
    participant ReqRepo as PrismaRequestRepository
    participant CompRepo as PrismaCompanyRepository
    participant NFE as NFEIOService
    participant Email as ResendEmailService
    participant DB as PostgreSQL

    Operador->>Route: POST /requests/:id/emit-invoice
    Route->>MW: verifica role OPERACIONAL|ADMIN
    MW-->>Route: ok

    Route->>UC: execute({requestId, userId})
    UC->>ReqRepo: findById(requestId)
    ReqRepo->>DB: SELECT requests JOIN company JOIN payer
    DB-->>ReqRepo: Request completo

    UC->>UC: valida company.nfeioCompanyId existe

    UC->>NFE: emitServiceInvoice(nfeioCompanyId, payload)
    NFE-->>UC: invoice {id, status, pdfUrl}

    UC->>ReqRepo: updateStatus(PROCESSADA, nfeioInvoiceId, arquivoUrl, processadoEm)
    ReqRepo->>DB: UPDATE requests

    UC->>NFE: getServiceInvoicePdfBinary()
    NFE-->>UC: pdfBuffer

    UC->>Email: send(tomador, nota-processada, pdfBuffer)
    Email-->>UC: ok

    UC-->>Route: Request atualizado
    Route-->>Operador: 200 { request }
```

---

## 6. Fluxo de CNAEs (Cache-First com BD Local)

```mermaid
sequenceDiagram
    actor User
    participant Route as GET /cnaes
    participant UC as DbListCnaes
    participant Repo as PrismaCnaeRepository
    participant API as CnaeApiService
    participant DB as PostgreSQL
    participant EXT as api.listacnae.com.br

    User->>Route: GET /cnaes?search=soja
    Route->>UC: execute("soja")

    UC->>Repo: count()
    Repo->>DB: SELECT COUNT(*) FROM cnaes
    DB-->>Repo: count

    alt count == 0 (banco vazio)
        UC->>API: fetchAll()
        API->>EXT: GET /todosCnaes (Bearer token)
        EXT-->>API: [{codigo, descricao}, ...]
        API-->>UC: [{codCnae, descricaoCnae}, ...]
        UC->>Repo: createMany(data, skipDuplicates)
        Repo->>DB: INSERT INTO cnaes
    end

    UC->>Repo: findAll("soja")
    Repo->>DB: SELECT WHERE codCnae ILIKE '%soja%' OR descricaoCnae ILIKE '%soja%'
    DB-->>Repo: CnaeModel[]
    Repo-->>UC: CnaeModel[]
    UC-->>Route: CnaeModel[]
    Route-->>User: 200 [{ id, codCnae, descricaoCnae }]
```

---

## 7. Fluxo de Upload de PDF

```mermaid
sequenceDiagram
    actor Operador
    participant Route as POST /upload/:requestId
    participant Multer as multer + CloudinaryStorage
    participant Cloud as Cloudinary CDN
    participant UC as DbUpdateRequestStatus
    participant Repo as PrismaRequestRepository
    participant Email as ResendEmailService
    participant DB as PostgreSQL

    Operador->>Route: POST /upload/:requestId (multipart/form-data, field=file)
    Route->>Multer: intercepta arquivo
    Multer->>Multer: valida mimetype=application/pdf, max 10MB
    Multer->>Cloud: upload para pasta notas-fiscais/
    Cloud-->>Multer: { secure_url }
    Multer-->>Route: req.file.path = secure_url

    Route->>UC: execute({requestId, status: PROCESSADA, arquivoUrl})
    UC->>Repo: findById(requestId)
    Repo->>DB: SELECT requests
    DB-->>Repo: Request

    UC->>Repo: updateStatus(PROCESSADA, arquivoUrl, processadoEm)
    Repo->>DB: UPDATE requests
    DB-->>Repo: Request atualizado

    UC->>Email: send(tomador, nota-processada)
    Email-->>UC: ok

    UC-->>Route: Request
    Route-->>Operador: 200 { request }
```

---

## 8. Mapa Completo de Dependências por Camada

```mermaid
flowchart LR
    subgraph ROUTES["Routes"]
        R1["/auth"]
        R2["/companies"]
        R3["/requests"]
        R4["/payers"]
        R5["/upload"]
        R6["/cnaes"]
        R7["/nbs"]
        R8["/users"]
    end

    subgraph FACTORIES["Factories"]
        F1["makeLoginUseCase\nmakeRegisterUseCase\nmakeUpdateProfileUseCase\nmakeChangePasswordUseCase"]
        F2["makeCreateCompanyUseCase\nmakeListCompaniesUseCase\nmakeUpdateCompanyUseCase\nmakeDeleteCompanyUseCase\nmakeUploadCertificateUseCase"]
        F3["makeCreateRequestUseCase\nmakeListRequestsUseCase\nmakeGetRequestByIdUseCase\nmakeUpdateRequestStatusUseCase\nmakeCancelRequestUseCase\nmakeEmitInvoiceUseCase\nmakeCancelNfeioInvoiceUseCase\nmakeGetInvoicePdfUrlUseCase"]
        F4["makeEmailService"]
    end

    subgraph USECASES["Data UseCases"]
        U1["DbLogin\nDbRegister\nDbUpdateProfile\nDbChangePassword"]
        U2["DbCreateCompany\nDbListCompanies\nDbUpdateCompany\nDbDeleteCompany\nDbUploadCertificate"]
        U3["DbCreateRequest\nDbListRequests\nDbGetRequestById\nDbUpdateRequestStatus\nDbCancelRequest\nDbEmitInvoice\nDbCancelNfeioInvoice\nDbGetInvoicePdfUrl"]
        U4["DbListCnaes"]
    end

    subgraph REPOS["Repositories"]
        P1["PrismaUserRepository"]
        P2["PrismaCompanyRepository"]
        P3["PrismaRequestRepository"]
        P4["PrismaPayerRepository"]
        P5["PrismaCnaeRepository"]
        P6["PrismaNbsRepository"]
    end

    subgraph SERVICES["External Services"]
        S1["NFEIOService"]
        S2["ResendEmailService"]
        S3["ViaCepService"]
        S4["CnaeApiService"]
    end

    R1 --> F1 --> U1 --> P1
    R2 --> F2 --> U2 --> P2
    U2 --> S1 & S3
    R3 --> F3 --> U3 --> P3 & P2 & P4
    U3 --> S1 & S2
    R4 --> P4
    R5 --> U3
    R6 --> U4 --> P5 & S4
    R7 --> P6
    R8 --> F1
```

---

## 9. Roles e Permissões por Endpoint

```mermaid
flowchart TD
    REQ["Requisição HTTP"]
    AUTH{"authMiddleware\nJWT válido?"}
    ROLE{"roleMiddleware\nRole permitida?"}
    UC["UseCase / Repository"]

    REQ --> AUTH
    AUTH -- "401 Unauthorized" --> ERR1["Token ausente\nToken expirado\nToken inválido"]
    AUTH -- ok --> ROLE
    ROLE -- "403 Forbidden" --> ERR2["Role insuficiente"]
    ROLE -- ok --> UC

    subgraph PERMISSOES["Mapa de Permissões"]
        direction LR
        C["CLIENTE"]
        O["OPERACIONAL"]
        A["ADMIN"]

        C --> CE1["POST /requests\nDELETE /requests/:id/cancel\nGET /companies (próprias)\nPOST /companies\nPUT /companies/:id\nDELETE /companies/:id\nGET /payers (próprios)\nPOST PUT DELETE /payers"]

        O --> OE1["GET /requests (todas)\nGET /requests/:id\nPATCH /requests/:id/status\nPOST /requests/:id/emit-invoice\nPOST /requests/:id/cancel-nfeio\nPOST /upload/:requestId\nPOST PUT /cnaes\nPOST /cnaes/import\nPOST PUT /nbs"]

        A --> AE1["Tudo de OPERACIONAL\nDELETE /cnaes/:id\nDELETE /nbs/:id\n/seed"]
    end
```

---

## 10. Contrato da API

### Base URL
```
http://localhost:3333
```

### Autenticação
Todos os endpoints (exceto `/auth/register` e `/auth/login`) exigem:
```
Authorization: Bearer <jwt_token>
```

---

### `/auth` — Autenticação

#### `POST /auth/register`
Cria um novo usuário.

**Body:**
```json
{
  "email": "string (email válido)",
  "password": "string (mín. 1 char)",
  "name": "string (mín. 2 chars)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "role": "CLIENTE",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Erros:** `400` dados inválidos · `409` email já cadastrado

---

#### `POST /auth/login`
Autentica e retorna JWT.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "CLIENTE | OPERACIONAL | ADMIN"
  },
  "accessToken": "jwt_string",
  "accessTokenExpiresAt": "ISO8601"
}
```

**Erros:** `400` dados inválidos · `401` credenciais incorretas

---

#### `GET /auth/me`
Retorna o usuário autenticado.

**Response 200:**
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "role": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### `/users` — Perfil

#### `PUT /users/profile`
Atualiza nome e/ou email.

**Body:**
```json
{
  "name": "string (opcional)",
  "email": "string email (opcional)"
}
```

**Response 200:** `UserModel`

---

#### `PUT /users/password`
Altera a senha.

**Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response 200:** `{ "message": "Senha alterada com sucesso" }`

**Erros:** `400` senha atual incorreta

---

### `/companies` — Empresas

#### `GET /companies`
Lista empresas do usuário autenticado.

**Response 200:** `CompanyModel[]`

---

#### `POST /companies`
Cadastra nova empresa.

**Body:**
```json
{
  "nome": "string",
  "cnpj": "string",
  "email": "string",
  "telefone": "string",
  "endereco": "string",
  "cidade": "string",
  "estado": "string (2 chars)",
  "cep": "string",
  "nomeFantasia": "string (opcional)",
  "regimeTributario": "string (opcional)",
  "inscricaoMunicipal": "string (opcional)",
  "inscricaoEstadual": "string (opcional)",
  "aliquotaIss": "number (opcional)",
  "emissaoAutomatica": "boolean (opcional)"
}
```

**Response 201:** `CompanyModel`

**Erros:** `409` CNPJ já cadastrado para este usuário

---

#### `PUT /companies/:id`
Atualiza empresa. Mesmos campos do POST (todos opcionais).

**Response 200:** `CompanyModel`

**Erros:** `404` empresa não encontrada

---

#### `DELETE /companies/:id`
Remove empresa e cascateia deleção de solicitações.

**Response 204**

---

#### `POST /companies/:id/certificate`
Envia certificado digital A1 para a NFe.io.

**Body:** `multipart/form-data`, campo `certificate` (arquivo `.pfx`/`.p12`, máx 2MB), campo `password`.

**Response 200:** `CompanyModel`

---

### `/requests` — Solicitações

#### `GET /requests`
Lista solicitações.

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `status` | `PENDENTE \| PROCESSADA \| CANCELADA` | Filtro por status |
| `userId` | `uuid` | Apenas OPERACIONAL/ADMIN |

**Comportamento:** CLIENTE vê apenas as suas; OPERACIONAL/ADMIN vê todas.

**Response 200:** `RequestModel[]`

---

#### `GET /requests/:id`
Busca solicitação por ID.

**Response 200:** `RequestModel`

**Erros:** `403` sem permissão · `404` não encontrada

---

#### `POST /requests`
Cria solicitação. **Apenas CLIENTE.**

**Body:**
```json
{
  "valor": "number (positivo)",
  "dataEmissao": "ISO8601",
  "companyId": "uuid",
  "observacoes": "string (opcional)",
  "cnaeCode": "string (opcional)",
  "emissaoAutomatica": "boolean (opcional, default false)",
  "payerId": "uuid (opcional)",
  "tomadorNome": "string (opcional)",
  "tomadorDocumento": "string (opcional)",
  "tomadorEmail": "string (opcional)"
}
```

**Response 201:** `RequestModel`

---

#### `PATCH /requests/:id/status`
Atualiza status. **Apenas OPERACIONAL/ADMIN.**

**Body:**
```json
{
  "status": "PENDENTE | PROCESSADA | CANCELADA",
  "arquivoUrl": "string url (opcional)"
}
```

**Response 200:** `RequestModel`

---

#### `DELETE /requests/:id/cancel`
Cancela solicitação. **Apenas CLIENTE (dono).**

**Response 200:** `RequestModel`

**Erros:** `400` já cancelada · `400` processada sem NFe.io · `403` sem permissão

---

#### `POST /requests/:id/emit-invoice`
Emite nota na NFe.io. **Apenas OPERACIONAL/ADMIN.**

**Body (opcional):**
```json
{
  "cityServiceCode": "string (opcional)",
  "cnaeCode": "string (opcional)"
}
```

**Response 200:** `RequestModel`

**Erros:** `400` empresa sem nfeioCompanyId

---

#### `POST /requests/:id/cancel-nfeio`
Cancela nota na NFe.io. **Apenas OPERACIONAL/ADMIN.**

**Response 200:** `RequestModel`

---

#### `GET /requests/:id/invoice-pdf`
Retorna PDF da nota fiscal.

**Comportamento:** Tenta URL armazenada → NFe.io redirect → buffer binário inline.

**Response:** `302 redirect` ou `200 application/pdf`

---

### `/upload` — Upload de PDF

#### `POST /upload/:requestId`
Envia PDF da nota para Cloudinary. **Apenas OPERACIONAL/ADMIN.**

**Body:** `multipart/form-data`, campo `file` (PDF, máx 10MB).

**Response 200:** `RequestModel` com `arquivoUrl` atualizada.

---

### `/payers` — Tomadores

#### `GET /payers`
Lista tomadores do usuário autenticado.

**Response 200:** `PayerModel[]`

---

#### `POST /payers`
Cadastra tomador.

**Body:**
```json
{
  "name": "string (mín. 2 chars)",
  "document": "string (CPF ou CNPJ, mín. 11 dígitos)",
  "email": "string email (opcional)"
}
```

**Response 201:** `PayerModel`

**Erros:** `409` documento já cadastrado para este usuário

---

#### `PUT /payers/:id`
Atualiza tomador. Mesmos campos do POST (todos opcionais).

**Response 200:** `PayerModel`

---

#### `DELETE /payers/:id`
Remove tomador.

**Response 204**

---

### `/cnaes` — CNAEs

#### `GET /cnaes`
Lista CNAEs. Verifica banco local primeiro; se vazio, busca na API externa e persiste.

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `search` | `string` | Filtra por código ou descrição (case-insensitive) |

**Response 200:** `CnaeModel[]`

---

#### `GET /cnaes/:id`
Busca CNAE por ID.

**Response 200:** `CnaeModel`

**Erros:** `404`

---

#### `POST /cnaes`
Cadastra CNAE. **Apenas OPERACIONAL/ADMIN.**

**Body:**
```json
{
  "codCnae": "string (somente números)",
  "descricaoCnae": "string"
}
```

**Response 201:** `CnaeModel`

**Erros:** `409` código já existe

---

#### `POST /cnaes/import`
Importa lista de CNAEs em lote. **Apenas OPERACIONAL/ADMIN.** Duplicatas são ignoradas (`skipDuplicates`).

**Body:**
```json
[
  { "codCnae": "string", "descricaoCnae": "string" }
]
```

**Response 201:**
```json
{ "imported": 14 }
```

---

#### `PUT /cnaes/:id`
Atualiza CNAE. **Apenas OPERACIONAL/ADMIN.**

**Body:** campos opcionais `codCnae`, `descricaoCnae`.

**Response 200:** `CnaeModel`

---

#### `DELETE /cnaes/:id`
Remove CNAE. **Apenas ADMIN.**

**Response 204**

---

### `/nbs` — Nomenclatura Brasileira de Serviços

#### `GET /nbs`
Lista todos os registros NBS.

**Response 200:** `NbsModel[]`

---

#### `GET /nbs/:id`
Busca NBS por ID.

**Response 200:** `NbsModel`

**Erros:** `404`

---

#### `POST /nbs`
Cadastra NBS. **Apenas OPERACIONAL/ADMIN.**

**Body:**
```json
{
  "nbs": "string (ex: 1.1502.10.00)",
  "descricaoNbs": "string",
  "psOnerosa": "boolean (opcional)",
  "adqExterior": "boolean (opcional)",
  "indop": "string (ex: 100501)",
  "localIncidencia": "string",
  "cClassTrib": "string (ex: 000001)",
  "nomeClassTrib": "string"
}
```

**Response 201:** `NbsModel`

**Erros:** `409` código NBS já existe

---

#### `PUT /nbs/:id`
Atualiza NBS. **Apenas OPERACIONAL/ADMIN.** Todos os campos opcionais.

**Response 200:** `NbsModel`

---

#### `DELETE /nbs/:id`
Remove NBS. **Apenas ADMIN.**

**Response 204**

---

## 11. Modelos de Resposta (Tipos)

```typescript
// UserModel
{
  id: string
  email: string
  name: string
  role: "CLIENTE" | "OPERACIONAL" | "ADMIN"
  createdAt: string // ISO8601
  updatedAt: string // ISO8601
}

// CompanyModel
{
  id: string
  nome: string
  nomeFantasia?: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  nfeioCompanyId?: string
  userId: string
  createdAt: string
  updatedAt: string
}

// RequestModel
{
  id: string
  valor: number
  dataEmissao: string // ISO8601
  observacoes?: string
  cnaeCode?: string
  status: "PENDENTE" | "PROCESSADA" | "CANCELADA"
  arquivoUrl?: string
  tomadorNome?: string
  tomadorDocumento?: string
  tomadorEmail?: string
  nfeioInvoiceId?: string
  processadoEm?: string
  emissaoAutomatica: boolean
  userId: string
  companyId: string
  payerId?: string
  createdAt: string
  updatedAt: string
}

// PayerModel
{
  id: string
  name: string
  document: string
  email?: string
  userId: string
  createdAt: string
  updatedAt: string
}

// CnaeModel
{
  id: string
  codCnae: string
  descricaoCnae: string
  createdAt: string
  updatedAt: string
}

// NbsModel
{
  id: string
  nbs: string
  descricaoNbs: string
  psOnerosa?: boolean
  adqExterior?: boolean
  indop: string
  localIncidencia: string
  cClassTrib: string
  nomeClassTrib: string
  createdAt: string
  updatedAt: string
}
```

---

## 12. Códigos de Erro Padrão

| HTTP | Significado |
|---|---|
| `400` | Dados inválidos (Zod) ou regra de negócio violada |
| `401` | Token ausente, expirado ou inválido |
| `403` | Role insuficiente ou recurso não pertence ao usuário |
| `404` | Recurso não encontrado |
| `409` | Conflito — duplicidade (email, CNPJ, código, documento) |
| `500` | Erro interno do servidor |
