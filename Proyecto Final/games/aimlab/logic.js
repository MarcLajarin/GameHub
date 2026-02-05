export class GameLogic {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.targets = [];
        this.gameLoopInterval = null;
        this.spawnInterval = null;
        this.gameDuration = 60;
    }

    reset() {
        this.score = 0;
        this.timeLeft = this.gameDuration;
        this.targets = [];
        this.isPlaying = false;
    }

    start(callbacks) {
        this.reset();
        this.isPlaying = true;
        this.callbacks = callbacks || {};

        // Start timers
        this.gameLoopInterval = setInterval(() => this.update(), 100);
        this.startSpawning();

        if (this.callbacks.onStart) this.callbacks.onStart();
        if (this.callbacks.onUpdate) this.callbacks.onUpdate(this.getState());
    }

    stop() {
        this.isPlaying = false;
        clearInterval(this.gameLoopInterval);
        clearTimeout(this.spawnInterval);
        if (this.callbacks.onGameOver) this.callbacks.onGameOver(this.score);
    }

    update() {
        if (!this.isPlaying) return;

        // Decrease time (update runs every 0.1s, but we decrement integer seconds for display)
        // Actually, let's just use Date.now() for accurate timing in a real engine, 
        // but for this simple arcade, checking every 1000ms via a separate interval or accumulating delta is better.
        // Let's simplify:
    }

    // Called every second by the main loop/timer
    decrementTime() {
        if (!this.isPlaying) return;
        this.timeLeft--;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.stop();
        }
        if (this.callbacks.onUpdate) this.callbacks.onUpdate(this.getState());
    }

    startSpawning() {
        if (!this.isPlaying) return;

        // Base speed modifiers
        const difficulty = localStorage.getItem('arcadeDifficulty') || 'standard';
        let baseDelay = 1000;
        let minDelay = 400;
        let speedMultiplier = 10;

        switch (difficulty) {
            case 'easy':
                baseDelay = 1500;
                minDelay = 800;
                speedMultiplier = 5;
                break;
            case 'standard':
            case 'normal':
                baseDelay = 1000;
                minDelay = 400;
                speedMultiplier = 10;
                break;
            case 'hard':
                baseDelay = 700;
                minDelay = 300;
                speedMultiplier = 15;
                break;
            case 'extreme':
                baseDelay = 500;
                minDelay = 150;
                speedMultiplier = 20;
                break;
        }

        const spawnDelay = Math.max(minDelay, baseDelay - (this.score * speedMultiplier)); // Speed up as score increases

        this.spawnInterval = setTimeout(() => {
            this.spawnTarget();
            this.startSpawning(); // Schedule next spawn
        }, spawnDelay);
    }

    spawnTarget() {
        const id = Date.now() + Math.random().toString();
        // Random position percentage (10% to 90% to avoid edges)
        const x = 10 + Math.random() * 80;
        const y = 10 + Math.random() * 80;

        const target = { id, x, y };
        this.targets.push(target);

        if (this.callbacks.onSpawn) this.callbacks.onSpawn(target);
    }

    handleHit(targetId) {
        if (!this.isPlaying) return;

        const index = this.targets.findIndex(t => t.id === targetId);
        if (index !== -1) {
            this.targets.splice(index, 1);
            this.score++;
            if (this.callbacks.onHit) this.callbacks.onHit(targetId);
            if (this.callbacks.onUpdate) this.callbacks.onUpdate(this.getState());
        }
    }

    getState() {
        return {
            score: this.score,
            timeLeft: this.timeLeft,
            isPlaying: this.isPlaying
        };
    }
}
