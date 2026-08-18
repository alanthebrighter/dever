/**
 * EXERCÍCIO 5 — Event Emitter com Contexto Controlado
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { EventEmitter } = require('./src/ex05');
 */
const { EventEmitter } = require('./src/ex05');

describe('Exercício 5 — EventEmitter', () => {

  describe('.on() e .emit()', () => {
    it('chama o handler quando o evento é emitido', () => {
      const em = new EventEmitter();
      const fn = jest.fn();

      em.on('teste', fn);
      em.emit('teste');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passa o payload corretamente ao handler', () => {
      const em = new EventEmitter();
      const recebido = [];

      em.on('dados', (payload) => recebido.push(payload));
      em.emit('dados', { valor: 42 });

      expect(recebido[0]).toEqual({ valor: 42 });
    });

    it('chama múltiplos handlers registrados no mesmo evento', () => {
      const em = new EventEmitter();
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      const fn3 = jest.fn();

      em.on('x', fn1);
      em.on('x', fn2);
      em.on('x', fn3);
      em.emit('x');

      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
      expect(fn3).toHaveBeenCalledTimes(1);
    });

    it('não chama handlers de outros eventos', () => {
      const em = new EventEmitter();
      const fnA = jest.fn();
      const fnB = jest.fn();

      em.on('A', fnA);
      em.on('B', fnB);
      em.emit('A');

      expect(fnA).toHaveBeenCalledTimes(1);
      expect(fnB).not.toHaveBeenCalled();
    });

    it('emitir evento sem handlers não lança erro', () => {
      const em = new EventEmitter();
      expect(() => em.emit('evento-inexistente')).not.toThrow();
    });
  });

  describe('.off()', () => {
    it('remove um handler específico', () => {
      const em = new EventEmitter();
      const fn = jest.fn();

      em.on('teste', fn);
      em.off('teste', fn);
      em.emit('teste');

      expect(fn).not.toHaveBeenCalled();
    });

    it('remover um handler não afeta os outros do mesmo evento', () => {
      const em = new EventEmitter();
      const fn1 = jest.fn();
      const fn2 = jest.fn();

      em.on('evento', fn1);
      em.on('evento', fn2);
      em.off('evento', fn1);
      em.emit('evento');

      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).toHaveBeenCalledTimes(1);
    });

    it('off() sem função remove todos os handlers do evento', () => {
      const em = new EventEmitter();
      const fn1 = jest.fn();
      const fn2 = jest.fn();

      em.on('evento', fn1);
      em.on('evento', fn2);
      em.off('evento');
      em.emit('evento');

      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
    });

    it('remover um handler já removido não lança erro', () => {
      const em = new EventEmitter();
      const fn = jest.fn();

      em.on('evento', fn);
      em.off('evento', fn);

      expect(() => em.off('evento', fn)).not.toThrow();
    });
  });

  describe('.once()', () => {
    it('chama o handler apenas uma vez', () => {
      const em = new EventEmitter();
      const fn = jest.fn();

      em.once('evento', fn);
      em.emit('evento');
      em.emit('evento');
      em.emit('evento');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passa o payload corretamente', () => {
      const em = new EventEmitter();
      let recebido;

      em.once('evento', (payload) => { recebido = payload; });
      em.emit('evento', 'olá');

      expect(recebido).toBe('olá');
    });

    it('handler do once pode ser removido antes de disparar', () => {
      const em = new EventEmitter();
      const fn = jest.fn();

      em.once('evento', fn);
      em.off('evento', fn);
      em.emit('evento');

      expect(fn).not.toHaveBeenCalled();
    });

    it('once e on coexistem no mesmo evento', () => {
      const em = new EventEmitter();
      const onFn = jest.fn();
      const onceFn = jest.fn();

      em.on('evento', onFn);
      em.once('evento', onceFn);

      em.emit('evento');
      em.emit('evento');

      expect(onFn).toHaveBeenCalledTimes(2);
      expect(onceFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Contexto (this binding)', () => {
    it('bind manual funciona com function declaration', () => {
      const em = new EventEmitter();

      class Componente {
        constructor() { this.valor = 42; this.recebido = null; }
        handler(dados) { this.recebido = this.valor; }
      }

      const comp = new Componente();
      em.on('evento', comp.handler.bind(comp));
      em.emit('evento', {});

      expect(comp.recebido).toBe(42);
    });

    it('terceiro argumento de .on() define o this do handler', () => {
      const em = new EventEmitter();
      const contexto = { nome: 'Contexto Certo', chamado: false };

      em.on('evento', function () {
        this.chamado = true;
        expect(this.nome).toBe('Contexto Certo');
      }, contexto);

      em.emit('evento');
      expect(contexto.chamado).toBe(true);
    });

    it('this em arrow function não é sobrescrito pelo contexto', () => {
      const em = new EventEmitter();
      const externo = { valor: 'externo' };
      const contextoPassado = { valor: 'passado' };
      let capturedThis;

      // Arrow function não pode ter o this alterado
      em.on('evento', () => { capturedThis = externo; }, contextoPassado);
      em.emit('evento');

      // O this dentro da arrow aponta para o escopo léxico, não para contextoPassado
      expect(capturedThis).toBe(externo);
    });
  });

  describe('.eventos() e .handlers()', () => {
    it('eventos() lista os nomes dos eventos com handlers registrados', () => {
      const em = new EventEmitter();
      em.on('A', () => {});
      em.on('B', () => {});
      em.on('C', () => {});

      const lista = em.eventos();
      expect(lista).toContain('A');
      expect(lista).toContain('B');
      expect(lista).toContain('C');
    });

    it('eventos() não inclui evento após remover todos os handlers', () => {
      const em = new EventEmitter();
      const fn = jest.fn();

      em.on('temporario', fn);
      em.off('temporario');

      expect(em.eventos()).not.toContain('temporario');
    });

    it('handlers() retorna os handlers de um evento específico', () => {
      const em = new EventEmitter();
      const fn1 = jest.fn();
      const fn2 = jest.fn();

      em.on('evento', fn1);
      em.on('evento', fn2);

      const lista = em.handlers('evento');
      expect(lista).toHaveLength(2);
    });
  });

  describe('.emitAsync()', () => {
    it('aguarda handlers assíncronos antes de resolver', async () => {
      const em = new EventEmitter();
      const ordem = [];

      em.on('evento', async () => {
        await new Promise(r => setTimeout(r, 50));
        ordem.push('handler 1 concluiu');
      });

      em.on('evento', async () => {
        await new Promise(r => setTimeout(r, 30));
        ordem.push('handler 2 concluiu');
      });

      await em.emitAsync('evento');
      ordem.push('emitAsync resolveu');

      // emitAsync só deve resolver após todos os handlers
      expect(ordem[0]).toMatch(/concluiu/);
      expect(ordem[1]).toMatch(/concluiu/);
      expect(ordem[2]).toBe('emitAsync resolveu');
    });

    it('rejeita se algum handler assíncrono rejeitar', async () => {
      const em = new EventEmitter();

      em.on('evento', async () => {
        throw new Error('handler falhou');
      });

      await expect(em.emitAsync('evento')).rejects.toThrow('handler falhou');
    });

    it('emitAsync sem handlers resolve imediatamente', async () => {
      const em = new EventEmitter();
      await expect(em.emitAsync('evento-vazio')).resolves.not.toThrow();
    });
  });
});
