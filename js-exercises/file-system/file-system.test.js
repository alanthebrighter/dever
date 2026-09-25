/**
 * File System — Testes
 *
 * Como usar:
 *   node filesystem.test.js
 *
 * Substitua o caminho do import abaixo pelo arquivo do seu código.
 */

import {
  File,
  Directory,
  FileSystem,
  buildFileSystemReport,
} from "./file-system.js"; // ← ajuste o caminho conforme necessário

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

// ─── File ─────────────────────────────────────────────────────────────────────

section("File — validações");

assertThrows(
  "name vazio lança erro",
  () => new File("", 100, "pdf"),
  "name must be a non-empty string"
);

assertThrows(
  "name não-string lança erro",
  () => new File(42, 100, "pdf"),
  "name must be a non-empty string"
);

assertThrows(
  "size negativo lança erro",
  () => new File("resume.pdf", -1, "pdf"),
  "size must be 0 or greater"
);

assertThrows(
  "extension vazia lança erro",
  () => new File("resume.pdf", 100, ""),
  "extension must be a non-empty string"
);

assertThrows(
  "extension não-string lança erro",
  () => new File("resume.pdf", 100, 42),
  "extension must be a non-empty string"
);

{
  const f = new File("resume.pdf", 0, "pdf");
  assert("size = 0 é válido", f.size === 0);
}

section("File — getInfo");

{
  const f = new File("resume.pdf", 150, "pdf");
  assert(
    'getInfo retorna "resume.pdf - 150 KB"',
    f.getInfo() === "resume.pdf - 150 KB"
  );
}

{
  const f = new File("notes.txt", 0, "txt");
  assert(
    'getInfo com size 0 retorna "notes.txt - 0 KB"',
    f.getInfo() === "notes.txt - 0 KB"
  );
}

// ─── Directory ────────────────────────────────────────────────────────────────

section("Directory — validações");

assertThrows(
  "name vazio lança erro",
  () => new Directory(""),
  "name must be a non-empty string"
);

assertThrows(
  "name não-string lança erro",
  () => new Directory(99),
  "name must be a non-empty string"
);

section("Directory — estado inicial");

{
  const d = new Directory("documents");
  assert("children começa como array vazio", Array.isArray(d.children) && d.children.length === 0);
}

section("Directory — add");

assertThrows(
  "add rejeita tipo inválido",
  () => new Directory("docs").add({ name: "fake" }),
  "child must be a File or Directory"
);

{
  const dir = new Directory("documents");
  const file = new File("resume.pdf", 150, "pdf");
  dir.add(file);
  assert("add aceita File", dir.children.length === 1);
}

{
  const dir = new Directory("documents");
  const sub = new Directory("images");
  dir.add(sub);
  assert("add aceita Directory", dir.children.length === 1);
}

section("Directory — remove");

{
  const dir = new Directory("documents");
  dir.add(new File("resume.pdf", 150, "pdf"));
  dir.add(new File("notes.txt", 50, "txt"));

  const result = dir.remove("resume.pdf");
  assert("remove retorna true quando encontrou", result === true);
  assert("remove elimina o filho correto", dir.children.length === 1);
  assert("remove mantém o filho restante", dir.children[0].name === "notes.txt");
}

{
  const dir = new Directory("documents");
  const result = dir.remove("inexistente.txt");
  assert("remove retorna false quando não encontrou", result === false);
}

section("Directory — find");

{
  const root = new Directory("root");
  const docs = new Directory("documents");
  const file = new File("resume.pdf", 150, "pdf");
  docs.add(file);
  root.add(docs);

  assert("find localiza filho direto", root.find("documents") === docs);
}

{
  // busca recursiva profunda
  const root = new Directory("root");
  const projects = new Directory("projects");
  const app = new Directory("app");
  const index = new File("index.js", 100, "js");
  app.add(index);
  projects.add(app);
  root.add(projects);

  assert("find localiza arquivo em subdiretório profundo", root.find("index.js") === index);
}

{
  const root = new Directory("root");
  assert("find retorna null quando não existe", root.find("nada.txt") === null);
}

section("Directory — getSize");

{
  const dir = new Directory("documents");
  dir.add(new File("a.txt", 100, "txt"));
  dir.add(new File("b.txt", 200, "txt"));
  assert("getSize soma arquivos diretos", dir.getSize() === 300);
}

{
  // recursão: soma arquivos em subdiretórios
  const docs = new Directory("documents");
  docs.add(new File("a.txt", 100, "txt"));
  docs.add(new File("b.txt", 200, "txt"));
  const images = new Directory("images");
  images.add(new File("photo.jpg", 500, "jpg"));
  docs.add(images);

  assert("getSize soma recursivamente (100 + 200 + 500 = 800)", docs.getSize() === 800);
}

{
  const dir = new Directory("vazia");
  assert("getSize de diretório vazio retorna 0", dir.getSize() === 0);
}

// ─── FileSystem ───────────────────────────────────────────────────────────────

section("FileSystem — root");

