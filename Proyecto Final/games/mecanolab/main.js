import { GameLogic } from './logic.js';
import { GameUI } from './ui.js';

const logic = new GameLogic();
const ui = new GameUI();

// Initial Diff
const diffBtns = document.querySelectorAll('.diff-btn');
let currentDiff = localStorage.getItem('arcadeDifficulty') || 'medium';
if (currentDiff === 'standard' || currentDiff === 'normal') currentDiff = 'medium';

logic.setDifficulty(currentDiff);

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
        logic.setDifficulty(newDiff);
    });
});

document.addEventListener('gameStart', () => {
    ui.reset();
    logic.start({
        onStart: (state) => {
            ui.updateStats(state.lives, state.timeLeft, state.progress, 5);
        },
        onNewPhrase: (phrase) => {
            ui.setPhrase(phrase);
        },
        onCorrectInput: (currentTyping) => {
            ui.updateInput(currentTyping);
        },
        onMistake: (lives) => {
            ui.shakePaper();
            ui.updateStats(lives);
        },
        onProgress: (current, max) => {
            ui.updateStats(logic.lives, logic.timeLeft, current, max);
        },
        onTick: (time) => {
            ui.updateStats(logic.lives, time);
        },
        onGameOver: (isWin) => {
            ui.showGameOver(isWin);
        }
    });
});

window.addEventListener('keydown', (e) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        logic.handleInput(e.key);
    }
});
