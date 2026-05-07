import { ImpostorGame } from './logic.js';
import { ImpostorUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new ImpostorGame();

    game.setDifficulty('medium');
    const ui = new ImpostorUI(game);
});
