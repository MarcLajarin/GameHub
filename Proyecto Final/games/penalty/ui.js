export class PenaltyUI {
    constructor(game) {
        this.game = game;

        // Elements
        this.ball = document.getElementById('ball');
        this.goalie = document.getElementById('goalie');
        this.msgDisplay = document.getElementById('message');
        this.pScoreEl = document.getElementById('player-score');
        this.cScoreEl = document.getElementById('cpu-score');
        this.roundEl = document.getElementById('round-display');

        // Zone mapping for Animations
        // Coords relative to center of goal spot
        // Ball starts at bottom center. Goal is "far away" in Z (or negative Y in 2D simulation).
        // Y val needs to be high negative to reach the "net".
        this.coords = {
            'TL': { x: -220, y: -380 }, 'TC': { x: 0, y: -380 }, 'TR': { x: 220, y: -380 },
            'BL': { x: -220, y: -190 }, 'BC': { x: 0, y: -190 }, 'BR': { x: 220, y: -190 }
        };

        this.isAnimating = false;
        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('.target-zone').forEach(zone => {
            zone.addEventListener('click', (e) => {
                const zoneId = e.target.dataset.zone;
                this.handleShot(zoneId);
            });
        });

        document.getElementById('restart-btn')?.addEventListener('click', () => {
            this.game.reset();
            this.resetVisuals();
            this.updateDisplay();
        });
    }

    handleShot(zone) {
        if (this.isAnimating || this.game.gameOver) return;

        this.isAnimating = true;

        // Disable grid interaction cursor
        document.querySelector('.target-grid').style.pointerEvents = 'none';

        const result = this.game.shoot(zone);

        this.animateShot(result.direction, result.goalieDirection).then(() => {
            this.updateDisplay();
            this.msgDisplay.textContent = result.isGoal ? "GOAL!" : "SAVED!";
            this.msgDisplay.className = result.isGoal ? "msg goal" : "msg miss";

            if (result.gameOver) {
                setTimeout(() => this.showEndGame(result), 1000);
            } else {
                // Re-enable input after delay to see the result properly
                setTimeout(() => {
                    this.resetTurn();
                }, 1500);
            }
        });
    }

    animateShot(ballZone, goalieZone) {
        return new Promise(resolve => {
            const ballTarget = this.coords[ballZone];
            const goalieTarget = this.coords[goalieZone];

            // 1. Ball Animation
            // Direct shot: fast linear/ease-out transport to the target
            this.ball.style.transition = 'all 0.6s cubic-bezier(0.2, 0.6, 0.2, 1)';

            // Use calc to maintain the -50% centering offset while adding the target translation
            // transform origin is center. Initial state is left:50% translateX(-50%).
            // We need to add the pixel offset to that transform.
            this.ball.style.transform = `translate(calc(-50% + ${ballTarget.x}px), ${ballTarget.y}px) scale(0.55)`;

            // 2. Goalie Animation
            this.goalie.style.transition = 'all 0.6s ease-out';

            let gX = goalieTarget.x;
            // Clamp X so goalie stays somewhat in goal frame
            // Visual goal width is 500px, so 250px per side. goalieTarget x is +/- 220 max.
            if (gX > 180) gX = 180;
            if (gX < -180) gX = -180;

            let gY = 0;
            let rotate = 0;

            // If diving Top, jump up and tilt
            if (goalieZone.startsWith('T')) {
                gY = -80;
                if (goalieZone === 'TL') rotate = -45;
                if (goalieZone === 'TR') rotate = 45;
            } else {
                // Low dive
                gY = 20; // Dive down
                if (goalieZone === 'BL') rotate = -80;
                if (goalieZone === 'BR') rotate = 80;
            }

            // Center saves
            if (goalieZone === 'TC') { gY = -50; rotate = 0; } // Jump straight up
            if (goalieZone === 'BC') { gY = 0; rotate = 0; }

            // Goalie starts center (translateX(-50%)). Add pixel move.
            this.goalie.style.transform = `translate(calc(-50% + ${gX}px), ${gY}px) rotate(${rotate}deg)`;

            setTimeout(() => {
                resolve();
            }, 700);
        });
    }

    resetTurn() {
        // Reset Ball
        this.ball.style.transition = 'none';
        // Return to initial CSS state: left 50%, translate -50%
        this.ball.style.transform = 'translate(-50%, 0) scale(1)';

        // Reset Goalie
        this.goalie.style.transition = 'none';
        this.goalie.style.transform = 'translate(-50%, 0)';

        this.msgDisplay.textContent = 'Select a corner to shoot!';
        this.msgDisplay.className = 'msg';

        document.querySelector('.target-grid').style.pointerEvents = 'auto';
        this.isAnimating = false;
    }

    resetVisuals() {
        this.resetTurn();
        document.querySelector('.end-screen').style.display = 'none';
    }

    updateDisplay() {
        const state = this.game.getState();
        this.pScoreEl.textContent = state.playerScore;
        this.cScoreEl.textContent = state.cpuScore;
        this.roundEl.textContent = state.gameOver ? 'Final' : `Round ${state.round} / 5`;
    }

    showEndGame(state) {
        const endScreen = document.querySelector('.end-screen');
        const endTitle = endScreen.querySelector('h2');
        endScreen.style.display = 'flex';

        if (state.playerScore > state.cpuScore) {
            endTitle.textContent = "YOU WIN! 🏆";
            endTitle.style.color = "#4caf50";
        } else if (state.playerScore < state.cpuScore) {
            endTitle.textContent = "YOU LOSE ❌";
            endTitle.style.color = "#f44336";
        } else {
            endTitle.textContent = "DRAW 🤝";
            endTitle.style.color = "#ffeb3b";
        }
    }
}
