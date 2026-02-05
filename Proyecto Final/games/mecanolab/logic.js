export class GameLogic {
    constructor() {
        this.phrases = [
            "No habéis programado ni una puta línea de código",
            "The quick brown fox jumps over the lazy dog",
            "To be or not to be that is the question",
            "All that glitters is not gold",
            "Action speaks louder than words",
            "Knowledge is power but enthusiasm pulls the switch",
            "Fortune favors the bold",
            "Practice makes perfect",
            "A journey of a thousand miles begins with a single step",
            "Where there is a will there is a way",
            "Keep your friends close and your enemies closer",
            "Life is what happens when you are busy making other plans",
            "You miss one hundred percent of the shots you dont take",
            "Simplicity is the ultimate sophistication",
            "Stay hungry stay foolish",
            "May the force be with you"

        ];

        this.lives = 3;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.completionCount = 0;
        this.targetCount = 5;
        this.currentPhrase = "";
        this.inputIndex = 0; // Tracks correct chars typed
        this.timerInterval = null;
    }

    reset() {
        this.lives = 3;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.completionCount = 0;
        this.inputIndex = 0;
    }

    start(callbacks) {
        this.reset();
        this.callbacks = callbacks || {};
        this.isPlaying = true;
        this.nextPhrase();

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
            if (this.callbacks.onTick) this.callbacks.onTick(this.timeLeft);
        }, 1000);

        if (this.callbacks.onStart) this.callbacks.onStart(this.getState());
    }

    nextPhrase() {
        const randomIndex = Math.floor(Math.random() * this.phrases.length);
        this.currentPhrase = this.phrases[randomIndex];
        this.inputIndex = 0;
        if (this.callbacks.onNewPhrase) this.callbacks.onNewPhrase(this.currentPhrase);
    }

    handleInput(char) {
        if (!this.isPlaying) return;

        // Ignore modifier keys or non-printable chars (mostly handled by caller)
        if (char.length !== 1) return;

        const targetChar = this.currentPhrase[this.inputIndex];

        // Case sensitive matching? Usually typing tests are.
        // Let's be strict.
        if (char === targetChar) {
            this.inputIndex++;
            if (this.callbacks.onCorrectInput) this.callbacks.onCorrectInput(this.currentPhrase.substring(0, this.inputIndex));

            // Check completion
            if (this.inputIndex >= this.currentPhrase.length) {
                this.completionCount++;
                if (this.completionCount >= this.targetCount) {
                    this.endGame(true);
                } else {
                    this.nextPhrase();
                    if (this.callbacks.onProgress) this.callbacks.onProgress(this.completionCount, this.targetCount);
                }
            }
        } else {
            // Mistake
            this.lives--;
            this.inputIndex = 0; // Reset phrase
            if (this.callbacks.onMistake) this.callbacks.onMistake(this.lives);
            if (this.callbacks.onCorrectInput) this.callbacks.onCorrectInput(""); // Clear visible input

            if (this.lives <= 0) {
                this.endGame(false);
            }
        }
    }

    endGame(isWin) {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        if (this.callbacks.onGameOver) this.callbacks.onGameOver(isWin);
    }

    getState() {
        return {
            lives: this.lives,
            timeLeft: this.timeLeft,
            progress: this.completionCount
        };
    }
}
