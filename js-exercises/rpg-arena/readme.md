
---

# Desafio — Arena RPG

## Objetivo

Criar um pequeno sistema de batalha usando POO.

Você deverá implementar as classes e o comportamento descrito abaixo.

---

# Classe base

```text
Character
```

## Propriedades

* name
* health
* maxHealth
* attackPower

---

## Validações

### name

* string
* não pode ser vazia

Erro:

```text
name must be a non-empty string
```

---

### maxHealth

* número
* maior que zero

Erro

```text
maxHealth must be greater than 0
```

---

### health

* nunca pode ser menor que 0
* nunca pode ser maior que maxHealth

Se receber:

```js
health = 500
```

e

```js
maxHealth = 100
```

deve armazenar

```text
100
```

---

### attackPower

* número
* maior que zero

Erro

```text
attackPower must be greater than 0
```

---

# Métodos

## attack(enemy)

Recebe outro personagem.

Deve causar dano chamando

```js
enemy.takeDamage(...)
```

---

## takeDamage(amount)

Reduz a vida.

Nunca pode ficar negativa.

---

## heal(amount)

Recupera vida.

Nunca pode passar de `maxHealth`.

---

## isAlive()

Retorna

```js
true
```

ou

```js
false
```

---

## getStatus()

Retorna

```text
Arthur (80/100 HP)
```

---

# Warrior

Herda de Character.

Quando ataca, causa

```text
attackPower + 5
```

---

## getStatus()

Retorna

```text
⚔ Warrior Arthur (80/100 HP)
```

---

# Mage

Nova propriedade

```text
mana
```

---

Validação

Mana ≥ 0

Erro

```text
mana must be 0 or greater
```

---

Quando atacar

Se tiver pelo menos

```text
20 mana
```

causa

```text
attackPower * 2
```

e perde

```text
20 mana
```

Caso contrário

causa dano normal.

---

## regenerateMana()

Recupera

```text
10
```

de mana.

Máximo

```text
100
```

---

## getStatus()

```text
✨ Mage Merlin (50/80 HP) Mana:60
```

---

# Archer

Nova propriedade

```text
arrows
```

---

Validação

≥ 0

Erro

```text
arrows must be 0 or greater
```

---

Ao atacar

Se possuir flechas

* gasta uma flecha
* causa

```text
attackPower + 10
```

Sem flechas

causa dano normal.

---

## refillArrows(amount)

Adiciona flechas.

Não aceita negativos.

---

# Party

Recebe um array de personagens.

---

## addMember(character)

Aceita apenas

```js
instanceof Character
```

---

## getAliveMembers()

Retorna somente os vivos.

*(Dica: aqui faz sentido usar `filter()`.)*

---

## getStatuses()

Retorna um array de strings.

Exemplo

```js
[
    "⚔ Warrior Arthur (90/100 HP)",
    "✨ Mage Merlin (60/80 HP) Mana:70"
]
```

*(Dica: aqui faz sentido usar `map()`.)*

---

## getTotalHealth()

Retorna a soma da vida atual de todos.

*(Dica: `reduce()`.)*

---

## Método estático

```text
Party.fromObjects(data)
```

Entrada:

```js
[
    {
        type: "warrior",
        name: "Arthur",
        health: 100,
        maxHealth: 100,
        attackPower: 20
    },
    {
        type: "mage",
        name: "Merlin",
        health: 80,
        maxHealth: 80,
        attackPower: 15,
        mana: 60
    }
]
```

Deve retornar uma `Party` contendo as instâncias corretas.

---

# Função

Implemente

```js
buildBattleReport(party)
```

Retorna

```js
{
    totalMembers: 3,
    aliveMembers: 2,
    totalHealth: 150,
    statuses: [
        ...
    ]
}
```

---

# Restrições

Você **deve utilizar**:

* Classes
* Herança
* Getters e setters
* Override
* `super`
* `instanceof`
* `map`
* `filter`
* `reduce`
* Método estático
* Composição (`Party` contém personagens)

---

# O objetivo deste desafio

Ele adiciona vários conceitos novos sem fugir do que você já estudou:

* **Polimorfismo de verdade:** `attack()` terá implementações diferentes em cada classe.
* **Estados internos:** mana e flechas mudam conforme o personagem age.
* **Colaboração entre objetos:** um personagem altera o estado de outro (`enemy.takeDamage(...)`).
* **Composição:** a `Party` coordena vários personagens sem precisar saber exatamente qual é o tipo de cada um.

---
