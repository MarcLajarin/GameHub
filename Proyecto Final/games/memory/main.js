import { MemoryGame } from './logic.js';
import { MemoryUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new MemoryGame();
    const ui = new MemoryUI(game);

    ui.initGame();
});
