import { SolitaireGame } from './logic.js';
import { SolitaireUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new SolitaireGame();
    const ui = new SolitaireUI(game);

    game.resetGame();
    ui.render();
});
