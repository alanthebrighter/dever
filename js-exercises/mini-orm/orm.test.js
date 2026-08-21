/**
 * Mini ORM — Testes
 *
 * Como usar:
 *   node orm.test.js
 *
 * Substitua o caminho do import abaixo pelo arquivo do seu código.
 */

import {
  Record,
  User,
  Post,
  Table,
  Database,
  buildDatabaseReport,
} from "./orm.js"; // ← ajuste o caminho conforme necessário

// ─── Utilitários de teste ────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    failed++;
  }
}

function assertThrows(description, fn, expectedMessage) {
  try {
    fn();
    console.error(`  ❌ ${description} (não lançou erro)`);
    failed++;
  } catch (e) {
    if (expectedMessage && e.message !== expectedMessage) {
      console.error(
        `  ❌ ${description} (mensagem errada: "${e.message}" — esperado: "${expectedMessage}")`
      );
      failed++;
    } else {
      console.log(`  ✅ ${description}`);
      passed++;
    }
  }
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(50 - title.length)}`);
}

// helpers
function makeUser(name = "Alan", email = "alan@email.com") {
  return new User(1, new Date(), name, email);
}
function makePost(author, content = "Hello world!") {
  return new Post(1, new Date(), author, content);
}

// ─── Record ───────────────────────────────────────────────────────────────────

section("Record — validações");

assertThrows(
  "id = 0 lança erro",
  () => new Record(0, new Date()),
  "id must be a positive integer"
);

assertThrows(
  "id negativo lança erro",
  () => new Record(-1, new Date()),
  "id must be a positive integer"
);

assertThrows(
  "id decimal lança erro",
  () => new Record(1.5, new Date()),
  "id must be a positive integer"
);

assertThrows(
  "id não-número lança erro",
  () => new Record("1", new Date()),
  "id must be a positive integer"
);

assertThrows(
  "createdAt não-Date lança erro",
  () => new Record(1, "2024-01-01"),
  "createdAt must be an instance of Date"
);

assertThrows(
  "createdAt null lança erro",
  () => new Record(1, null),
  "createdAt must be an instance of Date"
);

section("Record — toJSON");

{
  const now = new Date();
  const r = new Record(1, now);
  const json = r.toJSON();
  assert("toJSON retorna id", json.id === 1);
  assert("toJSON retorna createdAt", json.createdAt === now);
}

// ─── User ─────────────────────────────────────────────────────────────────────

section("User — validações");

assertThrows(
  "name vazio lança erro",
  () => new User(1, new Date(), "", "alan@email.com"),
  "name must be a non-empty string"
);

assertThrows(
  "name não-string lança erro",
  () => new User(1, new Date(), 42, "alan@email.com"),
  "name must be a non-empty string"
);

assertThrows(
  "email sem @ lança erro",
  () => new User(1, new Date(), "Alan", "alanemail.com"),
  "invalid email"
);

{
  assert("User é instância de Record", makeUser() instanceof Record);
}

section("User — toJSON");

{
  const now = new Date();
  const u = new User(1, now, "Alan", "alan@email.com");
  const json = u.toJSON();
  assert("toJSON inclui id", json.id === 1);
  assert("toJSON inclui createdAt", json.createdAt === now);
  assert("toJSON inclui name", json.name === "Alan");
  assert("toJSON inclui email", json.email === "alan@email.com");
}

// ─── Post ─────────────────────────────────────────────────────────────────────

section("Post — validações");

assertThrows(
  "author não-User lança erro",
  () => new Post(1, new Date(), { name: "fake" }, "Hello"),
  "author must be an instance of User"
);

assertThrows(
  "content vazio lança erro",
  () => new Post(1, new Date(), makeUser(), ""),
  "content must be a non-empty string"
);

assertThrows(
  "content não-string lança erro",
  () => new Post(1, new Date(), makeUser(), 123),
  "content must be a non-empty string"
);

{
  assert("Post é instância de Record", makePost(makeUser()) instanceof Record);
}

section("Post — toJSON");

{
  const now = new Date();
  const author = new User(1, now, "Alan", "alan@email.com");
  const post = new Post(2, now, author, "Hello world");
  const json = post.toJSON();
  assert("toJSON inclui id", json.id === 2);
  assert("toJSON inclui createdAt", json.createdAt === now);
  assert("toJSON inclui author como instância de User", json.author instanceof User);
  assert("toJSON inclui content", json.content === "Hello world");
}

// ─── Table ────────────────────────────────────────────────────────────────────

section("Table — insert");

{
  const users = new Table(User);
  const u = new User(999, new Date(), "Alan", "alan@email.com");
  const inserted = users.insert(u);
  assert("insert retorna o registro inserido", inserted === u);
  assert("insert atribui id começando em 1", inserted.id === 1);
}

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));
  const u2 = users.insert(new User(999, new Date(), "Bob", "bob@email.com"));
  assert("insert incrementa id corretamente", u2.id === 2);
}

{
  const users = new Table(User);
  assertThrows(
    "insert rejeita tipo errado",
    () => users.insert(new Post(1, new Date(), makeUser(), "Hello")),
    "record must be an instance of the table model"
  );
}

section("Table — findById");

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));
  users.insert(new User(999, new Date(), "Bob", "bob@email.com"));

  const found = users.findById(1);
  assert("findById retorna o registro correto", found.name === "Alan");
  assert("findById retorna null quando não existe", users.findById(99) === null);
}

section("Table — findAll");

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));
  users.insert(new User(999, new Date(), "Bob", "bob@email.com"));

  const all = users.findAll();
  assert("findAll retorna todos os registros", all.length === 2);

  // não deve devolver o array interno
  all.push({ fake: true });
  assert("findAll retorna cópia do array (não a referência interna)", users.count() === 2);
}

section("Table — where");

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@gmail.com"));
  users.insert(new User(999, new Date(), "Bob", "bob@email.com"));
  users.insert(new User(999, new Date(), "Alice", "alice@gmail.com"));

  const gmail = users.where(u => u.email.includes("@gmail.com"));
  assert("where filtra corretamente", gmail.length === 2);
  assert("where retorna array (encadeável com .length)", typeof gmail.length === "number");
}

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));

  const none = users.where(u => u.name === "Fantasma");
  assert("where retorna array vazio quando não há resultados", none.length === 0);
}

section("Table — update");

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));

  const updated = users.update(1, { name: "Alan Souza" });
  assert("update retorna o registro atualizado", updated !== null);
  assert("update altera o campo correto", updated.name === "Alan Souza");
  assert("update mantém campos não alterados", updated.email === "alan@email.com");
}

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));

  users.update(1, { id: 999 }); // tentar mudar o id
  const found = users.findById(1);
  assert("update não permite alterar o id", found !== null && found.id === 1);
}

{
  const users = new Table(User);
  assert("update retorna null quando id não existe", users.update(99, { name: "X" }) === null);
}

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));
  const updated = users.update(1, { name: "Alan Souza" });
  assert("registro atualizado continua sendo instância de User", updated instanceof User);
}

section("Table — delete");

{
  const users = new Table(User);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));

  assert("delete retorna true quando existe", users.delete(1) === true);
  assert("delete remove o registro", users.count() === 0);
  assert("delete retorna false quando não existe", users.delete(99) === false);
}

section("Table — count");

{
  const users = new Table(User);
  assert("count começa em 0", users.count() === 0);
  users.insert(new User(999, new Date(), "Alan", "alan@email.com"));
  users.insert(new User(999, new Date(), "Bob", "bob@email.com"));
  assert("count retorna número de registros", users.count() === 2);
  users.delete(1);
  assert("count diminui após delete", users.count() === 1);
}

// ─── Database ─────────────────────────────────────────────────────────────────

section("Database — createTable / table");

{
  const db = new Database();
  db.createTable("users", User);
  db.createTable("posts", Post);

  assert("createTable cria tabela acessível via db.tables", db.tables.users instanceof Table);
  assert("createTable cria tabela de posts", db.tables.posts instanceof Table);
  assert("table() retorna a tabela correta", db.table("users") instanceof Table);
  assert("table() retorna a mesma instância que db.tables", db.table("users") === db.tables.users);
}

section("Database — fluxo completo");

{
  const db = new Database();
  db.createTable("users", User);

  const u1 = db.table("users").insert(new User(999, new Date(), "Alan", "alan@email.com"));
  const u2 = db.table("users").insert(new User(999, new Date(), "Bob", "bob@gmail.com"));

  assert("insert via db.table funciona", db.table("users").count() === 2);
  assert("ids atribuídos corretamente", u1.id === 1 && u2.id === 2);

  const found = db.table("users").findById(2);
  assert("findById via db.table funciona", found.name === "Bob");

  const gmail = db.table("users").where(u => u.email.includes("@gmail.com"));
  assert("where encadeado via db.table funciona", gmail.length === 1);

  db.table("users").update(1, { name: "Alan Souza" });
  assert("update via db.table funciona", db.table("users").findById(1).name === "Alan Souza");

  db.table("users").delete(2);
  assert("delete via db.table funciona", db.table("users").count() === 1);
}

// ─── Database.fromObject ──────────────────────────────────────────────────────

section("Database.fromObject");

{
  const data = {
    users: [
      { name: "Alan", email: "alan@email.com" },
      { name: "Bob", email: "bob@email.com" },
    ],
  };

  const db = Database.fromObject(data);

  assert("fromObject retorna uma Database", db instanceof Database);
  assert("fromObject cria tabela users", db.tables.users instanceof Table);
  assert("fromObject insere todos os registros", db.table("users").count() === 2);
  assert(
    "fromObject cria instâncias reais de User",
    db.table("users").findById(1) instanceof User
  );
  assert(
    "fromObject preserva os dados corretamente",
    db.table("users").findById(1).name === "Alan"
  );
  assert("fromObject atribui ids sequenciais", db.table("users").findById(2).name === "Bob");
}

// ─── buildDatabaseReport ─────────────────────────────────────────────────────

section("buildDatabaseReport");

{
  const db = new Database();
  db.createTable("users", User);
  db.createTable("posts", Post);

  db.table("users").insert(new User(999, new Date(), "Alan", "alan@email.com"));
  db.table("users").insert(new User(999, new Date(), "Bob", "bob@email.com"));
  db.table("users").insert(new User(999, new Date(), "Alice", "alice@email.com"));

  const author = db.table("users").findById(1);
  db.table("posts").insert(new Post(999, new Date(), author, "Post 1"));
  db.table("posts").insert(new Post(999, new Date(), author, "Post 2"));
  db.table("posts").insert(new Post(999, new Date(), author, "Post 3"));
  db.table("posts").insert(new Post(999, new Date(), author, "Post 4"));
  db.table("posts").insert(new Post(999, new Date(), author, "Post 5"));

  const report = buildDatabaseReport(db);

  assert("report.users = 3", report.users === 3);
  assert("report.posts = 5", report.posts === 5);
}

{
  // tabelas dinâmicas — o report deve funcionar para qualquer nome de tabela
  const db = new Database();
  db.createTable("comments", User); // reutilizando User só pra testar
  db.table("comments").insert(new User(999, new Date(), "X", "x@x.com"));
  db.table("comments").insert(new User(999, new Date(), "Y", "y@y.com"));

  const report = buildDatabaseReport(db);
  assert("report funciona com tabelas de nome dinâmico", report.comments === 2);
}

// ─── Resultado final ──────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(52));
console.log(`  Resultado: ${passed} passou | ${failed} falhou`);
console.log("═".repeat(52));

if (failed > 0) process.exit(1);
