# Projeto 03 — Tudo junto: Auth + Recurso protegido 🔒📋

**Duração estimada:** 2-3 dias  
**Objetivo:** Juntar tudo — auth, banco, rotas protegidas. Cada usuário só vê e edita o próprio dado.

---

## O que você vai construir

Uma API de **lista de tarefas por usuário**:
- Usuário se registra e faz login
- Cada usuário tem suas próprias tarefas
- Nenhum usuário vê ou mexe nas tarefas do outro

É o cenário real de 90% das APIs que existem no mundo.

---

## Stack usada

- Express
- Postgres + Drizzle ORM
- JWT + bcrypt
- TypeScript
- Vitest

---

## Setup

```bash
mkdir api-tasks && cd api-tasks
npm init -y
npm install express drizzle-orm postgres dotenv jsonwebtoken bcrypt
npm install -D typescript tsx vitest @types/express @types/jsonwebtoken @types/bcrypt drizzle-kit
```

`.env`:
```
DATABASE_URL=postgres://usuario:senha@localhost:5432/tasks_db
JWT_SECRET=segredo-aqui
```

---

## Schema (src/db/schema.ts)

```ts
import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  done: boolean("done").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

A coluna `userId` é a chave — é ela que liga uma tarefa ao usuário dono dela.

---

## Rotas que você precisa implementar

### Públicas (sem token)

| Método | Rota       | O que faz                        |
|--------|------------|----------------------------------|
| POST   | /register  | Cria usuário                     |
| POST   | /login     | Retorna JWT                      |

### Protegidas (precisam de `Authorization: Bearer <token>`)

| Método | Rota         | O que faz                              |
|--------|--------------|----------------------------------------|
| GET    | /tasks       | Lista todas as tarefas do usuário      |
| POST   | /tasks       | Cria uma tarefa para o usuário logado  |
| PUT    | /tasks/:id   | Marca como feita ou edita título       |
| DELETE | /tasks/:id   | Deleta a tarefa                        |

---

## Regras de negócio (as que importam)

1. **Isolamento de dados**: ao buscar ou modificar uma tarefa, sempre filtre por `userId` além do `id`. Se o usuário A tentar mexer na tarefa do usuário B, retorne `404` (não `403`) — não revele que a tarefa existe.

2. **POST /tasks**: cria tarefa com `done: false` por padrão. Só `title` é obrigatório.

3. **PUT /tasks/:id**: aceita `title` e/ou `done` no body. Atualiza só o que vier.

---

## O erro mais comum nesse projeto

Fazer a query assim:
```ts
// ❌ ERRADO — qualquer usuário pode ver/deletar
await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
```

Fazer assim:
```ts
// ✅ CERTO — só o dono vê
await db.select().from(tasks).where(
  and(eq(tasks.id, Number(req.params.id)), eq(tasks.userId, req.user.id))
);
```

Sem esse `and`, qualquer usuário autenticado consegue acessar as tarefas de qualquer outro — é um bug de segurança clássico.

---

## Estrutura de pastas sugerida

```
src/
  db/
    schema.ts
    index.ts
  middleware/
    auth.ts       ← reutilize do projeto 02
  routes/
    auth.ts       ← /register e /login
    tasks.ts      ← todas as rotas de tasks
  app.ts
  index.ts
tests/
  tasks.test.ts
```

---

## Dica de tipagem para o middleware

Depois de verificar o JWT, você coloca o usuário em `req.user`. Para o TypeScript não reclamar:

```ts
// src/types/express.d.ts
declare namespace Express {
  interface Request {
    user?: { id: number; email: string };
  }
}
```

---

## Critério de conclusão

- [ ] Auth funcionando (register + login)
- [ ] CRUD de tarefas funcionando para usuário logado
- [ ] Usuário A não consegue ver/editar/deletar tarefas do usuário B
- [ ] Todos os testes passando
