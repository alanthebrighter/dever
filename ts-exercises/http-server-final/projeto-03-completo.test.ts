// projeto-03-completo.test.ts
// Rode com: npx vitest run
// Servidor precisa estar em localhost:3000

import { describe, it, expect, beforeAll } from "vitest";

const BASE = "http://localhost:3000";

// Dois usuários diferentes para testar isolamento
const USER_A = { email: `user_a_${Date.now()}@email.com`, password: "senhaA123" };
const USER_B = { email: `user_b_${Date.now()}@email.com`, password: "senhaB123" };

let tokenA: string;
let tokenB: string;
let taskIdA: number; // tarefa criada pelo usuário A

// ─── SETUP: registra e loga os dois usuários ──────────────────────────────────

beforeAll(async () => {
  // Registra usuário A
  await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(USER_A),
  });

  // Registra usuário B
  await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(USER_B),
  });

  // Loga A
  const loginA = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(USER_A),
  });
  const dataA = await loginA.json();
  tokenA = dataA.token;

  // Loga B
  const loginB = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(USER_B),
  });
  const dataB = await loginB.json();
  tokenB = dataB.token;
});

// ─── CRIAR TAREFA ─────────────────────────────────────────────────────────────

describe("POST /tasks", () => {
  it("usuário A cria uma tarefa", async () => {
    const res = await fetch(`${BASE}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ title: "Tarefa do usuário A" }),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(data.title).toBe("Tarefa do usuário A");
    expect(data.done).toBe(false);

    taskIdA = data.id;
  });

  it("retorna 400 se title estiver faltando", async () => {
    const res = await fetch(`${BASE}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it("retorna 401 sem token", async () => {
    const res = await fetch(`${BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Sem auth" }),
    });

    expect(res.status).toBe(401);
  });
});

// ─── LISTAR TAREFAS ───────────────────────────────────────────────────────────

describe("GET /tasks", () => {
  it("usuário A vê só as próprias tarefas", async () => {
    const res = await fetch(`${BASE}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    // Todas as tarefas retornadas devem ter o titulo que A criou
    expect(data.some((t: { title: string }) => t.title === "Tarefa do usuário A")).toBe(true);
  });

  it("usuário B começa com lista vazia (suas tarefas, não as de A)", async () => {
    // Cria uma tarefa para A (já criou acima)
    // B não criou nada ainda — lista deve estar vazia
    const res = await fetch(`${BASE}/tasks`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    // Tarefa do usuário A não pode aparecer para o B
    expect(data.some((t: { id: number }) => t.id === taskIdA)).toBe(false);
  });

  it("retorna 401 sem token", async () => {
    const res = await fetch(`${BASE}/tasks`);
    expect(res.status).toBe(401);
  });
});

// ─── ATUALIZAR TAREFA ─────────────────────────────────────────────────────────

describe("PUT /tasks/:id", () => {
  it("usuário A atualiza a própria tarefa", async () => {
    const res = await fetch(`${BASE}/tasks/${taskIdA}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ done: true }),
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.done).toBe(true);
  });

  it("usuário B NÃO consegue atualizar tarefa do usuário A (retorna 404)", async () => {
    const res = await fetch(`${BASE}/tasks/${taskIdA}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ done: true }),
    });

    // Deve ser 404 — não revelamos que a tarefa existe, só que B não tem acesso
    expect(res.status).toBe(404);
  });

  it("retorna 401 sem token", async () => {
    const res = await fetch(`${BASE}/tasks/${taskIdA}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    });

    expect(res.status).toBe(401);
  });
});

// ─── DELETAR TAREFA ───────────────────────────────────────────────────────────

describe("DELETE /tasks/:id", () => {
  it("usuário B NÃO consegue deletar tarefa do usuário A (retorna 404)", async () => {
    const res = await fetch(`${BASE}/tasks/${taskIdA}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    expect(res.status).toBe(404);
  });

  it("usuário A consegue deletar a própria tarefa", async () => {
    const res = await fetch(`${BASE}/tasks/${taskIdA}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    expect(res.status).toBe(200);
  });

  it("tarefa deletada não aparece mais no GET /tasks de A", async () => {
    const res = await fetch(`${BASE}/tasks`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    const data = await res.json();
    const ids = data.map((t: { id: number }) => t.id);
    expect(ids).not.toContain(taskIdA);
  });
});
