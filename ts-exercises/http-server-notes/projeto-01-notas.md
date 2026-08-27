# Projeto 01 — API de Notas 📝

**Duração estimada:** 1 dia  
**Objetivo:** Macetear Express + Drizzle + Postgres com um CRUD clássico, sem autenticação ainda.

---

## O que você vai construir

Uma API REST de notas pessoais. Nada além disso. Sem usuário, sem login — só nota entra, nota sai.

---

## Stack usada

- Express
- Postgres (local ou Docker)
- Drizzle ORM
- TypeScript
- Vitest (testes)

---

## Setup inicial

```bash
mkdir api-notas && cd api-notas
npm init -y
npm install express drizzle-orm postgres dotenv
npm install -D typescript tsx vitest @types/express drizzle-kit
npx tsc --init
```

Crie um `.env`:
```
DATABASE_URL=postgres://usuario:senha@localhost:5432/notas_db
```

---

## Schema do banco (src/db/schema.ts)

```ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## Rotas que você precisa implementar

| Método | Rota        | O que faz                        |
|--------|-------------|----------------------------------|
| GET    | /notes      | Retorna todas as notas           |
| GET    | /notes/:id  | Retorna uma nota pelo ID         |
| POST   | /notes      | Cria uma nota nova               |
| PUT    | /notes/:id  | Atualiza título e/ou body        |
| DELETE | /notes/:id  | Deleta uma nota                  |

---

## Regras de negócio

- `title` e `body` são obrigatórios no POST — retorne `400` se algum faltar
- Se a nota não existir no GET/PUT/DELETE — retorne `404` com `{ error: "Note not found" }`
- Respostas de sucesso sempre em JSON

---

## Estrutura de pastas sugerida

```
src/
  db/
    schema.ts
    index.ts       ← conexão com o banco via drizzle
  routes/
    notes.ts       ← todas as rotas de notes
  app.ts           ← cria o Express app
  index.ts         ← sobe o servidor na porta
tests/
  notes.test.ts
```

---

## Dicas de implementação

**Conexão com banco (src/db/index.ts):**
```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

**No route handler, a lógica é sempre:**
1. Valida o input
2. Faz a query com Drizzle
3. Retorna o resultado

Para buscar por ID com Drizzle:
```ts
import { eq } from "drizzle-orm";
const note = await db.select().from(notes).where(eq(notes.id, Number(req.params.id)));
```

---

## O que os testes vão verificar

Veja o arquivo `projeto-01-notas.test.ts` — os testes batem direto na API HTTP usando `fetch`, então suba o servidor antes de rodar, ou use um setup que sobe o app no próprio teste.

---

## Critério de conclusão

- [ ] Todas as 5 rotas funcionando
- [ ] Retorna 400 quando falta campo obrigatório
- [ ] Retorna 404 quando a nota não existe
- [ ] Todos os testes passando
