/**
 * Rede Social — Testes
 *
 * Como usar:
 *   node social.test.js
 *
 * Substitua o caminho do import abaixo pelo arquivo do seu código.
 */

import {
  User,
  Post,
  SocialNetwork,
  buildSocialReport,
} from "./social.js"; // ← ajuste o caminho conforme necessário

// ─── Utilitários de teste ────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    failed++;
  }
}

function assertThrows(description, fn, expectedMessage) {
  try {
    fn();
    console.error(`  ❌ ${description} (não lançou erro)`);
    failed++;
  } catch (e) {
    if (expectedMessage && e.message !== expectedMessage) {
      console.error(
        `  ❌ ${description} (mensagem errada: "${e.message}" — esperado: "${expectedMessage}")`
      );
      failed++;
    } else {
      console.log(`  ✅ ${description}`);
      passed++;
    }
  }
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(50 - title.length)}`);
}

// helpers
function makeUser(username = "alan", email = "alan@email.com") {
  return new User(username, email);
}
function makePost(author, content = "Hello world!") {
  return new Post(author, content);
}

// ─── User ─────────────────────────────────────────────────────────────────────

section("User — validações");

assertThrows(
  "username vazio lança erro",
  () => new User("", "alan@email.com"),
  "username must be a non-empty string"
);

assertThrows(
  "username não-string lança erro",
  () => new User(42, "alan@email.com"),
  "username must be a non-empty string"
);

assertThrows(
  "email sem @ lança erro",
  () => new User("alan", "alanemail.com"),
  "invalid email"
);

section("User — estado inicial");

{
  const u = makeUser();
  assert("following começa como array vazio", Array.isArray(u.following) && u.following.length === 0);
  assert("followers começa como array vazio", Array.isArray(u.followers) && u.followers.length === 0);
}

section("User — follow");

assertThrows(
  "follow rejeita não-User",
  () => makeUser().follow({ username: "fake" }),
  "user must be an instance of User"
);

{
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  alan.follow(bob);

  assert("follow adiciona bob em alan.following", alan.following.includes(bob));
  assert("follow adiciona alan em bob.followers", bob.followers.includes(alan));
}

{
  // sem duplicatas
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  alan.follow(bob);
  alan.follow(bob);

  assert("follow não duplica em following", alan.following.length === 1);
  assert("follow não duplica em followers", bob.followers.length === 1);
}

section("User — unfollow");

{
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  alan.follow(bob);
  alan.unfollow(bob);

  assert("unfollow remove bob de alan.following", !alan.following.includes(bob));
  assert("unfollow remove alan de bob.followers", !bob.followers.includes(alan));
}

{
  // unfollow de quem não segue não faz nada
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  alan.unfollow(bob);
  assert("unfollow sem relação prévia não lança erro", true);
  assert("unfollow sem relação não altera following", alan.following.length === 0);
}

section("User — getFollowing / getFollowers");

{
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const alice = makeUser("alice", "alice@email.com");
  alan.follow(bob);
  alan.follow(alice);

  const following = alan.getFollowing();
  assert("getFollowing retorna array de usernames", Array.isArray(following));
  assert("getFollowing contém 'bob'", following.includes("bob"));
  assert("getFollowing contém 'alice'", following.includes("alice"));

  const followers = bob.getFollowers();
  assert("getFollowers retorna array de usernames", Array.isArray(followers));
  assert("getFollowers de bob contém 'alan'", followers.includes("alan"));
}

// ─── Post ─────────────────────────────────────────────────────────────────────

section("Post — validações");

assertThrows(
  "author não-User lança erro",
  () => new Post({ username: "fake" }, "Hello"),
  "author must be an instance of User"
);

assertThrows(
  "content vazio lança erro",
  () => new Post(makeUser(), ""),
  "content must be a non-empty string"
);

assertThrows(
  "content não-string lança erro",
  () => new Post(makeUser(), 123),
  "content must be a non-empty string"
);

section("Post — estado inicial");

{
  const post = makePost(makeUser());
  assert("likes começa como array vazio", Array.isArray(post.likes) && post.likes.length === 0);
}

section("Post — like / unlike");

{
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const post = makePost(alan);

  post.like(bob);
  assert("like adiciona usuário aos likes", post.likes.includes(bob));

  post.like(bob);
  assert("like não duplica o mesmo usuário", post.likes.length === 1);
}

{
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const post = makePost(alan);
  post.like(bob);
  post.unlike(bob);
  assert("unlike remove usuário dos likes", !post.likes.includes(bob));
}

{
  const post = makePost(makeUser());
  const bob = makeUser("bob", "bob@email.com");
  post.unlike(bob);
  assert("unlike sem like prévio não lança erro", true);
  assert("unlike sem like prévio não altera likes", post.likes.length === 0);
}

section("Post — getLikeCount");

{
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const alice = makeUser("alice", "alice@email.com");
  const post = makePost(alan);
  post.like(bob);
  post.like(alice);
  assert("getLikeCount retorna número de likes", post.getLikeCount() === 2);
}

section("Post — getSummary");

{
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const alice = makeUser("alice", "alice@email.com");
  const post = new Post(alan, "Hello world!");
  post.like(bob);
  post.like(alice);
  post.like(makeUser("carlos", "carlos@email.com"));
  assert(
    'getSummary retorna "@alan: Hello world! (3 likes)"',
    post.getSummary() === "@alan: Hello world! (3 likes)"
  );
}

{
  const post = new Post(makeUser("alan"), "Sem likes");
  assert(
    'getSummary com 0 likes retorna "(0 likes)"',
    post.getSummary() === "@alan: Sem likes (0 likes)"
  );
}

// ─── SocialNetwork ────────────────────────────────────────────────────────────

section("SocialNetwork — addUser / addPost");

{
  const net = new SocialNetwork();
  assertThrows("addUser rejeita não-User", () => net.addUser({ username: "fake" }));
  net.addUser(makeUser());
  assert("addUser adiciona usuário", net.users.length === 1);
}

{
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  assertThrows("addPost rejeita não-Post", () => net.addPost({ content: "fake" }));
  net.addPost(makePost(alan));
  assert("addPost adiciona post", net.posts.length === 1);
}

section("SocialNetwork — getUser");

{
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  net.addUser(alan);
  assert("getUser retorna o usuário correto", net.getUser("alan") === alan);
  assert("getUser retorna null quando não existe", net.getUser("fantasma") === null);
}

section("SocialNetwork — getPostsByUser");

{
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const p1 = makePost(alan, "Post 1");
  const p2 = makePost(alan, "Post 2");
  const p3 = makePost(bob, "Post do Bob");
  net.addUser(alan);
  net.addUser(bob);
  net.addPost(p1);
  net.addPost(p2);
  net.addPost(p3);

  const posts = net.getPostsByUser(alan);
  assert("getPostsByUser retorna apenas posts do usuário", posts.length === 2);
  assert("getPostsByUser não inclui posts de outros", !posts.includes(p3));
}

section("SocialNetwork — getFeed");

{
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const alice = makeUser("alice", "alice@email.com");
  const carlos = makeUser("carlos", "carlos@email.com");

  alan.follow(bob);
  alan.follow(alice);

  const p1 = makePost(bob, "Post do Bob 1");
  const p2 = makePost(bob, "Post do Bob 2");
  const p3 = makePost(alice, "Post da Alice");
  const p4 = makePost(carlos, "Post do Carlos"); // não aparece no feed

  net.addUser(alan);
  net.addUser(bob);
  net.addUser(alice);
  net.addUser(carlos);
  net.addPost(p1);
  net.addPost(p2);
  net.addPost(p3);
  net.addPost(p4);

  const feed = net.getFeed(alan);
  assert("getFeed retorna posts de quem alan segue", feed.length === 3);
  assert("getFeed inclui posts do bob", feed.includes(p1) && feed.includes(p2));
  assert("getFeed inclui posts da alice", feed.includes(p3));
  assert("getFeed não inclui posts de carlos", !feed.includes(p4));
}

{
  // feed vazio quando não segue ninguém
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  net.addUser(alan);
  net.addUser(bob);
  net.addPost(makePost(bob, "Post qualquer"));
  assert("getFeed vazio quando não segue ninguém", net.getFeed(alan).length === 0);
}

section("SocialNetwork — getMostLikedPost");

{
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const alice = makeUser("alice", "alice@email.com");

  const p1 = makePost(alan, "Post 1");
  const p2 = makePost(alan, "Post 2");
  const p3 = makePost(bob, "Post 3");

  p1.like(bob);
  p2.like(bob);
  p2.like(alice); // p2 tem mais likes
  p3.like(alice);

  net.addPost(p1);
  net.addPost(p2);
  net.addPost(p3);

  assert("getMostLikedPost retorna o post com mais likes", net.getMostLikedPost() === p2);
}

section("SocialNetwork — getMostFollowedUser");

{
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const alice = makeUser("alice", "alice@email.com");

  bob.follow(alan);
  alice.follow(alan);
  alice.follow(bob); // alan tem 2 seguidores, bob tem 1

  net.addUser(alan);
  net.addUser(bob);
  net.addUser(alice);

  assert("getMostFollowedUser retorna o usuário com mais seguidores", net.getMostFollowedUser() === alan);
}

section("SocialNetwork — getTotalLikes");

{
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const alice = makeUser("alice", "alice@email.com");

  const p1 = makePost(alan, "Post 1");
  const p2 = makePost(alan, "Post 2");
  p1.like(bob);   // 1
  p1.like(alice); // 2
  p2.like(bob);   // 1

  net.addPost(p1);
  net.addPost(p2);

  assert("getTotalLikes soma todos os likes de todos os posts", net.getTotalLikes() === 3);
}

{
  const net = new SocialNetwork();
  net.addPost(makePost(makeUser(), "Sem likes"));
  assert("getTotalLikes retorna 0 quando não há likes", net.getTotalLikes() === 0);
}

// ─── SocialNetwork.fromObject ─────────────────────────────────────────────────

section("SocialNetwork.fromObject");

{
  const data = {
    users: [
      { username: "alan", email: "alan@email.com" },
      { username: "bob", email: "bob@email.com" },
    ],
    posts: [
      { author: "alan", content: "Hello world!" },
      { author: "bob", content: "Learning JavaScript" },
    ],
  };

  const net = SocialNetwork.fromObject(data);

  assert("fromObject retorna uma SocialNetwork", net instanceof SocialNetwork);
  assert("fromObject cria Users corretamente", net.users.length === 2);
  assert("fromObject cria Posts corretamente", net.posts.length === 2);
  assert("fromObject cria instâncias de User", net.users[0] instanceof User);
  assert("fromObject cria instâncias de Post", net.posts[0] instanceof Post);
  assert(
    "fromObject vincula author como instância de User (não string)",
    net.posts[0].author instanceof User
  );
  assert(
    "fromObject vincula o User correto ao post do alan",
    net.posts[0].author === net.getUser("alan")
  );
  assert(
    "fromObject vincula o User correto ao post do bob",
    net.posts[1].author === net.getUser("bob")
  );
}

// ─── buildSocialReport ────────────────────────────────────────────────────────

section("buildSocialReport");

{
  const net = new SocialNetwork();
  const alan = makeUser("alan");
  const bob = makeUser("bob", "bob@email.com");
  const alice = makeUser("alice", "alice@email.com");

  bob.follow(alan);
  alice.follow(alan); // alan tem 2 seguidores — mais seguido

  const p1 = makePost(alan, "Post do Alan");
  const p2 = makePost(bob, "Learning JavaScript");

  p1.like(bob);
  p2.like(alan);
  p2.like(alice);
  p2.like(bob); // p2 tem 3 likes — mais curtido

  net.addUser(alan);
  net.addUser(bob);
  net.addUser(alice);
  net.addPost(p1);
  net.addPost(p2);

  const report = buildSocialReport(net);

  assert("report.totalUsers = 3", report.totalUsers === 3);
  assert("report.totalPosts = 2", report.totalPosts === 2);
  assert("report.totalLikes = 4", report.totalLikes === 4);
  assert('report.mostFollowed = "alan"', report.mostFollowed === "alan");
  assert(
    'report.mostLikedPost = "@bob: Learning JavaScript (3 likes)"',
    report.mostLikedPost === "@bob: Learning JavaScript (3 likes)"
  );
}

// ─── Resultado final ──────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(52));
console.log(`  Resultado: ${passed} passou | ${failed} falhou`);
console.log("═".repeat(52));

if (failed > 0) process.exit(1);
