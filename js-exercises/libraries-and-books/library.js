export class Book {
	constructor(title, author, available){
		this.title = title;
		this.author = author;
		this.available = available;
	}

	get title(){
		return this._title;
	}

	set title(value){
		if (!value) {
			throw new Error("title must be a non-empty string");
		}
		this._title = value;
	}

	get author(){
		return this._author;
	}

	set author(value){
		if (!value){
			throw new Error("author must be a non-empty string");
		}
		this._author = value;
	}

	get available(){
		return this._available;
	}

	set available(value){
		const values = [false, true];
		if (!values.includes(value)){
			throw new Error("available must be a boolean")
		}
		this._available = value;
	}

	getLabel(){
		if (this.available){
			return `${this.title} by ${this.author} (Available)`;
		}
		return `${this.title} by ${this.author} (Borrowed)`;
	}
}

export class Library{
	constructor(books){
		this.books = books;
	}

	get books(){
		
		return this._books;
	}

	set books(value){
		if (!Array.isArray(value)){
			throw new Error("books must be an array");
		}
		this._books = value;
	}

	addBook(book) {
		if (!(book instanceof Book)){
			throw new Error("book must be an instance of Book");
			
		}
		return this.books = [...this.books, book];

	}

	borrow(title){
		const foundBook = this.books.filter(item => item.title === title);
		if (foundBook.length < 1){
			return false;
		}
		if (!foundBook[0].available){
			return false;
		}

		foundBook[0].available = false;
		return true;
	}

	listBooks(){
		return this.books.map(item => {
			return item.getLabel();
		})
	}

	static fromObjects(data){
		return new Library(data.map(item => {return new Book(item.title, item.author, item.available);}));
	}
}

export function buildAvailableTitles(library){
	const onlyAvailable = library.books.filter(item => item.available === true);
	return onlyAvailable.map(item => {
		return item.title;
	});
}

