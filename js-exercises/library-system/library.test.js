/**
 * Sistema de Biblioteca — Testes
 *
 * Como usar:
 *   node library.test.js
 *
 * Substitua o caminho do import abaixo pelo arquivo do seu código.
 */

import {
  Book,
  Member,
  Loan,
  Library,
  buildLibraryReport,
} from "./library.js"; // ← ajuste o caminho conforme necessário

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
function makeBook(title = "The Hobbit", author = "Tolkien") {
  return new Book(title, author);
}
function makeMember(name = "Alan") {
  return new Member(name);
}

// ─── Book ─────────────────────────────────────────────────────────────────────

section("Book — validações");

assertThrows(
  "title vazio lança erro",
  () => new Book("", "Tolkien"),
  "title must be a non-empty string"
);

assertThrows(
  "title não-string lança erro",
  () => new Book(42, "Tolkien"),
  "title must be a non-empty string"
);

assertThrows(
  "author vazio lança erro",
  () => new Book("The Hobbit", ""),
  "author must be a non-empty string"
);

assertThrows(
  "author não-string lança erro",
  () => new Book("The Hobbit", 99),
  "author must be a non-empty string"
);

section("Book — estado inicial");

{
  const b = makeBook();
  assert("available começa como true", b.available === true);
}

section("Book — getSummary");

{
  const b = new Book("The Hobbit", "J.R.R. Tolkien");
  assert(
    'getSummary retorna "The Hobbit by J.R.R. Tolkien"',
    b.getSummary() === "The Hobbit by J.R.R. Tolkien"
  );
}

// ─── Member ───────────────────────────────────────────────────────────────────

section("Member — validações");

assertThrows(
  "name vazio lança erro",
  () => new Member(""),
  "name must be a non-empty string"
);

assertThrows(
  "name não-string lança erro",
  () => new Member(123),
  "name must be a non-empty string"
);

section("Member — estado inicial");

{
  const m = makeMember();
  assert("books começa como array vazio", Array.isArray(m.books) && m.books.length === 0);
}

section("Member — borrowBook");

assertThrows(
  "borrowBook rejeita não-Book",
  () => makeMember().borrowBook({ title: "Fake" }),
  "book must be an instance of Book"
);

assertThrows(
  "borrowBook rejeita livro indisponível",
  () => {
    const book = makeBook();
    book.available = false;
    makeMember().borrowBook(book);
  },
  "book is not available"
);

{
  const member = makeMember();
  const book = makeBook();
  member.borrowBook(book);
  assert("borrowBook adiciona livro em books", member.books.length === 1);
  assert("borrowBook altera available para false", book.available === false);
}

{
  // mesmo livro não pode ser emprestado duas vezes
  const m1 = makeMember();
  const m2 = makeMember("Bob");
  const book = makeBook();
  m1.borrowBook(book);
  assertThrows(
    "borrowBook lança erro se livro já emprestado por outro membro",
    () => m2.borrowBook(book),
    "book is not available"
  );
}

section("Member — returnBook");

{
  const member = makeMember();
  const book = makeBook();
  member.borrowBook(book);
  member.returnBook(book);
  assert("returnBook remove livro de books", member.books.length === 0);
  assert("returnBook restaura available para true", book.available === true);
}

{
  const member = makeMember();
  const book = makeBook();
  // devolver livro que não foi emprestado não deve lançar erro
  member.returnBook(book);
  assert("returnBook com livro não emprestado não faz nada", member.books.length === 0);
}

section("Member — getBorrowedBooks");

{
  const member = makeMember();
  const b1 = makeBook("The Hobbit");
  const b2 = makeBook("Dune", "Frank Herbert");
  member.borrowBook(b1);
  member.borrowBook(b2);
  const titles = member.getBorrowedBooks();
  assert("getBorrowedBooks retorna array de títulos", Array.isArray(titles));
  assert('getBorrowedBooks[0] = "The Hobbit"', titles[0] === "The Hobbit");
  assert('getBorrowedBooks[1] = "Dune"', titles[1] === "Dune");
}

// ─── Loan ─────────────────────────────────────────────────────────────────────

section("Loan — estado inicial");

{
  const book = makeBook();
  const member = makeMember();
  const now = new Date();
  const loan = new Loan(book, member, now);

  assert("book armazenado corretamente", loan.book === book);
  assert("member armazenado corretamente", loan.member === member);
  assert("borrowedAt é instância de Date", loan.borrowedAt instanceof Date);
  assert("returnedAt começa como null", loan.returnedAt === null);
}

