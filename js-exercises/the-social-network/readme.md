# Desafio — Rede Social



Agora entramos na dificuldade **8.5/10**. O foco principal será **relacionamentos muitos-para-muitos** e manipulação de coleções de objetos.



Você já sabe trabalhar com:



```text

Library → Loan → Member + Book

```



Agora teremos:



```text

User ↔ User

User ↔ Post

User ↔ Post

```



Ou seja, os mesmos objetos podem estar relacionados a vários outros objetos.



---



## 1. `User`



### Propriedades



* `username`

* `email`

* `following`

* `followers`



`following` e `followers` começam como arrays vazios.



### Validações



`username`:



* string não vazia



Erro:



```text

username must be a non-empty string

```



`email`:



* deve conter `"@"`



Erro:



```text

invalid email

```



---



### `follow(user)`



Aceita apenas:



```js

user instanceof User

```



Erro:



```text

user must be an instance of User

```



Ao seguir:



```text

A.follow(B)

```



deve acontecer:



```text

A.following → B

B.followers → A

```



Não deve adicionar a mesma relação duas vezes.



---



### `unfollow(user)`



Remove a relação dos dois lados.



```text

A.following → remove B

B.followers → remove A

```



Se não estiver seguindo, não faz nada.



---



### `getFollowing()`



Retorna um array com os usernames das pessoas que o usuário segue.



Use `map()`.



---



### `getFollowers()`



Retorna os usernames dos seguidores.



Use `map()`.



---



# 2. `Post`



### Propriedades



* `author`

* `content`

* `likes`



`likes` começa como array vazio.



`author` deve ser:



```js

instanceof User

```



Erro:



```text

author must be an instance of User

```



`content`:



* string não vazia



Erro:



```text

content must be a non-empty string

```



---



### `like(user)`



Adiciona o usuário aos likes.



Não deve duplicar o mesmo usuário.



---



### `unlike(user)`



Remove o usuário dos likes.



Se ele não tiver curtido, não faz nada.



---



### `getLikeCount()`



Retorna:



```js

this.likes.length

```



---



### `getSummary()`



Exemplo:



```text

@alan: Hello world! (3 likes)

```



---



# 3. `SocialNetwork`



Essa será a classe responsável pela rede.



### Propriedades



* `users`

* `posts`



Ambas começam como arrays.



---



## `addUser(user)`



Aceita apenas:



```js

instanceof User

```



Adiciona à rede.



---



## `addPost(post)`



Aceita apenas:



```js

instanceof Post

```



Adiciona à rede.



---



## `getUser(username)`



Retorna o usuário correspondente.



Use `find()`.



Se não encontrar:



```js

null

```



---



## `getPostsByUser(user)`



Retorna os posts daquele usuário.



Use `filter()`.



---



## `getFeed(user)`



Essa é uma das partes importantes.



O feed deve conter **os posts dos usuários que o usuário segue**.



Exemplo:



```text

Alan segue Bob e Alice



Bob → Post 1

Bob → Post 2

Alice → Post 3

Carlos → Post 4

```



O feed de Alan:



```text

Post 1

Post 2

Post 3

```



Carlos não aparece.



Use `filter()`.



---



## `getMostLikedPost()`



Retorna o post com maior quantidade de likes.



Use `reduce()`.



---



## `getMostFollowedUser()`



Retorna o usuário com maior quantidade de seguidores.



Use `reduce()`.



---



## `getTotalLikes()`



Retorna a quantidade total de likes de todos os posts.



Use `reduce()`.



---



# 4. `SocialNetwork.fromObject(data)`



Agora vamos voltar ao conceito que você acabou de entender.



Entrada:



```js

{

    users: [

        {

            username: "alan",

            email: "alan@email.com"

        },

        {

            username: "bob",

            email: "bob@email.com"

        }

    ],



    posts: [

        {

            author: "alan",

            content: "Hello world!"

        },

        {

            author: "bob",

            content: "Learning JavaScript"

        }

    ]

}

```



Deve criar:



```text

SocialNetwork

│

├── User alan

├── User bob

│

├── Post

│    └── User alan

│

└── Post

     └── User bob

```



### Atenção



O `author` do objeto original é uma **string**:



```js

author: "alan"

```



Mas o `Post` precisa receber:



```js

author: User

```



Então você terá que:



1. criar os usuários;

2. adicioná-los à rede;

3. encontrar o usuário correspondente pelo username;

4. criar os posts usando a instância encontrada.



Esse é propositalmente um exercício de **transformação de dados + relacionamento entre objetos**.



---



# 5. `buildSocialReport(network)`



Retorna:



```js

{

    totalUsers: 3,

    totalPosts: 5,

    totalLikes: 12,

    mostFollowed: "alan",

    mostLikedPost: "@bob: Learning JavaScript (5 likes)"

}

```



---



# Regras importantes



Você deve usar:



* Classes

* Encapsulamento

* Getters/setters

* `instanceof`

* Composição

* Relacionamentos entre objetos

* `map()`

* `filter()`

* `find()`

* `reduce()`

* Método estático



### Principal conceito novo



**Relacionamento bidirecional.**



Quando:



```js

alan.follow(bob);

```



não basta:



```text

alan.following = [bob]

```



Também precisa existir:



```text

bob.followers = [alan]

```



O mesmo conceito aparece em sistemas reais com relacionamentos entre entidades.


