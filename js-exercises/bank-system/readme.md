
---

# Desafio — Sistema Bancário

Agora vamos sair um pouco do "RPG" e fazer algo que parece código de empresa.

## Objetivo

Criar um sistema simples de contas bancárias.

Desta vez você vai trabalhar bastante com **composição**, **polimorfismo**, **regras de negócio** e um pouco de **histórico de operações**.

---

# Classe

```text
BankAccount
```

## Propriedades

* owner
* balance

---

## Validações

### owner

* string
* não vazia

Erro

```text
owner must be a non-empty string
```

---

### balance

* número
* nunca negativo

Erro

```text
balance cannot be negative
```

---

## Métodos

### deposit(amount)

Regras

* amount > 0

Erro

```text
deposit amount must be greater than 0
```

Adiciona saldo.

---

### withdraw(amount)

Regras

* amount > 0

Erro

```text
withdraw amount must be greater than 0
```

Se não houver saldo suficiente

Erro

```text
insufficient funds
```

---

### transfer(targetAccount, amount)

Move dinheiro entre contas.

Só aceita

```js
instanceof BankAccount
```

Erro

```text
target must be a BankAccount
```

A transferência deve reutilizar seus próprios métodos (`withdraw` e `deposit`) em vez de duplicar lógica.

---

### getSummary()

Retorna

```text
Alan - Balance: R$350
```

---

# Classe

```text
SavingsAccount
```

Herda de BankAccount.

Nova propriedade

```text
interestRate
```

(%)

---

Validação

> =0

Erro

```text
interestRate must be 0 or greater
```

---

Método

```text
applyInterest()
```

Exemplo

saldo

```text
1000
```

juros

```text
10
```

↓

novo saldo

```text
1100
```

---

Sobrescreva

```text
getSummary()
```

↓

```text
Savings - Alan - Balance: R$1100
```

---

# Classe

```text
CheckingAccount
```

Nova propriedade

```text
transactionFee
```

---

Validação

> =0

---

Sempre que ocorrer

* depósito
* saque

cobra a taxa.

Exemplo

saldo

```text
100
```

taxa

```text
2
```

Depósito de

```text
50
```

↓

saldo final

```text
148
```

---

Saque

```text
20
```

↓

saldo reduz

```text
22
```

(20 + taxa)

---

Sobrescreva

```text
getSummary()
```

↓

```text
Checking - Alan - Balance: R$22
```

---

# Classe

```text
Bank
```

Recebe um array de contas.

---

## addAccount(account)

Aceita apenas

```js
instanceof BankAccount
```

---

## getAccounts()

Retorna um array de summaries.

(Dica: `map()`.)

---

## getTotalMoney()

Soma todos os saldos.

(Dica: `reduce()`.)

---

## findAccount(owner)

Retorna a conta do dono.

Se não existir

```text
null
```

(Dica: `find()`.)

---

## richestAccount()

Retorna a conta com maior saldo.

(Dica: `reduce()`.)

---

## Método estático

```text
Bank.fromObjects(data)
```

Entrada

```js
[
    {
        owner:"Alan",
        balance:100
    },
    {
        type:"checking",
        owner:"Bob",
        balance:200,
        transactionFee:2
    },
    {
        type:"savings",
        owner:"Alice",
        balance:500,
        interestRate:5
    }
]
```

Retorna um `Bank`.

---

# Função

```text
buildBankReport(bank)
```

Retorna

```js
{
    totalAccounts:3,
    totalMoney:800,
    richest:"Alice",
    accounts:[
        ...
    ]
}
```

---

# Restrições

Você deve utilizar:

* Classes
* Herança
* Encapsulamento
* Getters/Setters
* Override
* `super`
* `instanceof`
* `map`
* `reduce`
* `find`
* Método estático
* Composição

---

# O desafio extra (sem dizer exatamente como)

Até agora você fez desafios onde quase todos os métodos alteravam apenas o próprio objeto.

Neste, existe um método que altera **dois objetos ao mesmo tempo**.

A ideia é que você pense em como evitar estados inconsistentes. Por exemplo:

* Se o saque falhar por falta de saldo, o dinheiro pode aparecer na outra conta?
* Você consegue reutilizar os métodos existentes em vez de repetir as mesmas validações?

Essas perguntas são muito comuns em sistemas financeiros e vão fazer você começar a pensar em consistência, não apenas em implementação.

---

## Uma dica de organização

Antes de escrever qualquer código, faça um rascunho da API das classes. Algo assim:

```text
BankAccount
├── deposit()
├── withdraw()
├── transfer()
└── getSummary()

SavingsAccount
├── applyInterest()
└── getSummary()

CheckingAccount
├── deposit()
├── withdraw()
└── getSummary()

Bank
├── addAccount()
├── findAccount()
├── richestAccount()
├── getTotalMoney()
└── fromObjects()
```

Esse hábito de pensar na estrutura antes da implementação costuma reduzir bastante retrabalho e ajuda a manter o código organizado.
