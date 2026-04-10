# Blog API — The Margin

REST API para o blog **The Margin**, construída com Node.js, Prisma e SQLite.

## Stack

- **Runtime**: Node.js (latest)
- **Framework**: Express 4
- **ORM**: Prisma (latest)
- **Banco de dados**: SQLite
- **Linguagem**: TypeScript 5
- **Validação**: Zod
- **Build**: tsx (dev) + tsc (prod)

## Arquitetura

```
src/
├── domain/                         # Regras de negócio puras
│   ├── entities/                   # Tipos das entidades (Post, Author, Tag)
│   └── interfaces/
│       ├── repositories/           # Contratos dos repositórios (inversão de dependência)
│       └── services/               # Contratos dos services
│
├── application/                    # Casos de uso
│   └── services/                   # Implementações dos services (PostService, etc.)
│
├── infrastructure/                 # Detalhes de implementação
│   ├── database/                   # Prisma client singleton
│   └── repositories/               # Implementações Prisma dos repositórios
│
├── presentation/                   # Camada HTTP
│   ├── controllers/                # Recebem Request, delegam ao service, enviam Response
│   ├── routes/                     # Mapeamento de rotas → controllers
│   └── middlewares/                # errorHandler, requestLogger
│
├── shared/
│   ├── errors/                     # AppError, NotFoundError, ConflictError, ValidationError
│   └── utils/                      # Schemas Zod de validação
│
├── app.ts                          # Factory da aplicação Express (DI manual)
└── server.ts                       # Bootstrap + graceful shutdown
```

## Começando

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

O `.env.example` já vem com valores padrão para desenvolvimento local:

```env
DATABASE_URL="file:./dev.db"
PORT=3333
NODE_ENV=development
```

### 3. Gerar o Prisma client e criar o banco

```bash
npm run db:generate   # gera o client TypeScript do Prisma
npm run db:migrate    # aplica as migrations e cria o SQLite via libsql
```

### 4. Popular o banco com dados iniciais

```bash
npm run db:seed
```

Isso cria 3 autores, 15 tags e 5 posts completos (os mesmos do frontend).

### 5. Iniciar em modo desenvolvimento

```bash
npm run dev
```

O servidor sobe em `http://localhost:3333` com hot-reload via `tsx watch`.

---

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia com hot-reload (tsx watch) |
| `npm run build` | Compila TypeScript para `/dist` |
| `npm run start` | Inicia a build compilada |
| `npm run db:migrate` | Cria/atualiza o banco com as migrations |
| `npm run db:generate` | Regenera o Prisma client |
| `npm run db:seed` | Popula o banco com dados iniciais |
| `npm run db:studio` | Abre o Prisma Studio (GUI do banco) |
| `npm run db:reset` | Reseta o banco e re-executa o seed |

---

## Endpoints

### Health

```
GET /health
```

---

### Posts

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/posts` | Lista posts com paginação e filtros |
| `GET` | `/api/posts/featured` | Retorna o post em destaque |
| `GET` | `/api/posts/:id` | Busca post por ID |
| `GET` | `/api/posts/slug/:slug` | Busca post por slug |
| `POST` | `/api/posts` | Cria novo post |
| `PATCH` | `/api/posts/:id` | Atualiza post |
| `DELETE` | `/api/posts/:id` | Remove post |

**Query params de `/api/posts`:**

| Param | Tipo | Exemplo |
|-------|------|---------|
| `category` | string | `Essay`, `Practice`, `Work`, `Tools` |
| `tag` | string | `culture` |
| `search` | string | `internet` |
| `published` | boolean | `true` |
| `page` | number | `1` |
| `limit` | number | `10` |

**Exemplo de resposta paginada:**

```json
{
  "data": [...],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Corpo para `POST /api/posts`:**

```json
{
  "title": "Meu Novo Post",
  "subtitle": "Um subtítulo descritivo",
  "excerpt": "Um resumo do post com pelo menos 10 caracteres.",
  "body": "Conteúdo completo do post...",
  "category": "Essay",
  "readTime": "5 min",
  "authorId": "<id-do-autor>",
  "tagSlugs": ["culture", "technology"],
  "featured": false,
  "published": true
}
```

---

### Authors

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/authors` | Lista todos os autores |
| `GET` | `/api/authors/:id` | Busca autor por ID |
| `POST` | `/api/authors` | Cria novo autor |
| `PATCH` | `/api/authors/:id` | Atualiza autor |
| `DELETE` | `/api/authors/:id` | Remove autor |

**Corpo para `POST /api/authors`:**

```json
{
  "name": "João Silva",
  "initials": "JS",
  "bio": "Escritor e desenvolvedor."
}
```

---

### Tags

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/tags` | Lista todas as tags |
| `GET` | `/api/tags/:id` | Busca tag por ID |
| `POST` | `/api/tags` | Cria nova tag |
| `DELETE` | `/api/tags/:id` | Remove tag |

---

## Respostas de erro

Todos os erros seguem o mesmo formato:

```json
{
  "error": "NotFoundError",
  "message": "Post not found"
}
```

Erros de validação (Zod) retornam `422`:

```json
{
  "error": "Validation Error",
  "issues": [
    { "field": "title", "message": "String must contain at least 3 character(s)" }
  ]
}
```

| Status | Tipo |
|--------|------|
| `400` | AppError genérico |
| `404` | NotFoundError |
| `409` | ConflictError (slug duplicado, etc.) |
| `422` | ValidationError (Zod) |
| `500` | InternalServerError |
