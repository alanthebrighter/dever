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
    constructor(author, content, likes){
        this.author = author;
        this.content = content;
        this.likes = [];
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
        if(!(typeof value == "string") || value.length < 1){
            throw new Error("content must be a non-empty string");
        }

        this._content = value;
    }

    like(user){
        if(!(this.likes.includes(user))){
            this.likes.push(user);
        }
    }

    unlike(user){
        if(this.likes.includes(user)){
            const index = this.likes.indexOf(user);
            this.likes.splice(index, 1);
        }
    }

    getLikeCount(){
        return this.likes.length;
    }

    getSummary(){
        const summary = `@${this.author.username}: ${this.content} (${this.getLikeCount()} likes)`;
        return summary;
    }
}

export class SocialNetwork{
    constructor(users, posts){
        this.users = [];
        this.posts = [];
    }

    addUser(user){
        if(!(user instanceof User)){
            throw new Error("user must be an instance of User");
        }

        this.users.push(user);
    }

    addPost(post){
        if(!(post instanceof Post)){
            throw new Error("post must be an instance of Post");
        }

        this.posts.push(post);
    }

    getUser(username){
        const tmpUser =this.users.find(item => item.username === username);
        if(tmpUser){
            return tmpUser;
        } else {
            return null;
        }
    }

    getPostsByUser(user){
        return this.posts.filter(item => item.author.username === user.username);
    }

    getFeed(user){
        return this.posts.filter(item => user.following.includes(item.author));
    }

    getMostLikedPost(){
        return this.posts.reduce((prev, current) => prev.likes.length > current.likes.length ? prev : current);
    }

    getMostFollowedUser(){
        return this.users.reduce((prev, current) => prev.followers.length > current.followers.length ? prev : current);
    }

    getTotalLikes(){
        return this.posts.reduce((acc, current) => acc += current.likes.length, 0);
    }

    static fromObject(data){
        const tmpSocial = new SocialNetwork();

        for (const user of data.users){
            const tmpUser = new User(user.username, user.email);
            tmpSocial.addUser(tmpUser);
        }
        for (const post of data.posts){
            const tmpPost = new Post(tmpSocial.getUser(post.author), post.content);
            tmpSocial.addPost(tmpPost);
        }
        return tmpSocial;
    }
}

export function buildSocialReport(network){
    return {
        totalUsers: network.users.length,
        totalPosts: network.posts.length,
        totalLikes: network.getTotalLikes(),
        mostFollowed: network.getMostFollowedUser().username,
        mostLikedPost: network.getMostLikedPost().getSummary()
    }
}
