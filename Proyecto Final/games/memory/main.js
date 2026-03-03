import { MemoryGame } from './logic.js';
import { MemoryUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new MemoryGame();
    const ui = new MemoryUI(game);

    // Initial Diff
    const diffBtns = document.querySelectorAll('.diff-btn');
    let currentDiff = localStorage.getItem('arcadeDifficulty') || 'medium';
    if (currentDiff === 'standard' || currentDiff === 'normal') currentDiff = 'medium';
    localStorage.setItem('arcadeDifficulty', currentDiff);

    diffBtns.forEach(btn => {
        if (btn.getAttribute('data-diff') === currentDiff) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        btn.addEventListener('click', (e) => {
            diffBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const newDiff = e.target.getAttribute('data-diff');
            localStorage.setItem('arcadeDifficulty', newDiff);
            ui.initGame(); // restart logic and UI
        });
    });
});
