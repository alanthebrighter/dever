export class Character {
    constructor(name, health, maxHealth, attackPower){
        this.name = name;
        this.maxHealth = maxHealth;
        this.health = health;
        this.attackPower = attackPower;
    }

    get name(){
        return this._name;
    }
    set name(value){
        if(value.length < 1 || typeof value != "string"){
            throw new Error("name must be a non-empty string");
        }
        this._name = value;
    }

    get health(){
        return this._health;
    }

    set health(value){
        
        if(value > this.maxHealth){
            return this._health = this.maxHealth;
        } 

        if(value < 0){
            return this._health = 0;
        }
        
        this._health = value;
    }

    get maxHealth(){
        return this._maxHealth;
    }

    set maxHealth(value){
        if(typeof value != "number" || value < 1){
            throw new Error("maxHealth must be greater than 0");
        }
        this._maxHealth = value;
    }

    get attackPower(){
        return this._attackPower;
    }

    set attackPower(value){
        if(typeof value != "number" || value < 1){
            throw new Error("attackPower must be greater than 0");
        }
        this._attackPower = value;
    }

    attack(npc){
        npc.takeDamage(this.attackPower);
    }

    takeDamage(amount){
        if(amount < 0){
            throw new Error("Damage must be greater than 0")
        }
        else if((this.health - amount) > -1){
            return this.health -= amount;
        } else if((this.health - amount) < 0){
            return this._health = 0;
        } 
        else {
            throw new Error("Attack error!")
        }
    }

    heal(amount){
        if((this.health + amount) > this.maxHealth){
            return this.health = this.maxHealth;
        }
        if((this.health + amount) <= this.maxHealth){
            return this.health += amount;
        }
        

    }

    isAlive(){
        if(this.health > 0){
            return true;
        } else {
            return false;
        }
    }

    getStatus(){
        return `${this.name} (${this.health}/${this.maxHealth} HP)`;
    }
}

export class Warrior extends Character{
    constructor(name, health, maxHealth, attackPower){
        super(name, health, maxHealth, attackPower);
    }

    getStatus(){
        return `⚔ Warrior ${this.name} (${this.health}/${this.maxHealth} HP)`;
    }

    attack(npc){
        return npc.takeDamage(this.attackPower + 5);
    }
}

export class Mage extends Character{
    constructor(name, health, maxHealth, attackPower, mana){
        super(name, health, maxHealth, attackPower);
        this.mana = mana;
    }
    
    get mana(){
        return this._mana;
    }

    set mana(value){
        if(typeof value === "number" && value < 0){
            throw new Error("mana must be 0 or greater");
        }
        this._mana = value;
    }

    attack(npc){
        if(this.mana >= 20){
            this.mana -= 20;
            return npc.takeDamage(this.attackPower + 5);
        }
        return npc.takeDamage(this.attackPower);

    }

    regenerateMana(){
        if((this.mana + 10) <= 100){
            return this.mana += 10;
        } else {
            return this.mana = 100;
        }
    }

    getStatus(){
        return `✨ Mage ${this.name} (${this.health}/${this.maxHealth} HP) Mana:${this.mana}`;
    }
}

export class Archer extends Character{
    constructor(name, health, maxHealth, attackPower, arrows){
        super(name, health, maxHealth, attackPower);
        this.arrows = arrows;
    }

    get arrows(){
        return this._arrows;
    }

    set arrows(value){
        if(typeof value != "number" || value < 0){
            throw new Error("arrows must be 0 or greater");
        }
        this._arrows = value;
    }

    attack(npc){
        if(this.arrows > 0 ){
            this.arrows -= 1;
            return npc.takeDamage(this.attackPower + 10);
        } else {
            return npc.takeDamage(this.attackPower);
        }
    }

    refillArrows(amount){
        if(typeof amount == "number" && amount > -1){
            return this.arrows += amount;
        }
    }
}

export class Party{
    constructor(characters){
        this.characters = characters;
    }

    addMember(character){
        if(!(character instanceof Character)){
            throw new Error("character must be an instance of Character");
        }
        this.characters.push(character);
    }

    getAliveMembers(){
        return this.characters.filter(char => char.isAlive());
    }

    getStatuses(){
        return this.characters.map(char => char.getStatus());
    }

    getTotalHealth(){
        return this.characters.reduce((acc, charHealth) => {
            return acc + charHealth.health;
        }, 0)
    }

    static fromObjects(data){
        return new Party(data.map(item => {
            switch(item.type){
                case "warrior":
                    return new Warrior(item.name, item.health, item.maxHealth, item.attackPower);
                case "mage":
                    return new Mage(item.name, item.health, item.maxHealth, item.attackPower, item.mana);
                case "archer":
                    return new Archer(item.name, item.health, item.maxHealth, item.attackPower, item.arrows)
                default:
                    throw new Error("Party creation error!");
                }

        }))
    }
}

export function buildBattleReport(party){
    return {
    totalMembers: party.getStatuses().length,
    aliveMembers: party.getAliveMembers().length,
    totalHealth: party.getTotalHealth(),
    statuses: party.getStatuses()
    }
}
