export class Deck {
    constructor() {
        this.deck = [];
        this.reset();
    }

    reset() {
        this.deck = [];
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        for (let suit of suits) {
            for (let value of values) {
                // Color property helps with logic
                const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
                this.deck.push({ suit, value, color, faceUp: false });
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    deal() {
        return this.deck.pop();
    }
}
