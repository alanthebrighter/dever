import { Book, Library, buildAvailableTitles } from "./library.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertThrows(fn, expectedMessage) {
    try {
        fn();
        throw new Error("Expected an error.");
    } catch (err) {
        if (err.message === "Expected an error.") {
            throw err;
        }

        assert(
            err.message === expectedMessage,
            `Expected "${expectedMessage}", got "${err.message}"`
        );
    }
}

console.log("Running tests...\n");

// ----------------------------
// Book
// ----------------------------

const book = new Book(
    "Clean Code",
    "Robert C. Martin",
    true
);

assert(
    book.getLabel() ===
        "Clean Code by Robert C. Martin (Available)",
    "Book label incorrect."
);

book.available = false;

assert(
    book.getLabel() ===
        "Clean Code by Robert C. Martin (Borrowed)",
    "Book status incorrect."
);

// ----------------------------
// setters
// ----------------------------

assertThrows(
    () => new Book("", "Someone", true),
    "title must be a non-empty string"
);

assertThrows(
    () => new Book("Book", "", true),
    "author must be a non-empty string"
);

assertThrows(
    () => new Book("Book", "Someone", "yes"),
    "available must be a boolean"
);

// ----------------------------
// Library
// ----------------------------

const library = new Library([book]);

library.addBook(
    new Book("Refactoring", "Martin Fowler", true)
);

assert(
    library.borrow("Refactoring") === true,
    "Borrow should succeed."
);

assert(
    library.borrow("Refactoring") === false,
    "Borrowing twice should fail."
);

assert(
    library.borrow("Unknown") === false,
    "Borrowing unknown book should fail."
);

// ----------------------------
// Static
// ----------------------------

const lib2 = Library.fromObjects([
    {
        title: "DDD",
        author: "Eric Evans",
        available: true
    }
]);

assert(
    lib2.listBooks()[0] ===
        "DDD by Eric Evans (Available)",
    "Static method failed."
);

// ----------------------------
// buildAvailableTitles
// ----------------------------

const titles = buildAvailableTitles(lib2);

assert(
    titles.length === 1,
    "Available titles incorrect."
);

assert(
    titles[0] === "DDD",
    "Title incorrect."
);

console.log("\n✅ All tests passed!");