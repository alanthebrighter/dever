/**
 * EXERCÍCIO 1 — Executor de Tarefas Concorrentes com Limite
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { executarComLimite } = require('./src/ex01');
 */
const { executarComLimite } = require('./src/ex01');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Cria uma tarefa que resolve após `ms` milissegundos */
function tarefa(valor, ms) {
  return () => new Promise(resolve => setTimeout(() => resolve(valor), ms));
}

/** Cria uma tarefa que rejeita após `ms` milissegundos */
function tarefaComErro(msg, ms) {
  return () => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));
}

/**
 * Cria uma tarefa que registra quando inicia e termina.
 * Permite verificar concorrência real.
 */
function tarefaRastreada(valor, ms, log) {
  return () => new Promise(resolve => {
    log.push({ evento: 'inicio', valor, em: Date.now() });
    setTimeout(() => {
      log.push({ evento: 'fim', valor, em: Date.now() });
      resolve(valor);
    }, ms);
  });
}

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('Exercício 1 — executarComLimite', () => {

  describe('Resultados e ordem', () => {
    it('retorna os resultados na ordem original das tarefas', async () => {
      const tarefas = [
        tarefa('A', 300),
        tarefa('B', 100), // termina antes, mas deve aparecer em segundo
        tarefa('C', 200),
      ];

      const resultado = await executarComLimite(tarefas, 3);
      expect(resultado).toEqual(['A', 'B', 'C']);
    });

    it('retorna array com mesmo comprimento do array de entrada', async () => {
      const tarefas = [tarefa(1, 50), tarefa(2, 50), tarefa(3, 50)];
      const resultado = await executarComLimite(tarefas, 2);
      expect(resultado).toHaveLength(3);
    });

    it('funciona com uma única tarefa', async () => {
      const resultado = await executarComLimite([tarefa('único', 50)], 5);
      expect(resultado).toEqual(['único']);
    });

    it('funciona com limite maior que o número de tarefas', async () => {
      const tarefas = [tarefa('x', 50), tarefa('y', 50)];
      const resultado = await executarComLimite(tarefas, 10);
      expect(resultado).toEqual(['x', 'y']);
    });

    it('retorna array vazio para entrada vazia', async () => {
      const resultado = await executarComLimite([], 3);
      expect(resultado).toEqual([]);
    });
  });

  describe('Limite de concorrência', () => {
    it('nunca excede o limite de tarefas simultâneas', async () => {
      const log = [];
      const limite = 2;

      // 6 tarefas, cada uma demora 100ms
      const tarefas = Array.from({ length: 6 }, (_, i) =>
        tarefaRastreada(i, 100, log)
      );

      await executarComLimite(tarefas, limite);

      // Verifica que em nenhum momento havia mais de `limite` tarefas ativas
      for (let i = 0; i < log.length; i++) {
        if (log[i].evento !== 'inicio') continue;
        const em = log[i].em;

        // Conta tarefas que iniciaram e ainda não terminaram neste momento
        const ativas = log.filter(e =>
          e.evento === 'inicio' && e.em <= em &&
          !log.some(f => f.evento === 'fim' && f.valor === e.valor && f.em <= em)
        ).length;

        expect(ativas).toBeLessThanOrEqual(limite);
      }
    });

    it('inicia a próxima tarefa assim que uma slot é liberada (não espera lote)', async () => {
      const log = [];

      // Tarefa 1: 200ms, Tarefa 2: 200ms, Tarefa 3: deve iniciar quando 1 terminar
      const tarefas = [
        tarefaRastreada('T1', 200, log),
        tarefaRastreada('T2', 200, log),
        tarefaRastreada('T3', 50, log),  // rápida, deve iniciar no ~200ms
      ];

      const inicio = Date.now();
      await executarComLimite(tarefas, 2);
      const duracao = Date.now() - inicio;

      // Com limite 2: T1 e T2 rodam juntas (200ms), T3 começa quando uma termina
      // Total esperado: ~250ms (não ~400ms como seria em série par a par)
      expect(duracao).toBeLessThan(350);
    });

    it('com limite 1 executa em série', async () => {
      const ordemExecucao = [];

      const tarefas = [
        () => new Promise(r => { ordemExecucao.push(1); setTimeout(() => r(1), 50); }),
        () => new Promise(r => { ordemExecucao.push(2); setTimeout(() => r(2), 50); }),
        () => new Promise(r => { ordemExecucao.push(3); setTimeout(() => r(3), 50); }),
      ];

      await executarComLimite(tarefas, 1);
      // Com limite 1, cada tarefa só inicia após a anterior terminar
      expect(ordemExecucao).toEqual([1, 2, 3]);
    });
  });

  describe('Tratamento de erros', () => {
    it('não interrompe a execução quando uma tarefa falha', async () => {
      const tarefas = [
        tarefa('ok-1', 50),
        tarefaComErro('falhou!', 50),
        tarefa('ok-3', 50),
      ];

      const resultado = await executarComLimite(tarefas, 3);
      expect(resultado[0]).toBe('ok-1');
      expect(resultado[1]).toBeInstanceOf(Error);
      expect(resultado[1].message).toBe('falhou!');
      expect(resultado[2]).toBe('ok-3');
    });

    it('registra o erro na posição correta do array de resultados', async () => {
      const tarefas = [
        tarefaComErro('erro-0', 50),
        tarefa('ok-1', 50),
        tarefaComErro('erro-2', 50),
      ];

      const resultado = await executarComLimite(tarefas, 3);
      expect(resultado[0]).toBeInstanceOf(Error);
      expect(resultado[1]).toBe('ok-1');
      expect(resultado[2]).toBeInstanceOf(Error);
    });

    it('libera o slot mesmo quando uma tarefa falha', async () => {
      const log = [];
      const tarefas = [
        tarefaRastreada('T1', 50, log),
        () => new Promise((_, r) => setTimeout(() => r(new Error('x')), 50)), // falha
        tarefaRastreada('T3', 50, log), // deve executar após slot ser liberado pela falha
      ];

      const resultado = await executarComLimite(tarefas, 2);

      // T3 deve ter sido executado
      const t3Iniciou = log.some(e => e.valor === 'T3' && e.evento === 'inicio');
      expect(t3Iniciou).toBe(true);
      expect(resultado[2]).toBe('T3');
    });

    it('lida com todas as tarefas falhando', async () => {
      const tarefas = [
        tarefaComErro('e1', 30),
        tarefaComErro('e2', 30),
        tarefaComErro('e3', 30),
      ];

      const resultado = await executarComLimite(tarefas, 2);
      expect(resultado).toHaveLength(3);
      resultado.forEach(r => expect(r).toBeInstanceOf(Error));
    });
  });

  describe('Performance', () => {
    it('é significativamente mais rápido que execução em série', async () => {
      const N = 6;
      const DELAY = 100;
      const LIMITE = 3;

      const tarefas = Array.from({ length: N }, (_, i) => tarefa(i, DELAY));

      const inicio = Date.now();
      await executarComLimite(tarefas, LIMITE);
      const duracaoParalelo = Date.now() - inicio;

      // Com LIMITE=3 e 6 tarefas de 100ms, deveria levar ~200ms (2 rodadas)
      // Serial levaria 600ms. Esperamos menos que 400ms.
      const duracaoSerialEstimada = N * DELAY;
      expect(duracaoParalelo).toBeLessThan(duracaoSerialEstimada * 0.7);
    });
  });
});
