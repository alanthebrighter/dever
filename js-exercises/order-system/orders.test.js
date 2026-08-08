/**
 * Sistema de Pedidos — Testes
 *
 * Como usar:
 *   node orders.test.js
 *
 * Substitua o caminho do import abaixo pelo arquivo do seu código.
 */

import {
  Product,
  OrderItem,
  Customer,
  Order,
  buildInvoice,
} from "./orders.js"; // ← ajuste o caminho conforme necessário

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

// ─── Product ─────────────────────────────────────────────────────────────────

section("Product — validações");

assertThrows(
  "name vazio lança erro",
  () => new Product("", 120),
  "name must be a non-empty string"
);

assertThrows(
  "name não-string lança erro",
  () => new Product(99, 120),
  "name must be a non-empty string"
);

assertThrows(
  "price = 0 lança erro",
  () => new Product("Mouse", 0),
  "price must be greater than 0"
);

assertThrows(
  "price negativo lança erro",
  () => new Product("Mouse", -10),
  "price must be greater than 0"
);

{
  const p = new Product("Mouse Gamer", 120);
  assert("name armazenado corretamente", p.name === "Mouse Gamer");
  assert("price armazenado corretamente", p.price === 120);
}

section("Product — getSummary");

{
  const p = new Product("Mouse Gamer", 120);
  assert(
    'getSummary retorna "Mouse Gamer - R$120"',
    p.getSummary() === "Mouse Gamer - R$120"
  );
}

// ─── OrderItem ────────────────────────────────────────────────────────────────

section("OrderItem — validações");

assertThrows(
  "product não-Product lança erro",
  () => new OrderItem({ name: "Fake", price: 10 }, 2),
  "product must be an instance of Product"
);

assertThrows(
  "quantity = 0 lança erro",
  () => new OrderItem(new Product("Mouse", 120), 0),
  "quantity must be greater than 0"
);

assertThrows(
  "quantity negativa lança erro",
  () => new OrderItem(new Product("Mouse", 120), -1),
  "quantity must be greater than 0"
);

assertThrows(
  "quantity decimal lança erro",
  () => new OrderItem(new Product("Mouse", 120), 1.5),
  "quantity must be greater than 0"
);

{
  const item = new OrderItem(new Product("Mouse", 120), 2);
  assert("product armazenado corretamente", item.product instanceof Product);
  assert("quantity armazenado corretamente", item.quantity === 2);
}

section("OrderItem — getSubtotal");

{
  const item = new OrderItem(new Product("Mouse", 50), 3);
  assert("getSubtotal retorna price * quantity (50 * 3 = 150)", item.getSubtotal() === 150);
}

{
  const item = new OrderItem(new Product("Teclado", 190), 1);
  assert("getSubtotal com quantity 1 retorna o preço", item.getSubtotal() === 190);
}

section("OrderItem — getSummary");

{
  const item = new OrderItem(new Product("Mouse Gamer", 120), 2);
  assert(
    'getSummary retorna "Mouse Gamer x2 = R$240"',
    item.getSummary() === "Mouse Gamer x2 = R$240"
  );
}

// ─── Customer ─────────────────────────────────────────────────────────────────

section("Customer — validações");

assertThrows(
  "name vazio lança erro",
  () => new Customer("", "alan@email.com"),
  "name must be a non-empty string"
);

assertThrows(
  "name não-string lança erro",
  () => new Customer(42, "alan@email.com"),
  "name must be a non-empty string"
);

assertThrows(
  "email sem @ lança erro",
  () => new Customer("Alan", "alanemail.com"),
  "invalid email"
);

{
  const c = new Customer("Alan", "alan@email.com");
  assert("name armazenado corretamente", c.name === "Alan");
  assert("email armazenado corretamente", c.email === "alan@email.com");
}

section("Customer — getSummary");

{
  const c = new Customer("Alan", "alan@email.com");
  assert(
    'getSummary retorna "Alan <alan@email.com>"',
    c.getSummary() === "Alan <alan@email.com>"
  );
}

// ─── Order ────────────────────────────────────────────────────────────────────

section("Order — validações");

assertThrows(
  "customer não-Customer lança erro",
  () => new Order({ name: "Alan" }, []),
  "customer must be an instance of Customer"
);

section("Order — addItem");

assertThrows(
  "addItem rejeita não-OrderItem",
  () => {
    const order = new Order(new Customer("Alan", "alan@email.com"), []);
    order.addItem({ product: new Product("Mouse", 120), quantity: 1 });
  },
  "item must be an instance of OrderItem"
);

