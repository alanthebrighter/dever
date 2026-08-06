export class BankAccount {
    constructor(owner, balance){
        this.owner = owner;
        this.balance = balance;
    }

    get owner(){
        return this._owner;
    }

    set owner(value){
        if(!(typeof value === "string") || value.length < 1){
            throw new Error("owner must be a non-empty string");
        }
        this._owner = value;
    }

    get balance(){
        return this._balance;
    }

    set balance(value){
        if(!(typeof value === "number") || value < 0){
            throw new Error("balance cannot be negative");
        }
        this._balance = value;
    }
    
    deposit(amount){
        if(!(amount > 0)){
            throw new Error("deposit amount must be greater than 0");
        }
        return this.balance += amount;
    }

    withdraw(amount){
        if(!(amount > 0)){
            throw new Error("withdraw amount must be greater than 0");
        } else if ((this.balance - amount) < 0){
            throw new Error("insufficient funds");
        }
        return this.balance -= amount;
    }

    transfer(targetAccount, amount){
        if(!(targetAccount instanceof BankAccount)){
            throw new Error("target must be a BankAccount");
        }
        this.withdraw(amount);
        targetAccount.deposit(amount);
    }

    getSummary(){
        return `${this.owner} - Balance: R$${this.balance}`;
    }
}

export class SavingsAccount extends BankAccount{
    constructor(owner, balance, interestRate){
        super(owner, balance);
        this.interestRate = interestRate;
    }

    get interestRate(){
        return this._interestRate;
    }

    set interestRate(value){
        if(!(value >= 0)){
            throw new Error("interestRate must be 0 or greater");
        }
        this._interestRate = value;
    }

    applyInterest(){
        return this.balance += (this.interestRate/100) * this.balance;
    }

    getSummary(){
        return `Savings - ${this.owner} - Balance: R$${this.balance}`;
    }
}

export class CheckingAccount extends BankAccount{
    constructor(owner, balance, transactionFee){
        super(owner, balance);
        this.transactionFee = transactionFee;
    }

    get transactionFee(){
        return this._transactionFee;
    }

    set transactionFee(value){
        if(!(value >= 0)){
            throw new Error("transactionFee must be 0 or greater");
        }
        this._transactionFee = value;
    }

    deposit(amount){
        if(!(amount > 0)){
            throw new Error("deposit amount must be greater than 0");
        }
        if (amount <= this.transactionFee) {
            throw new Error("deposit amount must be greater than transaction fee");
        }
        return this.balance += (amount - this.transactionFee);
    }

    withdraw(amount){
        if(!(amount > 0)){
            throw new Error("withdraw amount must be greater than 0");
        } else if ((this.balance - (amount + this.transactionFee)) < 1){
            throw new Error("insufficient funds");
        }
        return this.balance -= (amount + this.transactionFee);
    }

    getSummary(){
        return `Checking - ${this.owner} - Balance: R$${this.balance}`;
    }
    
}

export class Bank{
    constructor(accounts){
        this.accounts = accounts;
    }

    addAccount(account){
        //if(!(this.accounts instanceof BankAccount)){
        //    throw new Error("accounts must be an instance of BankAccount");
        //}
        if(account instanceof BankAccount){
            this.accounts.push(account);
        } else{
            throw new Error("target must be a BankAccount");
        }
    }

    getAccounts(){
        return this.accounts.map(item => {
            return item.getSummary();
        })
    }

    getTotalMoney(){
            return this.accounts.reduce((acc, item) => {
                return acc += item.balance;
            }, 0)
    }

    findAccount(owner){
        return this.accounts.find(item => item.owner === owner) ?? null;
    }

    richestAccount(){
        return this.accounts.reduce((best, account) => {
            return account.balance > best.balance ? account : best;
        });
    }

    static fromObjects(data){
        return new Bank(data.map(item => {
            switch(item.type){
                case "checking":
                    return new CheckingAccount(item.owner, item.balance, item.transactionFee);
                case "savings":
                    return new SavingsAccount(item.owner, item.balance, item.interestRate);
                default:
                    return new BankAccount(item.owner, item.balance);
            }
        }));
    }

}

export function buildBankReport(bank){
    return {
    totalAccounts: bank.getAccounts().length,
    totalMoney: bank.getTotalMoney(),
    richest:bank.richestAccount().owner,
    accounts: bank.getAccounts()
}
}
