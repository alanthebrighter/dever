# Desafios NASM — do zero ao nível pleno recomendado

> **Ambiente**: WSL2 + Ubuntu 24.04 + NASM  
> **Instalar dependências**:
> ```bash
> sudo apt update && sudo apt install -y nasm gcc gdb binutils
> ```
> **Compilar e linkar (padrão de todos os desafios)**:
> ```bash
> nasm -f elf64 programa.asm -o programa.o
> ld programa.o -o programa
> # ou, quando precisar de libc:
> gcc -no-pie programa.o -o programa
> ```

```plaintext
program.asm [> nasm -f elf64 programa.asm -o programa.o]
       │
       │ nasm
       ▼
program.o [> ld programa.o -o programa]
       │
       │ ld
       ▼
program  ← executável
       │
       │ ./hello-syscall
       ▼
program instructins!
```

---

## Como usar este guia

Cada fase tem um objetivo cognitivo claro, não só técnico. Você vai saber que absorveu quando conseguir **ler o disassembly gerado pelo GCC e reconhecer os padrões** que você mesmo escreveu à mão. Esse é o ponto de chegada do documento base.

Tempo estimado por desafio: 1 a 3 dias. Não pule fases — cada uma é pré-requisito da seguinte.

---

## FASE 1 — Sobrevivência: registros, syscalls e o modelo de execução

**Objetivo cognitivo**: entender que o programa é uma sequência de instruções manipulando registros e memória. Desmistificar o "hello world".

---

### Desafio 1.1 — Hello, syscall

**O que fazer**: escrever um programa que imprime uma string na tela usando `syscall` diretamente (sem `printf`, sem libc).

**Conceitos cobertos**:
- Seções `.data` e `.text`
- Registros de propósito geral: `rax`, `rdi`, `rsi`, `rdx`
- Syscall `write` (número 1) e `exit` (número 60)
- Convenção de syscalls no Linux x86-64

**Estrutura mínima esperada**:
```nasm
section .data
    msg db "Hello, NASM!", 10   ; 10 = '\n'
    len equ $ - msg

section .text
    global _start

_start:
    ; syscall write(1, msg, len)
    mov rax, 1
    mov rdi, 1
    mov rsi, msg
    mov rdx, len
    syscall

    ; syscall exit(0)
    mov rax, 60
    xor rdi, rdi
    syscall
```

**Resultado esperado**:
```
Hello, NASM!
```

**Exercício de reflexão**: por que `xor rdi, rdi` é equivalente a `mov rdi, 0` mas é preferido? (dica: tamanho do opcode e flags do processador)

---

### Desafio 1.2 — Calculadora de inteiros no stdout

**O que fazer**: programa que soma dois números hardcoded (ex: 42 + 58) e imprime o resultado como string legível. **Sem printf** — você precisa converter o inteiro para ASCII manualmente.

**Conceitos cobertos**:
- Operações aritméticas: `add`, `sub`, `imul`, `idiv`
- Registros especiais de divisão: `rdx:rax`
- Conversão inteiro → string (divisão sucessiva por 10, push dos dígitos)
- Manipulação de pilha: `push`, `pop`

**Algoritmo de conversão**:
1. Divida o número por 10 com `div`
2. O resto (`rdx`) é o dígito — some `'0'` (48) para obter ASCII
3. Empilhe o dígito
4. Repita até o quociente ser zero
5. Desempilhe na ordem para montar a string

**Resultado esperado** (para 42 + 58):
```
100
```

**Extensão opcional**: aceitar números negativos (detectar sinal, imprimir `-` antes)

---

### Desafio 1.3 — Inspecione com GDB

**O que fazer**: compile o desafio 1.1 com símbolos de debug e execute passo a passo no GDB. Não escreva código novo — o objetivo é aprender a ferramenta.

```bash
nasm -f elf64 -g -F dwarf hello.asm -o hello.o
ld hello.o -o hello
gdb ./hello
```

**Comandos para praticar**:
```
(gdb) layout asm         # visualização do assembly
(gdb) info registers     # estado de todos os registros
(gdb) break _start       # breakpoint no início
(gdb) run
(gdb) stepi              # executa uma instrução
(gdb) x/16xb &msg        # examina 16 bytes de memória em hex
(gdb) p $rax             # valor do registro rax
```

**O que observar**:
- O valor de `rsp` antes e depois de operações de pilha
- Como `rax` muda após o `syscall`
- O endereço real onde `msg` fica na memória

**Resultado esperado**: você consegue parar em qualquer instrução e explicar o estado dos registros naquele momento.

