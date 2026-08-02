/**
 * Arena RPG — Testes
 *
 * Como usar:
 *   node arena.test.js
 *
 * Substitua o caminho do import abaixo pelo arquivo do seu código.
 */

import {
  Character,
  Warrior,
  Mage,
  Archer,
  Party,
  buildBattleReport,
} from "./arena.js"; // ← ajuste o caminho conforme necessário

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

// ─── Character ───────────────────────────────────────────────────────────────

section("Character — validações");

assertThrows(
  "name vazio lança erro",
  () => new Character("", 100, 20),
  "name must be a non-empty string"
);

assertThrows(
  "name não-string lança erro",
  () => new Character(123, 100, 20),
  "name must be a non-empty string"
);

assertThrows(
  "maxHealth = 0 lança erro",
  () => new Character("Hero", 100, 0, 20),
  "maxHealth must be greater than 0"
);

assertThrows(
  "maxHealth negativo lança erro",
  () => new Character("Hero", 100, -10, 20),
  "maxHealth must be greater than 0"
);

assertThrows(
  "attackPower = 0 lança erro",
  () => new Character("Hero", 100, 100, 0),
  "attackPower must be greater than 0"
);

assertThrows(
  "attackPower negativo lança erro",
  () => new Character("Hero", 100, 100, -5),
  "attackPower must be greater than 0"
);

section("Character — health clamp");

{
  const c = new Character("Hero", 500, 100, 10);
  assert("health > maxHealth é clamped para maxHealth", c.health === 100);
}

{
  const c = new Character("Hero", -50, 100, 10);
  assert("health < 0 é clamped para 0", c.health === 0);
}

{
  const c = new Character("Hero", 80, 100, 10);
  assert("health válido é armazenado corretamente", c.health === 80);
}

section("Character — métodos");

{
  const c = new Character("Hero", 100, 100, 10);
  assert("isAlive() = true quando health > 0", c.isAlive() === true);
  c.takeDamage(100);
  assert("isAlive() = false quando health = 0", c.isAlive() === false);
}

{
  const c = new Character("Hero", 80, 100, 10);
  c.takeDamage(200);
  assert("takeDamage não deixa health negativo", c.health === 0);
}

{
  const c = new Character("Hero", 50, 100, 10);
  c.heal(20);
  assert("heal soma vida", c.health === 70);
  c.heal(200);
  assert("heal não passa de maxHealth", c.health === 100);
}

{
  const attacker = new Character("Hero", 100, 100, 15);
  const enemy = new Character("Goblin", 100, 100, 5);
  attacker.attack(enemy);
  assert("attack() chama takeDamage no inimigo com attackPower", enemy.health === 85);
}

{
  const c = new Character("Arthur", 80, 100, 10);
  assert('getStatus() retorna "Arthur (80/100 HP)"', c.getStatus() === "Arthur (80/100 HP)");
}

// ─── Warrior ─────────────────────────────────────────────────────────────────

section("Warrior — ataque e status");

{
  const warrior = new Warrior("Arthur", 100, 100, 20);
  const enemy = new Character("Goblin", 100, 100, 5);
  warrior.attack(enemy);
  assert("Warrior causa attackPower + 5 de dano", enemy.health === 75);
}

{
  const warrior = new Warrior("Arthur", 80, 100, 20);
  assert(
    'Warrior.getStatus() retorna "⚔ Warrior Arthur (80/100 HP)"',
    warrior.getStatus() === "⚔ Warrior Arthur (80/100 HP)"
  );
}

{
  assert("Warrior é instância de Character", new Warrior("X", 100, 100, 10) instanceof Character);
}

// ─── Mage ─────────────────────────────────────────────────────────────────────

section("Mage — validação de mana");

assertThrows(
  "mana negativa lança erro",
  () => new Mage("Merlin", 80, 80, 15, -1),
  "mana must be 0 or greater"
);

section("Mage — ataque com mana");

{
  const mage = new Mage("Merlin", 80, 80, 15, 60);
  const enemy = new Character("Goblin", 100, 100, 5);
  mage.attack(enemy);
  assert("Mage com mana causa attackPower * 2", enemy.health === 70);
  assert("Mage perde 20 de mana ao atacar", mage.mana === 40);
}

{
  const mage = new Mage("Merlin", 80, 80, 15, 10);
  const enemy = new Character("Goblin", 100, 100, 5);
  mage.attack(enemy);
  assert("Mage sem mana suficiente causa dano normal", enemy.health === 85);
  assert("Mage sem mana não perde mana", mage.mana === 10);
}

section("Mage — regenerateMana");

{
  const mage = new Mage("Merlin", 80, 80, 15, 95);
  mage.regenerateMana();
  assert("regenerateMana não passa de 100", mage.mana === 100);
}

{
  const mage = new Mage("Merlin", 80, 80, 15, 50);
  mage.regenerateMana();
  assert("regenerateMana adiciona 10 de mana", mage.mana === 60);
}

section("Mage — getStatus");

{
  const mage = new Mage("Merlin", 50, 80, 15, 60);
  assert(
    'Mage.getStatus() retorna "✨ Mage Merlin (50/80 HP) Mana:60"',
    mage.getStatus() === "✨ Mage Merlin (50/80 HP) Mana:60"
  );
}

