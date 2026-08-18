/**
 * EXERCÍCIO 6 — Pipeline de Processamento com Encadeamento de Métodos
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { Pipeline } = require('./src/ex06');
 */
const { Pipeline } = require('./src/ex06');

describe('Exercício 6 — Pipeline', () => {

  describe('Operações síncronas básicas', () => {
    it('filtrar remove itens que não passam no predicado', () => {
      const resultado = Pipeline
        .de([1, 2, 3, 4, 5])
        .filtrar(n => n % 2 === 0)
        .paraArray();

      expect(resultado).toEqual([2, 4]);
    });

    it('mapear transforma cada item', () => {
      const resultado = Pipeline
        .de([1, 2, 3])
        .mapear(n => n * 10)
        .paraArray();

      expect(resultado).toEqual([10, 20, 30]);
    });

    it('reduzir acumula os valores e retorna o resultado', () => {
      const resultado = Pipeline
        .de([1, 2, 3, 4, 5])
        .reduzir((acc, n) => acc + n, 0)
        .resultado();

      expect(resultado).toBe(15);
    });

    it('fatiar retorna o subarray correto', () => {
      const resultado = Pipeline
        .de([10, 20, 30, 40, 50])
        .fatiar(1, 4)
        .paraArray();

      expect(resultado).toEqual([20, 30, 40]);
    });

    it('ordenar ordena com comparador customizado', () => {
      const resultado = Pipeline
        .de([3, 1, 4, 1, 5, 9, 2, 6])
        .ordenar((a, b) => a - b)
        .paraArray();

      expect(resultado).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
    });

    it('unico remove duplicatas', () => {
      const resultado = Pipeline
        .de([1, 2, 2, 3, 3, 3, 4])
        .unico()
        .paraArray();

      expect(resultado).toEqual([1, 2, 3, 4]);
    });

    it('agrupar agrupa itens por critério', () => {
      const resultado = Pipeline
        .de([1, 2, 3, 4, 5, 6])
        .agrupar(n => n % 2 === 0 ? 'par' : 'impar')
        .resultado();

      expect(resultado).toEqual({
        par: [2, 4, 6],
        impar: [1, 3, 5]
      });
    });

    it('achatar nivela o array', () => {
      const resultado = Pipeline
        .de([[1, 2], [3, [4, 5]]])
        .achatar()
        .paraArray();

      expect(resultado).toEqual([1, 2, 3, [4, 5]]);
    });

    it('achatar com profundidade 2 nivela dois níveis', () => {
      const resultado = Pipeline
        .de([[1, [2]], [3, [4, [5]]]])
        .achatar(2)
        .paraArray();

      expect(resultado).toEqual([1, 2, 3, 4, [5]]);
    });
  });

  describe('Encadeamento de operações', () => {
    it('encadeia múltiplas operações na ordem correta', () => {
      const resultado = Pipeline
        .de([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .filtrar(n => n % 2 === 0)       // [2, 4, 6, 8, 10]
        .mapear(n => n * n)              // [4, 16, 36, 64, 100]
        .reduzir((acc, n) => acc + n, 0) // 220
        .resultado();

      expect(resultado).toBe(220);
    });

    it('filtrar → ordenar → fatiar funciona em sequência', () => {
      const resultado = Pipeline
        .de([5, 3, 8, 1, 9, 2, 7, 4, 6])
        .filtrar(n => n > 3)
        .ordenar((a, b) => a - b)
        .fatiar(0, 3)
        .paraArray();

      expect(resultado).toEqual([4, 5, 6]);
    });

    it('mapear → unico → ordenar', () => {
      const resultado = Pipeline
        .de([1, 2, 2, 3, 3, 3])
        .mapear(n => n * 2)
        .unico()
        .ordenar((a, b) => b - a)
        .paraArray();

      expect(resultado).toEqual([6, 4, 2]);
    });
  });

  describe('Lazy Evaluation (execução preguiçosa)', () => {
    it('não executa as operações antes de .resultado() ou .paraArray()', () => {
      const chamadas = [];

      const pipeline = Pipeline
        .de([1, 2, 3])
        .filtrar(n => { chamadas.push(`filtrar:${n}`); return true; })
        .mapear(n => { chamadas.push(`mapear:${n}`); return n; });

      // Até aqui, nenhuma chamada deve ter ocorrido
      expect(chamadas).toHaveLength(0);

      // Agora executa
      pipeline.paraArray();
      expect(chamadas.length).toBeGreaterThan(0);
    });

    it('pode ser executado múltiplas vezes com o mesmo resultado', () => {
      const pipeline = Pipeline
        .de([1, 2, 3, 4, 5])
        .filtrar(n => n > 2)
        .mapear(n => n * 2);

      const r1 = pipeline.paraArray();
      const r2 = pipeline.paraArray();

      expect(r1).toEqual(r2);
      expect(r1).toEqual([6, 8, 10]);
    });

    it('operações não mutam o array de entrada original', () => {
      const original = [1, 2, 3, 4, 5];
      Pipeline.de(original).filtrar(n => n > 2).paraArray();
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Operações assíncronas', () => {
    it('mapearAsync transforma itens com função assíncrona', async () => {
      const resultado = await Pipeline
        .de([1, 2, 3])
        .mapearAsync(async n => {
          await new Promise(r => setTimeout(r, 10));
          return n * 2;
        })
        .paraArray();

      expect(resultado).toEqual([2, 4, 6]);
    });

    it('filtrarAsync filtra com função assíncrona', async () => {
      const resultado = await Pipeline
        .de([1, 2, 3, 4, 5])
        .filtrarAsync(async n => {
          await new Promise(r => setTimeout(r, 10));
          return n % 2 === 0;
        })
        .paraArray();

      expect(resultado).toEqual([2, 4]);
    });

    it('mapearAsync preserva a ordem dos resultados', async () => {
      // Tarefa 1 demora mais que a 2, mas o resultado 1 deve vir primeiro
      const tempos = [100, 50, 80, 20];

      const resultado = await Pipeline
        .de([0, 1, 2, 3])
        .mapearAsync(async (i) => {
          await new Promise(r => setTimeout(r, tempos[i]));
          return `item-${i}`;
        })
        .paraArray();

      expect(resultado).toEqual(['item-0', 'item-1', 'item-2', 'item-3']);
    });

    it('mapearAsync com limite de concorrência não excede o limite', async () => {
      let ativas = 0;
      let maxAtivas = 0;

      await Pipeline
        .de([1, 2, 3, 4, 5, 6])
        .mapearAsync(async (n) => {
          ativas++;
          maxAtivas = Math.max(maxAtivas, ativas);
          await new Promise(r => setTimeout(r, 50));
          ativas--;
          return n;
        }, { concorrencia: 2 })
        .paraArray();

      expect(maxAtivas).toBeLessThanOrEqual(2);
    });
  });

  describe('Casos extremos', () => {
    it('pipeline com array vazio retorna array vazio', () => {
      const resultado = Pipeline.de([]).filtrar(n => n > 0).paraArray();
      expect(resultado).toEqual([]);
    });

    it('reduzir em array vazio retorna valor inicial', () => {
      const resultado = Pipeline.de([]).reduzir((acc, n) => acc + n, 99).resultado();
      expect(resultado).toBe(99);
    });

    it('unico com array sem duplicatas mantém todos os itens', () => {
      const resultado = Pipeline.de([1, 2, 3]).unico().paraArray();
      expect(resultado).toEqual([1, 2, 3]);
    });
  });
});
