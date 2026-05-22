import { Deck } from './deck.js';

export class SolitaireGame {
    constructor() {
        this.deck = new Deck();
        this.stock = [];
        this.waste = [];
        this.foundations = { '♠': [], '♥': [], '♦': [], '♣': [] };
        this.tableau = [[], [], [], [], [], [], []];
        this.difficulty = 'medium';
        this.recycles = 0;
    }

    setDifficulty(diff) {
        this.difficulty = diff;
    }

    resetGame() {
        this.deck.reset();
        this.stock = [];
        this.waste = [];
        this.foundations = { '♠': [], '♥': [], '♦': [], '♣': [] };
        this.tableau = [[], [], [], [], [], [], []];
        this.recycles = 0;

        // Deal to Tableau using standard Klondike rules:
        // column 1 gets 1 card, column 2 gets 2 cards, etc.
        for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
            for (let cardIndex = 0; cardIndex <= columnIndex; cardIndex++) {
                const card = this.deck.deal();
                card.faceUp = cardIndex === columnIndex;
                this.tableau[columnIndex].push(card);
            }
        }

        // Remaining to Stock
        while (this.deck.deck.length > 0) {
            this.stock.push(this.deck.deal());
        }
    }

    flipStock() {
        let drawCount = 1;
        if (this.difficulty === 'medium' || this.difficulty === 'hard') {
            drawCount = 3;
        }

        if (this.stock.length === 0) {
            // Recycle waste to stock
            if (this.difficulty === 'hard' && this.recycles >= 3) {
                return this.getState(); // Out of recycles
            }
            if (this.waste.length > 0) {
                this.stock = this.waste.reverse().map(c => ({ ...c, faceUp: false }));
                this.waste = [];
                this.recycles++;
            }
        } else {
            for (let i = 0; i < drawCount && this.stock.length > 0; i++) {
                const card = this.stock.pop();
                card.faceUp = true;
                this.waste.push(card);
            }
        }
        return this.getState();
    }

    // Helper: Get numeric rank
    getRank(value) {
        if (value === 'A') return 1;
        if (value === 'J') return 11;
        if (value === 'Q') return 12;
        if (value === 'K') return 13;
        return parseInt(value);
    }

    isValidTableauMove(card, targetColumnIndex) {
        const targetColumn = this.tableau[targetColumnIndex];

        // Empty column accepts King
        if (targetColumn.length === 0) {
            return card.value === 'K';
        }

        const targetCard = targetColumn[targetColumn.length - 1];
        if (!targetCard.faceUp) return false; // Can't start on face down

        return (card.color !== targetCard.color) &&
            (this.getRank(card.value) === this.getRank(targetCard.value) - 1);
    }

    isValidFoundationMove(card, suit) {
        const pile = this.foundations[suit];
        const rank = this.getRank(card.value);

        if (pile.length === 0) {
            return rank === 1 && card.suit === suit;
        }

        const topCard = pile[pile.length - 1];
        return card.suit === suit && rank === this.getRank(topCard.value) + 1;
    }

    moveCard(from, to) {
        // 'from' and 'to' are identifiers e.g., { type: 'tableau', index: 0, cardIndex: 5 }
        // For simplicity in this version, we'll assume a "Move Attempt" based on selection

        // If Logic is complex, UI might handle drag source/target identification
        // Let's expose raw methods for specific moves:
    }

    // Abstracting attemptMove
    attemptMove(source, target) {
        let cardsToMove = [];
        let sourceArray = null;

        // --- EXTRACT SOURCE ---
        if (source.type === 'waste') {
            if (this.waste.length === 0) return false;
            cardsToMove = [this.waste[this.waste.length - 1]];
            sourceArray = this.waste;
        } else if (source.type === 'tableau') {
            const column = this.tableau[source.index];
            if (source.cardIndex >= column.length) return false;
            cardsToMove = column.slice(source.cardIndex);
            sourceArray = column;
        } else {
            return false; // Can't move from foundation/stock directly like this
        }

        const primaryCard = cardsToMove[0];

        // --- VALIDATE TARGET ---
        if (target.type === 'tableau') {
            if (this.isValidTableauMove(primaryCard, target.index)) {
                // Execute Move
                this.tableau[target.index].push(...cardsToMove);
                // Remove from source
                if (source.type === 'waste') this.waste.pop();
                else this.tableau[source.index].splice(source.cardIndex);

                // Flip new top of source if needed
                if (source.type === 'tableau' && this.tableau[source.index].length > 0) {
                    this.tableau[source.index][this.tableau[source.index].length - 1].faceUp = true;
                }
                return true;
            }
        } else if (target.type === 'foundation' && cardsToMove.length === 1) {
            if (this.isValidFoundationMove(primaryCard, target.suit)) {
                this.foundations[target.suit].push(primaryCard);
                // Remove from source
                if (source.type === 'waste') this.waste.pop();
                else this.tableau[source.index].splice(source.cardIndex);

                // Flip new top
                if (source.type === 'tableau' && this.tableau[source.index].length > 0) {
                    this.tableau[source.index][this.tableau[source.index].length - 1].faceUp = true;
                }
                return true;
            }
        }

        return false;
    }

    getState() {
        return {
            stock: this.stock,
            waste: this.waste,
            foundations: this.foundations,
            tableau: this.tableau
        };
    }

    checkWin() {
        const isWin = Object.values(this.foundations).every(p => p.length === 13);
        if (isWin && window.ArcadeAuth) {
            // Points handled by showGameOverModal
        }
        return isWin;
    }
}
