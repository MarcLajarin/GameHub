import { Deck } from './deck.js';

export class BlackjackGame {
    constructor() {
        this.deck = new Deck();
        this.playerHand = [];
        this.dealerHand = [];
        this.gameOver = false;
        this.message = '';
    }

    startGame() {
        this.deck.reset();
        this.playerHand = [this.deck.deal(), this.deck.deal()];
        this.dealerHand = [this.deck.deal(), this.deck.deal()];
        this.gameOver = false;
        this.message = '';
        this.checkBlackjack();
        return this.getState();
    }

    hit() {
        if (this.gameOver) return this.getState();
        this.playerHand.push(this.deck.deal());
        if (this.calculateScore(this.playerHand) > 21) {
            this.gameOver = true;
            this.message = 'Bust! You lost.';
        }
        return this.getState();
    }

    stand() {
        if (this.gameOver) return this.getState();

        while (this.calculateScore(this.dealerHand) < 17) {
            this.dealerHand.push(this.deck.deal());
        }

        this.gameOver = true;
        this.determineWinner();
        return this.getState();
    }

    calculateScore(hand) {
        let score = 0;
        let aceCount = 0;

        for (let card of hand) {
            if (['J', 'Q', 'K'].includes(card.value)) {
                score += 10;
            } else if (card.value === 'A') {
                aceCount += 1;
                score += 11;
            } else {
                score += parseInt(card.value);
            }
        }

        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount -= 1;
        }

        return score;
    }

    checkBlackjack() {
        const playerScore = this.calculateScore(this.playerHand);
        if (playerScore === 21) {
            this.gameOver = true;
            this.message = 'Blackjack! You win!';
            if (window.ArcadeAuth) window.ArcadeAuth.addPoints(3);
        }
    }

    determineWinner() {
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);

        if (dealerScore > 21) {
            this.message = 'Dealer Busts! You win!';
            if (window.ArcadeAuth) window.ArcadeAuth.addPoints(3);
        } else if (playerScore > dealerScore) {
            this.message = 'You Win!';
            if (window.ArcadeAuth) window.ArcadeAuth.addPoints(3);
        } else if (playerScore < dealerScore) {
            this.message = 'Dealer Wins!';
        } else {
            this.message = 'Push!';
        }
    }

    getState() {
        return {
            playerHand: this.playerHand,
            dealerHand: this.dealerHand,
            playerScore: this.calculateScore(this.playerHand),
            dealerScore: this.gameOver ? this.calculateScore(this.dealerHand) : '?',
            gameOver: this.gameOver,
            message: this.message
        };
    }
}
