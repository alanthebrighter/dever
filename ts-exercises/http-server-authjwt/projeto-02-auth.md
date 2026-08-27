# Projeto 02 — Auth com JWT 🔐

**Duração estimada:** 1-2 dias  
**Objetivo:** Macetear autenticação com JWT — register, login, rota protegida. É exatamente o capítulo 7 que você está sofrendo.

---

## O que você vai construir

Um sistema de usuários com:
- Registro de conta
- Login que retorna um JWT
- Rota protegida que só funciona com token válido no header

É um sistema pequeno de propósito — o foco é entender o fluxo, não construir um produto.

---

## Stack usada

- Express
- Postgres + Drizzle ORM
- `jsonwebtoken` para gerar/verificar JWT
- `bcrypt` para hash de senha
- TypeScript
- Vitest (testes)

---

## Setup

```bash
mkdir api-auth && cd api-auth
npm init -y
npm install express drizzle-orm postgres dotenv jsonwebtoken bcrypt
npm install -D typescript tsx vitest @types/express @types/jsonwebtoken @types/bcrypt drizzle-kit
```

`.env`:
```
DATABASE_URL=postgres://usuario:senha@localhost:5432/auth_db
JWT_SECRET=um-segredo-longo-aqui-qualquer-coisa
```

---

## Schema (src/db/schema.ts)

```ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## Rotas que você precisa implementar

| Método | Rota         | Protegida? | O que faz                          |
|--------|--------------|------------|------------------------------------|
| POST   | /register    | Não        | Cria um usuário novo               |
| POST   | /login       | Não        | Retorna um JWT se credenciais OK   |
| GET    | /me          | ✅ Sim      | Retorna dados do usuário logado    |

---

## Regras de negócio

**POST /register:**
- `email` e `password` obrigatórios → 400 se faltar
- Email duplicado → 409 (Conflict)
- Nunca salve a senha em texto puro — use `bcrypt.hash(password, 10)`
- Retorne o usuário criado (sem o `hashedPassword`)

**POST /login:**
- Busca o usuário pelo email → 401 se não encontrar
- Verifica a senha com `bcrypt.compare` → 401 se errada
- Retorna `{ token: "..." }` com um JWT assinado

**GET /me (rota protegida):**
- Lê o header `Authorization: Bearer <token>`
- Verifica o token com `jwt.verify`
- Se inválido ou ausente → 401
- Se válido → retorna os dados do usuário (sem senha)

---

## Middleware de autenticação

Crie um middleware separado `src/middleware/auth.ts`:

```ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // Coloca o payload em req para usar nas rotas depois
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

Use assim na rota:
```ts
app.get("/me", requireAuth, (req, res) => { ... });
```

---

## Estrutura de pastas sugerida

```
src/
  db/
    schema.ts
    index.ts
  middleware/
    auth.ts
  routes/
    auth.ts     ← /register e /login
    users.ts    ← /me
  app.ts
  index.ts
tests/
  auth.test.ts
```

---

## Critério de conclusão

- [ ] Registro cria usuário com senha hasheada no banco
- [ ] Login retorna token JWT válido
- [ ] GET /me funciona com token correto
- [ ] GET /me retorna 401 sem token
- [ ] Todos os testes passando
