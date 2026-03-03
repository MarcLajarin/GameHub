import { ImpostorGame } from './logic.js';
import { ImpostorUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new ImpostorGame();

    // Initial Diff
    const diffBtns = document.querySelectorAll('.diff-btn');
    let currentDiff = localStorage.getItem('arcadeDifficulty') || 'medium';
    if (currentDiff === 'standard' || currentDiff === 'normal') currentDiff = 'medium';

    game.setDifficulty(currentDiff);
    const ui = new ImpostorUI(game);

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
            game.setDifficulty(newDiff);
            ui.restart();
        });
    });
});
