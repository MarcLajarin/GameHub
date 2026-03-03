import { BlackjackGame } from './logic.js';
import { BlackjackUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new BlackjackGame();
    const ui = new BlackjackUI(game);

    // Initial Diff
    const diffBtns = document.querySelectorAll('.diff-btn');
    let currentDiff = localStorage.getItem('arcadeDifficulty') || 'medium';
    if (currentDiff === 'standard' || currentDiff === 'normal') currentDiff = 'medium';

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
            game.difficulty = newDiff;
            // Optionally restart the game automatically when difficulty changes
            // ui.render(game.startGame());
        });
    });

    game.difficulty = currentDiff;
    // Start initial game
    ui.render(game.startGame());
});