---

## FASE 2 — Controle de fluxo e estruturas

**Objetivo cognitivo**: reconhecer como `if`, `for`, `while` e funções em C viram instruções de salto e manipulação de pilha. Esse é o núcleo da leitura de disassembly.

---

### Desafio 2.1 — FizzBuzz em Assembly

**O que fazer**: imprimir FizzBuzz de 1 a 20. Para múltiplos de 3 imprime "Fizz", de 5 imprime "Buzz", de ambos "FizzBuzz", senão o número.

**Conceitos cobertos**:
- Saltos condicionais: `je`, `jne`, `jl`, `jge`, `jmp`
- Flags de condição após `cmp` e operações aritméticas
- Instrução `test` (AND sem salvar resultado — só seta flags)
- Loops com contador: padrão `dec rcx / jnz`
- Chamadas simples entre labels (não é `call` ainda — use `jmp` com label de retorno)

**Lógica esperada** (pseudo-Assembly):
```
mov rcx, 1          ; contador

.loop:
    ; testa se rcx % 3 == 0
    mov rax, rcx
    xor rdx, rdx
    mov rbx, 3
    div rbx
    cmp rdx, 0
    je  .eh_multiplo_3

    ; ... (completar lógica)

    inc rcx
    cmp rcx, 21
    jl .loop
```

**Resultado esperado**:
```
1
2
Fizz
4
Buzz
Fizz
7
...
FizzBuzz
```

**Exercício de reflexão**: abra o GDB após terminar e observe as flags `ZF` (zero flag) e `SF` (sign flag) após um `cmp`. Veja como `je` as lê.

---

### Desafio 2.2 — Stack frame manual

**O que fazer**: implementar uma função `soma(a, b)` usando a convenção de chamada System V AMD64 ABI — a mesma que o GCC usa. Chamá-la de `_start` e imprimir o resultado.

**Convenção System V AMD64 ABI** (memorize isso):
| Propósito | Registros |
|---|---|
| Argumentos inteiros (em ordem) | `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9` |
| Valor de retorno | `rax` |
| Preservados pelo chamado (callee-saved) | `rbx`, `rbp`, `r12`–`r15` |
| Não preservados (caller-saved) | `rax`, `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`, `r10`, `r11` |

**Estrutura esperada**:
```nasm
soma:
    push rbp
    mov  rbp, rsp       ; cria o stack frame
    
    mov  rax, rdi       ; primeiro argumento
    add  rax, rsi       ; segundo argumento
    ; resultado em rax
    
    pop  rbp
    ret

_start:
    mov rdi, 10         ; a = 10
    mov rsi, 32         ; b = 32
    call soma
    ; rax agora tem 42
```

**O que inspecionar no GDB**:
- O valor de `rsp` antes e depois do `call` (o `call` empurra o endereço de retorno)
- O conteúdo da pilha com `x/8gx $rsp` logo após entrar em `soma`
- Como `ret` usa o valor no topo da pilha

**Resultado esperado**: imprime `42` (usando a rotina de conversão do desafio 1.2)

---

### Desafio 2.3 — Função recursiva: fatorial

**O que fazer**: implementar `fatorial(n)` recursivamente. Testar com n=5 (resultado: 120) e n=10 (resultado: 3628800).

**Conceitos cobertos**:
- Recursão em Assembly: por que você **deve** salvar `rdi` antes de fazer `call` recursivo
- Callee-saved vs caller-saved na prática (se não salvar, o valor some)
- Crescimento da pilha em chamadas recursivas
- Stack overflow quando n é grande demais

**Estrutura esperada**:
```nasm
fatorial:
    push rbp
    mov  rbp, rsp
    push rbx            ; salva rbx (callee-saved) — vamos usá-lo
    
    mov  rbx, rdi       ; guarda n em rbx (sobreviverá ao call recursivo)
    
    cmp  rdi, 1
    jle  .base          ; se n <= 1, retorna 1
    
    dec  rdi
    call fatorial       ; fatorial(n-1) → resultado em rax
    imul rax, rbx       ; n * fatorial(n-1)
    jmp  .fim
    
.base:
    mov rax, 1
    
.fim:
    pop rbx
    pop rbp
    ret
```

**Por que `rbx`?** Porque `rbx` é callee-saved — qualquer função que você chamar vai preservá-lo. `rdi` não tem essa garantia.

**Resultado esperado**:
```
fatorial(5) = 120
fatorial(10) = 3628800
```

**Exercício de reflexão**: use o GDB para pausar dentro do terceiro nível de recursão. Execute `info stack` e `x/32gx $rsp`. Você consegue ver os stack frames empilhados?

