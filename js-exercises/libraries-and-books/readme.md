
---

# Desafio - Biblioteca de Livros

Crie um arquivo chamado `library.js`.

Seu objetivo é implementar duas classes e uma função.

---

# Classe Book

Um livro deve possuir:

* `title`
* `author`
* `available`

O construtor recebe:

```js
new Book(title, author, available)
```

---

## Regras

### title

Não pode ser vazio.

Use getter e setter.

Mensagem:

```
title must be a non-empty string
```

---

### author

Não pode ser vazio.

Mensagem:

```
author must be a non-empty string
```

---

### available

Deve ser um boolean.

Aceita apenas:

```js
true
false
```

Mensagem:

```
available must be a boolean
```

---

# Método

```js
getLabel()
```

Se disponível:

```
Clean Code by Robert C. Martin (Available)
```

Caso contrário:

```
Clean Code by Robert C. Martin (Borrowed)
```

---

# Classe Library

O construtor recebe um array de livros.

```js
const lib = new Library([
    new Book(...),
    new Book(...)
]);
```

Internamente guarde o array.

---

## Método

```js
addBook(book)
```

Só aceita objetos da classe `Book`.

Caso contrário:

```
book must be an instance of Book
```

---

## Método

```js
borrow(title)
```

Procura um livro pelo título.

Se encontrar um livro disponível:

marca como indisponível

retorna

```
true
```

Se já estiver emprestado:

```
false
```

Se não existir:

```
false
```

---

## Método

```js
listBooks()
```

Retorna

```js
[
   "Clean Code by Robert C. Martin (Available)",
   ...
]
```

---

# Método estático

Na classe Library crie

```js
static fromObjects(data)
```

Recebe

```js
[
    {
        title: "...",
        author: "...",
        available: true
    }
]
```

e retorna

```js
Library
```

contendo instâncias de `Book`.

---

# Função

Implemente

```js
buildAvailableTitles(library)
```

Recebe uma `Library`.

Retorna apenas os títulos disponíveis.

Exemplo

```js
[
   "Clean Code",
   "Refactoring"
]
```

---

# Restrições

* usar classes
* usar herança? **não**
* usar getters/setters
* usar método estático
* usar `.map()`
* usar `.filter()`
* não alterar arrays recebidos externamente

---

# Arquivo de teste

Crie um arquivo `test.js`.

```javascript
import { Book, Library, buildAvailableTitles } from "./library.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertThrows(fn, expectedMessage) {
    try {
        fn();
        throw new Error("Expected an error.");
    } catch (err) {
        if (err.message === "Expected an error.") {
            throw err;
        }

        assert(
            err.message === expectedMessage,
            `Expected "${expectedMessage}", got "${err.message}"`
        );
    }
}

console.log("Running tests...\n");

// ----------------------------
// Book
// ----------------------------

const book = new Book(
    "Clean Code",
    "Robert C. Martin",
    true
);

assert(
    book.getLabel() ===
        "Clean Code by Robert C. Martin (Available)",
    "Book label incorrect."
);

book.available = false;

assert(
    book.getLabel() ===
        "Clean Code by Robert C. Martin (Borrowed)",
    "Book status incorrect."
);

// ----------------------------
// setters
// ----------------------------

assertThrows(
    () => new Book("", "Someone", true),
    "title must be a non-empty string"
);

assertThrows(
    () => new Book("Book", "", true),
    "author must be a non-empty string"
);

assertThrows(
    () => new Book("Book", "Someone", "yes"),
    "available must be a boolean"
);

// ----------------------------
// Library
// ----------------------------

const library = new Library([book]);

library.addBook(
    new Book("Refactoring", "Martin Fowler", true)
);

assert(
    library.borrow("Refactoring") === true,
    "Borrow should succeed."
);

assert(
    library.borrow("Refactoring") === false,
    "Borrowing twice should fail."
);

assert(
    library.borrow("Unknown") === false,
    "Borrowing unknown book should fail."
);

// ----------------------------
// Static
// ----------------------------

const lib2 = Library.fromObjects([
    {
        title: "DDD",
        author: "Eric Evans",
        available: true
    }
]);

assert(
    lib2.listBooks()[0] ===
        "DDD by Eric Evans (Available)",
    "Static method failed."
);

// ----------------------------
// buildAvailableTitles
// ----------------------------

const titles = buildAvailableTitles(lib2);

assert(
    titles.length === 1,
    "Available titles incorrect."
);

assert(
    titles[0] === "DDD",
    "Title incorrect."
);

console.log("\n✅ All tests passed!");
```

---

## O que esse desafio reforça

* Encapsulamento com getters e setters.
* Validação de diferentes tipos (`string`, `boolean` e objetos).
* Uso de `instanceof` para garantir que apenas instâncias válidas sejam aceitas.
* Composição, onde uma `Library` contém vários objetos `Book`.
* Métodos que modificam o estado interno de um objeto (`borrow`).
* Métodos estáticos para converter dados simples em instâncias de classes.
* Uso combinado de `.filter()` e `.map()` para transformar coleções.
* Cuidado para não mutar dados externos recebidos pela classe.  

---
