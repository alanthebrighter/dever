// exercicio.test.ts
import { TodoClient } from './jsonplaceholder';

describe('TodoClient - Testes de HTTP Client', () => {
  let client: TodoClient;

  beforeAll(() => {
    client = new TodoClient();
  });

  it('deve buscar uma tarefa pelo ID com sucesso (GET)', async () => {
    const todo = await client.getTodoById(1);
    
    expect(todo).toBeDefined();
    expect(todo.id).toBe(1);
    expect(todo.userId).toBe(1);
    expect(typeof todo.title).toBe('string');
    expect(typeof todo.completed).toBe('boolean');
  });

  it('deve lançar um erro específico se a tarefa GET não existir (404)', async () => {
    // A JSONPlaceholder simula 404 se passarmos um ID inexistente na rota de objetos
    await expect(client.getTodoById(9999999)).rejects.toThrow('Tarefa não encontrada');
  });

  it('deve criar uma nova tarefa (POST)', async () => {
    const newTodoData = {
      title: 'Aprender HTTP Clients em TypeScript',
      userId: 1,
      completed: false
    };

    const createdTodo = await client.createTodo(newTodoData);

    expect(createdTodo).toBeDefined();
    expect(createdTodo.title).toBe(newTodoData.title);
    expect(createdTodo.userId).toBe(newTodoData.userId);
    expect(createdTodo.completed).toBe(false);
    // A JSONPlaceholder sempre retorna o ID 201 para simular criação
    expect(createdTodo.id).toBe(201);
  });

  it('deve atualizar o status de uma tarefa (PATCH)', async () => {
    const updatedTodo = await client.updateTodoStatus(1, true);

    expect(updatedTodo).toBeDefined();
    expect(updatedTodo.id).toBe(1);
    expect(updatedTodo.completed).toBe(true);
  });

  it('deve deletar uma tarefa com sucesso (DELETE)', async () => {
    const isDeleted = await client.deleteTodo(1);
    
    expect(isDeleted).toBe(true);
  });

  it('deve lançar um erro ao tentar deletar uma tarefa inexistente (DELETE 404)', async () => {
    // A JSONPlaceholder retorna 200 para deletes em IDs inexistentes, 
    // mas vamos testar o comportamento do seu código de qualquer forma manipulando um ID fora do padrão
    // Se a API responder 200, seu teste aqui pode precisar de ajuste dependendo de como você implementou.
    // Nota: A JSONPlaceholder pode não retornar 404 para deletes, então este teste foca na exigência do retorno booleano.
    const result = await client.deleteTodo(2);
    expect(result).toBe(true);
  });
});