---

## FASE 3 — Memória, strings e ponteiros

**Objetivo cognitivo**: entender que ponteiros são apenas endereços de memória — e que toda operação de "ponteiro" em C é uma instrução de endereçamento em Assembly.

---

### Desafio 3.1 — strlen e strcpy sem libc

**O que fazer**: implementar `strlen` (retorna o tamanho de uma string terminada em `\0`) e `strcpy` (copia string de src para dst). Testar com strings conhecidas.

**Conceitos cobertos**:
- Byte `\0` como terminador: como o hardware não sabe o tamanho da string
- Endereçamento indireto: `[rsi]`, `[rdi + rcx]`
- Instrução `movzx` (move com extensão de zero)
- Diferença entre `byte`, `word`, `dword`, `qword` em acessos de memória

**strlen esperado**:
```nasm
strlen:
    ; rdi = ponteiro para string
    ; retorna comprimento em rax
    xor  rax, rax       ; contador = 0
.loop:
    cmp  byte [rdi + rax], 0    ; chegou no '\0'?
    je   .fim
    inc  rax
    jmp  .loop
.fim:
    ret
```

**Para strcpy**: mova byte a byte de `[rsi]` para `[rdi]`, incluindo o `\0` final.

**Resultado esperado**:
```
strlen("Assembly") = 8
copia ok: "Assembly"
```

---

### Desafio 3.2 — Buffer na pilha: vulnerabilidade didática

**O que fazer**: criar um programa com um buffer de 16 bytes na pilha, preencher com uma string de exatamente 16 caracteres, e inspecionar o que acontece ao redor do buffer no GDB.

**Objetivo**: ver na prática o que o documento chama de "corrupção de pilha" e "buffer overflow".

**Setup**:
```nasm
_start:
    sub  rsp, 16        ; aloca 16 bytes na pilha
    ; rsp agora aponta pro buffer
    
    ; preenche manualmente:
    mov  byte [rsp],    'A'
    mov  byte [rsp+1],  'B'
    ; ... até [rsp+15]
    ; [rsp+16] é o endereço de retorno — não toque
```

**O que inspecionar**:
```
(gdb) x/32xb $rsp         ; 32 bytes a partir do topo da pilha
(gdb) x/4gx  $rsp         ; mesmo região, mas em quadwords (64 bits)
```

Identifique visualmente:
- Os 16 bytes do seu buffer (preenchidos com 'A', 'B'...)
- O valor de `rbp` salvo logo depois
- O endereço de retorno logo depois de `rbp`

**Resultado esperado**: você consegue apontar no dump de memória exatamente onde termina seu buffer e onde começa o endereço de retorno.

**Reflexão**: se você escrevesse no `[rsp+16]`, o que corromperia?

---

### Desafio 3.3 — Ordenação: Bubble Sort em Assembly

**O que fazer**: implementar Bubble Sort em um array de inteiros de 64 bits definido na seção `.data`. Imprimir o array antes e depois.

**Conceitos cobertos**:
- Arrays em memória: acesso por índice com `[base + índice * tamanho]`
- Registros de índice e o modo de endereçamento SIB (Scale-Index-Base)
- Swap sem variável temporária extra (usando `xchg`)
- Loop aninhado com dois contadores

**Array de teste**:
```nasm
section .data
    arr dq 64, 25, 12, 22, 11   ; cinco inteiros de 64 bits
    len equ 5
```

**Acesso ao elemento i**:
```nasm
mov rax, [arr + rcx * 8]    ; arr[i], cada elemento tem 8 bytes
```

**Resultado esperado**:
```
Antes:  64 25 12 22 11
Depois: 11 12 22 25 64
```

---

## FASE 4 — Leitura de disassembly: o objetivo real

**Objetivo cognitivo**: você agora escreve Assembly. O próximo passo é ler o que o compilador gera e reconhecer os padrões — esse é o skill descrito no documento como divisor de águas.

---

### Desafio 4.1 — Espelhar o compilador

**O que fazer**: escrever um trecho simples em C e, **antes de compilar**, prever qual Assembly o compilador vai gerar. Depois compilar, comparar, e entender as diferenças.

**Código C de referência**:
```c
// arquivo: soma.c
int soma_vetor(int *v, int n) {
    int acc = 0;
    for (int i = 0; i < n; i++) {
        acc += v[i];
    }
    return acc;
}
```