section("Loan — isReturned");

{
  const loan = new Loan(makeBook(), makeMember(), new Date());
  assert("isReturned() = false antes da devolução", loan.isReturned() === false);
  loan.returnBook();
  assert("isReturned() = true após devolução", loan.isReturned() === true);
}

section("Loan — returnBook");

{
  const loan = new Loan(makeBook(), makeMember(), new Date());
  loan.returnBook();
  assert("returnBook define returnedAt como Date", loan.returnedAt instanceof Date);
}

section("Loan — getDaysBorrowed");

{
  // empréstimo já devolvido: 4 dias
  const borrowedAt = new Date();
  borrowedAt.setDate(borrowedAt.getDate() - 4);
  const loan = new Loan(makeBook(), makeMember(), borrowedAt);
  loan.returnBook();
  assert("getDaysBorrowed com devolução retorna dias corretos (4)", loan.getDaysBorrowed() === 4);
}

{
  // empréstimo ainda ativo: ~2 dias
  const borrowedAt = new Date();
  borrowedAt.setDate(borrowedAt.getDate() - 2);
  const loan = new Loan(makeBook(), makeMember(), borrowedAt);
  assert("getDaysBorrowed ativo usa data atual", loan.getDaysBorrowed() === 2);
}

{
  // empréstimo de hoje: 0 dias
  const loan = new Loan(makeBook(), makeMember(), new Date());
  assert("getDaysBorrowed no mesmo dia retorna 0", loan.getDaysBorrowed() === 0);
}

// ─── Library ──────────────────────────────────────────────────────────────────

section("Library — addBook / addMember");

{
  const lib = new Library();
  assertThrows("addBook rejeita não-Book", () => lib.addBook({ title: "Fake" }));
  lib.addBook(makeBook());
  assert("addBook adiciona livro", lib.books.length === 1);
}

{
  const lib = new Library();
  assertThrows("addMember rejeita não-Member", () => lib.addMember({ name: "Fake" }));
  lib.addMember(makeMember());
  assert("addMember adiciona membro", lib.members.length === 1);
}

section("Library — borrowBook");

{
  const lib = new Library();
  const book = makeBook();
  const member = makeMember();
  lib.addBook(book);
  lib.addMember(member);
  lib.borrowBook(member, book);

  assert("borrowBook cria um Loan", lib.loans.length === 1);
  assert("Loan criado tem o book correto", lib.loans[0].book === book);
  assert("Loan criado tem o member correto", lib.loans[0].member === member);
  assert("Loan.borrowedAt é Date", lib.loans[0].borrowedAt instanceof Date);
  assert("livro fica indisponível após empréstimo", book.available === false);
}

section("Library — returnBook");

{
  const lib = new Library();
  const book = makeBook();
  const member = makeMember();
  lib.addBook(book);
  lib.addMember(member);
  lib.borrowBook(member, book);
  lib.returnBook(member, book);

  assert("returnBook restaura disponibilidade do livro", book.available === true);
  assert("returnBook registra returnedAt no Loan", lib.loans[0].returnedAt instanceof Date);
  assert("Loan.isReturned() = true após devolução", lib.loans[0].isReturned() === true);
}

section("Library — getAvailableBooks");

{
  const lib = new Library();
  const b1 = makeBook("The Hobbit");
  const b2 = makeBook("Dune", "Frank Herbert");
  const member = makeMember();
  lib.addBook(b1);
  lib.addBook(b2);
  lib.addMember(member);
  lib.borrowBook(member, b1);

  const available = lib.getAvailableBooks();
  assert("getAvailableBooks retorna apenas livros disponíveis", available.length === 1);
  assert("getAvailableBooks retorna o livro correto", available[0] === b2);
}

section("Library — getActiveLoans");

{
  const lib = new Library();
  const b1 = makeBook("The Hobbit");
  const b2 = makeBook("Dune", "Frank Herbert");
  const member = makeMember();
  lib.addBook(b1);
  lib.addBook(b2);
  lib.addMember(member);
  lib.borrowBook(member, b1);
  lib.borrowBook(member, b2);
  lib.returnBook(member, b1);

  const active = lib.getActiveLoans();
  assert("getActiveLoans retorna apenas empréstimos ativos", active.length === 1);
  assert("getActiveLoans retorna o loan correto", active[0].book === b2);
}