{
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  order.addItem(new OrderItem(new Product("Mouse", 120), 2));
  assert("addItem adiciona item corretamente", order.getItems().length === 1);
}

section("Order — removeItem");

{
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  order.addItem(new OrderItem(new Product("Mouse", 120), 2));
  order.addItem(new OrderItem(new Product("Teclado", 190), 1));
  order.removeItem("Mouse");
  assert("removeItem remove o item correto", order.getItems().length === 1);
  assert("removeItem mantém o item restante", order.getItems()[0] === "Teclado x1 = R$190");
}

{
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  order.addItem(new OrderItem(new Product("Mouse", 120), 2));
  order.removeItem("Inexistente");
  assert("removeItem com nome inexistente não altera os itens", order.getItems().length === 1);
}

section("Order — getItems");

{
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  order.addItem(new OrderItem(new Product("Mouse", 120), 2));
  order.addItem(new OrderItem(new Product("Teclado", 190), 1));
  const items = order.getItems();
  assert("getItems retorna array", Array.isArray(items));
  assert('getItems[0] = "Mouse x2 = R$240"', items[0] === "Mouse x2 = R$240");
  assert('getItems[1] = "Teclado x1 = R$190"', items[1] === "Teclado x1 = R$190");
}

section("Order — getTotal");

{
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  order.addItem(new OrderItem(new Product("Mouse", 120), 2));   // 240
  order.addItem(new OrderItem(new Product("Teclado", 190), 1)); // 190
  assert("getTotal soma todos os subtotais (240 + 190 = 430)", order.getTotal() === 430);
}

{
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  assert("getTotal com zero itens retorna 0", order.getTotal() === 0);
}

section("Order — getMostExpensiveItem");

{
  const mouse = new OrderItem(new Product("Mouse", 120), 2);    // 240
  const teclado = new OrderItem(new Product("Teclado", 190), 1); // 190
  const monitor = new OrderItem(new Product("Monitor", 100), 3); // 300
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  order.addItem(mouse);
  order.addItem(teclado);
  order.addItem(monitor);
  assert(
    "getMostExpensiveItem retorna o item com maior subtotal",
    order.getMostExpensiveItem() === monitor
  );
}

section("Order — getSummary");

{
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  order.addItem(new OrderItem(new Product("Mouse", 120), 2));
  order.addItem(new OrderItem(new Product("Teclado", 190), 1));
  assert(
    'getSummary retorna "Order for Alan - Total: R$430"',
    order.getSummary() === "Order for Alan - Total: R$430"
  );
}

// ─── Order.fromObject ─────────────────────────────────────────────────────────

section("Order.fromObject");

{
  const data = {
    customer: { name: "Alan", email: "alan@email.com" },
    items: [
      { product: { name: "Mouse", price: 120 }, quantity: 2 },
      { product: { name: "Keyboard", price: 190 }, quantity: 1 },
    ],
  };

  const order = Order.fromObject(data);

  assert("fromObject retorna uma Order", order instanceof Order);
  assert("fromObject cria Customer corretamente", order.customer instanceof Customer);
  assert("fromObject cria OrderItems corretamente", order.getItems().length === 2);

  // verifica que os itens têm Products reais dentro
  const firstItem = order.getMostExpensiveItem();
  assert("fromObject cria Products dentro dos OrderItems", firstItem.product instanceof Product);

  assert("fromObject preserva o total correto", order.getTotal() === 430);
}

// ─── buildInvoice ─────────────────────────────────────────────────────────────

section("buildInvoice");

{
  const order = new Order(new Customer("Alan", "alan@email.com"), []);
  order.addItem(new OrderItem(new Product("Mouse", 120), 2));
  order.addItem(new OrderItem(new Product("Keyboard", 190), 1));

  const invoice = buildInvoice(order);

  assert('invoice.customer = "Alan"', invoice.customer === "Alan");
  assert("invoice.total = 430", invoice.total === 430);
  assert("invoice.items é um array", Array.isArray(invoice.items));
  assert("invoice.items tem 2 entradas", invoice.items.length === 2);
  assert(
    'invoice.items[0] = "Mouse x2 = R$240"',
    invoice.items[0] === "Mouse x2 = R$240"
  );
  assert(
    'invoice.items[1] = "Keyboard x1 = R$190"',
    invoice.items[1] === "Keyboard x1 = R$190"
  );
}

// ─── Resultado final ──────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(52));
console.log(`  Resultado: ${passed} passou | ${failed} falhou`);
console.log("═".repeat(52));

if (failed > 0) process.exit(1);