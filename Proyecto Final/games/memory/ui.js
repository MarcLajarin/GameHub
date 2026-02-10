export class MemoryUI {
    constructor(game) {
        this.game = game;
        this.grid = document.querySelector('.memory-grid');
        this.movesEl = document.getElementById('moves');
        this.timeEl = document.getElementById('time');
        this.restartBtn = document.getElementById('restart-btn');
        this.endScreen = document.getElementById('end-screen');

        this.bindEvents();
        this.initGame();

        // Listen for mismatch flip back
        document.addEventListener('flipBack', (e) => {
            e.detail.cards.forEach(id => {
                const cardEl = document.querySelector(`.card[data-id="${id}"]`);
                if (cardEl) cardEl.classList.remove('flipped');
            });
        });
    }

    initGame() {
        this.game.init();
        this.renderGrid();
        this.updateStats();
        this.endScreen.style.display = 'none';

        this.game.startTimer((time) => {
            this.timeEl.textContent = this.formatTime(time);
        });
    }

    bindEvents() {
        this.restartBtn.addEventListener('click', () => {
            this.initGame();
        });
    }

    renderGrid() {
        this.grid.innerHTML = '';
        const state = this.game.getState();

        // Dynamic Grid Sizing
        // Dynamic Grid Sizing
        this.grid.style.gridTemplateColumns = `repeat(${state.gridSize.cols}, 1fr)`;
        // Adjust card size based on density if needed, or let CSS flex handle it.
        // For very large grids, we might want to scale down the cards via CSS variable or class
        let cardScale = '100px';
        if (state.cards.length > 36) cardScale = '60px';
        if (state.cards.length > 80) cardScale = '40px';

        document.documentElement.style.setProperty('--memory-card-size', cardScale);

        state.cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.dataset.id = card.id;

            // Card Structure
            cardEl.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <span>?</span>
                    </div>
                    <div class="card-back">
                        <span>${card.icon}</span>
                    </div>
                </div>
            `;

            cardEl.addEventListener('click', () => this.handleCardClick(card.id, cardEl));
            this.grid.appendChild(cardEl);
        });
    }

    handleCardClick(id, cardEl) {
        const result = this.game.flipCard(id);
        if (!result) return;

        // Animate Flip
        cardEl.classList.add('flipped');

        this.updateStats();

        if (result.match) {
            // keep flipped
            const c1 = document.querySelector(`.card[data-id="${result.cards[0].id}"]`);
            const c2 = document.querySelector(`.card[data-id="${result.cards[1].id}"]`);
            c1.classList.add('matched');
            c2.classList.add('matched');
        }

        if (result.gameOver) {
            setTimeout(() => this.showEndGame(), 500);
        }
    }

    updateStats() {
        const state = this.game.getState();
        this.movesEl.textContent = state.moves;
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    showEndGame() {
        this.endScreen.style.display = 'flex';
        document.getElementById('final-moves').textContent = this.game.moves;
        document.getElementById('final-time').textContent = this.formatTime(this.game.time);
    }
}
