import type { TILEntry } from "../index"

const _oop_encapsulation_vs_abstraction: TILEntry = {
    id: "oop-encapsulation-vs-abstraction",
    title: "Encapsulation hides data; abstraction hides complexity: they solve different problems",
    date: "2026-09-04",
    category: "OOP",
    published: true,
    body: "Encapsulation bundles data and the methods that operate on it into a single unit and restricts direct access: the `private` keyword enforces it. Abstraction exposes only what the caller needs to know, hiding the implementation behind an interface or base class. A bank account class demonstrates both: encapsulation means the balance field is private; abstraction means the `transfer()` method hides the ledger logic. You can have encapsulation without abstraction but the two together produce the cleanest APIs.",
    detail: [
      {
        type: "code",
        lang: "typescript",
        code: `// Encapsulation: balance is private: no direct access
// Abstraction: transfer() hides the ledger logic from the caller
class BankAccount {
  private balance: number

  constructor(initial: number) {
    this.balance = initial
  }

  // I expose only the operation, not the mechanism
  transfer(amount: number, to: BankAccount): void {
    if (amount > this.balance) throw new Error("Insufficient funds")
    this.balance -= amount
    to.balance += amount
  }

  getBalance(): number {
    return this.balance
  }
}`,
        caption: "Encapsulation (private field) and abstraction (transfer() method) working together",
      },
      {
        type: "note",
        text: "You can have encapsulation without abstraction: a class with private fields and public getters exposes every detail of its state, just through methods. Abstraction adds the idea of hiding the 'how' entirely, not just protecting the data.",
      },
    ],
    tags: ["OOP", "software design", "TypeScript"],
  }

export default _oop_encapsulation_vs_abstraction
