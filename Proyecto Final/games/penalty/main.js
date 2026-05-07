import { PenaltyGame } from './logic.js';
import { PenaltyUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new PenaltyGame();

    game.setDifficulty('medium');
    const ui = new PenaltyUI(game);
});
