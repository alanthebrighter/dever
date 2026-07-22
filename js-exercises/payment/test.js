import {
    Payment,
    CreditCardPayment,
    PixPayment,
    Checkout,
    buildReport,
} from "./payment.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(
            `${message}\nExpected: ${expected}\nActual: ${actual}`
        );
    }
}

function assertDeepEqual(actual, expected, message) {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);

    if (a !== b) {
        throw new Error(
            `${message}\nExpected: ${b}\nActual: ${a}`
        );
    }
}

function assertThrows(fn, expectedMessage) {
    try {
        fn();
        throw new Error("Expected function to throw.");
    } catch (err) {
        if (err.message === "Expected function to throw.") {
            throw err;
        }

        assertEqual(
            err.message,
            expectedMessage,
            "Incorrect error message."
        );
    }
}

console.log("Running tests...\n");

//
// Payment
//

const payment = new Payment(100);

assertEqual(
    payment.calculateTotal(),
    100,
    "Payment.calculateTotal() failed."
);

assertEqual(
    payment.getReceipt(),
    "Payment: R$100",
    "Payment.getReceipt() failed."
);

assertThrows(
    () => new Payment(0),
    "amount must be greater than 0"
);

assertThrows(
    () => new Payment(-5),
    "amount must be greater than 0"
);

//
// CreditCardPayment
//

const card = new CreditCardPayment(100, 5);

assertEqual(
    card.calculateTotal(),
    105,
    "CreditCardPayment.calculateTotal() failed."
);

assertEqual(
    card.getReceipt(),
    "Credit Card: R$105",
    "CreditCardPayment.getReceipt() failed."
);

assertThrows(
    () => new CreditCardPayment(100, -1),
    "feePercent must be 0 or greater"
);

//
// PixPayment
//

const pix = new PixPayment(100, 10);

assertEqual(
    pix.calculateTotal(),
    90,
    "PixPayment.calculateTotal() failed."
);

assertEqual(
    pix.getReceipt(),
    "PIX: R$90",
    "PixPayment.getReceipt() failed."
);

assertThrows(
    () => new PixPayment(100, -10),
    "discountPercent must be 0 or greater"
);

//
// Checkout
//

const checkout = new Checkout([
    payment,
    card,
    pix,
]);

assertDeepEqual(
    checkout.getReceipts(),
    [
        "Payment: R$100",
        "Credit Card: R$105",
        "PIX: R$90",
    ],
    "Checkout.getReceipts() failed."
);

assertEqual(
    checkout.getGrandTotal(),
    295,
    "Checkout.getGrandTotal() failed."
);

checkout.addPayment(
    new Payment(50)
);

assertEqual(
    checkout.getGrandTotal(),
    345,
    "Checkout.addPayment() failed."
);

assertThrows(
    () => checkout.addPayment({}),
    "payment must be an instance of Payment"
);

//
// fromObjects
//

const generated = Checkout.fromObjects([
    {
        amount: 50,
    },
    {
        type: "credit",
        amount: 100,
        feePercent: 10,
    },
    {
        type: "pix",
        amount: 100,
        discountPercent: 20,
    },
]);

assert(
    generated.payments[0] instanceof Payment,
    "fromObjects() should create Payment."
);

assert(
    generated.payments[1] instanceof CreditCardPayment,
    "fromObjects() should create CreditCardPayment."
);

assert(
    generated.payments[2] instanceof PixPayment,
    "fromObjects() should create PixPayment."
);

assertEqual(
    generated.getGrandTotal(),
    240,
    "fromObjects() created incorrect objects."
);

//
// buildReport
//

const report = buildReport(generated);

assertDeepEqual(
    report,
    {
        totalPayments: 3,
        grandTotal: 240,
        receipts: [
            "Payment: R$50",
            "Credit Card: R$110",
            "PIX: R$80",
        ],
    },
    "buildReport() failed."
);

//
// Original array should not mutate
//

const original = [
    new Payment(10),
];

const copy = [...original];

new Checkout(original);

assertDeepEqual(
    original,
    copy,
    "Constructor mutated original array."
);

console.log("\n✅ All tests passed!");