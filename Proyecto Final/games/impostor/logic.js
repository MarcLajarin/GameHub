export class ImpostorGame {
    constructor() {
        this.players = [];
        this.tasks = [];
        this.gameState = 'playing'; // playing, voting, won, lost
        this.myRole = null; // 'crewmate' or 'impostor'
        this.killCooldown = 0;
        this.meetingCooldown = 0;
        this.mapWidth = 1600;
        this.mapHeight = 1200;
    }

    init() {
        this.gameState = 'playing';
        // Colors for 9 players
        const colors = [
            '#ff0055', '#00f3ff', '#00ff88', '#ffff00',
            '#aa00ff', '#ff8800', '#ffffff', '#888888', '#5500ff'
        ];
        const names = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'White', 'Grey', 'Indigo'];

        this.players = [];

        // Player 0 is User
        this.players.push({
            id: 0,
            color: colors[0],
            x: 800, y: 600,
            role: null,
            isDead: false,
            isUser: true,
            name: 'YOU'
        });

        // Generate 8 Bots
        for (let i = 1; i < 9; i++) {
            this.players.push({
                id: i,
                color: colors[i],
                x: Math.random() * this.mapWidth,
                y: Math.random() * this.mapHeight,
                role: 'crewmate', // Default, changed below
                isDead: false,
                isUser: false,
                name: names[i],
                taskTarget: null
            });
        }

        // Assign Roles randomly
        // 2 Impostors for 9 players balance? Or just 1? 
        // User asked for "like the impostor game", usually 2 impostors for 10 players.
        // Let's stick to 2 Impostors total.

        let impostorCount = 0;

        // Chance for user to be Impostor (2/9 chance approx)
        if (Math.random() < 0.22) {
            this.players[0].role = 'impostor';
            this.myRole = 'impostor';
            impostorCount++;
        } else {
            this.players[0].role = 'crewmate';
            this.myRole = 'crewmate';
        }

        // Assign remaining Impostors to bots
        const bots = this.players.filter(p => !p.isUser);

        while (impostorCount < 2) {
            const randomBot = bots[Math.floor(Math.random() * bots.length)];
            if (randomBot.role !== 'impostor') {
                randomBot.role = 'impostor';
                impostorCount++;
            }
        }

        this.generateTasks();
    }

    generateTasks() {
        // Generate 20 tasks spread across the large map
        this.tasks = [];
        for (let i = 0; i < 20; i++) {
            this.tasks.push({
                id: i,
                x: 100 + Math.random() * (this.mapWidth - 200),
                y: 100 + Math.random() * (this.mapHeight - 200),
                completed: false
            });
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Move Bots
        this.players.forEach(p => {
            if (!p.isUser && !p.isDead) this.moveBot(p);
        });

        this.checkWinCondition();
    }

    checkWinCondition() {
        const deadCrew = this.players.filter(p => p.role === 'crewmate' && p.isDead).length;
        const totalCrew = this.players.filter(p => p.role === 'crewmate').length;
        const activeImpostors = this.players.filter(p => p.role === 'impostor' && !p.isDead).length;

        // Impostors Win: Impostors >= Crewmates (standard rule)
        const livingCrew = totalCrew - deadCrew;

        if (activeImpostors === 0) {
            this.gameState = 'won_crew';
            if (this.myRole === 'crewmate' && window.ArcadeAuth) window.ArcadeAuth.addPoints(7);
        } else if (activeImpostors >= livingCrew) {
            this.gameState = 'won_impostor';
            if (this.myRole === 'impostor' && window.ArcadeAuth) window.ArcadeAuth.addPoints(7);
        }

        // Tasks Win
        const tasksDone = this.tasks.filter(t => t.completed).length;
        if (tasksDone === this.tasks.length) {
            this.gameState = 'won_crew';
            if (this.myRole === 'crewmate' && window.ArcadeAuth) window.ArcadeAuth.addPoints(7);
        }
    }

    moveBot(bot) {
        // Simple AI: Move to random task location
        if (!bot.taskTarget) {
            const target = this.tasks[Math.floor(Math.random() * this.tasks.length)];
            bot.taskTarget = { x: target.x, y: target.y };
        }

        const dx = bot.taskTarget.x - bot.x;
        const dy = bot.taskTarget.y - bot.y;
        const dist = Math.hypot(dx, dy);
        const speed = 2.5;

        if (dist > 5) {
            bot.x += (dx / dist) * speed;
            bot.y += (dy / dist) * speed;
        } else {
            if (Math.random() < 0.01) {
                bot.taskTarget = null;
            }
        }

        // Impostor Kill Logic
        if (bot.role === 'impostor') {
            this.players.forEach(target => {
                if (target !== bot && !target.isDead && target.role !== 'impostor') {
                    const d = Math.hypot(target.x - bot.x, target.y - bot.y);
                    if (d < 30) {
                        // Kill cooldown simulated by low chance
                        if (Math.random() < 0.05) {
                            target.isDead = true;
                            // console.log(`${bot.name} killed ${target.name}`);
                        }
                    }
                }
            });
        }
    }

    movePlayer(dx, dy) {
        if (this.players[0].isDead) return;
        this.players[0].x += dx * 5;
        this.players[0].y += dy * 5;

        // Bounds
        this.players[0].x = Math.max(20, Math.min(this.mapWidth - 20, this.players[0].x));
        this.players[0].y = Math.max(20, Math.min(this.mapHeight - 20, this.players[0].y));
    }

    interact() {
        if (this.players[0].isDead) return;

        // Kill (if Impostor)
        if (this.myRole === 'impostor') {
            let killTarget = null;
            let minDist = 60; // Range

            this.players.forEach(p => {
                if (p !== this.players[0] && !p.isDead && p.role !== 'impostor') {
                    const d = Math.hypot(p.x - this.players[0].x, p.y - this.players[0].y);
                    if (d < minDist) {
                        minDist = d;
                        killTarget = p;
                    }
                }
            });

            if (killTarget) {
                killTarget.isDead = true;
            }
        } else {
            // Do Task
            this.tasks.forEach(t => {
                if (!t.completed) {
                    const d = Math.hypot(t.x - this.players[0].x, t.y - this.players[0].y);
                    if (d < 50) {
                        t.completed = true;
                    }
                }
            });
        }
    }

    getState() {
        return {
            players: this.players,
            tasks: this.tasks,
            gameState: this.gameState,
            myRole: this.myRole,
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight
        };
    }
}
