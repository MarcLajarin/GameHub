export class ImpostorUI {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.roleDisplay = document.getElementById('role-display');
        this.statusDisplay = document.getElementById('game-status');
        this.endScreen = document.getElementById('end-screen');
        this.endMessage = document.getElementById('end-message');
        this.restartBtn = document.getElementById('restart-btn');

        this.keys = {};

        // Canvas Size (Viewport)
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.bindEvents();
        this.restart();
    }

    restart() {
        this.game.init();
        this.endScreen.style.display = 'none';

        // Show Role
        const role = this.game.myRole.toUpperCase();
        this.roleDisplay.textContent = `ROLE: ${role}`;
        this.roleDisplay.style.color = this.game.myRole === 'impostor' ? '#ff0055' : '#00f3ff';

        this.statusDisplay.textContent = "TASKS REMAINING";

        this.loop();
    }

    bindEvents() {
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);

        window.addEventListener('keydown', e => {
            if (e.code === 'Space') {
                this.game.interact();
            }
        });

        this.restartBtn.addEventListener('click', () => {
            this.restart();
        });
    }

    loop() {
        // Input
        let dx = 0, dy = 0;
        if (this.keys['w'] || this.keys['ArrowUp']) dy = -1;
        if (this.keys['s'] || this.keys['ArrowDown']) dy = 1;
        if (this.keys['a'] || this.keys['ArrowLeft']) dx = -1;
        if (this.keys['d'] || this.keys['ArrowRight']) dx = 1;

        if (dx || dy) this.game.movePlayer(dx, dy);

        // Update Game
        this.game.update();

        const state = this.game.getState();
        if (state.gameState.startsWith('won') || state.gameState.startsWith('lost')) {
            this.showEndGame(state);
            this.render(); // One last render
            return; // Stop loop
        }

        // Render
        this.render();

        requestAnimationFrame(() => this.loop());
    }

    render() {
        const state = this.game.getState();
        const ctx = this.ctx;
        const myP = state.players[0];

        // Clear Screen
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Camera Logic
        ctx.save();

        // Center camera on player
        let camX = myP.x - this.canvas.width / 2;
        let camY = myP.y - this.canvas.height / 2;

        // Clamp Camera to Map Bounds
        camX = Math.max(0, Math.min(camX, state.mapWidth - this.canvas.width));
        camY = Math.max(0, Math.min(camY, state.mapHeight - this.canvas.height));

        ctx.translate(-camX, -camY);

        // Draw Map Boundary
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, state.mapWidth, state.mapHeight);

        // Grid/Floor (World Space)
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        for (let i = 0; i < state.mapWidth; i += 100) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, state.mapHeight); ctx.stroke();
        }
        for (let j = 0; j < state.mapHeight; j += 100) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(state.mapWidth, j); ctx.stroke();
        }

        // Tasks
        state.tasks.forEach(t => {
            ctx.fillStyle = t.completed ? '#00ff00' : '#ffff00';
            ctx.shadowBlur = 10;
            ctx.shadowColor = t.completed ? '#00ff00' : '#ffff00';
            ctx.fillRect(t.x - 15, t.y - 15, 30, 30);
            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '12px Arial';
            ctx.fillText('TASK', t.x - 15, t.y - 20);
        });

        // Players
        state.players.forEach(p => {
            if (p.isDead) {
                // Dead body
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y + 10, 20, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#aa0000'; // Bone
                ctx.fillRect(p.x - 3, p.y + 5, 6, 12);
            } else {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath();
                ctx.ellipse(p.x, p.y + 15, 12, 6, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = p.color;
                // Body
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, 15, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                // Visor
                ctx.fillStyle = '#00f3ff';
                ctx.beginPath();
                ctx.ellipse(p.x + 5, p.y - 5, 8, 5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Name
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(p.name, p.x, p.y - 25);
            }
        });

        ctx.restore(); // End Camera Transform

        // UI Layer (No Camera)
        // Vignette
        if (!myP.isDead) {
            const grad = ctx.createRadialGradient(400, 300, 150, 400, 300, 400);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.9)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 800, 600);
        } else {
            // Ghost view filter
            ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
            ctx.fillRect(0, 0, 800, 600);
        }
    }

    showEndGame(state) {
        this.endScreen.style.display = 'flex';

        let msg = "";
        let color = "";

        if (state.gameState === 'won_crew') {
            msg = "CREWMATES WIN";
            color = "#00f3ff";
        } else if (state.gameState === 'won_impostor') {
            msg = "IMPOSTORS WIN";
            color = "#ff0055";
        }

        if (state.gameState === 'won_crew' && this.game.myRole === 'crewmate') {
            msg += " (VICTORY)";
        } else if (state.gameState === 'won_impostor' && this.game.myRole === 'impostor') {
            msg += " (VICTORY)";
        } else {
            msg += " (DEFEAT)";
        }

        this.endMessage.textContent = msg;
        this.endMessage.style.color = color;
    }
}