section("Library — getTotalLoans");

{
  const lib = new Library();
  const b1 = makeBook("The Hobbit");
  const b2 = makeBook("Dune", "Frank Herbert");
  const member = makeMember();
  lib.addBook(b1);
  lib.addBook(b2);
  lib.addMember(member);
  lib.borrowBook(member, b1);
  lib.borrowBook(member, b2);
  lib.returnBook(member, b1);

  assert("getTotalLoans conta todos os empréstimos, inclusive devolvidos", lib.getTotalLoans() === 2);
}

section("Library — getMemberLoans");

{
  const lib = new Library();
  const book1 = makeBook("The Hobbit");
  const book2 = makeBook("Dune", "Frank Herbert");
  const alan = makeMember("Alan");
  const bob = makeMember("Bob");
  lib.addBook(book1);
  lib.addBook(book2);
  lib.addMember(alan);
  lib.addMember(bob);
  lib.borrowBook(alan, book1);
  lib.borrowBook(bob, book2);

  const alanLoans = lib.getMemberLoans(alan);
  assert("getMemberLoans retorna apenas os loans do membro", alanLoans.length === 1);
  assert("getMemberLoans retorna o loan correto", alanLoans[0].member === alan);
}

section("Library — getMostBorrowedBook");

{
  const lib = new Library();
  const hobbit = makeBook("The Hobbit");
  const dune = makeBook("Dune", "Frank Herbert");
  const alan = makeMember("Alan");
  const bob = makeMember("Bob");
  lib.addBook(hobbit);
  lib.addBook(dune);
  lib.addMember(alan);
  lib.addMember(bob);

  // The Hobbit emprestado 2 vezes, Dune 1 vez
  lib.borrowBook(alan, hobbit);
  lib.returnBook(alan, hobbit);
  lib.borrowBook(bob, hobbit);
  lib.returnBook(bob, hobbit);
  lib.borrowBook(alan, dune);

  assert("getMostBorrowedBook retorna o livro com mais empréstimos", lib.getMostBorrowedBook() === hobbit);
}

// ─── Library.fromObject ───────────────────────────────────────────────────────

section("Library.fromObject");

{
  const data = {
    books: [
      { title: "The Hobbit", author: "J.R.R. Tolkien" },
      { title: "Dune", author: "Frank Herbert" },
    ],
    members: [
      { name: "Alan" },
      { name: "Bob" },
    ],
  };

  const lib = Library.fromObject(data);

  assert("fromObject retorna uma Library", lib instanceof Library);
  assert("fromObject cria Books corretamente", lib.books.length === 2);
  assert("fromObject cria Members corretamente", lib.members.length === 2);
  assert("fromObject cria instâncias de Book", lib.books[0] instanceof Book);
  assert("fromObject cria instâncias de Member", lib.members[0] instanceof Member);
  assert("fromObject preserva título do livro", lib.books[0].title === "The Hobbit");
  assert("fromObject preserva nome do membro", lib.members[0].name === "Alan");
}

// ─── buildLibraryReport ───────────────────────────────────────────────────────

section("buildLibraryReport");

{
  const lib = new Library();
  const b1 = makeBook("The Hobbit");
  const b2 = makeBook("Dune", "Frank Herbert");
  const alan = makeMember("Alan");
  const bob = makeMember("Bob");
  lib.addBook(b1);
  lib.addBook(b2);
  lib.addMember(alan);
  lib.addMember(bob);

  lib.borrowBook(alan, b1); // ativo
  lib.borrowBook(bob, b2);  // ativo
  lib.returnBook(bob, b2);  // devolvido → b2 disponível de novo

  // b1 emprestado (indisponível), b2 disponível → availableBooks = 1
  // totalLoans = 2, activeLoans = 1

  const report = buildLibraryReport(lib);

  assert("report.totalBooks = 2", report.totalBooks === 2);
  assert("report.availableBooks = 1", report.availableBooks === 1);
  assert("report.totalMembers = 2", report.totalMembers === 2);
  assert("report.totalLoans = 2", report.totalLoans === 2);
  assert("report.activeLoans = 1", report.activeLoans === 1);
}

// ─── Resultado final ──────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(52));
console.log(`  Resultado: ${passed} passou | ${failed} falhou`);
console.log("═".repeat(52));

if (failed > 0) process.exit(1);