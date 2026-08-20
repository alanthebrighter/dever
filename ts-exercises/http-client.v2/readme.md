# 🧪 Exercício: CLI de Consulta de Repositórios do GitHub

## Contexto

Você vai construir uma pequena aplicação de linha de comando (CLI) em TypeScript que consome a **API pública do GitHub** para buscar e exibir informações sobre repositórios de um usuário.

O objetivo é colocar em prática tudo que você aprendeu no curso: fazer requisições HTTP reais, lidar com erros, trabalhar com JSON, usar headers, entender métodos e URLs — tudo isso com segurança de tipos do TypeScript.

---

## O que você vai construir

Uma CLI que, dado um **username do GitHub**, retorna:

1. O nome, descrição e linguagem dos **5 repositórios mais recentes** do usuário
2. O **total de estrelas** somando todos os repositórios
3. Uma mensagem de erro amigável caso o usuário **não exista** (404) ou a requisição falhe

### Exemplo de uso esperado

```
$ npx ts-node solution.ts octocat
```

```
Repositórios de octocat:
1. Hello-World — My first repository on GitHub! (JavaScript)
2. Spoon-Knife — ... (null)
...

⭐ Total de estrelas: 2847
```

---

## Requisitos funcionais

- [ ] Buscar a lista de repositórios públicos de um usuário via API do GitHub
- [ ] Filtrar e exibir apenas os **5 mais recentes** (ordenados por `updated_at`)
- [ ] Exibir: nome, descrição e linguagem de cada repositório
- [ ] Calcular e exibir o **total de estrelas** de todos os repositórios (não só dos 5)
- [ ] Tratar o caso de usuário não encontrado (**status 404**) com mensagem clara
- [ ] Tratar falhas de rede genéricas

---

## Requisitos técnicos

- Usar **`fetch`** nativo (Node 18+) — sem axios ou bibliotecas HTTP externas
- O username deve vir de **`process.argv`** (argumento da linha de comando)
- Validar a resposta da API com **Zod** (runtime validation — capítulo 10 do curso)
- Usar um **Header `Accept`** adequado para a API do GitHub
- O código deve estar em **TypeScript estrito** (sem `any` solto)

---

## Endpoint que você vai usar

```
GET https://api.github.com/users/{username}/repos?per_page=100&sort=updated
```

Documentação: https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user

> 💡 A API do GitHub é pública e não exige autenticação para repositórios públicos, mas tem rate limit. Se precisar, pode gerar um token pessoal gratuito e passá-lo via header `Authorization`.

---

## Estrutura esperada dos arquivos

```
/
├── solution.ts        ← sua implementação
├── solution.test.ts   ← testes (já fornecido, não mexa)
├── package.json
└── tsconfig.json
```

---

## Dicas (sem spoilers)

- Leia o status da resposta **antes** de tentar parsear o JSON
- O Zod vai te ajudar a garantir que a API retornou o formato esperado — pense em quais campos você realmente precisa validar
- Separe bem as responsabilidades: uma função para buscar, outra para formatar, outra para exibir
- A função principal pode ser `async` — use top-level await ou chame ela com `.catch()`
