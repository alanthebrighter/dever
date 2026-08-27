// projeto-01-notas.test.ts
// Rode com: npx vitest run
// IMPORTANTE: o servidor precisa estar rodando em localhost:3000
// Você pode subir com: npx tsx src/index.ts

import { describe, it, expect, beforeAll } from "vitest";

const BASE = "http://localhost:3000";

// ID que vai ser criado e reutilizado nos testes
let createdId: number;

// ─── CRIAR NOTA ─────────────────────────────────────────────────────────────

describe("POST /notes", () => {
  it("cria uma nota com title e body válidos", async () => {
    const res = await fetch(`${BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Minha primeira nota", body: "Conteúdo aqui" }),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(data.title).toBe("Minha primeira nota");
    expect(data.body).toBe("Conteúdo aqui");

    createdId = data.id;
  });

  it("retorna 400 quando title está faltando", async () => {
    const res = await fetch(`${BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Sem título" }),
    });

    expect(res.status).toBe(400);
  });

  it("retorna 400 quando body está faltando", async () => {
    const res = await fetch(`${BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Sem body" }),
    });

    expect(res.status).toBe(400);
  });

  it("retorna 400 quando o body da requisição está vazio", async () => {
    const res = await fetch(`${BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });
});

// ─── LISTAR NOTAS ────────────────────────────────────────────────────────────

describe("GET /notes", () => {
  it("retorna um array de notas", async () => {
    const res = await fetch(`${BASE}/notes`);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("cada nota tem id, title, body e createdAt", async () => {
    const res = await fetch(`${BASE}/notes`);
    const data = await res.json();
    const note = data[0];

    expect(note).toHaveProperty("id");
    expect(note).toHaveProperty("title");
    expect(note).toHaveProperty("body");
    expect(note).toHaveProperty("createdAt");
  });
});

// ─── BUSCAR NOTA POR ID ───────────────────────────────────────────────────────

describe("GET /notes/:id", () => {
  it("retorna a nota criada pelo id", async () => {
    const res = await fetch(`${BASE}/notes/${createdId}`);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.id).toBe(createdId);
    expect(data.title).toBe("Minha primeira nota");
  });

  it("retorna 404 para id que não existe", async () => {
    const res = await fetch(`${BASE}/notes/999999`);

    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data).toHaveProperty("error");
  });
});

// ─── ATUALIZAR NOTA ───────────────────────────────────────────────────────────

describe("PUT /notes/:id", () => {
  it("atualiza o title e body da nota", async () => {
    const res = await fetch(`${BASE}/notes/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Título atualizado", body: "Body atualizado" }),
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.title).toBe("Título atualizado");
    expect(data.body).toBe("Body atualizado");
  });

  it("retorna 404 ao tentar atualizar nota inexistente", async () => {
    const res = await fetch(`${BASE}/notes/999999`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "x", body: "y" }),
    });

    expect(res.status).toBe(404);
  });
});

// ─── DELETAR NOTA ────────────────────────────────────────────────────────────

describe("DELETE /notes/:id", () => {
  it("deleta a nota criada", async () => {
    const res = await fetch(`${BASE}/notes/${createdId}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(200);
  });

  it("retorna 404 ao tentar deletar nota já deletada", async () => {
    const res = await fetch(`${BASE}/notes/${createdId}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(404);
  });

  it("nota não aparece mais no GET /notes após deletar", async () => {
    const res = await fetch(`${BASE}/notes`);
    const data = await res.json();
    const ids = data.map((n: { id: number }) => n.id);

    expect(ids).not.toContain(createdId);
  });
});
