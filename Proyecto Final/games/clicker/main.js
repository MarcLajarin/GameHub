import { ClickerGame } from './logic.js';
import { ClickerUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new ClickerGame();
    const ui = new ClickerUI(game);



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
