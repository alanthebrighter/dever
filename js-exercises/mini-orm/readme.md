# Desafio 9 — Mini ORM

Desafio de dificuldade **9/10**. Este é diferente dos anteriores: o foco deixa de ser apenas modelar entidades e passa a ser **criar uma pequena camada de persistência/consulta em memória**.

A ideia é simular um ORM simplificado:

```text
Database
   │
   ├── Table<User>
   │      ├── User
   │      ├── User
   │      └── User
   │
   └── Table<Post>
          ├── Post
          └── Post
```

Não haverá banco de dados real. Tudo ficará em arrays.

---

# 1. `Record`

Classe base para os registros.

### Propriedades

* `id`
* `createdAt`

### Regras

`id` deve ser um número inteiro positivo.

Erro:

```text
id must be a positive integer
```

`createdAt` deve ser uma instância de `Date`.

Erro:

```text
createdAt must be an instance of Date
```

---

### `toJSON()`

Retorna um objeto simples contendo:

```js
{
    id: this.id,
    createdAt: this.createdAt
}
```

---

# 2. `User extends Record`

### Propriedades adicionais

* `name`
* `email`

`name`:

```text
name must be a non-empty string
```

`email` deve conter `"@"`:

```text
invalid email
```

---

### `toJSON()`

Deve incluir os campos herdados:

```js
{
    id: 1,
    createdAt: ...,
    name: "Alan",
    email: "alan@email.com"
}
```

---

# 3. `Post extends Record`

### Propriedades

* `author`
* `content`

`author` deve ser uma instância de `User`.

Erro:

```text
author must be an instance of User
```

`content` deve ser uma string não vazia.

Erro:

```text
content must be a non-empty string
```

---

### `toJSON()`

Exemplo:

```js
{
    id: 1,
    createdAt: ...,
    author: user,
    content: "Hello world"
}
```

O `author` continua sendo a **instância de `User`**, não o username.

---

# 4. `Table`

Aqui começa o Mini ORM propriamente dito.

Uma `Table` armazena registros de um determinado tipo.

### Construtor

Recebe a classe permitida:

```js
new Table(User)
```

ou:

```js
new Table(Post)
```

A tabela começa vazia.

Ela também deve manter um contador para gerar IDs.

---

## `insert(record)`

Insere um registro.

O objeto precisa ser uma instância da classe aceita pela tabela.

Exemplo:

```js
const users = new Table(User);

users.insert(
    new User(...)
);
```

Se tentar:

```js
users.insert(
    new Post(...)
);
```

deve lançar:

```text
record must be an instance of the table model
```

O `Table` deve atribuir um `id` ao registro antes de armazená-lo.

Os IDs devem começar em `1` e aumentar:

```text
1
2
3
4
...
```

Retorne o próprio registro inserido.

---

# 5. `findById(id)`

Procura pelo ID.

Exemplo:

```js
users.findById(2)
```

Retorna:

```text
User
```

Se não existir:

```js
null
```

---

# 6. `findAll()`

Retorna todos os registros.

**Importante:** não deve devolver diretamente o array interno da tabela.

Ou seja, isso:

```js
return this.records;
```

não é o comportamento desejado.

Retorne uma cópia do array.

---

# 7. `where(predicate)`

Essa é a primeira parte mais parecida com uma consulta de ORM.

Recebe uma função:

```js
users.where(user => user.email.includes("@gmail.com"))
```

e retorna os registros que satisfazem a condição.

Internamente, pense em:

```text
records
   ↓
filter(predicate)
   ↓
resultado
```

---

# 8. `update(id, changes)`

Atualiza um registro existente.

Exemplo:

```js
users.update(1, {
    name: "Alan Souza"
});
```

O registro deve continuar sendo uma instância de `User`.

O `id` não pode ser alterado pelo objeto `changes`.

Se o registro não existir:

```js
null
```

Caso exista:

```text
atualiza
↓
retorna o registro atualizado
```

---

# 9. `delete(id)`

Remove o registro.

Se existir:

* remove da tabela;
* retorna `true`.

Se não existir:

```js
false
```

---

# 10. `count()`

Retorna a quantidade de registros.

---

# 11. `Database`

Agora teremos uma classe que contém várias tabelas.

### Propriedade

```text
tables
```

Deve começar como um objeto vazio.

---

## `createTable(name, Model)`

Exemplo:

```js
const db = new Database();

db.createTable("users", User);
db.createTable("posts", Post);
```

Depois:

```js
db.tables.users
db.tables.posts
```

serão instâncias de `Table`.

---

## `table(name)`

Retorna a tabela pelo nome.

Exemplo:

```js
db.table("users")
```

retorna:

```text
Table<User>
```

---

# 12. `Database.fromObject(data)`

Entrada:

```js
{
    users: [
        {
            name: "Alan",
            email: "alan@email.com"
        },
        {
            name: "Bob",
            email: "bob@email.com"
        }
    ]
}
```

Deve criar uma `Database` contendo uma tabela `"users"` e inserir os usuários.

Os usuários precisam ser **instâncias reais de `User`**.

---

# 13. Consultas encadeadas

Agora vem a parte que diferencia este desafio dos anteriores.

Você deve conseguir fazer:

```js
db
    .table("users")
    .where(user => user.name.startsWith("A"))
```

E também:

```js
db
    .table("users")
    .where(user => user.email.includes("@gmail.com"))
    .length
```

Não precisa criar um sistema sofisticado de query builder. `where()` pode simplesmente retornar um array.

---

# 14. `buildDatabaseReport(db)`

Retorne:

```js
{
    users: 3,
    posts: 5
}
```

A chave deve ser o nome da tabela e o valor deve ser a quantidade de registros.

Se a database tiver:

```text
users → 3
posts → 5
comments → 10
```

o resultado deve ser:

```js
{
    users: 3,
    posts: 5,
    comments: 10
}
```

---

# Conceitos que quero que você pratique

Neste desafio, tente pensar menos em:

> "Qual código eu escrevo?"

e mais em:

> "Qual responsabilidade pertence a qual classe?"

A arquitetura esperada é aproximadamente:

```text
Record
  ↑
  ├── User
  └── Post

Table
  └── armazena Records

Database
  └── armazena Tables
```

E o fluxo:

```text
new User()
     ↓
Table.insert()
     ↓
Table.records
     ↓
findById / where / update / delete
```

Depois:

```text
Database
   ↓
createTable()
   ↓
Table<User>
   ↓
insert()
   ↓
User
```

### O desafio novo aqui

Você vai começar a construir uma **abstração sobre outras classes**.

Nos desafios anteriores você modelava:

```text
User
Post
Library
Loan
```

Agora você precisa construir algo que consiga trabalhar genericamente com:

```text
User
Post
ou qualquer outro Model
```