**Compilar com diferentes otimizações**:
```bash
gcc -O0 -S -masm=intel soma.c -o soma_O0.s
gcc -O2 -S -masm=intel soma.c -o soma_O2.s
diff soma_O0.s soma_O2.s
```

**O que procurar no diff**:
- `-O0`: você vai ver o compilador salvar e carregar variáveis da pilha a cada acesso (sem registros extras)
- `-O2`: o compilador pode reescrever o loop inteiro, usar registros diferentes, ou até "unrollar" o loop

**Usar o Compiler Explorer** (godbolt.org) para ver lado a lado com cores ligando o C ao Assembly gerado.

**Resultado esperado**: você consegue apontar, na versão `-O2`, onde está o `acc`, onde está `i`, e qual instrução incrementa o ponteiro `v[i]`.

---

### Desafio 4.2 — Identificar o stack frame de uma função C no GDB

**O que fazer**: compilar um programa C com uma função que tem variáveis locais, executar no GDB e localizar cada variável na pilha.

**Código C**:
```c
// arquivo: frames.c
#include <stdio.h>

int multiplica(int a, int b) {
    int resultado = a * b;
    int dobro = resultado * 2;
    return dobro;
}

int main() {
    int x = multiplica(6, 7);
    printf("%d\n", x);
    return 0;
}
```

```bash
gcc -g -O0 frames.c -o frames
gdb ./frames
```

**Sequência no GDB**:
```
(gdb) break multiplica
(gdb) run
(gdb) layout asm
(gdb) info registers
(gdb) x/16gx $rsp          # dump da pilha
(gdb) info frame            # GDB te diz os offsets do frame
```

**O que identificar**:
- Endereço de `rsp` e `rbp` no início da função
- Onde está `a` (em `rdi` — argumento)
- Onde está `resultado` na pilha (geralmente `rbp - N`)
- O endereço de retorno (logo acima de `rbp`)

**Resultado esperado**: um rascunho em papel/texto descrevendo o layout da pilha da função `multiplica`, com os offsets exatos que o GDB confirmou.

---

### Desafio 4.3 — Cache, localidade e performance: medir na prática

**O que fazer**: implementar dois programas equivalentes em C — um com acesso sequencial à memória, outro com acesso por saltos — e medir a diferença com `perf stat`.

**Programa A (cache-friendly)**:
```c
// acessa arr[0], arr[1], arr[2]... (sequencial)
for (int i = 0; i < N; i++)
    soma += arr[i];
```

**Programa B (cache-unfriendly)**:
```c
// acessa arr[0], arr[64], arr[128]... (pula 64 elementos = 256 bytes)
for (int i = 0; i < N; i += 64)
    soma += arr[i % N];
```

```bash
sudo apt install -y linux-tools-generic linux-tools-$(uname -r)
gcc -O1 cache_friendly.c -o friendly
gcc -O1 cache_hostile.c  -o hostile
perf stat ./friendly
perf stat ./hostile
```

**O que observar no `perf stat`**:
- `cache-misses`: número de falhas na cache L1/L2
- `instructions` vs `cycles`: se ciclos >> instruções, o pipeline está esperando memória
- `IPC` (instructions per cycle): deve ser muito maior no programa A

**Resultado esperado**: o programa B tem significativamente mais `cache-misses` que o A, mesmo executando o mesmo número de instruções (ou menos). Isso traduz diretamente o que o documento fala sobre custo real de acessos à memória.

---

## FASE 5 — Integração: C + NASM juntos

**Objetivo cognitivo**: entender que Assembly não precisa substituir C — ele pode coexistir. Esse é o modelo de embarcados e HPC descrito no documento.

---

### Desafio 5.1 — Função NASM chamada por C

**O que fazer**: escrever uma função `soma_rapida` em NASM que é chamada por um `main.c` em C. Linkar os dois juntos.

**Arquivo `soma.asm`**:
```nasm
global soma_rapida      ; exporta o símbolo para o linker

section .text
soma_rapida:
    ; rdi = ponteiro para array int64_t
    ; rsi = quantidade de elementos
    ; retorna soma em rax
    xor  rax, rax
    xor  rcx, rcx
.loop:
    cmp  rcx, rsi
    jge  .fim
    add  rax, [rdi + rcx * 8]
    inc  rcx
    jmp  .loop
.fim:
    ret
```

**Arquivo `main.c`**:
```c
#include <stdio.h>
#include <stdint.h>

extern int64_t soma_rapida(int64_t *arr, int64_t n);

int main() {
    int64_t arr[] = {10, 20, 30, 40, 50};
    int64_t resultado = soma_rapida(arr, 5);
    printf("Soma: %ld\n", resultado);
    return 0;
}
```

