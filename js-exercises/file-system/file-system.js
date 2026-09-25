export class File {
  constructor(name, size, extesion){
    this.name = name;
    this.size = size;
    this.extesion = extesion;
  }

  get name(){
    return this._name;
  }

  set name(value){
    if(!(value === "string") || !(value.lenght > 0)){
      throw new Error("name must be a non-empty string");
    }

    this._name = value;
  }

  get size(){
    return this._size;
  }

  set size(value){
    if(!(value > 0)){
      throw new Error("size must be 0 or greater");
    }

    this._size = value;
  }

  get extesion(){
    return this._extesion;
  }

  set extension(value){
    if(!(value === "string") || !(value.lenght > 0)){
      throw new Error("extension must be a non-empty string");
    }

    this._extesion = value;
  }

  getInfo(){
    return `${this.name}.${this.extesion} - ${this.size}`;
  }
}

export class Directory{
  constructor(name, children){
    this.name = name;
    this.children = [];
  }



}
