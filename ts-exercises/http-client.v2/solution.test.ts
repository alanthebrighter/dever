/**
 * Testes para o exercício: CLI de Consulta de Repositórios do GitHub
 *
 * NÃO MODIFIQUE ESTE ARQUIVO.
 * Implemente sua solução em solution.ts exportando as funções abaixo.
 *
 * Para rodar: npx vitest run
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchRepos,
  getTopRecent,
  sumStars,
  formatRepo,
} from "./solution";

// ─── Dados mock ───────────────────────────────────────────────────────────────

const mockRepos = [
  {
    name: "repo-alpha",
    description: "First repo",
    language: "TypeScript",
    stargazers_count: 10,
    updated_at: "2024-03-01T00:00:00Z",
  },
  {
    name: "repo-beta",
    description: null,
    language: "JavaScript",
    stargazers_count: 5,
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    name: "repo-gamma",
    description: "Third repo",
    language: null,
    stargazers_count: 100,
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    name: "repo-delta",
    description: "Fourth repo",
    language: "Go",
    stargazers_count: 3,
    updated_at: "2023-12-01T00:00:00Z",
  },
  {
    name: "repo-epsilon",
    description: "Fifth repo",
    language: "Python",
    stargazers_count: 7,
    updated_at: "2023-11-01T00:00:00Z",
  },
  {
    name: "repo-zeta",
    description: "Sixth repo",
    language: "Rust",
    stargazers_count: 50,
    updated_at: "2023-10-01T00:00:00Z",
  },
];

// ─── fetchRepos ───────────────────────────────────────────────────────────────

describe("fetchRepos", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna lista de repositórios para usuário válido", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockRepos,
    } as any);

    const repos = await fetchRepos("octocat");
    expect(Array.isArray(repos)).toBe(true);
    expect(repos.length).toBe(6);
    expect(repos[0].name).toBe("repo-alpha");
  });

  it("lança erro com mensagem clara quando usuário não existe (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as any);

    await expect(fetchRepos("usuario-que-nao-existe-xyzxyz")).rejects.toThrow(
      /não encontrado|not found|404/i
    );
  });

  it("lança erro genérico para status inesperado", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as any);

    await expect(fetchRepos("qualquer")).rejects.toThrow();
  });

  it("envia header Accept correto", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as any);

    await fetchRepos("octocat");

    const [_url, options] = (global.fetch as any).mock.calls[0];
    const headers = options?.headers ?? {};
    const acceptHeader =
      headers["Accept"] ?? headers["accept"] ?? "";

    expect(acceptHeader).toMatch(/application\/vnd\.github/i);
  });
});

// ─── getTopRecent ─────────────────────────────────────────────────────────────

describe("getTopRecent", () => {
  it("retorna exatamente 5 repositórios", () => {
    const top = getTopRecent(mockRepos);
    expect(top).toHaveLength(5);
  });

  it("retorna os 5 mais recentes por updated_at (ordem decrescente)", () => {
    const top = getTopRecent(mockRepos);
    expect(top[0].name).toBe("repo-alpha"); // mais recente
    expect(top[4].name).toBe("repo-epsilon");
  });

  it("funciona com menos de 5 repositórios", () => {
    const top = getTopRecent(mockRepos.slice(0, 3));
    expect(top).toHaveLength(3);
  });

  it("não muta o array original", () => {
    const original = [...mockRepos];
    getTopRecent(mockRepos);
    expect(mockRepos).toEqual(original);
  });
});

// ─── sumStars ─────────────────────────────────────────────────────────────────

describe("sumStars", () => {
  it("soma corretamente as estrelas de todos os repositórios", () => {
    const total = sumStars(mockRepos);
    expect(total).toBe(175); // 10+5+100+3+7+50
  });

  it("retorna 0 para lista vazia", () => {
    expect(sumStars([])).toBe(0);
  });
});

// ─── formatRepo ──────────────────────────────────────────────────────────────

describe("formatRepo", () => {
  it("formata repositório com todos os campos preenchidos", () => {
    const result = formatRepo(mockRepos[0], 1);
    expect(result).toContain("1");
    expect(result).toContain("repo-alpha");
    expect(result).toContain("First repo");
    expect(result).toContain("TypeScript");
  });

  it("exibe 'sem descrição' ou similar quando description é null", () => {
    const result = formatRepo(mockRepos[1], 2);
    expect(result).toMatch(/sem descrição|no description|—|-/i);
  });

  it("exibe 'N/A' ou similar quando language é null", () => {
    const result = formatRepo(mockRepos[2], 3);
    expect(result).toMatch(/n\/a|desconhecida|unknown|—|-/i);
  });
});
