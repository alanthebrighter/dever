
---

# Desafio 6 — Sistema de Pedidos

## Objetivo

Criar um pequeno sistema de pedidos de uma loja.

Desta vez você vai trabalhar com objetos que **contêm outros objetos**.

---

# Classe

## Product

### Propriedades

* name
* price

---

### Validações

name

* string
* não vazia

Erro

```
name must be a non-empty string
```

price

* número
* maior que zero

Erro

```
price must be greater than 0
```

---

### Método

```js
getSummary()
```

Retorna

```
Mouse Gamer - R$120
```

---

# Classe

## OrderItem

Representa um produto dentro de um pedido.

### Propriedades

* product
* quantity

---

### Validações

product

* instanceof Product

Erro

```
product must be an instance of Product
```

quantity

* inteiro
* maior que zero

Erro

```
quantity must be greater than 0
```

---

### Métodos

```js
getSubtotal()
```

Exemplo

```
Produto = 50
Quantidade = 3

150
```

---

```js
getSummary()
```

Exemplo

```
Mouse Gamer x2 = R$240
```

---

# Classe

## Customer

### Propriedades

* name
* email

---

Validações

name

```
name must be a non-empty string
```

email

Apenas verifique:

```js
email.includes("@")
```

Erro

```
invalid email
```

---

### Método

```js
getSummary()
```

↓

```
Alan <alan@email.com>
```

---

# Classe

## Order

### Propriedades

* customer
* items

---

customer

```
instanceof Customer
```

Erro

```
customer must be an instance of Customer
```

---

items

É um array de OrderItem.

---

## Métodos

### addItem(item)

Aceita apenas

```js
instanceof OrderItem
```

Erro

```
item must be an instance of OrderItem
```

---

### removeItem(productName)

Remove o primeiro item cujo produto tenha esse nome.

Se não existir

não faz nada.

*(Dica: `findIndex()`.)*

---

### getItems()

Retorna um array de summaries.

*(Dica: `map()`.)*

---

### getTotal()

Soma todos os subtotais.

*(Dica: `reduce()`.)*

---

### getMostExpensiveItem()

Retorna o `OrderItem` com maior subtotal.

*(Dica: `reduce()`.)*

---

### getSummary()

Retorna

```
Order for Alan - Total: R$430
```

---

## Método estático

```js
Order.fromObject(data)
```

Recebe

```js
{
    customer:{
        name:"Alan",
        email:"alan@email.com"
    },

    items:[
        {
            product:{
                name:"Mouse",
                price:120
            },
            quantity:2
        },
        {
            product:{
                name:"Keyboard",
                price:190
            },
            quantity:1
        }
    ]
}
```

Deve criar toda a estrutura de objetos:

```
Order
 ├── Customer
 ├── OrderItem
 │     └── Product
 └── OrderItem
       └── Product
```

---

# Função

```js
buildInvoice(order)
```

Retorna

```js
{
    customer:"Alan",

    total:430,

    items:[
        "Mouse x2 = R$240",
        "Keyboard x1 = R$190"
    ]
}
```

---

# Restrições

Você deve utilizar

* Classes
* Herança (não obrigatória desta vez)
* Composição (fortemente)
* Getters
* Setters
* `instanceof`
* `map`
* `reduce`
* `findIndex`
* Método estático

---

# O desafio escondido

Até agora, quando você criava um objeto, ele era quase sempre "plano".

Agora você terá uma estrutura aninhada:

```
Order
    Customer
    OrderItem
        Product
    OrderItem
        Product
```

Ou seja, você vai praticar transformar **objetos comuns (JSON)** em uma **árvore de objetos reais**.

Isso acontece o tempo todo quando consumimos APIs em aplicações Node.js e React.

---

## O que espero que você pratique

Neste desafio eu quero que você tente pensar **menos em sintaxe** e mais em responsabilidades.

Quando estiver escrevendo um método, pergunte:

> **"Qual classe deveria saber fazer isso?"**

Por exemplo:

* Quem sabe calcular um subtotal? O `Order` ou o `OrderItem`?
* Quem sabe o preço de um produto? O `OrderItem` ou o `Product`?
* Quem sabe o total do pedido? O `Order` ou cada item?

Essas perguntas ajudam muito a desenvolver modelagem orientada a objetos, que é justamente o próximo passo da sua evolução.
