- [Fundamentos resumo](./mentos-learn.md)
- [Fundamentos desafios](./mentos-pratice.md)
# Testes dos Exercícios — JavaScript Fundamentos

## Setup

```bash
# 1. Instale as dependências
npm install

# 2. Crie a pasta para suas implementações
mkdir src
```

## Estrutura esperada

```
testes-js/
├── package.json
├── README.md
├── src/                  ← suas implementações ficam aqui
│   ├── ex01.js           # Executor Concorrente
│   ├── ex02.js           # Scheduler
│   ├── ex03.js           # Estado Reativo
│   ├── ex04.js           # Memoização
│   ├── ex05.js           # Event Emitter
│   ├── ex06.js           # Pipeline
│   ├── ex07.js           # Deep Equal
│   ├── ex08.js           # Validador
│   ├── ex09.js           # Bundler
│   └── ex10.js           # Sistema de Plugins
├── ex01.test.js
├── ex02.test.js
├── ...
└── ex10.test.js
```

## Como rodar

```bash
# Todos os testes de uma vez
npm test

# Um exercício específico
npm run test:ex01
npm run test:ex07

# Modo watch (re-executa ao salvar)
npm run test:watch

# Com cobertura de código
npx jest --coverage
```

## O que cada arquivo deve exportar

### ex01.js
```js
module.exports = { executarComLimite };
// executarComLimite(tarefas: Array<() => Promise>, limite: number) => Promise<Array>
```

### ex02.js
```js
module.exports = { Scheduler };
// new Scheduler({ concorrencia, intervaloVerificacao })
// .adicionar(fn, { prioridade, id }) => Promise
// .status() => { emExecucao, naFila, concluidas, falhas, tempoMedioExecucao }
// .pausar() / .retomar()
```

### ex03.js
```js
module.exports = { criarEstado, derivar, batch };
// criarEstado(inicial) => [getter, setter, observar]
// derivar(fn) => getter (com observar opcional)
// batch(fn) => void
```

### ex04.js
```js
module.exports = { memoizar };
// memoizar(fn, { ttl, maxEntradas, chave }) => memoFn
// memoFn.invalidar(args)
// memoFn.limpar()
// memoFn.stats() => { hits, misses, entradas, taxaAcerto }
// memoFn.preCarregar(args, valor)
```

### ex05.js
```js
module.exports = { EventEmitter };
// new EventEmitter()
// .on(evento, handler, contexto?)
// .off(evento, handler?)
// .once(evento, handler)
// .emit(evento, payload?)
// .emitAsync(evento, payload?) => Promise
// .eventos() => string[]
// .handlers(evento) => Function[]
```

### ex06.js
```js
module.exports = { Pipeline };
// Pipeline.de(array)
//   .filtrar(fn) .mapear(fn) .reduzir(fn, init)
//   .fatiar(i, f) .ordenar(fn?) .unico()
//   .agrupar(fn) .achatar(profundidade?)
//   .mapearAsync(fn, { concorrencia? }) .filtrarAsync(fn)
//   .resultado() .paraArray() => valor | Array | Promise
```

### ex07.js
```js
module.exports = { igualdadeProfunda };
// igualdadeProfunda(a, b) => boolean
```

### ex08.js
```js
module.exports = { criar, tipo };
// tipo.string() / .numero() / .booleano() / .array(tipo) / .objeto(schema)
//   .opcional() .coercivel() .transformar(fn)
//   .minLength(n) .maxLength(n) .formato(f)
//   .min(n) .max(n) .inteiro()
//   .minItens(n)
// criar(schema) => validador
//   .validar(dados) => { valido, erros }
//   .parsear(dados) => { valido, valor, erros }
```

### ex09.js
```js
module.exports = { bundlar };
// bundlar(caminhoEntrada: string) => string (código JavaScript)
```

### ex10.js
```js
module.exports = { criarAplicacao };
// criarAplicacao() => app
//   app.usar(plugin)
//   app.iniciar()
//   app.prover(nome, servico)
//   app.injetar(nome) => servico
//   app.hook(evento, fn)
//   app.dispararHook(evento, contexto) => Promise<contexto>
//   app.registrarHandler(acao, fn)
//   app.executar(acao, dados) => Promise
```

## Interpretando os resultados

```
PASS  ex07.test.js          ← todos os testes passaram
FAIL  ex01.test.js          ← algum teste falhou

  ✓ retorna os resultados na ordem original (12ms)
  ✗ nunca excede o limite de tarefas simultâneas

    ● nunca excede o limite de tarefas simultâneas

      expect(received).toBeLessThanOrEqual(expected)
      Expected: <= 2
      Received: 4          ← você está rodando 4 tarefas ao mesmo tempo com limite 2
```

## Dicas gerais

- **Comece pelos testes mais simples** dentro de cada arquivo (os primeiros `describe`)
- **Um teste por vez**: foque em fazer um grupo de testes passar antes de ir para o próximo
- **Leia a mensagem de erro completa** — ela diz exatamente o que foi recebido vs esperado
- **Use `test.only` ou `it.only`** para rodar apenas um teste específico enquanto desenvolve:
  ```js
  it.only('meu teste', () => { ... });
  ```
- **Use `console.log` nos testes** temporariamente para inspecionar valores

## Critério de aprovação

| Status | O que significa |
|--------|----------------|
| Todos os testes passando | ✅ Exercício completo |
| > 80% dos testes passando | 🟡 Quase lá — revise os casos de borda |
| < 50% dos testes passando | 🔴 Revise os fundamentos do tópico |

Lembre-se: passar em todos os testes não garante que a implementação é perfeita
(pode haver casos não cobertos), mas é um excelente indicador de qualidade.
