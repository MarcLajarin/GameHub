export class BlackjackUI {
    constructor(game) {
        this.game = game;
        this.dealerCardsEl = document.getElementById('dealer-cards');
        this.playerCardsEl = document.getElementById('player-cards');
        this.dealerScoreEl = document.getElementById('dealer-score');
        this.playerScoreEl = document.getElementById('player-score');
        this.messageEl = document.getElementById('message');
        this.scoreEl = document.getElementById('score-display');

        this.btnHit = document.getElementById('btn-hit');
        this.btnStand = document.getElementById('btn-stand');
        this.btnNewGame = document.getElementById('btn-new-game');

        this.bindEvents();
    }

    bindEvents() {
        this.btnHit.addEventListener('click', () => {
            const state = this.game.hit();
            this.render(state);
        });

        this.btnStand.addEventListener('click', () => {
            const state = this.game.stand();
            this.render(state);
        });

        this.btnNewGame.addEventListener('click', () => {
            const state = this.game.startGame();
            this.render(state);
        });
    }

    render(state) {
        // Render Player Cards
        this.playerCardsEl.innerHTML = '';
        state.playerHand.forEach(card => {
            this.playerCardsEl.appendChild(this.createCardElement(card));
        });

        // Render Dealer Cards
        this.dealerCardsEl.innerHTML = '';
        state.dealerHand.forEach((card, index) => {
            if (!state.gameOver && index === 0) {
                // Hidden card
                const hiddenCard = document.createElement('div');
                hiddenCard.className = 'card hidden';
                this.dealerCardsEl.appendChild(hiddenCard);
            } else {
                this.dealerCardsEl.appendChild(this.createCardElement(card));
            }
        });

        // Update Text
        this.messageEl.textContent = state.message;
        this.playerScoreEl.textContent = state.playerScore;
        this.dealerScoreEl.textContent = state.dealerScore;

        // Buttons
        if (state.gameOver) {
            this.btnHit.disabled = true;
            this.btnStand.disabled = true;
            this.btnNewGame.style.display = 'block';
        } else {
            this.btnHit.disabled = false;
            this.btnStand.disabled = false;
            this.btnNewGame.style.display = 'none';
        }
    }

    createCardElement(card) {
        const el = document.createElement('div');
        el.className = `card ${this.getSuitClass(card.suit)}`;
        el.innerHTML = `
            <span class="value top">${card.value}</span>
            <span class="suit">${card.suit}</span>
            <span class="value bottom">${card.value}</span>
        `;
        return el;
    }

    getSuitClass(suit) {
        return (suit === '♥' || suit === '♦') ? 'red' : 'black';
    }
}
