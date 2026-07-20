
---

# Desafio 3 — Sistema de Pagamentos

Crie um arquivo:

```
payment.js
```

Implemente as classes abaixo.

---

# Classe base

```js
Payment
```

Propriedades:

* amount

---

## Validação

`amount`

* deve ser um número
* deve ser maior que zero

Mensagem:

```
amount must be greater than 0
```

Use getter e setter.

---

## Método

```js
calculateTotal()
```

Na classe base retorna simplesmente:

```
amount
```

---

## Método

```js
getReceipt()
```

Retorna

```
Payment: R$100
```

(se amount = 100)

---

# Classe

```
CreditCardPayment extends Payment
```

Nova propriedade

```
feePercent
```

Validação

* número
* > =0

Mensagem

```
feePercent must be 0 or greater
```

---

Sobrescreva

```js
calculateTotal()
```

Exemplo

```
amount = 100
fee = 5
```

Retorna

```
105
```

---

Sobrescreva

```js
getReceipt()
```

Retorna

```
Credit Card: R$105
```

---

# Classe

```
PixPayment extends Payment
```

Nova propriedade

```
discountPercent
```

Validação

> =0

Mensagem

```
discountPercent must be 0 or greater
```

---

Sobrescreva

```
calculateTotal()
```

Exemplo

```
100
10%
```

↓

```
90
```

---

Sobrescreva

```
getReceipt()
```

↓

```
PIX: R$90
```

---

# Classe

```
Checkout
```

Recebe um array de pagamentos.

```js
new Checkout([
    pagamento1,
    pagamento2
])
```

---

## Método

```
addPayment(payment)
```

Só aceita

```
instanceof Payment
```

Mensagem

```
payment must be an instance of Payment
```

---

## Método

```
getReceipts()
```

Retorna

```js
[
    "Payment: R$100",
    "Credit Card: R$105",
    "PIX: R$90"
]
```

---

## Método

```
getGrandTotal()
```

Soma

```js
payment.calculateTotal()
```

de todos os pagamentos.

---

# Método estático

Na classe Checkout

```
fromObjects(data)
```

Entrada

```js
[
{
type:"credit",
amount:100,
feePercent:5
},
{
type:"pix",
amount:200,
discountPercent:10
},
{
amount:50
}
]
```

Retorna

```
Checkout
```

com os objetos corretos.

---

# Função

Implemente

```js
buildReport(checkout)
```

Retorna

```js
{
    totalPayments:3,
    grandTotal:335,
    receipts:[
       ...
    ]
}
```

---

# Restrições

Você **deve usar**:

* classes
* herança
* getters/setters
* override
* static
* map
* reduce
* instanceof

Não altere os arrays recebidos.

---

# O que esse desafio quer ensinar

Até agora você fazia coisas assim:

```js
book.getLabel()
task.getSummary()
```

Agora você vai trabalhar com um array contendo **tipos diferentes de objetos**:

```js
[
    new Payment(...),
    new CreditCardPayment(...),
    new PixPayment(...)
]
```

E poderá fazer:

```js
payments.map(payment => payment.getReceipt())
```

sem precisar perguntar:

```js
if (payment instanceof CreditCardPayment) ...
```

ou

```js
if (payment instanceof PixPayment) ...
```

Cada objeto sabe como responder. Isso é **polimorfismo**, um dos conceitos centrais da POO.

---


