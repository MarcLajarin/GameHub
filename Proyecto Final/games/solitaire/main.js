import { SolitaireGame } from './logic.js';
import { SolitaireUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new SolitaireGame();

    game.setDifficulty('medium');
    const ui = new SolitaireUI(game);

    game.resetGame();
    ui.render();
});
