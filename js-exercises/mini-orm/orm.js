export class Record {
    constructor(id, createdAt){
        this.id = id;
        this.createdAt = createdAt;
    }

    get id(){
        return this._id;
    }

    set id(value){
        if(!Number.isInteger(value) || value < 1 ){
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
        const record = {id: this.id, createdAt: this.createdAt};
        return record;
    }
}

export class User extends Record{
    constructor(id, createdAt, name, email){
        super(id, createdAt);
        this.name = name;
        this.email = email;
    }

    get name(){
        return this._name;
    }

    set name(value){
        if(!(typeof value === "string") || value.length < 1 ){
            throw new Error("name must be a non-empty string");
        }

        this._name = value;
    }

    get email(){
        return this._email;
    }

    set email(value){
        if(!(typeof value === "string") || !value.includes("@")){
            throw new Error("invalid email");
        }

        this._email = value;
    }

    toJSON(){
        const user = {id: this.id, createdAt: this.createdAt, name: this.name, email: this.email};
        return user;

    }


}

export class Post extends Record{
    constructor(id, createdAt, author, content){
        super(id, createdAt);
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
            throw new Error("content must be a non-empty string");
        }

        this._content = value;
    }

    toJSON(){
        return {id: this.id, createdAt: this.createdAt, author: this.author, content: this.content};
    }
}

export class Table{
    constructor(model){
        this.model = model;
        this.records = [];
        this.counter = 1;
    }

    get model(){
        return this._model;
    }

    set model(value){
        this._model = value;
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
        if(record){
            return record;
        } else {
            return null;
        }

    }

    findAll(){
        return [...this.records];
    }

    where(predicate){
        return this.records.filter(predicate);
    }

    update(id, changes){
        const item = this.records.filter((element) => element.id === id)[0];
        if(!item){
            return null
        }
        for (const key in changes){

            if(key === "id") continue;

            if(key in item){
                item[key] = changes[key];
            }
        }
        return item;
    }

    delete(id){
        const index  = this.records.findIndex((element) => element.id === id);

        if(index === -1){
            return false;
        }
        this.records.splice(index, 1)
        return true;

    }

    count(){
        return this.records.length;
    }
}


export class Database {
    constructor(tables){
        this.tables = {};
    }

    createTable(name, model){
        this.tables[name] = new Table(model);
    }

    table(name){
        return this.tables[name];
    }

    static fromObject(data){
        const db = new Database();

        const models = {
            users: User,
            posts: Post,
        }

        for (const tableName in data){
            const ModelClass = models[tableName];

            db.createTable(tableName, ModelClass);
            const currentTable = db.table(tableName);

            for (const rawItem of data[tableName]){
                let instance;
                if(ModelClass === User){
                    instance = new User(1, new Date(), rawItem.name, rawItem.email);
                } else if (ModelClass === Post){
                    const user = db.table("users").where(usr => usr.name === rawItem.author)[0];
                    instance = new Post(1, new Date(), user, rawItem.content);
                }

                if (instance){
                    currentTable.insert(instance);
                }
            }
        }
        return db;
    }
}


export function buildDatabaseReport(db){
    const report = {};

    for (const tableName in db.tables){
        report[tableName] = db.tables[tableName].count();
    }

    return report;
}
