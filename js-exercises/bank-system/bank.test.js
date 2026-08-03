/**
 * Sistema Bancário — Testes
 *
 * Como usar:
 *   node bank.test.js
 *
 * Substitua o caminho do import abaixo pelo arquivo do seu código.
 */

import {
  BankAccount,
  SavingsAccount,
  CheckingAccount,
  Bank,
  buildBankReport,
} from "./bank.js"; // ← ajuste o caminho conforme necessário

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

// ─── BankAccount — validações ────────────────────────────────────────────────

section("BankAccount — validações");

assertThrows(
  "owner vazio lança erro",
  () => new BankAccount("", 100),
  "owner must be a non-empty string"
);

assertThrows(
  "owner não-string lança erro",
  () => new BankAccount(123, 100),
  "owner must be a non-empty string"
);

assertThrows(
  "balance negativo lança erro",
  () => new BankAccount("Alan", -1),
  "balance cannot be negative"
);

{
  const acc = new BankAccount("Alan", 0);
  assert("balance = 0 é válido", acc.balance === 0);
}

// ─── BankAccount — deposit ───────────────────────────────────────────────────

section("BankAccount — deposit");

assertThrows(
  "deposit de 0 lança erro",
  () => new BankAccount("Alan", 100).deposit(0),
  "deposit amount must be greater than 0"
);

assertThrows(
  "deposit negativo lança erro",
  () => new BankAccount("Alan", 100).deposit(-50),
  "deposit amount must be greater than 0"
);

{
  const acc = new BankAccount("Alan", 100);
  acc.deposit(50);
  assert("deposit soma ao saldo", acc.balance === 150);
}

// ─── BankAccount — withdraw ──────────────────────────────────────────────────

section("BankAccount — withdraw");

assertThrows(
  "withdraw de 0 lança erro",
  () => new BankAccount("Alan", 100).withdraw(0),
  "withdraw amount must be greater than 0"
);

assertThrows(
  "withdraw negativo lança erro",
  () => new BankAccount("Alan", 100).withdraw(-10),
  "withdraw amount must be greater than 0"
);

assertThrows(
  "withdraw sem saldo suficiente lança erro",
  () => new BankAccount("Alan", 50).withdraw(100),
  "insufficient funds"
);

{
  const acc = new BankAccount("Alan", 100);
  acc.withdraw(40);
  assert("withdraw reduz o saldo", acc.balance === 60);
}

// ─── BankAccount — transfer ──────────────────────────────────────────────────

section("BankAccount — transfer");

assertThrows(
  "transfer para não-BankAccount lança erro",
  () => new BankAccount("Alan", 100).transfer({ balance: 0 }, 50),
  "target must be a BankAccount"
);

assertThrows(
  "transfer sem saldo suficiente lança erro",
  () => {
    const a = new BankAccount("Alan", 30);
    const b = new BankAccount("Bob", 0);
    a.transfer(b, 100);
  },
  "insufficient funds"
);

{
  const a = new BankAccount("Alan", 200);
  const b = new BankAccount("Bob", 50);
  a.transfer(b, 80);
  assert("transfer debita da conta de origem", a.balance === 120);
  assert("transfer credita na conta de destino", b.balance === 130);
}

{
  // consistência: se o saque falhar, o destino não pode receber nada
  const a = new BankAccount("Alan", 10);
  const b = new BankAccount("Bob", 50);
  try { a.transfer(b, 100); } catch (_) {}
  assert("transfer falha sem alterar a conta de destino", b.balance === 50);
}

// ─── BankAccount — getSummary ────────────────────────────────────────────────

section("BankAccount — getSummary");

{
  const acc = new BankAccount("Alan", 350);
  assert(
    'getSummary retorna "Alan - Balance: R$350"',
    acc.getSummary() === "Alan - Balance: R$350"
  );
}

// ─── SavingsAccount — validações ─────────────────────────────────────────────

section("SavingsAccount — validações");

assertThrows(
  "interestRate negativa lança erro",
  () => new SavingsAccount("Alan", 1000, -1),
  "interestRate must be 0 or greater"
);

{
  const acc = new SavingsAccount("Alan", 1000, 0);
  assert("interestRate = 0 é válido", acc.interestRate === 0);
}

{
  assert(
    "SavingsAccount é instância de BankAccount",
    new SavingsAccount("Alan", 500, 10) instanceof BankAccount
  );
}

section("SavingsAccount — applyInterest");

{
  const acc = new SavingsAccount("Alan", 1000, 10);
  acc.applyInterest();
  assert("applyInterest aplica juros corretamente (1000 + 10% = 1100)", acc.balance === 1100);
}

{
  const acc = new SavingsAccount("Alan", 1000, 0);
  acc.applyInterest();
  assert("applyInterest com 0% não altera saldo", acc.balance === 1000);
}

section("SavingsAccount — getSummary");

{
  const acc = new SavingsAccount("Alan", 1100, 10);
  assert(
    'getSummary retorna "Savings - Alan - Balance: R$1100"',
    acc.getSummary() === "Savings - Alan - Balance: R$1100"
  );
}

// ─── CheckingAccount — validações ────────────────────────────────────────────

section("CheckingAccount — validações");

assertThrows(
  "transactionFee negativa lança erro",
  () => new CheckingAccount("Alan", 100, -1)
);

