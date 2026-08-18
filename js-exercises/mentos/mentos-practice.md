# Exercícios Práticos — Fundamentos de JavaScript

> Cada exercício foi projetado para levar **1 a 2 dias** de trabalho real. Leia com atenção, planeje antes de codar, e resista ao Google nos primeiros momentos — a frustração faz parte do aprendizado.

---

## Sumário

- [Exercícios — Event Loop](#-event-loop)
- [Exercícios — Closures](#-closures)
- [Exercícios — this: Arrow vs Function](#-this-arrow-vs-function)
- [Exercícios — == vs ===](#--vs-)
- [Exercícios — Sistema de Módulos](#-sistema-de-módulos)

---

## ⚙️ Event Loop

### Exercício 1 — Executor de Tarefas Concorrentes com Limite

**Contexto:**
Você está construindo um sistema de processamento de tarefas para um serviço de upload de arquivos. O sistema precisa processar N arquivos ao mesmo tempo, mas a infraestrutura suporta no máximo **K uploads simultâneos**. Se você disparar todos de uma vez, o servidor cai. Se fizer um por um, é lento demais.

**O que você deve implementar:**

Uma função `executarComLimite(tarefas, limite)` que:

1. Recebe um array de funções assíncronas (`tarefas`) — cada uma retorna uma Promise
2. Recebe um número `limite` — quantidade máxima de tarefas rodando **ao mesmo tempo**
3. Retorna uma Promise que resolve com um array de resultados **na mesma ordem das tarefas originais**, independentemente de qual terminou primeiro
4. Assim que uma tarefa termina, **imediatamente** começa a próxima da fila (não espera o "lote" inteiro acabar)
5. Se uma tarefa falhar, o executor **não para** — registra o erro e continua com as demais

**Comportamento esperado:**

```javascript
// Simula uma tarefa que demora `ms` milissegundos
function criarTarefa(id, ms, falha = false) {
  return () => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (falha) reject(new Error(`Tarefa ${id} falhou`));
      else resolve(`Resultado ${id}`);
    }, ms);
  });
}

const tarefas = [
  criarTarefa(1, 3000),
  criarTarefa(2, 500),
  criarTarefa(3, 1000),
  criarTarefa(4, 200, true), // vai falhar
  criarTarefa(5, 800),
  criarTarefa(6, 1500),
];

const resultados = await executarComLimite(tarefas, 2);

console.log(resultados);
// [
//   "Resultado 1",
//   "Resultado 2",
//   "Resultado 3",
//   Error: "Tarefa 4 falhou",
//   "Resultado 5",
//   "Resultado 6"
// ]
```

**Restrições:**
- Não use `Promise.all()` diretamente na lista completa
- Não use bibliotecas externas (sem `p-limit`, `bluebird`, etc.)
- O tempo total de execução deve ser significativamente menor do que executar todas em série

**Pontos de atenção (não são dicas, são armadilhas):**
- Como você garante que a **ordem dos resultados** é preservada mesmo que a tarefa 2 termine antes da tarefa 1?
- Como você controla quais tarefas estão ativas sem usar um `for` simples com `await`?
- O que acontece com o slot liberado quando uma tarefa com erro termina?

**Extensão (desafio bônus):**
- Adicione um método `.cancelar()` que interrompe o processamento após as tarefas já em andamento terminarem
- Adicione eventos: `onInicio(id)`, `onConclusao(id, resultado)`, `onErro(id, erro)`

---

### Exercício 2 — Scheduler com Prioridades e Filas Separadas

**Contexto:**
Você precisa construir um agendador de tarefas que respeita prioridades. Pense em como um sistema operacional gerencia processos: tarefas críticas (alta prioridade) devem ser processadas antes das comuns, mas tarefas comuns não podem esperar para sempre.

**O que você deve implementar:**

Uma classe `Scheduler` com as seguintes características:

```javascript
const scheduler = new Scheduler({
  concorrencia: 3,        // máximo de tarefas simultâneas
  intervaloVerificacao: 50 // ms entre checagens da fila
});
```

**Métodos obrigatórios:**

```javascript
// Adiciona tarefa com prioridade (1 = mais alta, 10 = mais baixa)
scheduler.adicionar(fn, { prioridade: 1, id: "tarefa-critica" });
scheduler.adicionar(fn, { prioridade: 5, id: "tarefa-normal" });

// Retorna estatísticas em tempo real
scheduler.status();
// {
//   emExecucao: 2,
//   naFila: 4,
//   concluidas: 10,
//   falhas: 1,
//   tempoMedioExecucao: 320 // ms
// }

// Pausa novas tarefas (as em andamento continuam)
scheduler.pausar();

// Retoma
scheduler.retomar();
```

**Regras de prioridade:**
- Tarefas de prioridade 1 sempre são executadas antes de prioridade 2, e assim por diante
- Entre tarefas de mesma prioridade, a que foi adicionada primeiro vai na frente (FIFO)
- Uma tarefa de alta prioridade adicionada enquanto o scheduler está cheio **não cancela** uma tarefa já em andamento de prioridade baixa — ela apenas entra na frente da fila

**Você precisará entender:**
- Como o Event Loop lida com a execução de tarefas assíncronas e como você pode "injetar" tarefas na fila sem bloquear
- A diferença entre verificar a fila via `setInterval` vs via encadeamento de Promises (qual consome menos recursos?)
- Como calcular tempo médio de execução mantendo apenas uma janela dos últimos N resultados (sem guardar todos em memória)

**Exemplo de uso:**

```javascript
// Todas essas são adicionadas "ao mesmo tempo"
for (let i = 1; i <= 10; i++) {
  const prioridade = i <= 3 ? 1 : i <= 7 ? 5 : 10;
  scheduler.adicionar(
    () => fetch(`/api/item/${i}`),
    { prioridade, id: `item-${i}` }
  );
}

// Com concorrencia: 2, as primeiras a executar serão os itens 1, 2, 3
// (prioridade 1), depois 4-7 (prioridade 5), por último 8-10 (prioridade 10)
```

**Extensão:**
- Adicione timeout por tarefa: se uma tarefa demorar mais de X ms, cancele e registre como falha
- Implemente "retry": tarefas que falham podem ser reagendadas até N vezes com backoff exponencial

---

## 🔒 Closures

### Exercício 3 — Sistema de Estado Reativo (mini-useState)

**Contexto:**
Antes do React existir, engenheiros precisavam implementar reatividade manualmente. Seu desafio é criar um sistema de estado que **notifica observadores automaticamente** quando um valor muda — similar ao `useState` do React, mas sem framework.

**O que você deve implementar:**

Uma função `criarEstado(valorInicial)` que retorna um objeto com:

```javascript
const [nome, setNome, observarNome] = criarEstado("João");

// Lê o valor
console.log(nome()); // "João"

// Atualiza o valor
setNome("Maria");
console.log(nome()); // "Maria"

// Observa mudanças
const cancelar = observarNome((novoValor, valorAnterior) => {
  console.log(`Mudou de "${valorAnterior}" para "${novoValor}"`);
});

setNome("Pedro"); // Imprime: Mudou de "Maria" para "Pedro"
cancelar();       // Remove o observador
setNome("Ana");   // Não imprime nada — observador foi cancelado
```

**Requisitos adicionais:**

1. **Derivação de estado**: deve haver uma função `derivar(fn)` que cria um estado calculado a partir de outros estados, e se atualiza automaticamente:

```javascript
const [preco, setPreco] = criarEstado(100);
const [quantidade, setQuantidade] = criarEstado(3);

const total = derivar(() => preco() * quantidade());

console.log(total()); // 300
setPreco(150);
console.log(total()); // 450 — atualizou automaticamente!
```

2. **Batch de atualizações**: múltiplas mudanças dentro de um `batch()` devem disparar os observadores apenas uma vez ao final:

```javascript
batch(() => {
  setPreco(200);
  setQuantidade(5);
});
// Observadores de `total` são notificados apenas UMA vez com o valor 1000
// E não duas vezes (com 600, depois 1000)
```

**Por que é desafiador:**
- Você vai precisar entender como closures capturam e mantém estado entre chamadas
- A função `derivar` precisa saber **quais estados ela depende** sem que você diga explicitamente — isso requer um mecanismo de rastreamento de dependências (tracking)
- O `batch` precisa suprimir notificações temporariamente e depois disparar apenas os observadores afetados

**Dica de arquitetura (não de implementação):** pesquise o conceito de "dependency tracking" e como Signals (Vue, SolidJS, Preact Signals) funcionam internamente.

---

### Exercício 4 — Memoização com TTL e Invalidação Seletiva

**Contexto:**
Você está otimizando um sistema de consultas caras a uma API externa. Algumas respostas mudam rapidamente (preços de ações), outras mudam raramente (dados cadastrais). Você precisa de um sistema de cache inteligente.

**O que você deve implementar:**

Uma função `memoizar(fn, opcoes)` que:

```javascript
async function buscarUsuario(id) {
  // Simula chamada de API cara (300ms)
  await new Promise(r => setTimeout(r, 300));
  return { id, nome: `Usuário ${id}`, timestamp: Date.now() };
}

const buscarComCache = memoizar(buscarUsuario, {
  ttl: 5000,           // cache expira em 5 segundos
  maxEntradas: 100,    // máximo de entradas no cache
  chave: (id) => `usuario:${id}` // como gerar a chave de cache
});

// Primeira chamada — vai à API (300ms)
const u1 = await buscarComCache(42);

// Segunda chamada — retorna do cache instantaneamente
const u2 = await buscarComCache(42);

console.log(u1 === u2); // true — exatamente o mesmo objeto
```

**Funcionalidades obrigatórias:**

```javascript
// Invalida uma entrada específica do cache
buscarComCache.invalidar(42);

// Invalida tudo
buscarComCache.limpar();

// Retorna estatísticas
buscarComCache.stats();
// {
//   hits: 15,       // quantas vezes serviu do cache
//   misses: 3,      // quantas vezes foi à função original
//   entradas: 3,    // entradas atualmente no cache
//   taxaAcerto: 0.83 // hits / (hits + misses)
// }

// Pré-carrega o cache com valores conhecidos (útil para SSR)
buscarComCache.preCarregar(42, { id: 42, nome: "João" });
```

**Casos difíceis que você precisa resolver:**

1. **Stampede de cache (cache stampede):** O que acontece quando 10 chamadas simultâneas pedem o mesmo `id: 42` e o cache está vazio? Você quer que apenas **uma** vá à API, e as outras 9 esperem a primeira terminar.

```javascript
// Essas 10 chamadas devem resultar em apenas 1 chamada real à API
const promessas = Array(10).fill(null).map(() => buscarComCache(42));
const resultados = await Promise.all(promessas);
// Apenas 1 chamada real foi feita!
```

2. **Eviction por LRU:** Quando o cache atinge `maxEntradas`, a entrada **menos recentemente usada** deve ser removida (não a mais antiga em termos de criação).

3. **TTL por entrada:** Suporte a TTL diferente para cada chamada específica:

```javascript
await buscarComCache(42, { ttl: 60000 }); // essa entrada específica dura 60s
```

---

## 🎯 `this`: Arrow vs Function

### Exercício 5 — Event Emitter com Contexto Controlado

**Contexto:**
jQuery, Node.js EventEmitter, e praticamente todo framework usa o padrão Observer (EventEmitter). Você vai construir o seu do zero, e o desafio central é garantir que o `this` correto esteja disponível nos handlers.

**O que você deve implementar:**

```javascript
class EventEmitter {
  // ...sua implementação
}
```

**API obrigatória:**

```javascript
const emitter = new EventEmitter();

// Registro de handlers
emitter.on("dados", function(payload) {
  console.log(this); // deve ser o emitter
});

emitter.on("dados", (payload) => {
  // arrow function — this léxico (não é o emitter)
});

// Emissão de eventos
emitter.emit("dados", { valor: 42 });

// Handler que executa apenas uma vez
emitter.once("conectado", function() {
  console.log("Conectado!", this === emitter); // true
});

// Remover handler específico
function handler() { /* ... */ }
emitter.on("evento", handler);
emitter.off("evento", handler);

// Remover todos os handlers de um evento
emitter.off("evento");

// Listar eventos ativos
emitter.eventos();
// ["dados", "conectado"]

// Listar handlers de um evento específico
emitter.handlers("dados");
// [Function, Function]
```

**O desafio real — suporte a contexto explícito:**

```javascript
class Componente {
  constructor(nome) {
    this.nome = nome;
    this.contador = 0;
  }

  aoReceber(dados) {
    this.contador++; // this deve ser a instância do Componente
    console.log(`${this.nome} recebeu:`, dados);
  }
}

const comp = new Componente("MeuComponente");
const emitter = new EventEmitter();

// Versão 1: bind manual (o usuário faz)
emitter.on("evento", comp.aoReceber.bind(comp));

// Versão 2: o emitter oferece um parâmetro de contexto
emitter.on("evento", comp.aoReceber, comp); // terceiro argumento = this

emitter.emit("evento", { x: 1 });
console.log(comp.contador); // 2 — os dois handlers foram chamados
```

**Extensão — EventEmitter assíncrono:**

```javascript
// emitAsync espera que todos os handlers (mesmo os async) terminem
emitter.on("salvar", async (dados) => {
  await salvarNoBanco(dados);
});

emitter.on("salvar", async (dados) => {
  await enviarEmail(dados);
});

await emitter.emitAsync("salvar", { id: 1 }); 
// Garante que banco e email foram salvos antes de continuar
```

**Por que é desafiador:**
- A diferença entre `emitter.on("x", fn)` e `emitter.on("x", fn, contexto)` exige que você gerencie o binding manualmente
- Remover um handler com `.off()` precisa encontrar a função **exatamente** — incluindo funções que foram bound
- O `once` precisa se auto-remover após a primeira chamada, o que envolve criar um wrapper que ainda assim pode ser removido com `.off()`

---

### Exercício 6 — Pipeline de Processamento com Encadeamento de Métodos

**Contexto:**
Você vai construir um pipeline de transformação de dados com **method chaining** (encadeamento de métodos) — o mesmo padrão usado por jQuery, Lodash, e frameworks de query como Knex.js.

**O que você deve implementar:**

```javascript
const resultado = Pipeline
  .de([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .filtrar(n => n % 2 === 0)       // [2, 4, 6, 8, 10]
  .mapear(n => n * n)              // [4, 16, 36, 64, 100]
  .reduzir((acc, n) => acc + n, 0) // 220
  .resultado();

console.log(resultado); // 220
```

**Operações obrigatórias (todas encadeáveis):**

```javascript
Pipeline
  .de([...dados])
  .filtrar(fn)
  .mapear(fn)
  .reduzir(fn, inicial)
  .fatiar(inicio, fim)    // como Array.slice
  .ordenar(fn?)           // como Array.sort
  .unico()                // remove duplicatas
  .agrupar(fn)            // agrupa por critério — retorna objeto
  .achatar(profundidade?)  // como Array.flat
  .resultado()            // executa e retorna o valor final
  .paraArray()            // como resultado(), mas sempre retorna array
```

**Execução preguiçosa (Lazy Evaluation) — o verdadeiro desafio:**

O pipeline **não deve executar nada** até que `.resultado()` ou `.paraArray()` seja chamado. As operações apenas acumulam a "receita" de transformações.

```javascript
const pipeline = Pipeline
  .de([1, 2, 3, 4, 5])
  .filtrar(n => {
    console.log(`Filtrando ${n}`); // Não deve imprimir ainda
    return n > 2;
  })
  .mapear(n => n * 2);

console.log("Nada foi processado ainda!");

// Apenas aqui o processamento ocorre
const resultado = pipeline.resultado();
// "Filtrando 1" ... "Filtrando 5"

console.log(resultado); // [6, 8, 10]
```

**Operações assíncronas:**

```javascript
const resultado = await Pipeline
  .de(idsDeUsuarios)
  .mapearAsync(async (id) => await buscarUsuario(id)) // paralelo, com limite de 3
  .filtrarAsync(async (usuario) => await verificarPermissao(usuario))
  .paraArray();
```

**Por que é desafiador:**
- Cada método precisa retornar `this` (ou uma nova instância do Pipeline) para o encadeamento funcionar — você vai descobrir rapidamente onde o `this` se perde
- A execução preguiçosa requer acumular uma lista de operações e aplicá-las em sequência apenas no final
- `agrupar` quebra o fluxo — o resultado não é mais um array. Como você representa isso no sistema de tipos e na API?
- `mapearAsync` com limite de concorrência é o Exercício 1 dentro do Exercício 6

---

## 🔍 `==` vs `===`

### Exercício 7 — Função de Igualdade Profunda (Deep Equal)

**Contexto:**
`===` não funciona para objetos e arrays — ele compara **referências**, não estrutura. `JSON.stringify` é uma gambiarra. Você vai implementar uma função de igualdade profunda robusta, como a usada internamente por Jest, Lodash e Node.js `assert.deepEqual`.

**O que você deve implementar:**

```javascript
function igualdadeProfunda(a, b) {
  // ...
}
```

**Casos que devem funcionar:**

```javascript
// Primitivos
igualdadeProfunda(1, 1);         // true
igualdadeProfunda(1, "1");       // false — sem coerção!
igualdadeProfunda(NaN, NaN);     // true — diferente do ===
igualdadeProfunda(0, -0);        // false — diferente do ===

// Arrays
igualdadeProfunda([1, 2, 3], [1, 2, 3]);  // true
igualdadeProfunda([1, 2], [1, 2, 3]);     // false — tamanhos diferentes
igualdadeProfunda([[1, 2], [3]], [[1, 2], [3]]); // true — aninhado

// Objetos
igualdadeProfunda({ a: 1, b: 2 }, { b: 2, a: 1 }); // true — ordem não importa
igualdadeProfunda({ a: { b: { c: 3 } } }, { a: { b: { c: 3 } } }); // true

// Tipos especiais
igualdadeProfunda(null, null);         // true
igualdadeProfunda(null, undefined);    // false
igualdadeProfunda(new Date("2024-01-01"), new Date("2024-01-01")); // true
igualdadeProfunda(/abc/gi, /abc/gi);   // true
igualdadeProfunda(/abc/g, /abc/i);     // false — flags diferentes
igualdadeProfunda(new Map([["a", 1]]), new Map([["a", 1]])); // true
igualdadeProfunda(new Set([1, 2, 3]), new Set([3, 1, 2]));   // true — ordem não importa em Set

// Referências circulares — não pode travar em loop infinito!
const obj1 = { a: 1 };
obj1.self = obj1; // aponta para si mesmo

const obj2 = { a: 1 };
obj2.self = obj2;

igualdadeProfunda(obj1, obj2); // true — sem stack overflow!
```

**Requisitos técnicos:**
- Sem uso de `JSON.stringify`
- Deve identificar corretamente o tipo de cada valor (typeof, instanceof, Object.prototype.toString)
- Deve lidar com referências circulares usando um mecanismo de "vistos" (WeakMap é seu amigo)

**Por que é desafiador:**
- Cada tipo de dado (Array, Object, Date, RegExp, Map, Set) precisa de uma estratégia de comparação diferente
- `NaN !== NaN` mas `igualdadeProfunda(NaN, NaN)` deve ser `true` — como você detecta isso?
- `0 === -0` mas `igualdadeProfunda(0, -0)` deve ser `false` — como você distingue?
- Referências circulares vão travar sua recursão se você não rastrear os objetos já visitados

---

### Exercício 8 — Motor de Validação e Comparação com Schema

**Contexto:**
Você vai construir um validador de dados — similar a Zod, Yup ou Joi — que usa comparações de tipo seguras internamente. O desafio é ir além do simples `typeof` e construir um sistema robusto que lida com coerção de forma explícita e controlada.

**O que você deve implementar:**

```javascript
const schema = criar({
  nome: tipo.string().minLength(2).maxLength(50),
  idade: tipo.numero().min(0).max(150).inteiro(),
  email: tipo.string().formato("email"),
  ativo: tipo.booleano(),
  tags: tipo.array(tipo.string()).minItens(1),
  endereco: tipo.objeto({
    rua: tipo.string(),
    numero: tipo.numero().opcional(),
    cidade: tipo.string()
  }).opcional()
});

const resultado = schema.validar({
  nome: "Ana",
  idade: 25,
  email: "ana@email.com",
  ativo: true,
  tags: ["dev", "js"]
});

console.log(resultado.valido); // true
console.log(resultado.erros);  // []
```

**Casos de validação com coerção opcional:**

```javascript
const schemaComCoercao = criar({
  quantidade: tipo.numero().coercivel(), // "10" → 10 é aceito
  ativo: tipo.booleano().coercivel(),    // "true" → true é aceito
});

// Sem coerção — usa === internamente
const semCoercao = criar({
  valor: tipo.numero() // "10" é inválido — tipo errado
});
```

**Comparação de schemas:**

```javascript
// Dois schemas são "iguais" se produzem os mesmos resultados
// para o mesmo conjunto de entradas
schema.igualA(outroSchema); // true/false
```

**Transformações:**

```javascript
const schema = criar({
  nome: tipo.string().transformar(s => s.trim().toLowerCase()),
  data: tipo.string().transformar(s => new Date(s))
});

const { valor } = schema.parsear({ nome: "  ANA  ", data: "2024-01-01" });
// { nome: "ana", data: Date object }
```

**Por que é desafiador:**
- Você vai precisar implementar uma API fluente com method chaining (como no Exercício 6) onde cada chamada retorna o validador com configuração adicional
- A distinção entre `tipo.numero()` (rejeita strings) e `tipo.numero().coercivel()` (aceita `"10"`) precisa ser tratada de forma limpa internamente — é aqui que o conhecimento de `==` vs `===` vs coerção explícita se aplica na prática
- Validadores aninhados (objeto dentro de objeto, array de objetos) requerem recursão
- As mensagens de erro devem incluir o **caminho** até o campo inválido: `"endereco.cidade: campo obrigatório"`

---

## 📦 Sistema de Módulos

### Exercício 9 — Bundler Simples de Módulos

**Contexto:**
Antes do Webpack existir, engenheiros construíam seus próprios bundlers. Você vai construir um bundler mínimo que entende o sistema de módulos CommonJS, resolve dependências e gera um único arquivo executável.

**O que você deve implementar:**

Um script Node.js `bundler.js` que recebe um ponto de entrada e gera um bundle:

```bash
node bundler.js src/index.js dist/bundle.js
```

**Como o bundle gerado deve funcionar:**

Dado o seguinte código fonte:

```javascript
// src/utils/math.js
exports.somar = (a, b) => a + b;
exports.PI = 3.14159;

// src/saudacao.js
const { somar } = require('./utils/math');
exports.mensagem = (nome) => `Olá ${nome}! 1+1=${somar(1,1)}`;

// src/index.js
const { mensagem } = require('./saudacao');
const { PI } = require('./utils/math');
console.log(mensagem("Mundo"));
console.log("PI:", PI);
```

Seu bundler deve gerar um `dist/bundle.js` que:
1. Contém todos os módulos em um único arquivo
2. Funciona sem `require` nativo (tudo resolvido em tempo de build)
3. Cada módulo tem seu próprio escopo isolado (sem poluição global)
4. Um módulo requerido múltiplas vezes (`math.js` é requerido por `saudacao.js` e `index.js`) é incluído **apenas uma vez** no bundle

**Estrutura interna do bundle (o que você precisa gerar):**

```javascript
// dist/bundle.js (gerado pelo seu bundler)
(function() {
  const modulos = {
    "./src/utils/math.js": function(module, exports, require) {
      exports.somar = (a, b) => a + b;
      exports.PI = 3.14159;
    },
    "./src/saudacao.js": function(module, exports, require) {
      const { somar } = require('./utils/math');
      exports.mensagem = (nome) => `Olá ${nome}! 1+1=${somar(1,1)}`;
    },
    "./src/index.js": function(module, exports, require) {
      const { mensagem } = require('./saudacao');
      const { PI } = require('./utils/math');
      console.log(mensagem("Mundo"));
      console.log("PI:", PI);
    }
  };

  const cache = {};

  function require(moduloId) {
    if (cache[moduloId]) return cache[moduloId].exports;
    const module = { exports: {} };
    cache[moduloId] = module;
    modulos[moduloId](module, module.exports, require);
    return module.exports;
  }

  require("./src/index.js"); // ponto de entrada
})();
```

**Requisitos técnicos:**
1. Usar o módulo `fs` do Node.js para ler arquivos
2. Usar expressões regulares ou parsing simples para encontrar os `require()` em cada arquivo
3. Construir um grafo de dependências (qual módulo depende de qual) antes de gerar o bundle
4. Resolver caminhos relativos corretamente (`require('./utils/math')` dentro de `saudacao.js` deve mapear para o caminho absoluto correto)

**Por que é desafiador:**
- Resolver caminhos relativos `require('./utils/math')` dentro de arquivos em subdiretórios diferentes exige que você rastreie "de onde" o require foi feito
- Você precisa fazer uma busca em profundidade (DFS) no grafo de dependências para garantir que dependências aparecem antes de quem as usa
- Dependências circulares (`a.js` require `b.js` que require `a.js`) não podem travar seu bundler

**Extensão:**
- Suporte a `node_modules`: se o require não começa com `./` ou `../`, procure em `node_modules/`
- Adicione source maps: um comentário no bundle mapeando linhas do bundle para os arquivos originais
- Suporte a JSON: `require('./config.json')` deve funcionar

---

### Exercício 10 — Sistema de Plugins com Injeção de Dependências

**Contexto:**
Você vai construir o núcleo de um sistema de plugins — como os usados pelo Vite, Rollup, ou o sistema de middleware do Express. Plugins estendem a funcionalidade base sem modificar o código central, usando o sistema de módulos para encapsulamento.

**O que você deve implementar:**

```javascript
// core.js — o núcleo da aplicação
import { criarAplicacao } from './framework.js';

const app = criarAplicacao();

// Registrando plugins
app.usar(pluginLogger({ nivel: "debug" }));
app.usar(pluginCache({ ttl: 5000 }));
app.usar(pluginAutenticacao({ secreto: "abc123" }));

// Usando os serviços providos pelos plugins
const resultado = await app.executar("processarPedido", {
  usuarioId: 1,
  itens: [{ id: "prod-1", quantidade: 2 }]
});
```

**O que um plugin é:**

```javascript
// plugins/logger.js
export function pluginLogger(opcoes = {}) {
  return {
    nome: "logger",
    
    // Executado quando o plugin é registrado
    instalar(app) {
      // Adiciona serviços ao container de DI
      app.prover("logger", {
        info: (msg) => opcoes.nivel !== "silent" && console.log(`[INFO] ${msg}`),
        debug: (msg) => opcoes.nivel === "debug" && console.log(`[DEBUG] ${msg}`),
        erro: (msg) => console.error(`[ERRO] ${msg}`)
      });

      // Adiciona hooks (pontos de extensão)
      app.hook("antes:executar", (contexto) => {
        app.injetar("logger").debug(`Executando: ${contexto.acao}`);
      });

      app.hook("depois:executar", (contexto, resultado) => {
        app.injetar("logger").info(`Concluído: ${contexto.acao}`);
      });
    }
  };
}
```

**O container de injeção de dependências (DI):**

```javascript
// Qualquer plugin pode declarar que precisa de outro
export function pluginCache(opcoes) {
  return {
    nome: "cache",
    dependencias: ["logger"], // precisa do logger estar instalado antes

    instalar(app) {
      const logger = app.injetar("logger"); // resolve do container
      const cache = new Map();

      app.prover("cache", {
        get(chave) {
          logger.debug(`Cache GET: ${chave}`);
          return cache.get(chave);
        },
        set(chave, valor) {
          logger.debug(`Cache SET: ${chave}`);
          cache.set(chave, valor);
          if (opcoes.ttl) {
            setTimeout(() => cache.delete(chave), opcoes.ttl);
          }
        }
      });
    }
  };
}
```

**Hooks — o sistema de extensão:**

```javascript
// Dentro do framework (não do plugin), você expõe pontos de extensão
async function executar(acao, dados) {
  const contexto = { acao, dados };
  
  // Todos os plugins que registraram "antes:executar" rodam aqui
  await this.dispararHook("antes:executar", contexto);
  
  const resultado = await this.handlers[acao](dados);
  
  // Todos os plugins que registraram "depois:executar" rodam aqui
  await this.dispararHook("depois:executar", contexto, resultado);
  
  return resultado;
}
```

**Requisitos:**
1. O framework deve detectar automaticamente se um plugin depende de outro que não foi instalado e lançar um erro claro
2. Plugins não podem ser registrados depois que `app.iniciar()` for chamado
3. Um plugin não pode ser instalado duas vezes (detecção por nome)
4. Hooks devem suportar funções assíncronas e aguardar todas antes de continuar
5. O sistema deve suportar hooks que **modificam** os dados que passam por eles (middleware pattern):

```javascript
app.hook("antes:executar", (contexto) => {
  // Modifica o contexto — os hooks seguintes recebem o contexto modificado
  contexto.dados.timestamp = Date.now();
  return contexto; // retornar o contexto modifica o que o próximo hook recebe
});
```

**Por que é desafiador:**
- A ordem de instalação dos plugins importa (por causa das dependências), mas você quer que o usuário não precise se preocupar com isso — o framework deve **ordenar automaticamente** os plugins por dependência (topological sort)
- O sistema de hooks com modificação de contexto precisa que cada hook receba o contexto **já modificado** pelo anterior, em série — não em paralelo
- Isolar o escopo de cada plugin (um plugin não deve conseguir acessar os internos de outro, apenas através da API pública do `app`) é uma aplicação direta de closures e módulos

---

## 📋 Guia de Entrega e Auto-avaliação

Para cada exercício, ao terminar pergunte-se:

| Critério | Pergunta |
|----------|----------|
| **Correção** | Todos os casos do enunciado passam? |
| **Edge cases** | O que acontece com entradas vazias, null, undefined? |
| **Erros** | O código falha claramente com mensagens úteis quando algo está errado? |
| **Legibilidade** | Outra pessoa consegue entender seu código sem comentários? |
| **Conceito** | Você consegue explicar, em voz alta, por que sua solução funciona? |

### Ordem sugerida de resolução

Se você está começando, esta ordem progressiva respeita a curva de dificuldade:

```
Exercício 7 (Deep Equal) → Exercício 3 (Estado Reativo)
→ Exercício 5 (Event Emitter) → Exercício 4 (Memoização)
→ Exercício 6 (Pipeline) → Exercício 8 (Validador)
→ Exercício 1 (Executor Concorrente) → Exercício 9 (Bundler)
→ Exercício 2 (Scheduler) → Exercício 10 (Plugins)
```

### Uma dica de processo

Antes de escrever qualquer código:
1. **Leia o exercício inteiro** (inclusive as extensões, mesmo que não vá fazer)
2. **Escreva os testes primeiro** — crie os exemplos do enunciado como `console.assert()` ou Jest
3. **Desenhe a estrutura de dados** no papel
4. **Implemente o caso mais simples** que funciona, depois adicione complexidade

> "Make it work, make it right, make it fast." — Kent Beck
```
