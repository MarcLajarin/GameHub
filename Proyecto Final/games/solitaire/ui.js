export class SolitaireUI {
    constructor(game) {
        this.game = game;
        this.elements = {
            stock: document.getElementById('stock'),
            waste: document.getElementById('waste'),
            foundations: {
                '♠': document.getElementById('f-spades'),
                '♥': document.getElementById('f-hearts'),
                '♦': document.getElementById('f-diamonds'),
                '♣': document.getElementById('f-clubs')
            },
            tableau: Array.from({ length: 7 }, (_, i) => document.getElementById(`t-${i}`))
        };

        this.selected = null; // { type: 'waste'|'tableau', index: int, cardIndex: int }

        this.bindEvents();
    }

    bindEvents() {
        // Stock Click
        this.elements.stock.addEventListener('click', () => {
            this.game.flipStock();
            this.selected = null;
            this.render();
        });

        // Waste Click (Selection)
        this.elements.waste.addEventListener('click', () => {
            const state = this.game.getState();
            if (state.waste.length > 0) {
                this.handleSelection({ type: 'waste' });
            }
        });

        // Foundation Click (Target)
        Object.entries(this.elements.foundations).forEach(([suit, el]) => {
            el.addEventListener('click', () => {
                if (this.selected) {
                    this.game.attemptMove(this.selected, { type: 'foundation', suit });
                    this.selected = null;
                    this.render();
                }
            });
        });

        // Tableau Click (Source/Target)
        this.elements.tableau.forEach((el, colIndex) => {
            el.addEventListener('click', (e) => {
                // Find clicked card index
                const clickedCard = e.target.closest('.card');

                if (!clickedCard) {
                    // Clicked empty column space -> Target
                    if (this.selected) {
                        this.game.attemptMove(this.selected, { type: 'tableau', index: colIndex });
                        this.selected = null;
                        this.render();
                    }
                    return;
                }

                const cardIndex = parseInt(clickedCard.dataset.index);
                const state = this.game.getState();
                const card = state.tableau[colIndex][cardIndex];

                if (!card.faceUp) return; // Cannot select face down

                if (this.selected) {
                    // Try to move Selected -> This Column
                    // If source is same as target, deselect or do nothing
                    if (this.selected.type === 'tableau' && this.selected.index === colIndex && this.selected.cardIndex === cardIndex) {
                        this.selected = null;
                    } else {
                        const success = this.game.attemptMove(this.selected, { type: 'tableau', index: colIndex });
                        if (!success) {
                            // If move failed, maybe user meant to select THIS card instead
                            this.handleSelection({ type: 'tableau', index: colIndex, cardIndex });
                        } else {
                            this.selected = null;
                        }
                    }
                } else {
                    // Select this card (and those below it)
                    this.handleSelection({ type: 'tableau', index: colIndex, cardIndex });
                }
                this.render();
            });
        });
    }

    handleSelection(selection) {
        // Toggle selection logic could go here
        this.selected = selection;
        this.render();
    }

    render() {
        const state = this.game.getState();

        // Render Stock
        this.elements.stock.innerHTML = state.stock.length > 0 ? '<div class="card back"></div>' : '<div class="stock-empty">↺</div>';

        // Render Waste
        this.elements.waste.innerHTML = '';
        if (state.waste.length > 0) {
            const card = state.waste[state.waste.length - 1];
            const el = this.createCard(card);
            el.classList.add('waste-card');
            if (this.selected && this.selected.type === 'waste') el.classList.add('selected');
            this.elements.waste.appendChild(el);
        }

        // Render Foundations
        Object.keys(this.elements.foundations).forEach(suit => {
            const pile = state.foundations[suit];
            const el = this.elements.foundations[suit];
            el.innerHTML = '';
            if (pile.length > 0) {
                el.appendChild(this.createCard(pile[pile.length - 1]));
            } else {
                el.innerHTML = `<span class="placeholder">${suit}</span>`;
            }
        });

        // Render Tableau
        state.tableau.forEach((col, i) => {
            const el = this.elements.tableau[i];
            el.innerHTML = '';
            col.forEach((card, cardIndex) => {
                const cardEl = this.createCard(card);
                cardEl.dataset.index = cardIndex;
                cardEl.style.top = `${cardIndex * 30}px`; // Cascade effect

                if (this.selected && this.selected.type === 'tableau' && this.selected.index === i && cardIndex >= this.selected.cardIndex) {
                    cardEl.classList.add('selected');
                }

                el.appendChild(cardEl);
            });
        });

        // Check for Win
        if (this.game.checkWin()) {
            if (window.ArcadeAuth) {
                window.ArcadeAuth.showGameOverModal({
                    title: 'SOLITAIRE CLEAR!',
                    message: 'Congratulations! You have organized the entire deck.',
                    onPlayAgain: () => {
                        this.game.resetGame();
                        this.render();
                    }
                });
            }
        }
    }

    createCard(card) {
        const div = document.createElement('div');
        div.className = `card ${card.faceUp ? 'face-up' : 'back'} ${card.color || ''}`;

        if (card.faceUp) {
            div.innerHTML = `
                <div class="top-left">${card.value}${card.suit}</div>
                <div class="center-suit">${card.suit}</div>
                <div class="bottom-right">${card.value}${card.suit}</div>
            `;
        }
        return div;
    }
}
