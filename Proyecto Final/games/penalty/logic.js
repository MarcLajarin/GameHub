export class PenaltyGame {
    constructor() {
        this.playerScore = 0;
        this.cpuScore = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.gameOver = false;
        this.history = [];
    }

    shoot(direction) {
        if (this.gameOver) return this.getState();

        // 6 Zones: TL, TC, TR, BL, BC, BR (Top/Bottom - Left/Center/Right)
        const zones = ['TL', 'TC', 'TR', 'BL', 'BC', 'BR'];
        const goalieDirection = zones[Math.floor(Math.random() * zones.length)];

        // Win logic: Goal if player zone != goalie zone
        const isGoal = direction !== goalieDirection;

        if (isGoal) {
            this.playerScore++;
            this.history.push('goal');
        } else {
            // CPU scores if it saves the ball
            this.cpuScore++;
            this.history.push('miss');
        }

        // Removed random CPU turn. CPU score now reflects Saves.

        this.round++;

        if (this.round > this.maxRounds) {
            this.gameOver = true;
            if (this.playerScore > this.cpuScore && window.ArcadeAuth) window.ArcadeAuth.addPoints(7);
        }

        return {
            isGoal,
            direction,
            goalieDirection,
            playerScore: this.playerScore,
            cpuScore: this.cpuScore,
            gameOver: this.gameOver
        };
    }

    reset() {
        this.playerScore = 0;
        this.cpuScore = 0;
        this.round = 1;
        this.gameOver = false;
        this.history = [];
    }

    getState() {
        return {
            playerScore: this.playerScore,
            cpuScore: this.cpuScore,
            round: this.round,
            gameOver: this.gameOver
        };
    }
}
