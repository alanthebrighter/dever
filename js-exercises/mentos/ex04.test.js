/**
 * EXERCÍCIO 4 — Memoização com TTL e Invalidação Seletiva
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { memoizar } = require('./src/ex04');
 */
const { memoizar } = require('./src/ex04');

function esperar(ms) {
  return new Promise(r => setTimeout(r, ms));
}

describe('Exercício 4 — memoizar', () => {

  describe('Cache básico', () => {
    it('chama a função original na primeira vez', async () => {
      const fn = jest.fn(async x => x * 2);
      const memoFn = memoizar(fn);

      const resultado = await memoFn(5);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(resultado).toBe(10);
    });

    it('usa o cache na segunda chamada com os mesmos argumentos', async () => {
      const fn = jest.fn(async x => x * 2);
      const memoFn = memoizar(fn);

      await memoFn(5);
      await memoFn(5);

      expect(fn).toHaveBeenCalledTimes(1); // só chamou uma vez
    });

    it('retorna exatamente o mesmo objeto (referência) do cache', async () => {
      const fn = jest.fn(async () => ({ dados: true }));
      const memoFn = memoizar(fn);

      const r1 = await memoFn();
      const r2 = await memoFn();

      expect(r1).toBe(r2); // mesma referência
    });

    it('trata argumentos diferentes como chaves diferentes', async () => {
      const fn = jest.fn(async x => x * 10);
      const memoFn = memoizar(fn);

      const r1 = await memoFn(1);
      const r2 = await memoFn(2);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(r1).toBe(10);
      expect(r2).toBe(20);
    });

    it('suporta chave customizada via opção `chave`', async () => {
      const fn = jest.fn(async (id) => ({ id }));
      const memoFn = memoizar(fn, { chave: id => `usuario:${id}` });

      await memoFn(42);
      await memoFn(42);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('TTL — expiração do cache', () => {
    it('retorna do cache antes do TTL expirar', async () => {
      const fn = jest.fn(async () => 'fresco');
      const memoFn = memoizar(fn, { ttl: 200 });

      await memoFn();
      await esperar(100);
      await memoFn();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('chama a função original após o TTL expirar', async () => {
      const fn = jest.fn(async () => 'valor');
      const memoFn = memoizar(fn, { ttl: 100 });

      await memoFn();
      await esperar(150); // TTL expirado
      await memoFn();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache stampede', () => {
    it('múltiplas chamadas simultâneas com mesma chave resultam em 1 chamada real', async () => {
      let chamadas = 0;
      const fn = jest.fn(async (id) => {
        chamadas++;
        await esperar(100);
        return { id };
      });

      const memoFn = memoizar(fn);

      // 10 chamadas simultâneas com o mesmo argumento
      const promessas = Array.from({ length: 10 }, () => memoFn(42));
      const resultados = await Promise.all(promessas);

      expect(chamadas).toBe(1); // apenas 1 chamada real
      // Todos devem ter recebido o mesmo resultado
      resultados.forEach(r => expect(r).toEqual({ id: 42 }));
    });

    it('após stampede resolvido, novas chamadas usam o cache normalmente', async () => {
      const fn = jest.fn(async () => { await esperar(50); return 'resultado'; });
      const memoFn = memoizar(fn);

      await Promise.all([memoFn(), memoFn(), memoFn()]);
      await memoFn(); // deve usar cache

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Invalidação', () => {
    it('invalidar(args) força nova chamada à função original', async () => {
      const fn = jest.fn(async x => x * 2);
      const memoFn = memoizar(fn);

      await memoFn(5);
      memoFn.invalidar(5);
      await memoFn(5);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('limpar() invalida todo o cache', async () => {
      const fn = jest.fn(async x => x);
      const memoFn = memoizar(fn);

      await memoFn(1);
      await memoFn(2);
      await memoFn(3);

      memoFn.limpar();

      await memoFn(1);
      await memoFn(2);

      expect(fn).toHaveBeenCalledTimes(5); // 3 originais + 2 após limpar
    });

    it('invalidar um argumento não afeta outros no cache', async () => {
      const fn = jest.fn(async x => x * 2);
      const memoFn = memoizar(fn);

      await memoFn(1);
      await memoFn(2);

      memoFn.invalidar(1);

      await memoFn(1); // deve chamar fn de novo
      await memoFn(2); // deve usar cache

      expect(fn).toHaveBeenCalledTimes(3); // 1+2+recalcula(1)
    });
  });

  describe('Estatísticas', () => {
    it('stats() reporta hits e misses corretamente', async () => {
      const fn = jest.fn(async x => x);
      const memoFn = memoizar(fn);

      await memoFn(1); // miss
      await memoFn(1); // hit
      await memoFn(2); // miss
      await memoFn(2); // hit
      await memoFn(2); // hit

      const stats = memoFn.stats();
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(2);
    });

    it('stats() calcula a taxa de acerto corretamente', async () => {
      const fn = jest.fn(async x => x);
      const memoFn = memoizar(fn);

      await memoFn(1); // miss
      await memoFn(1); // hit
      await memoFn(1); // hit

      const stats = memoFn.stats();
      expect(stats.taxaAcerto).toBeCloseTo(2 / 3, 2);
    });

    it('stats() reporta o número de entradas no cache', async () => {
      const fn = jest.fn(async x => x);
      const memoFn = memoizar(fn);

      await memoFn(1);
      await memoFn(2);
      await memoFn(3);

      const stats = memoFn.stats();
      expect(stats.entradas).toBe(3);
    });
  });

  describe('maxEntradas — Eviction LRU', () => {
    it('não ultrapassa maxEntradas entradas no cache', async () => {
      const fn = jest.fn(async x => x);
      const memoFn = memoizar(fn, { maxEntradas: 3 });

      await memoFn(1);
      await memoFn(2);
      await memoFn(3);
      await memoFn(4); // deve remover a menos recentemente usada

      const stats = memoFn.stats();
      expect(stats.entradas).toBeLessThanOrEqual(3);
    });

    it('remove a entrada menos recentemente usada (LRU)', async () => {
      const fn = jest.fn(async x => x);
      const memoFn = memoizar(fn, { maxEntradas: 2 });

      await memoFn(1); // entra: [1]
      await memoFn(2); // entra: [1, 2]
      await memoFn(1); // acessa 1 → mais recente: [2, 1]
      await memoFn(3); // entra, remove LRU (2): [1, 3]

      // 2 foi removido, deve chamar fn novamente
      await memoFn(2);
      expect(fn).toHaveBeenCalledWith(2);

      // Conta chamadas com argumento 2: deve ser 2 (original + após eviction)
      const chamadasCom2 = fn.mock.calls.filter(args => args[0] === 2).length;
      expect(chamadasCom2).toBe(2);
    });
  });

  describe('preCarregar', () => {
    it('preCarregar() preenche o cache sem chamar a função', async () => {
      const fn = jest.fn(async x => x * 2);
      const memoFn = memoizar(fn);

      memoFn.preCarregar(5, 999);
      const resultado = await memoFn(5);

      expect(fn).not.toHaveBeenCalled();
      expect(resultado).toBe(999);
    });
  });
});
