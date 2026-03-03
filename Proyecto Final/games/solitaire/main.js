import { SolitaireGame } from './logic.js';
import { SolitaireUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new SolitaireGame();

    // Initial Diff
    const diffBtns = document.querySelectorAll('.diff-btn');
    let currentDiff = localStorage.getItem('arcadeDifficulty') || 'medium';
    if (currentDiff === 'standard' || currentDiff === 'normal') currentDiff = 'medium';

    game.setDifficulty(currentDiff);
    const ui = new SolitaireUI(game);

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
            game.resetGame();
            ui.render();
        });
    });

    game.resetGame();
    ui.render();
});
