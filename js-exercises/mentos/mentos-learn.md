# Fundamentos Avançados de JavaScript

> Um guia completo e detalhado sobre os conceitos mais importantes do JavaScript moderno, com os fundamentos subjacentes que os sustentam.

---

## Sumário

1. [Event Loop](#1-event-loop)
2. [Closures](#2-closures)
3. [this: Arrow Function vs Function](#3-this-arrow-function-vs-function)
4. [== vs ===](#4--vs-)
5. [Sistema de Módulos](#5-sistema-de-módulos)

---

## 1. Event Loop

O Event Loop é o mecanismo que permite ao JavaScript — uma linguagem **single-threaded** — executar operações assíncronas sem travar a thread principal.

### 🔩 Fundamentos que você precisa entender primeiro

#### 1.1 Single-Thread e a Call Stack

JavaScript possui **uma única thread de execução**, ou seja, só pode fazer uma coisa por vez. O controle dessa execução é feito pela **Call Stack** (Pilha de Chamadas), uma estrutura de dados do tipo LIFO (**L**ast **I**n, **F**irst **O**ut).

Cada vez que uma função é invocada, um **Execution Context** (contexto de execução) é empurrado para o topo da stack. Quando a função retorna, ele é removido.

```javascript
function somar(a, b) {
  return a + b;        // 3) somar() é removida da stack
}

function calcular() {
  const resultado = somar(2, 3); // 2) somar() entra na stack
  console.log(resultado);        // 4) console.log() entra e sai
}

calcular(); // 1) calcular() entra na stack
```

**Estado da Call Stack durante a execução:**

```
|  console.log  |  ← passo 4
|  somar()      |  ← passo 2 e 3
|  calcular()   |  ← passo 1 (base)
|_______________|
```

#### 1.2 Heap

O **Heap** é a região de memória não estruturada onde objetos e variáveis são armazenados. Quando você cria um objeto `{}` ou array `[]`, o JavaScript aloca espaço no heap e guarda a **referência** na stack.

```javascript
const obj = { nome: "João" }; // { nome: "João" } vai pro HEAP
                               // a referência "obj" fica na STACK
```

#### 1.3 Web APIs (ou Node.js APIs)

O JavaScript do browser não vive sozinho. O **ambiente** (browser ou Node.js) fornece APIs que rodam **fora da thread principal**:

- `setTimeout` / `setInterval`
- `fetch` / `XMLHttpRequest`
- `addEventListener`
- `fs.readFile` (Node.js)

Quando você chama `setTimeout(fn, 1000)`, o JS registra o timer na Web API e **continua executando o resto do código**. A Web API é quem controla o tempo.

---

### 1.4 O Event Loop em si

O Event Loop tem um trabalho simples: **verificar constantemente se a Call Stack está vazia e, se estiver, puxar a próxima tarefa das filas**.

Existem **duas filas** principais:

#### Macrotask Queue (Task Queue)
Recebe callbacks de:
- `setTimeout`
- `setInterval`
- eventos do DOM (`click`, `keydown`)
- I/O (Node.js)

#### Microtask Queue
Recebe callbacks de:
- `.then()` / `.catch()` / `.finally()` de Promises
- `queueMicrotask()`
- `MutationObserver`

**Regra crítica:** a Microtask Queue tem **prioridade** sobre a Macrotask Queue. Após cada tarefa da Call Stack, o Event Loop esvazia **toda** a fila de microtasks antes de pegar a próxima macrotask.

```
         ┌──────────────────────────┐
         │        Call Stack         │
         │  (executa código sync)   │
         └────────────┬─────────────┘
                      │ vazia?
                      ▼
         ┌──────────────────────────┐
         │    Microtask Queue       │  ← PRIORIDADE ALTA
         │  (Promises, async/await) │
         └────────────┬─────────────┘
                      │ vazia?
                      ▼
         ┌──────────────────────────┐
         │    Macrotask Queue       │  ← PRIORIDADE BAIXA
         │  (setTimeout, eventos)   │
         └──────────────────────────┘
```

---

### 1.5 Exemplo completo e detalhado

```javascript
console.log("1 - início");                     // síncrono

setTimeout(() => {
  console.log("2 - setTimeout");               // macrotask
}, 0);

Promise.resolve()
  .then(() => {
    console.log("3 - Promise .then 1");        // microtask
  })
  .then(() => {
    console.log("4 - Promise .then 2 (chain)");// microtask (encadeada)
  });

console.log("5 - fim do código síncrono");    // síncrono

// OUTPUT:
// 1 - início
// 5 - fim do código síncrono
// 3 - Promise .then 1
// 4 - Promise .then 2 (chain)
// 2 - setTimeout
```

**Por quê essa ordem?**

| Passo | O que acontece |
|-------|----------------|
| 1 | `console.log("1")` vai para a Call Stack e executa imediatamente |
| 2 | `setTimeout` é registrado na Web API (timer de 0ms). Callback vai para a Macrotask Queue |
| 3 | `Promise.resolve().then(...)` — as callbacks `.then` vão para a Microtask Queue |
| 4 | `console.log("5")` executa imediatamente |
| 5 | Call Stack vazia → Event Loop verifica Microtask Queue → executa "3" e "4" |
| 6 | Microtask Queue vazia → Event Loop pega da Macrotask Queue → executa "2" |

---

### 1.6 `async/await` e o Event Loop

`async/await` é açúcar sintático sobre Promises. Quando o JS encontra um `await`, ele **pausa a função** (sem bloquear a thread) e coloca o restante dela como microtask.

```javascript
async function buscarDados() {
  console.log("A - dentro da async fn");

  const resultado = await Promise.resolve("dados"); // pausa aqui

  console.log("C - após o await:", resultado); // isso vira microtask
}

console.log("antes");
buscarDados();
console.log("B - após chamar a fn async");

// Output:
// antes
// A - dentro da async fn
// B - após chamar a fn async
// C - após o await: dados
```

---

### ⚠️ Armadilha: Stack Overflow

Se uma função chama a si mesma infinitamente (recursão sem condição de parada), a Call Stack enche e o JS lança um `RangeError: Maximum call stack size exceeded`.

```javascript
// ERRADO: Stack Overflow
function contar() {
  return contar(); // nunca termina
}

// CORRETO: recursão com condição de parada
function contar(n) {
  if (n <= 0) return "fim";
  return contar(n - 1);
}
```

---

## 2. Closures

Uma **closure** é a combinação de uma função com o ambiente léxico (scope) em que ela foi criada. Em outras palavras, uma função "lembra" das variáveis do escopo onde nasceu, **mesmo depois que esse escopo foi encerrado**.

### 🔩 Fundamentos que você precisa entender primeiro

#### 2.1 Execution Context

Toda vez que o JavaScript executa código, ele cria um **Execution Context**, que contém:

- **Variable Environment**: onde as variáveis e declarações são armazenadas
- **Scope Chain**: referência para os escopos externos
- **`this` binding**: o valor de `this` naquele contexto

Existem três tipos de Execution Context:
- **Global**: criado ao iniciar o programa
- **Function**: criado a cada chamada de função
- **Eval**: criado dentro de `eval()` (evite usar)

#### 2.2 Escopo Léxico (Lexical Scope)

JavaScript usa **escopo léxico** — também chamado de *escopo estático*. Isso significa que o escopo de uma variável é determinado **onde o código foi escrito**, não onde ele é executado.

```javascript
const x = "global";

function externa() {
  const x = "externa";

  function interna() {
    // interna "vê" x = "externa" porque é onde ela FOI ESCRITA
    console.log(x);
  }

  interna(); // "externa"
}

externa();
```

#### 2.3 Hoisting

Antes de executar qualquer código, o JavaScript passa pelo código e **eleva** (hoist) as declarações:

- `var` → é hoistada e inicializada com `undefined`
- `function` declaration → é hoistada completamente (nome + corpo)
- `let` / `const` → são hoistadas mas ficam em uma **Temporal Dead Zone (TDZ)** — acessá-las antes da declaração lança `ReferenceError`

```javascript
console.log(a); // undefined (hoistada com var)
var a = 10;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;

ola(); // "olá!" (function declaration é hoistada completamente)
function ola() { console.log("olá!"); }
```

---

### 2.4 Como Closures funcionam

```javascript
function criarContador() {
  let contagem = 0; // variável no escopo de criarContador

  return function () {
    contagem++;       // a função interna "fecha sobre" (closes over) contagem
    return contagem;
  };
}

const contador = criarContador();
// criarContador() terminou de executar, mas contagem NÃO foi destruída

console.log(contador()); // 1
console.log(contador()); // 2
console.log(contador()); // 3
```

`criarContador()` executou e saiu da Call Stack. Normalmente, `contagem` seria coletada pelo Garbage Collector. Mas como a função interna ainda guarda uma **referência** a `contagem`, ela permanece viva na memória.

---

### 2.5 Casos de uso práticos

#### Encapsulamento / Módulo privado

```javascript
function criarConta(saldoInicial) {
  let saldo = saldoInicial; // privado — inacessível de fora

  return {
    depositar(valor) {
      saldo += valor;
      console.log(`Saldo: R$${saldo}`);
    },
    sacar(valor) {
      if (valor > saldo) return console.log("Saldo insuficiente");
      saldo -= valor;
      console.log(`Saldo: R$${saldo}`);
    },
    verSaldo() {
      return saldo;
    }
  };
}

const conta = criarConta(100);
conta.depositar(50); // Saldo: R$150
conta.sacar(30);     // Saldo: R$120
console.log(conta.saldo); // undefined — não tem acesso direto!
```

#### Factory Functions com closure

```javascript
function criarSaudacao(idioma) {
  const saudacoes = { pt: "Olá", en: "Hello", es: "Hola" };

  return function (nome) {
    return `${saudacoes[idioma]}, ${nome}!`;
  };
}

const saudarPT = criarSaudacao("pt");
const saudarEN = criarSaudacao("en");

console.log(saudarPT("Maria")); // "Olá, Maria!"
console.log(saudarEN("John"));  // "Hello, John!"
```

---

### ⚠️ Armadilha clássica: closure em loop com `var`

```javascript
// PROBLEMA — todas as funções compartilham o MESMO i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3

// SOLUÇÃO 1 — usar let (cria uma nova ligação por iteração)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2

// SOLUÇÃO 2 — IIFE para criar um escopo novo por iteração
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// Output: 0, 1, 2
```

**Por quê com `var` dá errado?** `var` tem escopo de **função**, não de bloco. O `i` é o mesmo para todas as iterações do loop. Quando os callbacks executam (após 100ms), o loop já terminou e `i` vale `3`.

---

## 3. `this`: Arrow Function vs Function

O `this` é uma das fontes mais comuns de confusão em JavaScript. Seu valor **não é fixo** — ele muda dependendo de *como* e *onde* a função é chamada.

### 🔩 Fundamentos: os 4 tipos de binding de `this`

#### 3.1 Default Binding (contexto global)

Quando uma função é chamada "solta", sem nenhum objeto à esquerda do ponto, `this` aponta para o objeto global (`window` no browser, `global` no Node.js) ou é `undefined` em modo estrito.

```javascript
function mostrar() {
  console.log(this); // window (browser) ou undefined (strict mode)
}

mostrar();
```

#### 3.2 Implicit Binding (método de objeto)

Quando uma função é chamada como método de um objeto, `this` aponta para o **objeto à esquerda do ponto**.

```javascript
const pessoa = {
  nome: "Ana",
  falar() {
    console.log(this.nome); // "Ana" — this = pessoa
  }
};

pessoa.falar(); // "Ana"

// CUIDADO: perda do this
const falarSolta = pessoa.falar;
falarSolta(); // undefined — this agora é o global/undefined
```

#### 3.3 Explicit Binding (call, apply, bind)

Você pode forçar o valor de `this` usando:

```javascript
function apresentar(cidade) {
  console.log(`${this.nome} de ${cidade}`);
}

const usuario = { nome: "Carlos" };

apresentar.call(usuario, "São Paulo");           // call: argumentos diretos
apresentar.apply(usuario, ["Rio de Janeiro"]);   // apply: argumentos em array
const fn = apresentar.bind(usuario, "Brasília"); // bind: retorna nova função
fn();
```

#### 3.4 New Binding (construtores)

Quando você usa `new`, o JavaScript cria um novo objeto e `this` aponta para ele.

```javascript
function Carro(modelo) {
  this.modelo = modelo; // this = o novo objeto sendo criado
}

const meuCarro = new Carro("Civic");
console.log(meuCarro.modelo); // "Civic"
```

---

### 3.5 `this` em Function Declarations/Expressions

O `this` em funções regulares é **dinâmico** — definido no momento da **chamada**, não da criação.

```javascript
const equipe = {
  nome: "Times",
  membros: ["Ana", "Bob", "Carlos"],

  listar() {
    // this = equipe (implicit binding) ✅
    console.log("Equipe:", this.nome);

    this.membros.forEach(function (membro) {
      // this aqui é undefined (strict mode) ou window!
      // função regular dentro de forEach perde o contexto
      console.log(this.nome, membro); // ❌ undefined "Ana"
    });
  }
};

equipe.listar();
```

#### Solução clássica (pré-ES6)

```javascript
listar() {
  const self = this; // salvar referência
  this.membros.forEach(function(membro) {
    console.log(self.nome, membro); // ✅
  });
}
```

---

### 3.6 `this` em Arrow Functions

Arrow functions **não possuem `this` próprio**. Elas herdam o `this` do escopo léxico onde foram **escritas** — ou seja, o `this` é capturado no momento da criação, não da chamada.

```javascript
const equipe = {
  nome: "Times",
  membros: ["Ana", "Bob", "Carlos"],

  listar() {
    // this = equipe (implicit binding) ✅

    this.membros.forEach((membro) => {
      // Arrow function herda o this do método listar()
      // this ainda = equipe ✅
      console.log(this.nome, membro); // "Times Ana", "Times Bob"...
    });
  }
};

equipe.listar();
```

---

### 3.7 Comparação direta

```javascript
const obj = {
  valor: 42,

  // Função regular — this depende de quem a chama
  regular: function () {
    return this.valor;
  },

  // Arrow function — this herdado do escopo léxico (= obj)
  arrow: () => {
    // ⚠️ this aqui NÃO é obj!
    // Arrow functions no topo de um objeto herdam o this do escopo GLOBAL
    return this?.valor; // undefined
  },

  // Uso correto da arrow: dentro de outro método
  usando_arrow_certo() {
    const fn = () => this.valor; // this = obj (herdado deste método)
    return fn();
  }
};

console.log(obj.regular());        // 42
console.log(obj.arrow());          // undefined
console.log(obj.usando_arrow_certo()); // 42
```

---

### 3.8 Arrow functions NÃO podem ser usadas como construtoras

```javascript
const Pessoa = (nome) => {
  this.nome = nome;
};

// TypeError: Pessoa is not a constructor
const p = new Pessoa("Ana");
```

---

### 3.9 Tabela de referência rápida

| Cenário | Função Regular | Arrow Function |
|---------|---------------|----------------|
| `this` definido em | Momento da **chamada** | Momento da **criação** (léxico) |
| Pode usar `call/apply/bind`? | ✅ Sim | ❌ Ignorado |
| Pode ser construtora (`new`)? | ✅ Sim | ❌ Não |
| Tem `arguments` próprio? | ✅ Sim | ❌ Não (herda) |
| Ideal para callbacks? | ⚠️ Cuidado com `this` | ✅ Sim |
| Ideal para métodos de objeto? | ✅ Sim | ⚠️ Geralmente não |

---

## 4. `==` vs `===`

A diferença fundamental é:

- `===` (igualdade estrita): compara **valor e tipo**. Nunca converte.
- `==` (igualdade abstrata): compara **valor**, podendo **converter o tipo** primeiro.

### 🔩 Fundamento: Coerção de Tipo (Type Coercion)

JavaScript é uma linguagem de **tipagem dinâmica e fraca**. O JS pode converter implicitamente um valor de um tipo para outro — isso é chamado de **coerção de tipo**.

Existem dois tipos de coerção:

```javascript
// Coerção EXPLÍCITA — você faz propositalmente
Number("42");   // 42
String(10);     // "10"
Boolean(0);     // false

// Coerção IMPLÍCITA — o JS faz sozinho (perigoso!)
"5" - 2;   // 3   (string virou número)
"5" + 2;   // "52" (número virou string — concatenação!)
true + 1;  // 2   (true virou 1)
```

#### Valores Falsy e Truthy

Em JavaScript, os seguintes valores são **falsy** (se comportam como `false` em contexto booleano):

```javascript
false, 0, -0, 0n, "", '', ``, null, undefined, NaN
```

Tudo o mais é **truthy**, inclusive: `"0"`, `[]`, `{}`, `function(){}`.

---

### 4.1 Como o `===` funciona

O operador `===` aplica o algoritmo de **Strict Equality Comparison**:

1. Se os **tipos são diferentes** → retorna `false` imediatamente
2. Se os **tipos são iguais** → compara os valores

```javascript
1 === 1        // true  — mesmo tipo, mesmo valor
1 === "1"      // false — tipos diferentes (number vs string)
null === null  // true
null === undefined // false — tipos diferentes
NaN === NaN    // false — NaN nunca é igual a nada, nem a si mesmo
```

> Para verificar `NaN`, use `Number.isNaN(valor)`.

---

### 4.2 Como o `==` funciona

O `==` aplica o algoritmo de **Abstract Equality Comparison**, que segue uma tabela de regras de coerção. As principais:

```javascript
// Número vs String → string vira número
1 == "1"         // true  (Number("1") = 1)
0 == ""          // true  (Number("") = 0)
0 == "0"         // true  (Number("0") = 0)
"" == "0"        // false (ambos já são string, compara diretamente!)

// Boolean → vira número
true == 1        // true  (Number(true) = 1)
false == 0       // true  (Number(false) = 0)
true == "1"      // true  (ambos viram número: 1 == 1)

// null e undefined — REGRA ESPECIAL
null == undefined  // true  (exceção explícita no spec)
null == 0          // false (null só é igual a undefined)
null == false      // false

// Objeto vs Primitivo → objeto passa por valueOf() ou toString()
[] == false        // true  ([] vira "" vira 0, false vira 0)
[0] == false       // true  (mesmo processo)
[[]] == false      // true  (argh...)
```

---

### 4.3 A tabela do caos do `==`

```javascript
// Exemplos que violam intuição
[] == ![]          // true  (ambos resultam em 0)
null == undefined  // true  (regra especial)
NaN == NaN         // false (NaN nunca é igual)
0 == -0            // true
"" == false        // true
" " == 0           // true  (espaço em branco vira 0!)
```

---

### 4.4 Regra prática

**Sempre use `===`**. Use `==` apenas em um caso onde há consenso: verificar `null` ou `undefined` ao mesmo tempo:

```javascript
// Ao invés de:
if (valor === null || valor === undefined) { ... }

// Pode usar:
if (valor == null) { ... } // pega null E undefined
```

---

### 4.5 E o `Object.is()`?

`Object.is()` é como `===` mas com duas diferenças importantes:

```javascript
Object.is(NaN, NaN); // true  (diferente do ===)
Object.is(0, -0);    // false (diferente do ===)
Object.is(1, 1);     // true  (igual ao ===)
```

---

## 5. Sistema de Módulos

Módulos são mecanismos para dividir o código em arquivos separados, com encapsulamento e dependências explícitas.

### 🔩 Fundamento: Por que módulos existem?

No início, todo JS era carregado em `<script>` tags, compartilhando o **escopo global**. Isso gerava conflitos de nomes, código difícil de manter e ausência de encapsulamento.

```html
<!-- Tudo no global — desastre em projetos grandes -->
<script src="utils.js"></script>
<script src="app.js"></script>
<!-- utils.js e app.js compartilham window — colisão de variáveis! -->
```

**A evolução histórica:**

```
Script Global → IIFE → CommonJS (Node) → AMD → UMD → ES Modules (ESM)
```

---

### 5.1 IIFE — A solução pré-módulo

**IIFE** (Immediately Invoked Function Expression) cria um escopo privado usando o conceito de closures:

```javascript
// Tudo dentro da IIFE fica encapsulado
const MinhaLib = (function () {
  // Privado
  let contador = 0;
  function incrementar() { contador++; }

  // Público — o que é retornado
  return {
    adicionar() { incrementar(); },
    valor() { return contador; }
  };
})();

MinhaLib.adicionar();
console.log(MinhaLib.valor()); // 1
console.log(contador);         // ReferenceError — privado!
```

---

### 5.2 CommonJS (CJS) — O sistema do Node.js

O CommonJS foi introduzido pelo Node.js para ambiente servidor. É **síncrono** — o `require` bloqueia a execução até o arquivo ser carregado.

```javascript
// math.js — exportando
const PI = 3.14159;

function somar(a, b) { return a + b; }
function subtrair(a, b) { return a - b; }

module.exports = { PI, somar, subtrair };
// Ou exportações individuais:
// exports.somar = somar;
```

```javascript
// app.js — importando
const { PI, somar } = require('./math');
// Ou tudo de uma vez:
// const math = require('./math');

console.log(somar(2, 3)); // 5
console.log(PI);          // 3.14159
```

**Características do CJS:**
- `require()` é **síncrono**
- Retorna o valor de `module.exports`
- Carregamento **dinâmico** (pode estar dentro de um `if`)
- `module.exports` é um **objeto** mutável — cuidado com referências circulares

```javascript
// Require dinâmico é válido em CJS
if (condicao) {
  const modulo = require('./modulo-especial');
}
```

---

### 5.3 ES Modules (ESM) — O padrão moderno

Os ES Modules foram padronizados no ES2015 (ES6) e são o **sistema oficial** da linguagem. Funcionam no browser (com `type="module"`) e no Node.js (`.mjs` ou `"type": "module"` no `package.json`).

```javascript
// math.js — exportações nomeadas
export const PI = 3.14159;

export function somar(a, b) { return a + b; }
export function subtrair(a, b) { return a - b; }

// Exportação padrão (default) — um por arquivo
export default function calcular(a, b) { return a * b; }
```

```javascript
// app.js — importações
import calcular, { PI, somar } from './math.js'; // default + named
import * as Math from './math.js';               // namespace import

console.log(somar(2, 3));  // 5
console.log(Math.PI);      // 3.14159
console.log(calcular(4, 5)); // 20
```

#### Importação dinâmica (lazy loading)

```javascript
// import() retorna uma Promise — útil para code splitting
async function carregarModulo() {
  const { somar } = await import('./math.js');
  console.log(somar(1, 2));
}

// Ou com condição
if (precisaDeGraficos) {
  const { renderizar } = await import('./graficos.js');
  renderizar();
}
```

---

### 5.4 Diferenças fundamentais: CJS vs ESM

| Característica | CommonJS (CJS) | ES Modules (ESM) |
|----------------|---------------|-----------------|
| Sintaxe | `require` / `module.exports` | `import` / `export` |
| Carregamento | Síncrono | Assíncrono |
| Análise | Runtime | Parse time (estático) |
| `import` dinâmico? | ✅ Sempre | Somente com `import()` |
| Tree-shaking | ❌ Difícil | ✅ Sim (imports estáticos) |
| `this` no topo | `module.exports` | `undefined` |
| Uso no browser | ❌ Não nativo | ✅ Com `type="module"` |
| Extensão no Node | `.cjs` ou `.js` | `.mjs` ou `"type":"module"` |

---

### 5.5 Tree-shaking: por que ESM importa

**Tree-shaking** é a capacidade do bundler (Webpack, Rollup, Vite) de **eliminar código não utilizado** do bundle final.

Isso só é possível porque os `import`/`export` do ESM são **estáticos** — analisados em tempo de parse, não de execução.

```javascript
// utils.js
export function usada() { return "usada"; }
export function naoUsada() { return "nunca chamada"; }

// app.js
import { usada } from './utils.js';
// naoUsada() será REMOVIDA do bundle final pelo tree-shaking
```

Com CJS, o bundler não consegue garantir isso porque `require` pode ser dinâmico:

```javascript
// CJS — bundler precisa incluir TUDO
const nomeModulo = condicao ? 'a' : 'b';
const mod = require(nomeModulo); // impossível analisar estaticamente
```

---

### 5.6 Módulos no browser

```html
<!-- type="module" ativa o ESM nativo -->
<script type="module">
  import { somar } from './math.js';
  console.log(somar(1, 2));
</script>

<!-- Módulos têm escopo próprio — não poluem o global -->
<script type="module">
  const x = 10; // não está em window.x
</script>
```

**Características especiais de `type="module"`:**
- Sempre em **strict mode** automaticamente
- Carregados de forma **diferida** (como `defer`)
- Têm **escopo próprio** — variáveis não vazam para `window`
- Cada arquivo é carregado apenas **uma vez**, independentemente de quantos `import`s apontam para ele

---

## Resumo Final: Como tudo se conecta

```
┌─────────────────────────────────────────────────────────────────┐
│                    JavaScript Runtime                           │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ Call Stack  │    │     Heap     │    │     Web APIs      │  │
│  │             │    │              │    │                   │  │
│  │ Execution   │    │  Closures    │    │  setTimeout       │  │
│  │ Contexts    │←───│  guardam     │    │  fetch            │  │
│  │             │    │  referências │    │  eventos          │  │
│  └──────┬──────┘    └──────────────┘    └────────┬──────────┘  │
│         │ vazia?                                  │             │
│         ▼                                         ▼             │
│  ┌─────────────┐                       ┌──────────────────────┐ │
│  │ Event Loop  │←──────────────────────│  Microtask Queue     │ │
│  │             │                       │  (Promises/await)    │ │
│  └─────────────┘                       ├──────────────────────┤ │
│                                        │  Macrotask Queue     │ │
│                                        │  (setTimeout/events) │ │
│                                        └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Closures ──────► dependem de ──────► Lexical Scope + Execution Context
this ──────────► depende de ────────► Como a função é CHAMADA (regular)
                                      Onde a função foi CRIADA (arrow)
== ────────────► depende de ────────► Type Coercion + Tipo dos valores
Módulos ───────► evoluíram de ──────► IIFE (closures!) → CJS → ESM
```

---

*Dominando esses conceitos, você tem uma base sólida para entender qualquer framework ou biblioteca JavaScript moderno.*
