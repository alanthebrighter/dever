export class Product {
    constructor(name, price){
        this.name = name;
        this.price = price;
    }

    get name(){
        return this._name;
    }

    set name(value){
        if(!(typeof value === "string") || value.length < 1){
            throw new Error("name must be a non-empty string");
        }
        this._name = value;
    }

    get price(){
        return this._price;
    }

    set price(value){
        if(!(typeof value === "number") || value <= 0){
            throw new Error("price must be greater than 0");
        }
        this._price = value;
    }

    getSummary(){
        return `${this.name} - R$${this.price}`;
    }
}

export class OrderItem {
    constructor(product, quantity){
        this.product = product;
        this.quantity = quantity;
    }

    get product(){
        return this._product;
    }

    set product(value){
        if(!(value instanceof Product)){
            throw new Error("product must be an instance of Product");
        }
        this._product = value;
    }

    get quantity(){
        return this._quantity;
    }

    set quantity(value){
        if(/*!(typeof value === "number")*/!Number.isInteger(value) || value <= 0){
            throw new Error("quantity must be greater than 0");
        }
        this._quantity = value;
    }

    getSubtotal(){
       return this.product.price * this.quantity; 
    }

    getSummary(){
        return `${this._product.name} x${this.quantity} = R$${this.getSubtotal()}`;
    }
}

export class Customer{
    constructor(name, email){
        this.name = name;
        this.email = email;
    }

    get name(){
        return this._name;
    }

    set name(value){
        if(!(typeof value === "string") || value.length <= 0){
            throw new Error("name must be a non-empty string");
        }
        this._name = value;
    }

    get email(){
        return this._email;
    }

    set email(value){
        if(!(value.includes("@"))){
            throw new Error("invalid email");
        }
        this._email = value;
    }

    getSummary(){
        return `${this.name} <${this.email}>`;
    }

}

export class Order{
    constructor(customer, items){
        this.customer = customer;
        this.items = items;
    }

    get customer(){
        return this._customer;
    }

    set customer(value){
        if(!(value instanceof Customer)){
            throw new Error("customer must be an instance of Customer");
        }
        this._customer = value;
    }

    get items(){
        return this._items;
    }

    set items(value){
        let isOrderItem = true;
        for(const item of value){
            if(!(item instanceof OrderItem)){
                isOrderItem = false;
                break
            }
        }

        if(!isOrderItem){
            throw new Error("each item in items must be an instance of OrderItem");
        }
        this._items = value;
    }

    addItem(item){
        if(!(item instanceof OrderItem)){
            throw new Error("item must be an instance of OrderItem");
        }
        this.items.push(item);
    }

    removeItem(item){
        const index = this.items.findIndex(element => element.product.name === item);
        if (index > -1) {
            return this.items.splice(index, 1)[0];
        }
    }

    getItems(){
        return this.items.map(item => {
            return item.getSummary();
        })
    }

    getTotal(){
        return this.items.reduce((acc, item) => acc + item.getSubtotal(), 0);
    }

    getMostExpensiveItem(){
        let item = this.items.reduce((most, item) => item.getSubtotal() > most.getSubtotal() ? item : most);
        return item;
    }

    getSummary(){
        return `Order for ${this.customer.name} - Total: R$${this.getTotal()}`;
    }

    static fromObject(data){
        const tempCustomer = new Customer(data.customer.name, data.customer.email);
        const tmp = data.items.map(item => {
            let tmpProd = new Product(item.product.name, item.product.price);
            let tmpOrderItem = new OrderItem(tmpProd, item.quantity);
            return tmpOrderItem;
        })
        let tmpOrder = new Order(tempCustomer, tmp);
        return tmpOrder;
    }

}

export function buildInvoice(order){
    
    return {
    customer:order.customer.name,
    total:order.getTotal(),
    items: order.items.map(item => {
        return item.getSummary();
    })
    }    
}