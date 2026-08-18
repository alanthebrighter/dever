/**
 * EXERCÍCIO 9 — Bundler Simples de Módulos
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { bundlar } = require('./src/ex09');
 *
 * bundlar(entrada, saida) deve retornar o conteúdo do bundle como string
 * OU aceitar apenas o caminho de entrada e retornar o código como string.
 *
 * Adapte conforme a assinatura que você implementou.
 */
const { bundlar } = require('./src/ex09');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── Helpers ────────────────────────────────────────────────────────────────

let tmpDir;

/** Cria um arquivo temporário com o conteúdo fornecido */
function criarArquivo(nome, conteudo) {
  const caminho = path.join(tmpDir, nome);
  fs.mkdirSync(path.dirname(caminho), { recursive: true });
  fs.writeFileSync(caminho, conteudo, 'utf-8');
  return caminho;
}

/** Executa o bundle gerado e retorna os logs do console.log */
function executarBundle(codigoBundle) {
  const logs = [];
  const consoleMock = { log: (...args) => logs.push(args.join(' ')) };

  // Executa o bundle em um contexto isolado
  const fn = new Function('console', codigoBundle);
  fn(consoleMock);

  return logs;
}

// ─── Setup e Teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundler-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('Exercício 9 — Bundler', () => {

  describe('Arquivo único', () => {
    it('bundla um arquivo sem dependências', () => {
      const entrada = criarArquivo('index.js', `
        console.log('olá mundo');
      `);

      const bundle = bundlar(entrada);
      const logs = executarBundle(bundle);

      expect(logs).toContain('olá mundo');
    });

    it('o bundle gerado é uma string de código JavaScript válido', () => {
      const entrada = criarArquivo('index.js', `console.log('ok');`);
      const bundle = bundlar(entrada);

      expect(typeof bundle).toBe('string');
      expect(bundle.length).toBeGreaterThan(0);
      expect(() => new Function(bundle)).not.toThrow();
    });
  });

  describe('Múltiplos módulos com require', () => {
    it('resolve um require simples entre dois arquivos', () => {
      criarArquivo('util.js', `
        exports.somar = (a, b) => a + b;
      `);
      const entrada = criarArquivo('index.js', `
        const { somar } = require('./util');
        console.log(somar(2, 3));
      `);

      const bundle = bundlar(entrada);
      const logs = executarBundle(bundle);

      expect(logs).toContain('5');
    });

    it('resolve cadeia de dependências (A → B → C)', () => {
      criarArquivo('c.js', `exports.valor = 42;`);
      criarArquivo('b.js', `
        const { valor } = require('./c');
        exports.dobro = valor * 2;
      `);
      const entrada = criarArquivo('a.js', `
        const { dobro } = require('./b');
        console.log(dobro);
      `);

      const bundle = bundlar(entrada);
      const logs = executarBundle(bundle);

      expect(logs).toContain('84');
    });

    it('resolve requires em subdiretórios corretamente', () => {
      criarArquivo('utils/math.js', `exports.PI = 3.14;`);
      const entrada = criarArquivo('index.js', `
        const { PI } = require('./utils/math');
        console.log(PI);
      `);

      const bundle = bundlar(entrada);
      const logs = executarBundle(bundle);

      expect(logs).toContain('3.14');
    });
  });

  describe('Módulo incluído apenas uma vez', () => {
    it('um módulo requerido em dois lugares é incluído apenas uma vez no bundle', () => {
      criarArquivo('shared.js', `exports.valor = 'compartilhado';`);
      criarArquivo('a.js', `
        const { valor } = require('./shared');
        exports.fromA = valor;
      `);
      criarArquivo('b.js', `
        const { valor } = require('./shared');
        exports.fromB = valor;
      `);
      const entrada = criarArquivo('index.js', `
        const { fromA } = require('./a');
        const { fromB } = require('./b');
        console.log(fromA);
        console.log(fromB);
      `);

      const bundle = bundlar(entrada);

      // Conta quantas vezes o conteúdo de shared.js aparece no bundle
      const ocorrencias = (bundle.match(/compartilhado/g) || []).length;
      // O valor literal pode aparecer 1 vez (na definição), não múltiplas vezes
      expect(ocorrencias).toBe(1);

      const logs = executarBundle(bundle);
      expect(logs).toContain('compartilhado');
    });

    it('o cache de módulos garante que o mesmo objeto é retornado', () => {
      criarArquivo('singleton.js', `
        exports.contador = 0;
        exports.incrementar = function() { exports.contador++; };
      `);
      criarArquivo('a.js', `
        const s = require('./singleton');
        s.incrementar();
        exports.ok = true;
      `);
      const entrada = criarArquivo('index.js', `
        const { ok } = require('./a');
        const s = require('./singleton');
        console.log(s.contador); // deve ser 1, não 0
      `);

      const bundle = bundlar(entrada);
      const logs = executarBundle(bundle);

      expect(logs).toContain('1');
    });
  });

  describe('Escopo dos módulos', () => {
    it('variáveis de um módulo não vazam para o escopo global', () => {
      criarArquivo('lib.js', `
        var segredo = 'privado';
        exports.api = 'público';
      `);
      const entrada = criarArquivo('index.js', `
        const lib = require('./lib');
        console.log(lib.api);
        try {
          console.log(typeof segredo); // deve ser undefined
        } catch(e) {
          console.log('undefined');
        }
      `);

      const bundle = bundlar(entrada);
      const logs = executarBundle(bundle);

      expect(logs).toContain('público');
      expect(logs).toContain('undefined');
    });
  });

  describe('Referências circulares', () => {
    it('não entra em loop infinito com dependências circulares', () => {
      criarArquivo('a.js', `
        exports.nomeParcial = 'A';
        const b = require('./b');
        exports.nomeCompleto = 'A-' + b.nomeParcial;
      `);
      criarArquivo('b.js', `
        exports.nomeParcial = 'B';
        const a = require('./a');
        exports.nomeCompleto = 'B-' + a.nomeParcial;
      `);
      const entrada = criarArquivo('index.js', `
        const a = require('./a');
        console.log(a.nomeParcial);
      `);

      // O bundler não deve travar durante a geração do bundle
      expect(() => bundlar(entrada)).not.toThrow();

      const bundle = bundlar(entrada);
      // E o bundle deve executar sem travar
      expect(() => executarBundle(bundle)).not.toThrow();
    });
  });

  describe('module.exports vs exports', () => {
    it('suporta module.exports = objeto direto', () => {
      criarArquivo('lib.js', `
        module.exports = { resposta: 42 };
      `);
      const entrada = criarArquivo('index.js', `
        const lib = require('./lib');
        console.log(lib.resposta);
      `);

      const bundle = bundlar(entrada);
      const logs = executarBundle(bundle);

      expect(logs).toContain('42');
    });

    it('suporta exports.propriedade = valor', () => {
      criarArquivo('lib.js', `
        exports.a = 1;
        exports.b = 2;
      `);
      const entrada = criarArquivo('index.js', `
        const lib = require('./lib');
        console.log(lib.a + lib.b);
      `);

      const bundle = bundlar(entrada);
      const logs = executarBundle(bundle);

      expect(logs).toContain('3');
    });
  });
});
