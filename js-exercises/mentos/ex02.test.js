/**
 * EXERCÍCIO 2 — Scheduler com Prioridades e Filas Separadas
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { Scheduler } = require('./src/ex02');
 */
const { Scheduler } = require('./src/ex02');

// ─── Helpers ────────────────────────────────────────────────────────────────

function esperar(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function tarefaComDuracao(duracao, resultado = 'ok') {
  return () => new Promise(r => setTimeout(() => r(resultado), duracao));
}

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('Exercício 2 — Scheduler', () => {

  describe('Concorrência', () => {
    it('não executa mais tarefas que o limite de concorrência', async () => {
      const scheduler = new Scheduler({ concorrencia: 2 });
      let ativas = 0;
      let maxAtivas = 0;

      const criarTarefa = () => () => new Promise(r => {
        ativas++;
        maxAtivas = Math.max(maxAtivas, ativas);
        setTimeout(() => { ativas--; r(); }, 80);
      });

      const promessas = Array.from({ length: 6 }, () =>
        scheduler.adicionar(criarTarefa(), { prioridade: 5 })
      );

      await Promise.all(promessas);
      expect(maxAtivas).toBeLessThanOrEqual(2);
    });

    it('preenche slots disponíveis imediatamente', async () => {
      const scheduler = new Scheduler({ concorrencia: 3 });
      const iniciadas = [];

      const criarTarefa = (id) => () => new Promise(r => {
        iniciadas.push(id);
        setTimeout(r, 100);
      });

      scheduler.adicionar(criarTarefa(1), { prioridade: 5 });
      scheduler.adicionar(criarTarefa(2), { prioridade: 5 });
      scheduler.adicionar(criarTarefa(3), { prioridade: 5 });
      scheduler.adicionar(criarTarefa(4), { prioridade: 5 }); // deve esperar

      await esperar(30); // tempo para as primeiras iniciarem
      expect(iniciadas).toHaveLength(3); // apenas 3 iniciaram
    });
  });

  describe('Prioridades', () => {
    it('executa tarefas de maior prioridade antes', async () => {
      // Concorrência 1 garante que a ordem de execução seja visível
      const scheduler = new Scheduler({ concorrencia: 1 });
      const ordemExecucao = [];

      // Adiciona todas ao mesmo tempo, mas concorrência 1 vai fila-las
      // Primeira entra imediatamente, as demais ficam na fila por prioridade
      const p1 = scheduler.adicionar(
        () => new Promise(r => setTimeout(() => { ordemExecucao.push('baixa'); r(); }, 50)),
        { prioridade: 10, id: 'baixa' }
      );
      const p2 = scheduler.adicionar(
        () => new Promise(r => { ordemExecucao.push('alta'); r(); }),
        { prioridade: 1, id: 'alta' }
      );
      const p3 = scheduler.adicionar(
        () => new Promise(r => { ordemExecucao.push('media'); r(); }),
        { prioridade: 5, id: 'media' }
      );

      await Promise.all([p1, p2, p3]);

      // 'baixa' entra primeiro (já estava rodando), mas 'alta' deve ser segunda
      expect(ordemExecucao.indexOf('alta')).toBeLessThan(ordemExecucao.indexOf('media'));
    });

    it('respeita FIFO entre tarefas de mesma prioridade', async () => {
      const scheduler = new Scheduler({ concorrencia: 1 });
      const ordem = [];

      // A primeira tarefa ocupa o slot, as demais vão para a fila
      scheduler.adicionar(
        () => new Promise(r => setTimeout(r, 80)),
        { prioridade: 5 }
      );

      const p1 = scheduler.adicionar(
        () => Promise.resolve(ordem.push('A')),
        { prioridade: 5 }
      );
      const p2 = scheduler.adicionar(
        () => Promise.resolve(ordem.push('B')),
        { prioridade: 5 }
      );
      const p3 = scheduler.adicionar(
        () => Promise.resolve(ordem.push('C')),
        { prioridade: 5 }
      );

      await Promise.all([p1, p2, p3]);
      expect(ordem).toEqual(['A', 'B', 'C']);
    });

    it('tarefa de alta prioridade na fila precede a de baixa prioridade', async () => {
      const scheduler = new Scheduler({ concorrencia: 1 });
      const ordem = [];

      // Ocupa o único slot
      scheduler.adicionar(
        () => new Promise(r => setTimeout(r, 100)),
        { prioridade: 5 }
      );

      const pBaixa = scheduler.adicionar(
        () => Promise.resolve(ordem.push('baixa')),
        { prioridade: 10 }
      );
      const pAlta = scheduler.adicionar(
        () => Promise.resolve(ordem.push('alta')),
        { prioridade: 1 }
      );

      await Promise.all([pBaixa, pAlta]);
      expect(ordem).toEqual(['alta', 'baixa']);
    });
  });

  describe('Pause e Resume', () => {
    it('pausar impede que novas tarefas da fila iniciem', async () => {
      const scheduler = new Scheduler({ concorrencia: 2 });
      const iniciadas = [];

      scheduler.adicionar(
        () => new Promise(r => { iniciadas.push(1); setTimeout(r, 200); }),
        { prioridade: 5 }
      );
      scheduler.adicionar(
        () => new Promise(r => { iniciadas.push(2); setTimeout(r, 200); }),
        { prioridade: 5 }
      );

      await esperar(20);
      scheduler.pausar();

      scheduler.adicionar(
        () => new Promise(r => { iniciadas.push(3); r(); }),
        { prioridade: 5 }
      );

      await esperar(100);
      // Tarefa 3 não deve ter iniciado (scheduler pausado)
      expect(iniciadas).not.toContain(3);
    });

    it('retomar processa as tarefas que ficaram na fila', async () => {
      const scheduler = new Scheduler({ concorrencia: 1 });
      const resultados = [];

      scheduler.pausar();
      const p = scheduler.adicionar(
        () => Promise.resolve(resultados.push('executou')),
        { prioridade: 5 }
      );

      await esperar(50);
      expect(resultados).toHaveLength(0); // pausado, não executou

      scheduler.retomar();
      await p;
      expect(resultados).toContain('executou');
    });

    it('tarefas em andamento não são interrompidas ao pausar', async () => {
      const scheduler = new Scheduler({ concorrencia: 2 });
      let concluiu = false;

      const p = scheduler.adicionar(
        () => new Promise(r => setTimeout(() => { concluiu = true; r(); }, 100)),
        { prioridade: 5 }
      );

      await esperar(20);
      scheduler.pausar();

      await p;
      expect(concluiu).toBe(true);
    });
  });

  describe('Status', () => {
    it('reporta corretamente as tarefas em execução e na fila', async () => {
      const scheduler = new Scheduler({ concorrencia: 2 });

      // Adiciona 4 tarefas lentas; 2 executam, 2 ficam na fila
      for (let i = 0; i < 4; i++) {
        scheduler.adicionar(tarefaComDuracao(300), { prioridade: 5 });
      }

      await esperar(50); // tempo para as primeiras iniciarem

      const status = scheduler.status();
      expect(status.emExecucao).toBe(2);
      expect(status.naFila).toBe(2);
    });

    it('atualiza status após conclusões', async () => {
      const scheduler = new Scheduler({ concorrencia: 3 });

      const promessas = Array.from({ length: 3 }, () =>
        scheduler.adicionar(tarefaComDuracao(100), { prioridade: 5 })
      );

      await Promise.all(promessas);

      const status = scheduler.status();
      expect(status.concluidas).toBe(3);
      expect(status.emExecucao).toBe(0);
      expect(status.naFila).toBe(0);
    });

    it('contabiliza falhas separadamente', async () => {
      const scheduler = new Scheduler({ concorrencia: 2 });

      const p1 = scheduler.adicionar(
        () => Promise.reject(new Error('falha')),
        { prioridade: 5 }
      ).catch(() => {});

      const p2 = scheduler.adicionar(
        () => Promise.resolve('ok'),
        { prioridade: 5 }
      );

      await Promise.all([p1, p2]);

      const status = scheduler.status();
      expect(status.falhas).toBe(1);
      expect(status.concluidas).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Retorno das tarefas', () => {
    it('adicionar() retorna uma Promise com o resultado da tarefa', async () => {
      const scheduler = new Scheduler({ concorrencia: 1 });
      const resultado = await scheduler.adicionar(
        () => Promise.resolve(42),
        { prioridade: 5 }
      );
      expect(resultado).toBe(42);
    });

    it('adicionar() rejeita se a tarefa rejeitar', async () => {
      const scheduler = new Scheduler({ concorrencia: 1 });
      await expect(
        scheduler.adicionar(
          () => Promise.reject(new Error('ops')),
          { prioridade: 5 }
        )
      ).rejects.toThrow('ops');
    });
  });
});
