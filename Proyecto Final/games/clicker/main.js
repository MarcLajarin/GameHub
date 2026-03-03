import { ClickerGame } from './logic.js';
import { ClickerUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new ClickerGame();
    const ui = new ClickerUI(game);

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
            game.setDifficulty(newDiff);
            ui.updateDisplay(); // reflect new BPS immediately
        });
    });

    game.setDifficulty(currentDiff);

    let lastTime = performance.now();

    function gameLoop(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000; // Seconds
        lastTime = currentTime;

        game.update(deltaTime);
        ui.updateDisplay();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});