{
  const fs = new FileSystem();
  assert("root é um Directory", fs.root instanceof Directory);
}

section("FileSystem — createDirectory");

{
  const fs = new FileSystem();
  fs.createDirectory("/documents");
  assert("createDirectory cria diretório no root", fs.root.find("documents") instanceof Directory);
}

{
  // cria intermediários automaticamente
  const fs = new FileSystem();
  fs.createDirectory("/projects/app");
  assert("createDirectory cria diretórios intermediários", fs.root.find("projects") instanceof Directory);
  assert("createDirectory cria diretório final", fs.root.find("app") instanceof Directory);
}

section("FileSystem — createFile");

{
  const fs = new FileSystem();
  fs.createDirectory("/documents");
  fs.createFile("/documents/resume.pdf", 150, "pdf");
  const file = fs.root.find("resume.pdf");
  assert("createFile cria o arquivo no diretório correto", file instanceof File);
  assert("createFile preserva o nome", file.name === "resume.pdf");
  assert("createFile preserva o size", file.size === 150);
  assert("createFile preserva a extension", file.extension === "pdf");
}

{
  // cria diretórios intermediários automaticamente
  const fs = new FileSystem();
  fs.createFile("/projects/app/index.js", 100, "js");
  assert("createFile cria diretórios intermediários automaticamente",
    fs.root.find("projects") instanceof Directory
  );
  assert("createFile cria subdiretório intermediário",
    fs.root.find("app") instanceof Directory
  );
  assert("createFile cria o arquivo no final do caminho",
    fs.root.find("index.js") instanceof File
  );
}

section("FileSystem — find");

{
  const fs = new FileSystem();
  fs.createFile("/documents/resume.pdf", 150, "pdf");

  const file = fs.find("/documents/resume.pdf");
  assert("find localiza arquivo pelo caminho", file instanceof File);
  assert("find retorna o objeto correto", file.name === "resume.pdf");
}

{
  const fs = new FileSystem();
  fs.createDirectory("/projects/app");

  const dir = fs.find("/projects/app");
  assert("find localiza diretório pelo caminho", dir instanceof Directory);
}

{
  const fs = new FileSystem();
  assert("find retorna null quando caminho não existe", fs.find("/inexistente/arquivo.txt") === null);
}

section("FileSystem — delete");

{
  const fs = new FileSystem();
  fs.createFile("/documents/resume.pdf", 150, "pdf");

  const result = fs.delete("/documents/resume.pdf");
  assert("delete retorna true quando removeu", result === true);
  assert("delete remove o arquivo", fs.find("/documents/resume.pdf") === null);
}

{
  const fs = new FileSystem();
  fs.createDirectory("/documents");

  const result = fs.delete("/documents");
  assert("delete remove diretório", result === true);
  assert("delete remove diretório do root", fs.find("/documents") === null);
}

{
  const fs = new FileSystem();
  assert("delete retorna false quando não encontrou", fs.delete("/inexistente.txt") === false);
}

section("FileSystem — getTotalSize");

{
  const fs = new FileSystem();
  fs.createFile("/documents/resume.pdf", 150, "pdf");
  fs.createFile("/documents/notes.txt", 50, "txt");
  fs.createFile("/projects/app/index.js", 100, "js");
  fs.createFile("/projects/app/package.json", 80, "json");

  assert("getTotalSize soma todos os arquivos (150+50+100+80 = 380)", fs.getTotalSize() === 380);
}

{
  const fs = new FileSystem();
  assert("getTotalSize retorna 0 quando vazio", fs.getTotalSize() === 0);
}

// ─── buildFileSystemReport ────────────────────────────────────────────────────

section("buildFileSystemReport");

{
  const fs = new FileSystem();
  fs.createDirectory("/documents");
  fs.createFile("/documents/resume.pdf", 150, "pdf");
  fs.createFile("/documents/notes.txt", 50, "txt");
  fs.createFile("/projects/app/index.js", 100, "js");
  fs.createFile("/projects/app/package.json", 80, "json");

  // estrutura:
  //   documents/ (dir)
  //   resume.pdf, notes.txt (2 files)
  //   projects/ (dir)
  //   app/ (dir)
  //   index.js, package.json (2 files)
  // totalFiles = 4, totalDirectories = 3 (root não conta), totalSize = 380

  const report = buildFileSystemReport(fs);

  assert("report.totalFiles = 4", report.totalFiles === 4);
  assert("report.totalDirectories = 3 (root não conta)", report.totalDirectories === 3);
  assert("report.totalSize = 380", report.totalSize === 380);
}

{
  const fs = new FileSystem();
  const report = buildFileSystemReport(fs);
  assert("report com fs vazio: totalFiles = 0", report.totalFiles === 0);
  assert("report com fs vazio: totalDirectories = 0", report.totalDirectories === 0);
  assert("report com fs vazio: totalSize = 0", report.totalSize === 0);
}

// ─── Resultado final ──────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(52));
console.log(`  Resultado: ${passed} passou | ${failed} falhou`);
console.log("═".repeat(52));

if (failed > 0) process.exit(1);
