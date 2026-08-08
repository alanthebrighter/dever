# Desafio — Sistema de Biblioteca

Agora vamos subir para dificuldade **7.5/10**. O foco será **estado + transições de estado + datas**.

A ideia é você modelar uma biblioteca onde livros podem ser emprestados e devolvidos.

---

## 1. `Book`

### Propriedades

* `title`
* `author`
* `available`

### Validações

`title`:

* string não vazia

Erro:

```text
title must be a non-empty string
```

`author`:

* string não vazia

Erro:

```text
author must be a non-empty string
```

`available` deve começar como `true`.

---

### `getSummary()`

Exemplo:

```text
The Hobbit by J.R.R. Tolkien
```

---

## 2. `Member`

### Propriedades

* `name`
* `books`

`books` começa como um array vazio.

### Validação

`name`:

```text
name must be a non-empty string
```

---

### `borrowBook(book)`

Aceita apenas:

```js
book instanceof Book
```

Erro:

```text
book must be an instance of Book
```

Se o livro estiver indisponível:

```text
book is not available
```

Caso contrário:

* adiciona o livro em `books`
* altera `book.available` para `false`

---

### `returnBook(book)`

Remove o livro dos livros emprestados e altera:

```js
book.available = true
```

Se o membro não possuir aquele livro, não precisa fazer nada.

---

### `getBorrowedBooks()`

Retorna os títulos dos livros emprestados.

Exemplo:

```js
["The Hobbit", "Dune"]
```

Use `map()`.

---

## 3. `Loan`

Agora entra uma classe nova.

Ela representa **um empréstimo específico**.

### Propriedades

* `book`
* `member`
* `borrowedAt`
* `returnedAt`

`book` deve ser `Book`.

`member` deve ser `Member`.

`borrowedAt` deve ser uma instância de `Date`.

`returnedAt` começa como:

```js
null
```

---

### `returnBook()`

Quando chamado:

```js
returnedAt = new Date()
```

Não precisa alterar o `Book` aqui.

A responsabilidade de alterar o estado do livro continua sendo do `Member`.

---

### `isReturned()`

Retorna:

```js
true
```

se `returnedAt` não for `null`.

Caso contrário:

```js
false
```

---

### `getDaysBorrowed()`

Retorna quantos dias se passaram desde `borrowedAt`.

Se ainda não foi devolvido:

```text
data atual - borrowedAt
```

Se já foi devolvido:

```text
returnedAt - borrowedAt
```

Considere **dias inteiros**.

Exemplo:

```text
borrowedAt: 1/jan
returnedAt: 5/jan

→ 4
```

---

## 4. `Library`

A classe principal.

### Propriedades

* `books`
* `members`
* `loans`

Todas começam como arrays.

---

### `addBook(book)`

Aceita apenas `Book`.

Adiciona à biblioteca.

---

### `addMember(member)`

Aceita apenas `Member`.

Adiciona à biblioteca.

---

### `borrowBook(member, book)`

Aqui começa a parte interessante.

Deve:

1. pedir ao `member` para realizar o empréstimo;
2. criar um `Loan`;
3. adicionar o `Loan` em `loans`.

O `borrowedAt` deve ser o momento atual:

```js
new Date()
```

---

### `returnBook(member, book)`

Deve:

1. fazer o membro devolver o livro;
2. encontrar o `Loan` correspondente;
3. registrar a devolução nesse `Loan`.

---

### `getAvailableBooks()`

Retorna somente livros disponíveis.

Use `filter()`.

---

### `getActiveLoans()`

Retorna somente empréstimos ainda não devolvidos.

Use `filter()`.

---

### `getTotalLoans()`

Retorna o número total de empréstimos registrados.

---

### `getMemberLoans(member)`

Retorna os empréstimos daquele membro.

Use `filter()`.

---

### `getMostBorrowedBook()`

Retorna o livro que aparece no maior número de empréstimos.

Aqui você vai precisar pensar um pouco mais sobre a implementação.

---

## 5. `Library.fromObject(data)`

Recebe:

```js
{
    books: [
        {
            title: "The Hobbit",
            author: "J.R.R. Tolkien"
        },
        {
            title: "Dune",
            author: "Frank Herbert"
        }
    ],

    members: [
        {
            name: "Alan"
        },
        {
            name: "Bob"
        }
    ]
}
```

Deve criar:

```text
Library
├── Book
├── Book
├── Member
└── Member
```

e retornar uma instância de `Library`.

---

# 6. `buildLibraryReport(library)`

Retorna:

```js
{
    totalBooks: 2,
    availableBooks: 1,
    totalMembers: 2,
    totalLoans: 3,
    activeLoans: 1
}
```

---

# Restrições

Você deve utilizar:

* Classes
* Encapsulamento
* Getters/setters quando fizer sentido
* `instanceof`
* Composição
* `map()`
* `filter()`
* `reduce()`
* `find()`
* `findIndex()`
* `Date`
* Método estático
* Estado/transição de estado

---

## O ponto principal deste desafio

No anterior você tinha:

```text
Order
 ├── Customer
 └── OrderItem
      └── Product
```

Agora você tem **relações entre objetos independentes**:

```text
Library
├── Books
├── Members
└── Loans
      ├── Book
      └── Member
```

E existe uma mudança de estado:

```text
Book
available = true
       ↓
   empréstimo
       ↓
available = false
       ↓
   devolução
       ↓
available = true
```

O `Loan` também possui seu próprio estado:

```text
returnedAt = null
       ↓
   devolução
       ↓
returnedAt = Date
```

O desafio aqui não é só fazer funcionar. É começar a perceber **qual objeto é responsável por qual mudança**.