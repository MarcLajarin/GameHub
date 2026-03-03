export class ClickerGame {
    constructor() {
        this.bits = 0;
        this.clickPower = 1;
        this.autoClickPower = 0;

        this.upgrades = [
            { id: 'cursor', name: 'Auto Cursor', cost: 15, auto: 0.5, count: 0 },
            { id: 'gpu', name: 'GPU Miner', cost: 100, auto: 4, count: 0 },
            { id: 'server', name: 'Data Server', cost: 500, auto: 20, count: 0 },
            { id: 'quantum', name: 'Quantum CPU', cost: 2000, auto: 100, count: 0 }
        ];

        this.lastTime = 0;
        this.accumulatedFraction = 0;
        this.difficulty = 'medium';
    }

    setDifficulty(diff) {
        this.difficulty = diff;
    }

    getMultiplier() {
        if (this.difficulty === 'easy') return 2;
        if (this.difficulty === 'hard') return 0.5;
        return 1;
    }

    click() {
        const added = this.clickPower * this.getMultiplier();
        this.bits += added;
        return { bits: this.bits, added: added };
    }

    buyUpgrade(id) {
        const upgrade = this.upgrades.find(u => u.id === id);
        if (upgrade && this.bits >= upgrade.cost) {
            this.bits -= upgrade.cost;
            upgrade.count++;
            this.autoClickPower += upgrade.auto;
            upgrade.cost = Math.ceil(upgrade.cost * 1.15);
            return true;
        }
        return false;
    }

    update(deltaTime) {
        // Add auto generated bits
        const generated = this.autoClickPower * deltaTime * this.getMultiplier();
        this.bits += generated;

        return { bits: this.bits };
    }

    getState() {
        return {
            bits: Math.floor(this.bits),
            clickPower: this.clickPower * this.getMultiplier(),
            autoClickPower: this.autoClickPower * this.getMultiplier(),
            upgrades: this.upgrades
        };
    }
}