{
  const acc = new CheckingAccount("Alan", 100, 0);
  assert("transactionFee = 0 é válido", acc.transactionFee === 0);
}

{
  assert(
    "CheckingAccount é instância de BankAccount",
    new CheckingAccount("Alan", 100, 2) instanceof BankAccount
  );
}

section("CheckingAccount — deposit com taxa");

{
  const acc = new CheckingAccount("Alan", 100, 2);
  acc.deposit(50);
  assert("deposit cobra taxa (100 + 50 - 2 = 148)", acc.balance === 148);
}

section("CheckingAccount — withdraw com taxa");

{
  const acc = new CheckingAccount("Alan", 100, 2);
  acc.withdraw(20);
  assert("withdraw cobra taxa (100 - 20 - 2 = 78)", acc.balance === 78);
}

{
  // saldo insuficiente deve considerar valor + taxa
  assertThrows(
    "withdraw lança erro quando saldo < amount + fee",
    () => new CheckingAccount("Alan", 21, 2).withdraw(20),
    "insufficient funds"
  );
}

section("CheckingAccount — getSummary");

{
  const acc = new CheckingAccount("Alan", 78, 2);
  assert(
    'getSummary retorna "Checking - Alan - Balance: R$78"',
    acc.getSummary() === "Checking - Alan - Balance: R$78"
  );
}

// ─── Bank ────────────────────────────────────────────────────────────────────

section("Bank — addAccount");

{
  const bank = new Bank([]);
  assertThrows(
    "addAccount rejeita não-BankAccount",
    () => bank.addAccount({ owner: "Fake" })
  );
}

{
  const bank = new Bank([]);
  const acc = new BankAccount("Alan", 100);
  bank.addAccount(acc);
  assert("addAccount aceita BankAccount válido", bank.getAccounts().length === 1);
}

section("Bank — getAccounts");

{
  const bank = new Bank([
    new BankAccount("Alan", 350),
    new SavingsAccount("Alice", 1100, 10),
  ]);
  const accounts = bank.getAccounts();
  assert("getAccounts retorna array de strings", Array.isArray(accounts));
  assert("getAccounts[0] = 'Alan - Balance: R$350'", accounts[0] === "Alan - Balance: R$350");
  assert(
    "getAccounts[1] = 'Savings - Alice - Balance: R$1100'",
    accounts[1] === "Savings - Alice - Balance: R$1100"
  );
}

section("Bank — getTotalMoney");

{
  const bank = new Bank([
    new BankAccount("Alan", 100),
    new BankAccount("Bob", 200),
    new SavingsAccount("Alice", 500, 5),
  ]);
  assert("getTotalMoney soma todos os saldos", bank.getTotalMoney() === 800);
}

section("Bank — findAccount");

{
  const bank = new Bank([
    new BankAccount("Alan", 100),
    new BankAccount("Bob", 200),
  ]);
  assert("findAccount retorna a conta correta", bank.findAccount("Bob").owner === "Bob");
  assert("findAccount retorna null quando não existe", bank.findAccount("Zé") === null);
}

section("Bank — richestAccount");

{
  const alan = new BankAccount("Alan", 100);
  const bob = new BankAccount("Bob", 500);
  const alice = new SavingsAccount("Alice", 300, 5);
  const bank = new Bank([alan, bob, alice]);
  assert("richestAccount retorna a conta com maior saldo", bank.richestAccount() === bob);
}

// ─── Bank.fromObjects ─────────────────────────────────────────────────────────

section("Bank.fromObjects");

{
  const data = [
    { owner: "Alan", balance: 100 },
    { type: "checking", owner: "Bob", balance: 200, transactionFee: 2 },
    { type: "savings", owner: "Alice", balance: 500, interestRate: 5 },
  ];

  const bank = Bank.fromObjects(data);

  assert("fromObjects retorna um Bank", bank instanceof Bank);

  const accounts = bank.findAccount("Alan");
  assert("fromObjects sem type cria BankAccount", accounts instanceof BankAccount);

  const bob = bank.findAccount("Bob");
  assert("fromObjects type='checking' cria CheckingAccount", bob instanceof CheckingAccount);

  const alice = bank.findAccount("Alice");
  assert("fromObjects type='savings' cria SavingsAccount", alice instanceof SavingsAccount);

  assert("fromObjects preserva todos os membros", bank.getTotalMoney() === 800);
}

// ─── buildBankReport ─────────────────────────────────────────────────────────

section("buildBankReport");

{
  const bank = new Bank([
    new BankAccount("Alan", 100),
    new CheckingAccount("Bob", 200, 2),
    new SavingsAccount("Alice", 500, 5),
  ]);

  const report = buildBankReport(bank);

  assert("report.totalAccounts = 3", report.totalAccounts === 3);
  assert("report.totalMoney = 800", report.totalMoney === 800);
  assert("report.richest = 'Alice'", report.richest === "Alice");
  assert("report.accounts é um array", Array.isArray(report.accounts));
  assert("report.accounts tem 3 entradas", report.accounts.length === 3);
}

// ─── Resultado final ──────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(52));
console.log(`  Resultado: ${passed} passou | ${failed} falhou`);
console.log("═".repeat(52));

if (failed > 0) process.exit(1);