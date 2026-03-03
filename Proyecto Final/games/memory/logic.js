export class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.time = 0;
        this.timerInterval = null;
        this.isLocked = false;
        this.gameOver = false;
    }

    init() {
        const difficulty = localStorage.getItem('arcadeDifficulty') || 'standard';
        let rows = 4, cols = 4; // Default 4x4 (standard) for redundancy, though we want 8x8 as 'normal' according to prompt or standard?
        // Prompt said: 
        // Easy: 6x6
        // Normal (Standard/Normal): 8x8
        // Hard: 10x10
        // Extreme: 15x6 (originally 15x5 but extended to 15x6 for even pairs)

        // If standard, let's treat it as Normal (8x8) or maybe the original size? 
        // Original was not specified but 4x4 or 6x6 is common.
        // Let's map strict to the requirements:

        switch (difficulty) {
            case 'easy': rows = 6; cols = 6; break;
            case 'standard':
            case 'normal':
            case 'medium': rows = 8; cols = 8; break;
            case 'hard': rows = 10; cols = 10; break;
            case 'extreme': rows = 6; cols = 15; break; // 90 cards
            default: rows = 8; cols = 8;
        }

        this.gridSize = { rows, cols };
        const numPairs = (rows * cols) / 2;

        // Extended Icon Set
        const icons = [
            '🍆', '🍑', '🍌', '💦', '🛏️', '🥵', '👯‍♀️', '🚿',
            '💋', '👙', '👠', '💄', '👅', '🦴', '🍒', '🔥',
            '😈', '🧊', '⛓️', '🍸', '🕯️', '🧸', '🎀', '🍭',
            '🦄', '🐇', '🦊', '🐱', '🌶️', '💊', '💉', '🩹',
            '🩸', '🦠', '🧬', '🧿', '🔮', '🧸', '🧨', '💣',
            '🔪', '🛡️', '🏹', '🧹', '🧺', '🧻', '🛁', '🧼',
            '🧽', '🧴', '🧴', '🪒', '✂️', '🖊️', '🔍' // Added more to reach 50+
        ];

        // Ensure we have enough icons by repeating if necessary
        let selectedIcons = [];
        while (selectedIcons.length < numPairs) {
            selectedIcons = selectedIcons.concat(icons);
        }
        selectedIcons = selectedIcons.slice(0, numPairs);

        // Duplicate to make pairs
        const deck = [...selectedIcons, ...selectedIcons];

        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // Create Card Objects
        this.cards = deck.map((icon, index) => ({
            id: index,
            icon: icon,
            isFlipped: false,
            isMatched: false
        }));

        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.time = 0;
        this.gameOver = false;
    }

    startTimer(callback) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.time++;
            if (callback) callback(this.time);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    flipCard(id) {
        if (this.isLocked || this.gameOver) return null;

        const card = this.cards[id];
        if (card.isFlipped || card.isMatched) return null;

        card.isFlipped = true;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.isLocked = true;
            return this.checkMatch();
        }

        return { match: null, card: card };
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.icon === card2.icon;

        if (match) {
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedPairs++;
            this.flippedCards = [];
            this.isLocked = false;

            if (this.matchedPairs === this.cards.length / 2) {
                this.gameOver = true;
                this.stopTimer();
                if (window.ArcadeAuth) window.ArcadeAuth.addPoints(9);
            }
        } else {
            // No match, wait then flip back
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                this.flippedCards = [];
                this.isLocked = false;
                // Notify UI via state update or generic event
                document.dispatchEvent(new CustomEvent('flipBack', {
                    detail: { cards: [card1.id, card2.id] }
                }));
            }, 1000);
        }

        return {
            match: match,
            cards: [card1, card2],
            gameOver: this.gameOver
        };
    }

    getState() {
        return {
            cards: this.cards,
            moves: this.moves,
            time: this.time,
            gameOver: this.gameOver,
            gridSize: this.gridSize
        };
    }
}
