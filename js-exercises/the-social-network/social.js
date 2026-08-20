export class User {
    constructor(username, email, following, followers){
        this.username = username;
        this.email = email;
        this.following = [];
        this.followers = [];
    }

    get username(){
        return this._username;
    }

    set username(value){
        if(!(typeof value === "string") || !(value.length > 0)){
            throw new Error("username must be a non-empty string");
        }

        this._username = value;
    }

    get email(){
        return this._email;
    }

    set email(value){
        if(!(typeof value === "string") || !(value.includes("@"))){
            throw new Error("invalid email");
        }

        this._email = value;
    }

    follow(user){
        if(!(user instanceof User)){
            throw new Error("user must be an instance of User");
        }
        if(this.following.includes(user)){
            return;
        }
        this.following.push(user);
        user.followers.push(this);
    }

    unfollow(user){
        const indexThis = user.followers.indexOf(this);
        const indexUser = this.following.indexOf(user);
        if(indexThis !== -1 && indexUser !== -1){
            this.following.splice(indexUser, 1);
            user.followers.splice(indexThis, 1);
        }
    }

    getFollowing(){
        return this.following.map(item => item.username);
    }

    getFollowers(){
        return this.followers.map(item => item.username);
    }
}

export class Post{
    //todo
}

export class SocialNetwork{
    //todo
}

export function buildSocialReport(){
    //todo
}
