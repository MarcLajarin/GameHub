export class GameUI {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.scoreDisplay = document.getElementById('score');
        this.timeDisplay = document.getElementById('time');
        this.startScreen = document.getElementById('start-screen');
        this.endScreen = document.getElementById('end-screen');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameStatus = document.getElementById('game-status');
        this.diffBtns = document.querySelectorAll('.diff-btn');
    }

    init(callbacks) {
        this.startBtn.addEventListener('click', () => callbacks.onStartGame());
        this.restartBtn.addEventListener('click', () => callbacks.onRestartGame());

        this.diffBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.diffBtns.forEach(b => b.classList.remove('active'));
                const target = e.target;
                target.classList.add('active');
                if (callbacks.onSelectDifficulty) {
                    callbacks.onSelectDifficulty(target.getAttribute('data-diff'));
                }
            });
        });
    }

    updateHUD(state) {
        this.scoreDisplay.textContent = state.score;
        this.timeDisplay.textContent = state.timeLeft;
    }

    showStartScreen() {
        this.startScreen.style.display = 'flex';
        this.endScreen.style.display = 'none';
        this.gameStatus.textContent = 'PRESS START';

        // Select the right difficulty button initially
        const currentDiff = localStorage.getItem('arcadeDifficulty') || 'medium';
        this.diffBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-diff') === currentDiff ||
                (btn.getAttribute('data-diff') === 'medium' && currentDiff === 'standard') ||
                (btn.getAttribute('data-diff') === 'medium' && currentDiff === 'normal')) {
                btn.classList.add('active');
            }
        });

        // Remove old targets
        const targets = document.querySelectorAll('.target');
        targets.forEach(t => t.remove());
    }

    hideStartScreen() {
        this.startScreen.style.display = 'none';
        this.gameStatus.textContent = 'MISSION ACTIVE';
    }

    showGameOver(score) {
        this.endScreen.style.display = 'flex';
        this.finalScoreDisplay.textContent = score;
        this.gameStatus.textContent = 'MISSION ENDED';
    }

    spawnTarget(targetData, onHitCallback) {
        const el = document.createElement('div');
        el.className = 'target';
        el.dataset.id = targetData.id;
        el.style.left = targetData.x + '%';
        el.style.top = targetData.y + '%';

        // Handle click/hit
        el.onmousedown = (e) => {
            e.stopPropagation(); // Prevent background clicks if we add those later
            onHitCallback(targetData.id);

            // Visual feedback handled by CSS class 'hit' before removal?
            // Actually, the logic removes it instantly usually, but let's add class for animation handling
            // However, logic.js calls removeTarget immediately. 
            // We can let UI handle the 'hit' animation before removing from DOM.
        };

        this.gameArea.appendChild(el);
    }

    removeTarget(targetId) {
        const el = document.querySelector(`.target[data-id="${targetId}"]`);
        if (el) {
            el.classList.add('hit');
            // Remove after animation
            el.addEventListener('animationend', () => {
                el.remove();
            });
            // Fallback removal
            setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
        }
    }
}