**Compilar e linkar**:
```bash
nasm -f elf64 soma.asm -o soma.o
gcc main.c soma.o -o programa
./programa
```

**Resultado esperado**:
```
Soma: 150
```

**Extensão**: meça com `time` se a versão NASM é mais rápida que uma versão C equivalente com `-O0`. Com `-O2`, o compilador provavelmente empata ou vence — e isso em si é uma lição importante.

---

### Desafio 5.2 — Projeto final: implementar `memcpy` e comparar com o sistema

**O que fazer**: implementar uma versão de `memcpy` em NASM (usando loop de quadwords de 8 bytes), medir performance contra a `memcpy` do sistema (que usa instruções SIMD internamente), e inspecionar o disassembly da `memcpy` do sistema para entender por que ela é mais rápida.

**Sua implementação**:
```nasm
global meu_memcpy

meu_memcpy:
    ; rdi = dst, rsi = src, rdx = n (bytes)
    ; copia de 8 em 8 bytes (quadwords)
    mov  rcx, rdx
    shr  rcx, 3             ; rcx = n / 8
    rep  movsq              ; copia rcx quadwords
    ; trata bytes restantes (n % 8):
    mov  rcx, rdx
    and  rcx, 7
    rep  movsb
    ret
```

**Inspecionar a memcpy do sistema**:
```bash
# ver o disassembly da glibc memcpy
objdump -d /lib/x86_64-linux-gnu/libc.so.6 | grep -A 50 "<memcpy>"
# ou no GDB:
# (gdb) disas memcpy
```

**O que procurar**: instruções como `vmovdqu`, `vmovdqa`, `vperm`, `ymm0`–`ymm15` — essas são instruções AVX/SSE2 que copiam 16 ou 32 bytes por instrução.

**Resultado esperado**: sua versão funciona corretamente. A do sistema é 2x–10x mais rápida em buffers grandes por causa das instruções SIMD — e agora você **vê** isso no disassembly, não apenas acredita nisso.

---

## Referência rápida: registros x86-64

```
Propósito geral (64-bit / 32-bit / 16-bit / 8-bit):
  rax / eax / ax / al     → acumulador, retorno de função, dividendo
  rbx / ebx / bx / bl     → callee-saved (você deve preservar)
  rcx / ecx / cx / cl     → contador (rep, loop)
  rdx / edx / dx / dl     → extensão do dividendo, 3º argumento
  rsi / esi               → source index, 2º argumento
  rdi / edi               → destination index, 1º argumento
  rsp / esp               → stack pointer (topo da pilha)
  rbp / ebp               → base pointer (marco do stack frame)
  r8  – r15               → adicionais, r8/r9 são 5º e 6º argumentos

Flags relevantes (modificadas por cmp, test, add, sub):
  ZF  → zero flag    (resultado foi zero)
  SF  → sign flag    (resultado foi negativo)
  CF  → carry flag   (overflow sem sinal)
  OF  → overflow     (overflow com sinal)
```

## Referência rápida: syscalls Linux x86-64

| Syscall | Número (`rax`) | `rdi` | `rsi` | `rdx` |
|---|---|---|---|---|
| `write`  | 1  | fd (1=stdout) | buffer | tamanho |
| `read`   | 0  | fd (0=stdin)  | buffer | tamanho |
| `exit`   | 60 | código de saída | — | — |
| `mmap`   | 9  | addr (0=kernel escolhe) | tamanho | prot |

## Ferramentas recomendadas

```bash
# Ver disassembly de qualquer binário
objdump -d -M intel ./programa

# Compilar C e ver o Assembly gerado
gcc -O2 -S -masm=intel arquivo.c

# GDB com interface visual
gdb -tui ./programa

# Compiler Explorer (online, sem instalar nada)
# https://godbolt.org
```

---

## Checklist de progressão

Ao final das cinco fases, você deve conseguir:

- [ ] Escrever um programa NASM funcional do zero sem consultar sintaxe básica
- [ ] Explicar o que acontece na pilha durante um `call`/`ret`
- [ ] Abrir o GDB, setar breakpoint, inspecionar registros e memória sem hesitar
- [ ] Olhar um dump de disassembly de uma função C e identificar: o prólogo do stack frame, os argumentos, as variáveis locais, o epílogo
- [ ] Explicar por que um acesso sequencial à memória é mais rápido que acesso aleatório usando o conceito de cache miss
- [ ] Dizer sem hesitar por que Assembly inline é evitado em código moderno e o que o substitui
