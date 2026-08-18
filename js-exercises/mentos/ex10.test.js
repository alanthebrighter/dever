/**
 * EXERCÍCIO 10 — Sistema de Plugins com Injeção de Dependências
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { criarAplicacao } = require('./src/ex10');
 */
const { criarAplicacao } = require('./src/ex10');

// ─── Factories de plugins para testes ────────────────────────────────────────

function pluginA(opcoes = {}) {
  return {
    nome: 'pluginA',
    instalar(app) {
      app.prover('servicoA', { valor: opcoes.valor ?? 'A' });
    }
  };
}

function pluginB() {
  return {
    nome: 'pluginB',
    dependencias: ['pluginA'],
    instalar(app) {
      const a = app.injetar('servicoA');
      app.prover('servicoB', { combinado: a.valor + 'B' });
    }
  };
}

function pluginC() {
  return {
    nome: 'pluginC',
    dependencias: ['pluginB'],
    instalar(app) {
      const b = app.injetar('servicoB');
      app.prover('servicoC', { resultado: b.combinado + 'C' });
    }
  };
}

function pluginComHook(ordem) {
  return {
    nome: `hookPlugin-${Math.random()}`,
    instalar(app) {
      app.hook('evento', (ctx) => {
        ordem.push('hook-1');
        return ctx;
      });
      app.hook('evento', (ctx) => {
        ordem.push('hook-2');
        return ctx;
      });
    }
  };
}

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('Exercício 10 — Sistema de Plugins', () => {

  describe('Instalação de plugins', () => {
    it('instala um plugin e disponibiliza seus serviços', () => {
      const app = criarAplicacao();
      app.usar(pluginA());

      const servico = app.injetar('servicoA');
      expect(servico).toBeDefined();
      expect(servico.valor).toBe('A');
    });

    it('aceita opções no plugin', () => {
      const app = criarAplicacao();
      app.usar(pluginA({ valor: 'customizado' }));

      const servico = app.injetar('servicoA');
      expect(servico.valor).toBe('customizado');
    });

    it('múltiplos plugins são instalados independentemente', () => {
      const app = criarAplicacao();
      app.usar(pluginA());
      app.usar(pluginB());

      expect(app.injetar('servicoA')).toBeDefined();
      expect(app.injetar('servicoB')).toBeDefined();
    });

    it('lança erro ao tentar instalar o mesmo plugin duas vezes', () => {
      const app = criarAplicacao();
      app.usar(pluginA());

      expect(() => app.usar(pluginA())).toThrow();
    });
  });

  describe('Injeção de Dependências (DI)', () => {
    it('plugin pode injetar serviço de outro plugin já instalado', () => {
      const app = criarAplicacao();
      app.usar(pluginA());
      app.usar(pluginB());

      const servicoB = app.injetar('servicoB');
      expect(servicoB.combinado).toBe('AB');
    });

    it('cadeia de dependências funciona (A → B → C)', () => {
      const app = criarAplicacao();
      app.usar(pluginA());
      app.usar(pluginB());
      app.usar(pluginC());

      expect(app.injetar('servicoC').resultado).toBe('ABC');
    });

    it('lança erro ao injetar serviço não registrado', () => {
      const app = criarAplicacao();
      expect(() => app.injetar('servicoInexistente')).toThrow();
    });

    it('lança erro claro ao instalar plugin com dependência não registrada', () => {
      const app = criarAplicacao();
      // B depende de A, mas A não foi instalado
      expect(() => app.usar(pluginB())).toThrow(/pluginA|dependencia|dependência/i);
    });
  });

  describe('Ordenação automática por dependência', () => {
    it('ordena automaticamente plugins por dependência, independente da ordem de uso()', () => {
      const app = criarAplicacao();

      // Registra na ordem "errada" (C, B, A)
      // O framework deve resolver a ordem correta automaticamente
      // OU lançar um erro útil pedindo para registrar na ordem correta
      // Teste flexível: aceita qualquer das duas abordagens
      try {
        app.usar(pluginC()); // depende de B
        app.usar(pluginB()); // depende de A
        app.usar(pluginA()); // sem dependências

        app.iniciar(); // resolve dependências aqui

        expect(app.injetar('servicoC').resultado).toBe('ABC');
      } catch (e) {
        // Alternativa: o framework exige ordem explícita e lança erro descritivo
        expect(e.message).toMatch(/dependencia|dependência|ordem|order/i);
      }
    });
  });

  describe('Sistema de Hooks', () => {
    it('hooks registrados são chamados na emissão do evento', async () => {
      const app = criarAplicacao();
      const chamados = [];

      app.usar({
        nome: 'hookTest',
        instalar(a) {
          a.hook('meuEvento', (ctx) => { chamados.push('hook'); return ctx; });
        }
      });

      await app.dispararHook('meuEvento', {});
      expect(chamados).toContain('hook');
    });

    it('hooks são chamados na ordem de registro', async () => {
      const app = criarAplicacao();
      const ordem = [];

      app.usar({
        nome: 'multi-hook',
        instalar(a) {
          a.hook('evento', (ctx) => { ordem.push(1); return ctx; });
          a.hook('evento', (ctx) => { ordem.push(2); return ctx; });
          a.hook('evento', (ctx) => { ordem.push(3); return ctx; });
        }
      });

      await app.dispararHook('evento', {});
      expect(ordem).toEqual([1, 2, 3]);
    });

    it('hook pode modificar o contexto para o próximo hook', async () => {
      const app = criarAplicacao();

      app.usar({
        nome: 'modificador',
        instalar(a) {
          a.hook('processar', (ctx) => {
            return { ...ctx, modificado: true, passo: 1 };
          });
          a.hook('processar', (ctx) => {
            expect(ctx.modificado).toBe(true); // recebeu modificação anterior
            return { ...ctx, passo: 2 };
          });
        }
      });

      const resultado = await app.dispararHook('processar', { original: true });
      expect(resultado.modificado).toBe(true);
      expect(resultado.passo).toBe(2);
    });

    it('hooks assíncronos são aguardados antes do próximo', async () => {
      const app = criarAplicacao();
      const ordem = [];

      app.usar({
        nome: 'async-hooks',
        instalar(a) {
          a.hook('evento', async (ctx) => {
            await new Promise(r => setTimeout(r, 50));
            ordem.push('hook-1-fim');
            return ctx;
          });
          a.hook('evento', (ctx) => {
            ordem.push('hook-2'); // só deve aparecer APÓS hook-1-fim
            return ctx;
          });
        }
      });

      await app.dispararHook('evento', {});

      expect(ordem.indexOf('hook-1-fim')).toBeLessThan(ordem.indexOf('hook-2'));
    });

    it('disparar hook sem handlers não lança erro', async () => {
      const app = criarAplicacao();
      await expect(app.dispararHook('evento-sem-hooks', {})).resolves.not.toThrow();
    });
  });

  describe('Uso integrado (.executar)', () => {
    it('executar chama os hooks antes e depois', async () => {
      const app = criarAplicacao();
      const fases = [];

      app.usar({
        nome: 'logger',
        instalar(a) {
          a.hook('antes:executar', (ctx) => { fases.push('antes'); return ctx; });
          a.hook('depois:executar', (ctx) => { fases.push('depois'); return ctx; });
        }
      });

      app.registrarHandler('minhaAcao', async () => {
        fases.push('execucao');
        return 'resultado';
      });

      const resultado = await app.executar('minhaAcao', {});

      expect(fases).toEqual(['antes', 'execucao', 'depois']);
      expect(resultado).toBe('resultado');
    });

    it('hook antes:executar pode modificar os dados antes da execução', async () => {
      const app = criarAplicacao();

      app.usar({
        nome: 'enriquecedor',
        instalar(a) {
          a.hook('antes:executar', (ctx) => {
            return { ...ctx, dados: { ...ctx.dados, enriquecido: true } };
          });
        }
      });

      let dadosRecebidos;
      app.registrarHandler('acao', async (dados) => {
        dadosRecebidos = dados;
        return dados;
      });

      await app.executar('acao', { original: true });
      expect(dadosRecebidos.enriquecido).toBe(true);
    });
  });

  describe('Proteção e imutabilidade', () => {
    it('plugins não conseguem acessar internals de outros plugins diretamente', () => {
      const app = criarAplicacao();
      let tentativaDeAcesso;

      app.usar({
        nome: 'plugin1',
        instalar(a) {
          a.prover('publico', { valor: 'público' });
          // _privado existe internamente mas não deve ser acessível
        }
      });

      app.usar({
        nome: 'plugin2',
        instalar(a) {
          const publiico = a.injetar('publico');
          // Só deve conseguir acessar o que foi explicitamente provido
          tentativaDeAcesso = publiico;
        }
      });

      expect(tentativaDeAcesso.valor).toBe('público');
      expect(tentativaDeAcesso._privado).toBeUndefined();
    });

    it('não permite registrar plugins após iniciar()', () => {
      const app = criarAplicacao();
      app.usar(pluginA());
      app.iniciar();

      expect(() => app.usar(pluginB())).toThrow();
    });
  });
});
