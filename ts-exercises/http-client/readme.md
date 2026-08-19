# Exercício: Cliente de Gerenciamento de Tarefas (To-Do Client)

## Contexto

Você vai construir um "Cliente HTTP" para se comunicar com a API pública e gratuita **JSONPlaceholder**. Essa API simula um backend real de tarefas (To-Dos). 

A URL base da API é: `https://jsonplaceholder.typicode.com/todos`

## Seu Objetivo

Você deve escrever o código no arquivo `exercicio.ts` criando uma classe chamada `TodoClient` que contém os métodos abaixo. O arquivo de teste `exercicio.test.ts` já está pronto e testará a sua implementação.

## Requisitos e Regras de Negócio

Sua classe `TodoClient` deve ter os seguintes métodos assíncronos:

### 1. `getTodoById(id: number)`

- Deve fazer uma requisição `GET` para a URL base concatenada com o ID (ex: `/todos/1`).
- Deve retornar o objeto da tarefa (Todo) tipado corretamente.
- **Tratamento de erro:** Se a API retornar um status 404 (Not Found), você deve lançar um Error com a mensagem exata: `"Tarefa não encontrada"`.

### 2. `createTodo(data: { title: string; userId: number; completed: boolean })`

- Deve fazer uma requisição `POST` para a URL base.
- Deve enviar no corpo (body) da requisição o objeto recebido por parâmetro, formatado como JSON.
- Deve incluir o cabeçalho (header) `Content-Type: application/json`.
- Deve retornar a resposta da API simulando a criação da tarefa (que retornará um ID: 201).

### 3. `updateTodoStatus(id: number, completed: boolean)`

- Deve fazer uma requisição `PATCH` para a URL base concatenada com o ID (ex: `/todos/1`).
- Deve enviar no corpo (body) apenas o status `completed` atualizado.
- Deve retornar a resposta da API atualizada.

### 4. `deleteTodo(id: number)`

- Deve fazer uma requisição `DELETE` para a URL base concatenada com o ID.
- A API retornará um objeto vazio `{}` quando bem-sucedido. Seu método deve retornar `true` caso a requisição seja bem-sucedida (status 200).
- **Tratamento de erro:** Se a API retornar um status 404, lance um Error com a mensagem: `"Erro ao deletar: tarefa não existe"`.



## Dicas

- Use a interface `Todo` para tipar os retornos:

  ```typescript
  interface Todo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  }

  ```

- Lembre-se que o `fetch` nativo do Node 18+ não rejeita a promessa em erros HTTP (como 404 ou 500). Você precisa verificar a propriedade `response.ok` ou `response.status` manualmente para lançar os erros.

- Não se esqueça de exportar a classe `TodoClient` no final do arquivo para que os testes possam importá-la!





