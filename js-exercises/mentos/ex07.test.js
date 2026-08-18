/**
 * EXERCÍCIO 7 — Função de Igualdade Profunda (Deep Equal)
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { igualdadeProfunda } = require('./src/ex07');
 */
const { igualdadeProfunda } = require('./src/ex07');

describe('Exercício 7 — igualdadeProfunda', () => {

  describe('Primitivos', () => {
    it('compara números iguais', () => {
      expect(igualdadeProfunda(1, 1)).toBe(true);
      expect(igualdadeProfunda(0, 0)).toBe(true);
      expect(igualdadeProfunda(-5, -5)).toBe(true);
    });

    it('diferencia números diferentes', () => {
      expect(igualdadeProfunda(1, 2)).toBe(false);
      expect(igualdadeProfunda(1, 1.1)).toBe(false);
    });

    it('NaN é igual a NaN (diferente do ===)', () => {
      expect(igualdadeProfunda(NaN, NaN)).toBe(true);
    });

    it('0 e -0 são diferentes (diferente do ===)', () => {
      expect(igualdadeProfunda(0, -0)).toBe(false);
      expect(igualdadeProfunda(-0, 0)).toBe(false);
    });

    it('compara strings', () => {
      expect(igualdadeProfunda('abc', 'abc')).toBe(true);
      expect(igualdadeProfunda('abc', 'ABC')).toBe(false);
      expect(igualdadeProfunda('', '')).toBe(true);
    });

    it('compara booleanos', () => {
      expect(igualdadeProfunda(true, true)).toBe(true);
      expect(igualdadeProfunda(false, false)).toBe(true);
      expect(igualdadeProfunda(true, false)).toBe(false);
    });

    it('não usa coerção de tipo', () => {
      expect(igualdadeProfunda(1, '1')).toBe(false);
      expect(igualdadeProfunda(0, false)).toBe(false);
      expect(igualdadeProfunda('', false)).toBe(false);
      expect(igualdadeProfunda(null, 0)).toBe(false);
    });

    it('null é igual apenas a null', () => {
      expect(igualdadeProfunda(null, null)).toBe(true);
      expect(igualdadeProfunda(null, undefined)).toBe(false);
      expect(igualdadeProfunda(null, 0)).toBe(false);
      expect(igualdadeProfunda(null, '')).toBe(false);
    });

    it('undefined é igual apenas a undefined', () => {
      expect(igualdadeProfunda(undefined, undefined)).toBe(true);
      expect(igualdadeProfunda(undefined, null)).toBe(false);
    });
  });

  describe('Arrays', () => {
    it('arrays com mesmos valores na mesma ordem são iguais', () => {
      expect(igualdadeProfunda([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('arrays com mesmos valores em ordens diferentes são diferentes', () => {
      expect(igualdadeProfunda([1, 2, 3], [3, 2, 1])).toBe(false);
    });

    it('arrays de tamanhos diferentes são diferentes', () => {
      expect(igualdadeProfunda([1, 2], [1, 2, 3])).toBe(false);
      expect(igualdadeProfunda([1, 2, 3], [1, 2])).toBe(false);
    });

    it('arrays vazios são iguais', () => {
      expect(igualdadeProfunda([], [])).toBe(true);
    });

    it('arrays aninhados são comparados profundamente', () => {
      expect(igualdadeProfunda([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
      expect(igualdadeProfunda([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
    });

    it('array vs objeto são diferentes', () => {
      expect(igualdadeProfunda([], {})).toBe(false);
      expect(igualdadeProfunda([1], { 0: 1 })).toBe(false);
    });
  });

  describe('Objetos', () => {
    it('objetos com as mesmas propriedades são iguais', () => {
      expect(igualdadeProfunda({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('a ordem das propriedades não importa', () => {
      expect(igualdadeProfunda({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    });

    it('objetos com propriedades diferentes são diferentes', () => {
      expect(igualdadeProfunda({ a: 1 }, { a: 2 })).toBe(false);
      expect(igualdadeProfunda({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('objetos com número diferente de propriedades são diferentes', () => {
      expect(igualdadeProfunda({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('objetos vazios são iguais', () => {
      expect(igualdadeProfunda({}, {})).toBe(true);
    });

    it('objetos aninhados são comparados profundamente', () => {
      const a = { x: { y: { z: 42 } } };
      const b = { x: { y: { z: 42 } } };
      const c = { x: { y: { z: 99 } } };

      expect(igualdadeProfunda(a, b)).toBe(true);
      expect(igualdadeProfunda(a, c)).toBe(false);
    });

    it('objeto com propriedade undefined vs objeto sem a propriedade', () => {
      expect(igualdadeProfunda({ a: undefined }, {})).toBe(false);
    });
  });

  describe('Tipos especiais', () => {
    it('Dates iguais são iguais', () => {
      expect(igualdadeProfunda(
        new Date('2024-01-01'),
        new Date('2024-01-01')
      )).toBe(true);
    });

    it('Dates diferentes são diferentes', () => {
      expect(igualdadeProfunda(
        new Date('2024-01-01'),
        new Date('2024-01-02')
      )).toBe(false);
    });

    it('Date vs string com mesma representação são diferentes', () => {
      expect(igualdadeProfunda(new Date('2024-01-01'), '2024-01-01')).toBe(false);
    });

    it('RegExp iguais (padrão e flags) são iguais', () => {
      expect(igualdadeProfunda(/abc/gi, /abc/gi)).toBe(true);
    });

    it('RegExp com flags diferentes são diferentes', () => {
      expect(igualdadeProfunda(/abc/g, /abc/i)).toBe(false);
      expect(igualdadeProfunda(/abc/g, /abc/gi)).toBe(false);
    });

    it('RegExp com padrões diferentes são diferentes', () => {
      expect(igualdadeProfunda(/abc/, /xyz/)).toBe(false);
    });

    it('Maps com mesmos pares são iguais', () => {
      expect(igualdadeProfunda(
        new Map([['a', 1], ['b', 2]]),
        new Map([['b', 2], ['a', 1]])  // ordem diferente
      )).toBe(true);
    });

    it('Maps com valores diferentes são diferentes', () => {
      expect(igualdadeProfunda(
        new Map([['a', 1]]),
        new Map([['a', 2]])
      )).toBe(false);
    });

    it('Sets com mesmos elementos são iguais (independente da ordem)', () => {
      expect(igualdadeProfunda(
        new Set([1, 2, 3]),
        new Set([3, 1, 2])
      )).toBe(true);
    });

    it('Sets com elementos diferentes são diferentes', () => {
      expect(igualdadeProfunda(
        new Set([1, 2, 3]),
        new Set([1, 2, 4])
      )).toBe(false);
    });

    it('Sets de tamanhos diferentes são diferentes', () => {
      expect(igualdadeProfunda(
        new Set([1, 2]),
        new Set([1, 2, 3])
      )).toBe(false);
    });
  });

  describe('Referências circulares', () => {
    it('objetos com referência circular são comparados sem stack overflow', () => {
      const obj1 = { a: 1 };
      obj1.self = obj1;

      const obj2 = { a: 1 };
      obj2.self = obj2;

      // Não deve travar, e deve retornar true
      expect(() => igualdadeProfunda(obj1, obj2)).not.toThrow();
      expect(igualdadeProfunda(obj1, obj2)).toBe(true);
    });

    it('referência circular diferente retorna false', () => {
      const obj1 = { a: 1 };
      obj1.self = obj1;

      const obj2 = { a: 2 };  // valor diferente
      obj2.self = obj2;

      expect(igualdadeProfunda(obj1, obj2)).toBe(false);
    });

    it('arrays com referência circular não travam', () => {
      const arr1 = [1, 2];
      arr1.push(arr1);

      const arr2 = [1, 2];
      arr2.push(arr2);

      expect(() => igualdadeProfunda(arr1, arr2)).not.toThrow();
      expect(igualdadeProfunda(arr1, arr2)).toBe(true);
    });
  });

  describe('Comparações entre tipos distintos', () => {
    it('array e objeto são sempre diferentes', () => {
      expect(igualdadeProfunda([], {})).toBe(false);
    });

    it('Date e objeto simples são diferentes', () => {
      const d = new Date();
      expect(igualdadeProfunda(d, { getTime: d.getTime.bind(d) })).toBe(false);
    });

    it('Map e objeto simples são diferentes', () => {
      expect(igualdadeProfunda(new Map([['a', 1]]), { a: 1 })).toBe(false);
    });

    it('Set e array são diferentes', () => {
      expect(igualdadeProfunda(new Set([1, 2, 3]), [1, 2, 3])).toBe(false);
    });
  });
});
