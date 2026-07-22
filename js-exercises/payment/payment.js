export class Payment {
    constructor(amount) {
        this.amount = amount;
    }

    get amount (){
        return this._amount;
    }

    set amount (value) {
        if (!(typeof value === "number" && value > 0)){
            throw new Error("amount must be greater than 0");
        }
        this._amount = value;
        
    }

    calculateTotal() {
        return this.amount;
    }

    getReceipt() {
        return `Payment: R$${this.amount}`
    }
}

export class CreditCardPayment extends Payment{
    constructor(amount, feePercent){
        super(amount);
        this.feePercent = feePercent;
    }

    get feePercent(){
        return this._feePercent;
    }

    set feePercent(value){
        if (!(typeof value === "number" && value >= 0)){
            throw new Error("feePercent must be 0 or greater");
        }
        this._feePercent = value;
    }

    calculateTotal(){
        return Math.round(this.amount * (1 + this.feePercent/100));
    }

    getReceipt(){
        return `Credit Card: R$${this.calculateTotal()}`
    }
}

export class PixPayment extends Payment{
    constructor(amount, discountPercent){
        super(amount);
        this.discountPercent = discountPercent;
    }

    get discountPercent(){
        return this._discountPercent;
    }

    set discountPercent(value){
        if(!(typeof value === "number" && value >= 0)){
            throw new Error("discountPercent must be 0 or greater");

        }
        this._discountPercent = value;
    }

    calculateTotal(){
        return Math.round(this.amount - (this.amount * (this.discountPercent/100)));
    }

    getReceipt(){
        return `PIX: R$${this.calculateTotal()}`
    }


}

export class Checkout {
    constructor(payments) {
        this.payments = [...payments];
    }

    addPayment(payment){
        if (!(payment instanceof Payment)){
            throw new Error("payment must be an instance of Payment");
        }
        this.payments.push(payment);
    }

    getReceipts(){
        return this.payments.map(item => {
                return item.getReceipt()
        })
    }

    getGrandTotal(){ // reviewed
        let temp = this.payments.reduce((acc, payment) => {
            return acc + payment.calculateTotal();
        }, 0)
        return temp;
    }

    static fromObjects(data){
        return new Checkout(data.map(item => {

            switch (item.type){
                case "credit":
                    return new CreditCardPayment(item.amount, item.feePercent);
                case "pix":
                    return new PixPayment(item.amount, item.discountPercent);
                default:
                    return new Payment(item.amount);
            }
        }))
    }

}

export function buildReport(checkout){
    
    const temp = {
        totalPayments: checkout.payments.length,
        grandTotal: checkout.getGrandTotal(),
        receipts: checkout.getReceipts()
    }
    return temp;
}