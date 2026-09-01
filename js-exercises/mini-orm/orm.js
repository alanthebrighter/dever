export class Record {
    constructor(id, createdAt){
        this.id = id;
        this.createdAt = createdAt;
    }

    get id(){
        return this._id;
    }

    set id(value){
        if(!(typeof value === "number") || value < 0){
            throw new Error("id must be a positive integer");
        }

        this._id = value;
    }

    get createdAt(){
        return this._createdAt;
    }

    set createdAt(value){
        if (!(value instanceof Date)){
            throw new Error("createdAt must be an instance of Date");
        }

        this._createdAt = value;
    }

    toJSON(){
        return `{id: ${this.id}, createdAt: ${this.createdAt}}`;
    }
}

export class User extends Record{
    constructor(name, email){
        super(id, this.createdAt);
        this.name = name;
        this.email = email;
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

    get email(){
        return this._email;
    }

    set email(value){
        if(!(typeof email === "string") || !value.includes("@")){
            throw new Error("invalid email");
        }

        this._email = value;
    }

    toJSON(){
        return `{id: ${this.id}, createdAt: ${this.createdAt}, name: ${this.name}, email: ${this.email}}`;

    }


}

export class Post extends Record{
    constructor(author, content){
        super(id, this.createdAt);
        this.author = author;
        this.content = content;
        }

    get author(){
        return this._author;
    }

    set author(value){
        if(!(value instanceof User)){
            throw new Error("author must be an instance of User");
        }

        this._author = value;
    }

    get content(){
        return this._content;
    }

    set content(value){
        if(!(typeof value === "string") || value.length < 1){
            throw new Error("content be a non-empty string");
        }

        this._content = value;
    }

    toJSON(){
        return `{id: ${this.id}, createdAt: ${this.createdAt}, author: ${this.author}, content: ${this.content}}`;
    }
}

export class Table{
    constructor(model){
        this.model = model;
        this.records = [];
        this.counter = 1;
    }

    get model(){
        return this._table;
    }

    set model(value){
        if(!(value instanceof User) || !(value instanceof Post)){
            throw new Error("table must be a instance of User or Post");
        }
        if(value instanceof User){
            this._model = new User();
        }
        if(value instanceof Post){
            this._model = new Post();
        }
    }

    insert(record){
        if(!(record instanceof this.model)){
            throw new Error("record must be an instance of the table model");
        }

        record.id = this.counter;
        this.records.push(record);
        this.counter++;
        return record;
    }

    findById(id){
        const record = this.records.find(record => record.id === id);

        if(record > 0){
            return record;
        } else {
            return null;
        }
    }

    findAll(){
        return this.records.slice();
    }

    where(predicate){
        return this.records.filter(predicate);
    }

    update(id, changes){

    }
}
