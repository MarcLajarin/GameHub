export class GameUI {
    constructor() {
        this.startScreen = document.getElementById('start-screen');
        this.endScreen = document.getElementById('end-screen');
        this.targetTextEl = document.getElementById('target-text');
        this.userInputEl = document.getElementById('user-input');
        this.livesEl = document.getElementById('lives');
        this.timeEl = document.getElementById('time');
        this.progressEl = document.getElementById('progress');
        this.paperSheet = document.querySelector('.paper-sheet');

        document.getElementById('start-btn').addEventListener('click', () => {
            document.dispatchEvent(new Event('gameStart'));
        });
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.dispatchEvent(new Event('gameStart'));
        });
    }

    reset() {
        this.startScreen.style.display = 'none';
        this.endScreen.style.display = 'none';
        this.userInputEl.textContent = '';
        this.livesEl.textContent = '❤️❤️❤️';
        this.progressEl.textContent = '0/5';
        this.timeEl.textContent = '60';
    }

    setPhrase(phrase) {
        this.targetTextEl.textContent = phrase;
        this.userInputEl.textContent = '';
        // Add fade in animation?
        this.targetTextEl.style.opacity = '0';
        setTimeout(() => this.targetTextEl.style.opacity = '1', 100);
    }

    updateInput(text) {
        this.userInputEl.textContent = text;
    }

    shakePaper() {
        this.paperSheet.classList.remove('shake');
        void this.paperSheet.offsetWidth; // Trigger reflow
        this.paperSheet.classList.add('shake');

        // Visual feedback for error on blackboard?
        this.targetTextEl.style.color = '#ff6b6b';
        setTimeout(() => this.targetTextEl.style.color = '#f7fff7', 300);
    }

    updateStats(lives, time, currentProgress, maxProgress) {
        let hearts = '';
        for (let i = 0; i < lives; i++) hearts += '❤️';
        this.livesEl.textContent = hearts;

        if (time !== undefined) this.timeEl.textContent = time;
        if (currentProgress !== undefined) this.progressEl.textContent = `${currentProgress}/${maxProgress}`;
    }

    showGameOver(isWin) {
        this.endScreen.style.display = 'flex';
        const title = document.getElementById('end-title');
        const msg = document.getElementById('end-message');

        if (isWin) {
            title.textContent = 'A+ EXCELLENT WORK';
            title.style.color = '#4ade80';
            msg.textContent = 'You passed the typing test!';
        } else {
            title.textContent = 'F - SEE ME AFTER CLASS';
            title.style.color = '#ef4444';
            msg.textContent = 'Don\'t give up, try again.';
        }
    }
}
