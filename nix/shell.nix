# shell.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    pkgs.neovim
    pkgs.nodejs
    pkgs.tree-sitter
    pkgs.typescript-language-server
    prettier
    pkgs.gcc
    pkgs.git
  ];

  shellHook = ''
    echo "dever env loaded"
  '';
}
