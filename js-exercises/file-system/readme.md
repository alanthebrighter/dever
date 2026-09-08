# Desafio 10 — File System

**Dificuldade: 10/10**

Aqui a ideia é sair do modelo de objetos relacionados em estruturas relativamente lineares e trabalhar com uma **árvore de objetos recursiva**.

### Conceitos principais

* classes e herança
* composição
* encapsulamento
* `instanceof`
* arrays de objetos
* busca recursiva
* árvore de diretórios
* recursão
* cálculo acumulado
* navegação por caminhos

---

## Objetivo

Você vai implementar um pequeno sistema de arquivos em memória.

A estrutura será algo como:

```text
/
├── documents/
│   ├── resume.pdf
│   └── notes.txt
│
├── projects/
│   └── app/
│       ├── index.js
│       └── package.json
│
└── photo.jpg
```

Não existe sistema operacional nem arquivos reais. Tudo será representado por objetos JavaScript.

---

## 1. `File`

Representa um arquivo.

### Propriedades

* `name`
* `size`
* `extension`

### Regras

`name`:

```text
string não vazia
```

Erro:

```text
"name must be a non-empty string"
```

`size`:

```text
número >= 0
```

Erro:

```text
"size must be 0 or greater"
```

`extension`:

```text
string não vazia
```

Erro:

```text
"extension must be a non-empty string"
```

### Método

```js
getInfo()
```

Deve retornar:

```js
"resume.pdf - 150 KB"
```

considerando:

```js
name = "resume.pdf"
size = 150
extension = "pdf"
```

---

# 2. `Directory`

Representa uma pasta.

### Propriedades

* `name`
* `children`

`name` deve ser uma string não vazia.

Erro:

```text
"name must be a non-empty string"
```

`children` começa como:

```js
[]
```

---

### `add(child)`

Adiciona um `File` ou `Directory`.

Se não for nenhum dos dois:

```text
"child must be a File or Directory"
```

---

### `remove(name)`

Remove o primeiro filho que possuir aquele nome.

Retorna:

* `true` se removeu
* `false` se não encontrou

---

### `find(name)`

Procura um filho com aquele nome **recursivamente**.

Por exemplo:

```text
root
└── projects
    └── app
        └── index.js
```

Então:

```js
root.find("index.js")
```

deve encontrar o `File`, mesmo estando dentro de `app`.

Se não encontrar:

```js
null
```

---

### `getSize()`

Retorna o tamanho total da pasta.

Exemplo:

```text
documents/
├── a.txt → 100
├── b.txt → 200
└── images/
    └── photo.jpg → 500
```

Então:

```js
documents.getSize()
```

retorna:

```text
800
```

Ou seja, deve somar **recursivamente** os tamanhos de todos os arquivos abaixo dela.

---

# 3. `FileSystem`

Representa o sistema inteiro.

Possui:

```js
root
```

que deve ser um `Directory`.

O `root` começa representando:

```text
/
```

---

### `createFile(path, size, extension)`

Cria um arquivo dentro do diretório indicado.

Exemplo:

```js
fs.createFile("/documents/resume.pdf", 150, "pdf");
```

Resultado:

```text
/
└── documents/
    └── resume.pdf
```

Se os diretórios intermediários não existirem, devem ser criados.

Assim:

```js
fs.createFile("/projects/app/index.js", 100, "js");
```

deve automaticamente produzir:

```text
/
└── projects/
    └── app/
        └── index.js
```

---

### `createDirectory(path)`

Cria um diretório.

Exemplo:

```js
fs.createDirectory("/projects/app");
```

Deve criar os diretórios intermediários necessários.

---

### `find(path)`

Procura um arquivo ou diretório através do caminho.

Exemplo:

```js
fs.find("/projects/app/index.js");
```

retorna o objeto `File`.

Se não existir:

```js
null
```

---

### `delete(path)`

Remove o arquivo ou diretório indicado.

Retorna:

```text
true
```

quando removeu e:

```text
false
```

quando não encontrou.

---

### `getTotalSize()`

Retorna o tamanho total de todos os arquivos do sistema.

---

# 4. `buildFileSystemReport(fs)`

Deve retornar:

```js
{
    totalFiles: ...,
    totalDirectories: ...,
    totalSize: ...
}
```

Contando recursivamente todos os arquivos e diretórios.

**O `root` não deve ser contado como diretório.**

---

## Exemplo de uso

```js
const fs = new FileSystem();

fs.createDirectory("/documents");
fs.createFile("/documents/resume.pdf", 150, "pdf");
fs.createFile("/documents/notes.txt", 50, "txt");

fs.createFile("/projects/app/index.js", 100, "js");
fs.createFile("/projects/app/package.json", 80, "json");
```

A estrutura deve ficar:

```text
/
├── documents/
│   ├── resume.pdf
│   └── notes.txt
│
└── projects/
    └── app/
        ├── index.js
        └── package.json
```

E:

```js
fs.getTotalSize()
```

deve resultar em:

```text
380
```

---

### Regra importante para este desafio

Aqui **não vou te dar a implementação da recursão**.

A parte central do exercício é você perceber como fazer algo do tipo:

```text
Directory
   ↓
children
   ↓
Directory?
   ↓
entra nele
   ↓
children
   ↓
Directory?
   ↓
entra novamente
   ↓
...
```

---


### Pode usar

**JavaScript básico:**

* `class`
* `constructor`
* getters/setters
* `extends` / `super`
* `instanceof`
* `if/else`
* `for`, `for...of`
* `return`
* arrays
* objetos
* métodos de array como:

  * `.find()`
  * `.filter()`
  * `.push()`
  * `.splice()`
* `typeof`
* `Number.is...`
* `new Date()` se precisar
* `Map`/`Set`, se fizer sentido

**Estruturas auxiliares:**

* métodos privados não são necessários
* propriedades auxiliares como `_name` são permitidas
* funções auxiliares são permitidas

### Pode usar, mas o desafio quer que você pense por conta própria

* **recursão**
* decomposição de caminhos (`"/projects/app/index.js"`)
* percorrer uma árvore de `Directory`
* acumular valores durante uma travessia

A ideia é que você descubra a lógica dessas partes, então eu **não vou te entregar a implementação da recursão** antes de você tentar.

### Não precisa usar

* `fs` do Node.js
* filesystem real
* banco de dados
* bibliotecas externas
* npm
* TypeScript
* frameworks
* regex
* `async/await`
* Promises

E principalmente: **não precisa inventar uma arquitetura mais complexa**. O objetivo é praticar OOP + composição + recursão.

