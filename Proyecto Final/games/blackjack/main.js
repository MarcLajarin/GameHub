 import { BlackjackGame } from './logic.js';
import { BlackjackUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new BlackjackGame();
    const ui = new BlackjackUI(game);

    // Start initial game
    ui.render(game.startGame());
});
