export class Book{
    constructor(title, author){
        this.title =  title;
        this.author = author;
        this.available = true;
    }

    get title(){
        return this._title;
    }
    set title(value){
        if(!(typeof value === "string") || !(value.length > 0)){
            throw new Error("title must be a non-empty string");
        }
        this._title = value;
    }
    
    get author(){
        return this._author;
    }

    set author(value){
        if(!(typeof value === "string") || !(value.length > 0)){
            throw new Error("author must be a non-empty string");
        }
        this._author = value;
    }

    get available(){
        return this._available;
    }

    set available(value){
        if(typeof value === "boolean"){
            this._available = value;
        }
    }

    getSummary(){
        return `${this.title} by ${this.author}`;
    }

}

export class Member {
    constructor(name, books){
        this.name = name;
        this.books = [];
    }

    get name(){
        return this._name;
    }

    set name(value){
        if(!(typeof value === "string") || !(value.length > 0)){
            throw new Error("name must be a non-empty string");
        }
        this._name = value;
    }

    borrowBook(book){
        if(!(book instanceof Book)){
            throw new Error("book must be an instance of Book");
        } 
        if (!book.available){
            throw new Error("book is not available");
        }
        this.books.push(book);
        book.available = false;
    }

    returnBook(book){
        if(!(book instanceof Book)){
            throw new Error("book must be an instance of Book");
        } else if (!book.available){
            book.available = true;
        }
        this.books = this.books.filter(item => item.name !== book.name);
    }

    getBorrowedBooks(){
        return this.books.map(item => {
            //if(!item.available){
            //    return item.title;
            //}
            return item.title;
        })

    }


}

export class Loan {
    constructor(book, member, borrowedAt){
        this.book = book;
        this.member = member;
        this.borrowedAt = borrowedAt;
        this.returnedAt = null;
    }

    get book(){
        return this._book;
    }

    set book(value){
        if(!(value instanceof Book)){
            throw new Error("book must be an instance of Book");
        }
        this._book = value;
    }

    get member(){
        return this._member;
    }

    set member(value){
        if(!(value instanceof Member)){
            throw new Error("member must be an instance of Member");
        }
        this._member = value;
    }

    get borrowedAt(){
        return this._borrowedAt;
    }

    set borrowedAt(value){
        if(!(value instanceof Date)){
            throw new Error("borrowedAt must be an instance of Date");
        }
        this._borrowedAt = value;
    }

    get returnedAt(){
        return this._returnedAt;
    }

    set returnedAt(value){
        this._returnedAt = value;
    }

    returnBook(){
        this.returnedAt = new Date();
    }

    isReturned(){
        return this.returnedAt === null ? false : true
    }

    getDaysBorrowed(){
        if(this.isReturned()){
            return Math.round((this.returnedAt - this.borrowedAt) / (1000 * 60 * 60 * 24));
        }
        return Math.round((new Date() - this.borrowedAt) / (1000 * 60 * 60 * 24));
    }

}

export class Library{
    constructor(members){
        this.books = [];
        this.members = [];
        this.loans = [];
    }

    addBook(book){
        if(!(book instanceof Book)){
            throw new Error("book must be an instance of Book");
        }
        this.books.push(book);
    }

    addMember(member){
        if(!(member instanceof Member)){
            throw new Error("member must be an instance of Member");
        }
        this.members.push(member);
    }

    borrowBook(member, book){
        member.borrowBook(book);
        let tmpLoan = new Loan(book, member, new Date());
        this.loans.push(tmpLoan);
    }

    returnBook(member, book){
        member.returnBook(book);
        for (const item of this.loans){
            if((item.book === book) && (item.member === member)){
                item.returnBook();
            }
        }
    }

    getAvailableBooks(){
        return this.books.filter(item => item.available);
    }

    getActiveLoans(){
        return this.loans.filter(item => item.returnedAt === null);
    }

    getTotalLoans(){
        return this.loans.length;
    }

    getMemberLoans(member){
        return this.loans.filter(item => item.member === member);
    }

    getMostBorrowedBook(){
        const totalFreq = new Map();
        for(const item of this.loans){
            totalFreq.set(item.book.title, (totalFreq.get(item.book.title) || 0) + 1);
        }
        let titleGt = null;
        let valueGt = -Infinity;

    for (const [title, value] of totalFreq) {
        if (value > valueGt) {
            valueGt = value;
            titleGt = title;
        }
    }

    for (const item of this.loans){
        if(item.book.title === titleGt){
            return item.book;
        }
    }   
}

    static fromObject(data){
        const tmpLibrary = new Library()
        
        for (const item of data.books){
            tmpLibrary.addBook(new Book(item.title, item.author));
        }

        for (const item of data.members){
            tmpLibrary.addMember(new Member(item.name));
        }

        return tmpLibrary;
    }

}

export function buildLibraryReport(library){
    return {
    totalBooks: library.books.length,
    availableBooks: library.getAvailableBooks().length,
    totalMembers: library.members.length,
    totalLoans: library.getTotalLoans(),
    activeLoans: library.getActiveLoans().length,
    }
}