import { GameLogic } from './logic.js';
import { GameUI } from './ui.js';

const logic = new GameLogic();
const ui = new GameUI();

let timerInterval;

function startGame() {
    ui.hideStartScreen();
    logic.start({
        onStart: () => {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => logic.decrementTime(), 1000);
        },
        onUpdate: (state) => ui.updateHUD(state),
        onSpawn: (target) => ui.spawnTarget(target, handleTargetHit),
        onHit: (targetId) => ui.removeTarget(targetId),
        onGameOver: (score) => {
            clearInterval(timerInterval);
            ui.showGameOver(score);
        }
    });
}

function handleTargetHit(targetId) {
    logic.handleHit(targetId);
}

// Initial Setup
ui.init({
    onStartGame: startGame,
    onRestartGame: startGame
});

// Show initial state
ui.showStartScreen();
ui.updateHUD(logic.getState());
