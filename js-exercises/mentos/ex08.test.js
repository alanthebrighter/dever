/**
 * EXERCÍCIO 8 — Motor de Validação e Comparação com Schema
 *
 * Aponte o import para o arquivo da sua implementação:
 *   const { criar, tipo } = require('./src/ex08');
 */
const { criar, tipo } = require('./src/ex08');

describe('Exercício 8 — Validador com Schema', () => {

  describe('tipo.string()', () => {
    it('aceita strings', () => {
      const schema = criar({ nome: tipo.string() });
      expect(schema.validar({ nome: 'Ana' }).valido).toBe(true);
    });

    it('rejeita não-strings sem coerção', () => {
      const schema = criar({ nome: tipo.string() });
      expect(schema.validar({ nome: 42 }).valido).toBe(false);
      expect(schema.validar({ nome: true }).valido).toBe(false);
      expect(schema.validar({ nome: null }).valido).toBe(false);
    });

    it('minLength valida o comprimento mínimo', () => {
      const schema = criar({ nome: tipo.string().minLength(3) });
      expect(schema.validar({ nome: 'Ab' }).valido).toBe(false);
      expect(schema.validar({ nome: 'Abc' }).valido).toBe(true);
    });

    it('maxLength valida o comprimento máximo', () => {
      const schema = criar({ nome: tipo.string().maxLength(5) });
      expect(schema.validar({ nome: 'Abcdef' }).valido).toBe(false);
      expect(schema.validar({ nome: 'Abcde' }).valido).toBe(true);
    });

    it('formato email valida o padrão de email', () => {
      const schema = criar({ email: tipo.string().formato('email') });
      expect(schema.validar({ email: 'teste@email.com' }).valido).toBe(true);
      expect(schema.validar({ email: 'nao-e-email' }).valido).toBe(false);
      expect(schema.validar({ email: 'sem@dominio' }).valido).toBe(false);
    });

    it('com coercivel(), aceita números convertíveis para string', () => {
      const schema = criar({ val: tipo.string().coercivel() });
      expect(schema.validar({ val: 42 }).valido).toBe(true);
    });
  });

  describe('tipo.numero()', () => {
    it('aceita números', () => {
      const schema = criar({ idade: tipo.numero() });
      expect(schema.validar({ idade: 25 }).valido).toBe(true);
      expect(schema.validar({ idade: 3.14 }).valido).toBe(true);
    });

    it('rejeita strings sem coerção', () => {
      const schema = criar({ idade: tipo.numero() });
      expect(schema.validar({ idade: '25' }).valido).toBe(false);
    });

    it('min valida o valor mínimo', () => {
      const schema = criar({ idade: tipo.numero().min(0) });
      expect(schema.validar({ idade: -1 }).valido).toBe(false);
      expect(schema.validar({ idade: 0 }).valido).toBe(true);
      expect(schema.validar({ idade: 1 }).valido).toBe(true);
    });

    it('max valida o valor máximo', () => {
      const schema = criar({ nota: tipo.numero().max(10) });
      expect(schema.validar({ nota: 11 }).valido).toBe(false);
      expect(schema.validar({ nota: 10 }).valido).toBe(true);
    });

    it('inteiro rejeita números decimais', () => {
      const schema = criar({ qtd: tipo.numero().inteiro() });
      expect(schema.validar({ qtd: 3.5 }).valido).toBe(false);
      expect(schema.validar({ qtd: 3 }).valido).toBe(true);
    });

    it('com coercivel(), aceita string numérica', () => {
      const schema = criar({ qtd: tipo.numero().coercivel() });
      expect(schema.validar({ qtd: '42' }).valido).toBe(true);
    });

    it('com coercivel(), rejeita string não numérica', () => {
      const schema = criar({ qtd: tipo.numero().coercivel() });
      expect(schema.validar({ qtd: 'abc' }).valido).toBe(false);
    });
  });

  describe('tipo.booleano()', () => {
    it('aceita booleanos', () => {
      const schema = criar({ ativo: tipo.booleano() });
      expect(schema.validar({ ativo: true }).valido).toBe(true);
      expect(schema.validar({ ativo: false }).valido).toBe(true);
    });

    it('rejeita não-booleanos sem coerção', () => {
      const schema = criar({ ativo: tipo.booleano() });
      expect(schema.validar({ ativo: 1 }).valido).toBe(false);
      expect(schema.validar({ ativo: 'true' }).valido).toBe(false);
    });

    it('com coercivel(), converte "true"/"false" e 1/0', () => {
      const schema = criar({ ativo: tipo.booleano().coercivel() });
      expect(schema.validar({ ativo: 'true' }).valido).toBe(true);
      expect(schema.validar({ ativo: 'false' }).valido).toBe(true);
      expect(schema.validar({ ativo: 1 }).valido).toBe(true);
      expect(schema.validar({ ativo: 0 }).valido).toBe(true);
    });
  });

  describe('tipo.array()', () => {
    it('aceita arrays', () => {
      const schema = criar({ tags: tipo.array(tipo.string()) });
      expect(schema.validar({ tags: ['a', 'b'] }).valido).toBe(true);
    });

    it('rejeita não-arrays', () => {
      const schema = criar({ tags: tipo.array(tipo.string()) });
      expect(schema.validar({ tags: 'nao-e-array' }).valido).toBe(false);
    });

    it('valida o tipo dos itens do array', () => {
      const schema = criar({ ids: tipo.array(tipo.numero()) });
      expect(schema.validar({ ids: [1, 2, 3] }).valido).toBe(true);
      expect(schema.validar({ ids: [1, '2', 3] }).valido).toBe(false);
    });

    it('minItens valida o número mínimo de elementos', () => {
      const schema = criar({ tags: tipo.array(tipo.string()).minItens(1) });
      expect(schema.validar({ tags: [] }).valido).toBe(false);
      expect(schema.validar({ tags: ['uma'] }).valido).toBe(true);
    });
  });

  describe('tipo.objeto()', () => {
    it('valida schemas aninhados', () => {
      const schema = criar({
        endereco: tipo.objeto({
          rua: tipo.string(),
          numero: tipo.numero()
        })
      });

      expect(schema.validar({
        endereco: { rua: 'Av. Principal', numero: 100 }
      }).valido).toBe(true);

      expect(schema.validar({
        endereco: { rua: 'Av. Principal', numero: 'cem' }
      }).valido).toBe(false);
    });
  });

  describe('Campos opcionais', () => {
    it('campo opcional não falha quando ausente', () => {
      const schema = criar({
        nome: tipo.string(),
        apelido: tipo.string().opcional()
      });

      expect(schema.validar({ nome: 'Ana' }).valido).toBe(true);
    });

    it('campo opcional ainda valida quando presente', () => {
      const schema = criar({
        apelido: tipo.string().opcional()
      });

      expect(schema.validar({ apelido: 42 }).valido).toBe(false);
    });

    it('campo obrigatório falha quando ausente', () => {
      const schema = criar({ nome: tipo.string() });
      expect(schema.validar({}).valido).toBe(false);
    });
  });

  describe('Mensagens de erro', () => {
    it('retorna array de erros quando inválido', () => {
      const schema = criar({ nome: tipo.string(), idade: tipo.numero() });
      const resultado = schema.validar({ nome: 42, idade: 'vinte' });

      expect(resultado.valido).toBe(false);
      expect(Array.isArray(resultado.erros)).toBe(true);
      expect(resultado.erros.length).toBeGreaterThan(0);
    });

    it('os erros incluem o nome do campo', () => {
      const schema = criar({ email: tipo.string().formato('email') });
      const resultado = schema.validar({ email: 'invalido' });

      const temCampoNoErro = resultado.erros.some(e =>
        e.toLowerCase().includes('email') || e.includes('email')
      );
      expect(temCampoNoErro).toBe(true);
    });

    it('erros em campos aninhados incluem o caminho completo', () => {
      const schema = criar({
        endereco: tipo.objeto({
          cidade: tipo.string()
        })
      });

      const resultado = schema.validar({
        endereco: { cidade: 123 }
      });

      // O erro deve mencionar "endereco" e "cidade" ou "endereco.cidade"
      const textoErros = resultado.erros.join(' ');
      expect(textoErros).toMatch(/endereco/i);
    });

    it('retorna erros vazios quando válido', () => {
      const schema = criar({ nome: tipo.string() });
      const resultado = schema.validar({ nome: 'Ana' });

      expect(resultado.valido).toBe(true);
      expect(resultado.erros).toHaveLength(0);
    });
  });

  describe('Transformações', () => {
    it('transformar converte o valor antes de retornar', () => {
      const schema = criar({
        nome: tipo.string().transformar(s => s.trim().toLowerCase())
      });

      const { valor } = schema.parsear({ nome: '  ANA  ' });
      expect(valor.nome).toBe('ana');
    });

    it('transformar string em Date', () => {
      const schema = criar({
        data: tipo.string().transformar(s => new Date(s))
      });

      const { valor } = schema.parsear({ data: '2024-01-01' });
      expect(valor.data).toBeInstanceOf(Date);
    });

    it('parsear retorna o objeto transformado', () => {
      const schema = criar({
        nome: tipo.string().transformar(s => s.toUpperCase()),
        idade: tipo.numero()
      });

      const { valor, valido } = schema.parsear({ nome: 'ana', idade: 25 });
      expect(valido).toBe(true);
      expect(valor.nome).toBe('ANA');
      expect(valor.idade).toBe(25);
    });

    it('parsear falha se o valor for inválido', () => {
      const schema = criar({ nome: tipo.string() });
      const { valido, erros } = schema.parsear({ nome: 123 });

      expect(valido).toBe(false);
      expect(erros.length).toBeGreaterThan(0);
    });
  });

  describe('Schema completo', () => {
    it('valida um objeto complexo com múltiplos tipos', () => {
      const schema = criar({
        nome: tipo.string().minLength(2).maxLength(50),
        idade: tipo.numero().min(0).max(150).inteiro(),
        email: tipo.string().formato('email'),
        ativo: tipo.booleano(),
        tags: tipo.array(tipo.string()).minItens(1),
        endereco: tipo.objeto({
          rua: tipo.string(),
          cidade: tipo.string()
        }).opcional()
      });

      const valido = schema.validar({
        nome: 'Ana',
        idade: 25,
        email: 'ana@email.com',
        ativo: true,
        tags: ['dev', 'js']
      });

      expect(valido.valido).toBe(true);
      expect(valido.erros).toHaveLength(0);
    });
  });
});
