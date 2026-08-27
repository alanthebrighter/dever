// projeto-02-auth.test.ts
// Rode com: npx vitest run
// Servidor precisa estar em localhost:3000

import { describe, it, expect } from "vitest";

const BASE = "http://localhost:3000";

// Email único por execução para evitar conflito com dados antigos
const TEST_EMAIL = `teste_${Date.now()}@email.com`;
const TEST_PASSWORD = "senha123";

let authToken: string;

// ─── REGISTER ────────────────────────────────────────────────────────────────

describe("POST /register", () => {
  it("cria um novo usuário com email e senha", async () => {
    const res = await fetch(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(data.email).toBe(TEST_EMAIL);
    // senha nunca pode aparecer na resposta
    expect(data).not.toHaveProperty("password");
    expect(data).not.toHaveProperty("hashedPassword");
  });

  it("retorna 400 quando email está faltando", async () => {
    const res = await fetch(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: TEST_PASSWORD }),
    });

    expect(res.status).toBe(400);
  });

  it("retorna 400 quando password está faltando", async () => {
    const res = await fetch(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL }),
    });

    expect(res.status).toBe(400);
  });

  it("retorna 409 ao tentar registrar email já existente", async () => {
    // Tenta cadastrar o mesmo email de novo
    const res = await fetch(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: "outrasenha" }),
    });

    expect(res.status).toBe(409);
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe("POST /login", () => {
  it("retorna um token JWT com credenciais corretas", async () => {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("token");
    expect(typeof data.token).toBe("string");
    expect(data.token.length).toBeGreaterThan(10);

    // Guarda o token para os próximos testes
    authToken = data.token;
  });

  it("retorna 401 com senha errada", async () => {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: "senhaerrada" }),
    });

    expect(res.status).toBe(401);
  });

  it("retorna 401 com email que não existe", async () => {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "naoexiste@email.com", password: TEST_PASSWORD }),
    });

    expect(res.status).toBe(401);
  });
});

// ─── ROTA PROTEGIDA /me ───────────────────────────────────────────────────────

describe("GET /me", () => {
  it("retorna os dados do usuário com token válido", async () => {
    const res = await fetch(`${BASE}/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.email).toBe(TEST_EMAIL);
    expect(data).not.toHaveProperty("hashedPassword");
    expect(data).not.toHaveProperty("password");
  });

  it("retorna 401 sem nenhum header de autorização", async () => {
    const res = await fetch(`${BASE}/me`);

    expect(res.status).toBe(401);
  });

  it("retorna 401 com token malformado", async () => {
    const res = await fetch(`${BASE}/me`, {
      headers: { Authorization: "Bearer token.invalido.aqui" },
    });

    expect(res.status).toBe(401);
  });

  it("retorna 401 com header no formato errado (sem Bearer)", async () => {
    const res = await fetch(`${BASE}/me`, {
      headers: { Authorization: authToken }, // sem "Bearer "
    });

    expect(res.status).toBe(401);
  });
});
