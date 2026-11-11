# freecell

Versão CLI do jogo Freecell, desenvolvido com React and [ink](https://github.com/vadimdemedes/ink), e inspirado [nessa versão do jogo Paciênia](https://github.com/zephraph/solitaire)

![freecell](assets/freecell.gif)

## Como jogar

Requer Node.js 18 ou superior.

```
npx freecell
```

Use as setas `← ↑ → ↓` para navegar e `enter` (ou espaço) para selecionar e mover as cartas.
Use `ctrl+z` para desfazer o último movimento. Cada partida recebe um baralho novo.

## Jogar no navegador

A versão web fica em [cgreinhold.com/projetos/freecell](https://cgreinhold.com/projetos/freecell/)
e usa a mesma lógica de movimentos da versão CLI. O tabuleiro é desenhado em ASCII,
mas pode ser jogado com o teclado ou com o mouse.

## Desenvolvimento

```
npm install
npm start
npm test
```