{
  assert("Mage é instância de Character", new Mage("X", 80, 80, 10, 0) instanceof Character);
}

// ─── Archer ───────────────────────────────────────────────────────────────────

section("Archer — validação de arrows");

assertThrows(
  "arrows negativas lança erro",
  () => new Archer("Legolas", 100, 100, 15, -1),
  "arrows must be 0 or greater"
);

section("Archer — ataque com flechas");

{
  const archer = new Archer("Legolas", 100, 100, 15, 5);
  const enemy = new Character("Goblin", 100, 100, 5);
  archer.attack(enemy);
  assert("Archer com flechas causa attackPower + 10", enemy.health === 75);
  assert("Archer gasta uma flecha ao atacar", archer.arrows === 4);
}

{
  const archer = new Archer("Legolas", 100, 100, 15, 0);
  const enemy = new Character("Goblin", 100, 100, 5);
  archer.attack(enemy);
  assert("Archer sem flechas causa dano normal", enemy.health === 85);
}

section("Archer — refillArrows");

{
  const archer = new Archer("Legolas", 100, 100, 15, 3);
  archer.refillArrows(5);
  assert("refillArrows adiciona flechas", archer.arrows === 8);
}

{
  const archer = new Archer("Legolas", 100, 100, 15, 3);
  archer.refillArrows(-5);
  assert("refillArrows ignora valores negativos", archer.arrows === 3);
}

{
  assert("Archer é instância de Character", new Archer("X", 100, 100, 10, 0) instanceof Character);
}

// ─── Party ────────────────────────────────────────────────────────────────────

section("Party — addMember");

{
  const party = new Party([]);
  assertThrows(
    "addMember rejeita não-Character",
    () => party.addMember({ name: "Fake" }),
    undefined // só verifica que lançou
  );
}

{
  const warrior = new Warrior("Arthur", 100, 100, 20);
  const party = new Party([warrior]);
  assert("addMember aceita Character válido", true); // não lançou acima
}

section("Party — getAliveMembers");

{
  const w = new Warrior("Arthur", 100, 100, 20);
  const m = new Mage("Merlin", 0, 80, 15, 60);
  const party = new Party([w, m]);
  assert("getAliveMembers retorna apenas vivos", party.getAliveMembers().length === 1);
  assert("getAliveMembers retorna o personagem correto", party.getAliveMembers()[0] === w);
}

section("Party — getStatuses");

{
  const w = new Warrior("Arthur", 90, 100, 20);
  const m = new Mage("Merlin", 60, 80, 15, 70);
  const party = new Party([w, m]);
  const statuses = party.getStatuses();
  assert("getStatuses retorna array de strings", Array.isArray(statuses));
  assert(
    "getStatuses[0] = '⚔ Warrior Arthur (90/100 HP)'",
    statuses[0] === "⚔ Warrior Arthur (90/100 HP)"
  );
  assert(
    "getStatuses[1] = '✨ Mage Merlin (60/80 HP) Mana:70'",
    statuses[1] === "✨ Mage Merlin (60/80 HP) Mana:70"
  );
}

section("Party — getTotalHealth");

{
  const w = new Warrior("Arthur", 90, 100, 20);
  const m = new Mage("Merlin", 60, 80, 15, 70);
  const party = new Party([w, m]);
  assert("getTotalHealth soma a vida de todos", party.getTotalHealth() === 150);
}

section("Party.fromObjects");

{
  const data = [
    { type: "warrior", name: "Arthur", health: 100, maxHealth: 100, attackPower: 20 },
    { type: "mage", name: "Merlin", health: 80, maxHealth: 80, attackPower: 15, mana: 60 },
    { type: "archer", name: "Legolas", health: 90, maxHealth: 100, attackPower: 15, arrows: 10 },
  ];

  const party = Party.fromObjects(data);

  assert("fromObjects retorna uma Party", party instanceof Party);
  assert("fromObjects cria Warrior corretamente", party.getAliveMembers()[0] instanceof Warrior);
  assert("fromObjects cria Mage corretamente", party.getAliveMembers()[1] instanceof Mage);
  assert("fromObjects cria Archer corretamente", party.getAliveMembers()[2] instanceof Archer);
  assert("fromObjects mantém os membros corretos", party.getAliveMembers().length === 3);
}

// ─── buildBattleReport ────────────────────────────────────────────────────────

section("buildBattleReport");

{
  const w = new Warrior("Arthur", 90, 100, 20);
  const m = new Mage("Merlin", 0, 80, 15, 60);   // morto
  const a = new Archer("Legolas", 60, 100, 15, 5);
  const party = new Party([w, m, a]);

  const report = buildBattleReport(party);

  assert("report.totalMembers = 3", report.totalMembers === 3);
  assert("report.aliveMembers = 2", report.aliveMembers === 2);
  assert("report.totalHealth = 150", report.totalHealth === 150);
  assert("report.statuses é um array", Array.isArray(report.statuses));
  assert("report.statuses tem 3 entradas", report.statuses.length === 3);
}

// ─── Resultado final ──────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(52));
console.log(`  Resultado: ${passed} passou | ${failed} falhou`);
console.log("═".repeat(52));

if (failed > 0) process.exit(1);
