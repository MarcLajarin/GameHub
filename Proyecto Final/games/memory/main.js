import { MemoryGame } from './logic.js';
import { MemoryUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new MemoryGame();
    new MemoryUI(game);
});
