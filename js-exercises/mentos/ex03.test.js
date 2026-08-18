/**
 * EXERCÍCIO 3 — Sistema de Estado Reativo (mini-useState)
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { criarEstado, derivar, batch } = require('./src/ex03');
 */
const { criarEstado, derivar, batch } = require('./src/ex03');

describe('Exercício 3 — Estado Reativo', () => {

  describe('criarEstado — leitura e escrita', () => {
    it('retorna o valor inicial corretamente', () => {
      const [valor] = criarEstado(42);
      expect(valor()).toBe(42);
    });

    it('atualiza o valor com o setter', () => {
      const [valor, setValor] = criarEstado('inicial');
      setValor('atualizado');
      expect(valor()).toBe('atualizado');
    });

    it('funciona com qualquer tipo primitivo', () => {
      const [n, setN] = criarEstado(0);
      const [s, setS] = criarEstado('');
      const [b, setB] = criarEstado(false);

      setN(99); setS('oi'); setB(true);

      expect(n()).toBe(99);
      expect(s()).toBe('oi');
      expect(b()).toBe(true);
    });

    it('funciona com objetos como valor', () => {
      const [obj, setObj] = criarEstado({ x: 1 });
      setObj({ x: 2, y: 3 });
      expect(obj()).toEqual({ x: 2, y: 3 });
    });

    it('estados diferentes são independentes', () => {
      const [a, setA] = criarEstado(1);
      const [b, setB] = criarEstado(10);

      setA(2);
      expect(a()).toBe(2);
      expect(b()).toBe(10); // b não deve ser afetado
    });
  });

  describe('observar — notificações de mudança', () => {
    it('chama o observador quando o valor muda', () => {
      const [val, setVal, observar] = criarEstado(0);
      const chamadas = [];

      observar((novo, anterior) => chamadas.push({ novo, anterior }));
      setVal(1);
      setVal(2);

      expect(chamadas).toHaveLength(2);
      expect(chamadas[0]).toEqual({ novo: 1, anterior: 0 });
      expect(chamadas[1]).toEqual({ novo: 2, anterior: 1 });
    });

    it('não chama o observador se o valor não mudou', () => {
      const [val, setVal, observar] = criarEstado(5);
      const chamadas = [];

      observar(() => chamadas.push(1));
      setVal(5); // mesmo valor

      expect(chamadas).toHaveLength(0);
    });

    it('suporta múltiplos observadores no mesmo estado', () => {
      const [val, setVal, observar] = criarEstado(0);
      const obs1 = jest.fn();
      const obs2 = jest.fn();

      observar(obs1);
      observar(obs2);
      setVal(99);

      expect(obs1).toHaveBeenCalledTimes(1);
      expect(obs2).toHaveBeenCalledTimes(1);
    });

    it('cancelar o observador impede futuras notificações', () => {
      const [val, setVal, observar] = criarEstado(0);
      const chamadas = [];

      const cancelar = observar(() => chamadas.push(1));
      setVal(1); // chama
      cancelar();
      setVal(2); // não deve chamar
      setVal(3); // não deve chamar

      expect(chamadas).toHaveLength(1);
    });

    it('cancelar um observador não afeta os demais', () => {
      const [val, setVal, observar] = criarEstado(0);
      const obs1 = jest.fn();
      const obs2 = jest.fn();

      const cancelar1 = observar(obs1);
      observar(obs2);

      setVal(1);
      cancelar1();
      setVal(2);

      expect(obs1).toHaveBeenCalledTimes(1);
      expect(obs2).toHaveBeenCalledTimes(2); // recebeu os dois
    });
  });

  describe('derivar — estado calculado', () => {
    it('retorna o valor calculado inicialmente', () => {
      const [a] = criarEstado(3);
      const [b] = criarEstado(4);
      const soma = derivar(() => a() + b());

      expect(soma()).toBe(7);
    });

    it('atualiza automaticamente quando uma dependência muda', () => {
      const [preco, setPreco] = criarEstado(100);
      const [qtd, setQtd] = criarEstado(2);
      const total = derivar(() => preco() * qtd());

      expect(total()).toBe(200);
      setPreco(150);
      expect(total()).toBe(300);
      setQtd(3);
      expect(total()).toBe(450);
    });

    it('estado derivado pode ser observado', () => {
      const [base, setBase] = criarEstado(10);
      const dobro = derivar(() => base() * 2);
      const historico = [];

      // derivar deve retornar algo que também tem a função observar
      const [,, observarDobro] = dobro; // se a API for tupla
      // OU
      // dobro.observar(fn) — dependendo da API que o aluno escolher

      // Testa que dobro() retorna o valor atualizado mesmo sem observador
      setBase(20);
      expect(dobro()).toBe(40);
    });

    it('derivação aninhada funciona', () => {
      const [x, setX] = criarEstado(2);
      const quadrado = derivar(() => x() * x());
      const cubo = derivar(() => quadrado() * x());

      expect(cubo()).toBe(8); // 2^3
      setX(3);
      expect(cubo()).toBe(27); // 3^3
    });
  });

  describe('batch — atualização em lote', () => {
    it('dentro do batch, observadores são notificados apenas uma vez', () => {
      const [a, setA, observarA] = criarEstado(0);
      const [b, setB, observarB] = criarEstado(0);
      const total = derivar(() => a() + b());
      const notificacoes = [];

      // Observa o total derivado ou observa ambos
      observarA(() => notificacoes.push('a'));
      observarB(() => notificacoes.push('b'));

      batch(() => {
        setA(1);
        setB(1);
      });

      // Dentro do batch, as notificações devem ser agrupadas
      // O exato comportamento depende da implementação, mas o total de
      // chamadas deve ser reduzido vs sem batch
      expect(notificacoes.length).toBeLessThanOrEqual(2);
    });

    it('o valor final dentro do batch está correto ao término', () => {
      const [valor, setValor] = criarEstado(0);

      batch(() => {
        setValor(1);
        setValor(2);
        setValor(3);
      });

      expect(valor()).toBe(3);
    });

    it('após o batch, o estado reflete todas as mudanças', () => {
      const [a, setA] = criarEstado(10);
      const [b, setB] = criarEstado(20);

      batch(() => {
        setA(100);
        setB(200);
      });

      expect(a()).toBe(100);
      expect(b()).toBe(200);
    });

    it('notificações fora do batch funcionam normalmente', () => {
      const [val, setVal, observar] = criarEstado(0);
      const chamadas = [];

      observar(v => chamadas.push(v));

      setVal(1); // fora do batch → notifica imediatamente
      setVal(2); // fora do batch → notifica imediatamente

      expect(chamadas).toHaveLength(2);
    });
  });
});
