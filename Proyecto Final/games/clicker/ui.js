export class ClickerUI {
    constructor(game) {
        this.game = game;

        // DOM Elements
        this.bitDisplay = document.getElementById('bit-count');
        this.bpsDisplay = document.getElementById('bps-count');
        this.clickButton = document.getElementById('main-button');
        this.shopContainer = document.getElementById('shop-items');
        this.particleContainer = document.getElementById('particle-container');

        this.bindEvents();
        this.renderShop();
    }

    bindEvents() {
        this.clickButton.addEventListener('mousedown', (e) => {
            const result = this.game.click();
            this.updateDisplay();
            this.spawnFloatingText(e.clientX, e.clientY, `+${Math.floor(result.added)}`);
            this.spawnParticles(e.clientX, e.clientY);

            // Visual press effect
            this.clickButton.style.transform = 'scale(0.95)';
        });

        this.clickButton.addEventListener('mouseup', () => {
            this.clickButton.style.transform = 'scale(1)';
        });
    }

    renderShop() {
        this.shopContainer.innerHTML = '';
        this.game.upgrades.forEach(upgrade => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.id = `upgrade-${upgrade.id}`;
            item.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${upgrade.name}</span>
                    <span class="item-cost">${upgrade.cost} Bits</span>
                </div>
                <div class="item-stats">
                    <span class="item-count">Owned: ${upgrade.count}</span>
                    <span class="item-power">+${upgrade.auto}/s</span>
                </div>
            `;
            item.addEventListener('click', () => {
                if (this.game.buyUpgrade(upgrade.id)) {
                    this.renderShop(); // Re-render to update costs
                    this.updateDisplay();
                }
            });
            this.shopContainer.appendChild(item);
        });
    }

    updateDisplay() {
        const state = this.game.getState();
        this.bitDisplay.textContent = state.bits.toLocaleString();
        this.bpsDisplay.textContent = state.autoClickPower.toFixed(1);

        // Update shop visuals (gray out unaffordable)
        this.game.upgrades.forEach(upgrade => {
            const el = document.getElementById(`upgrade-${upgrade.id}`);
            if (el) {
                if (state.bits >= upgrade.cost) {
                    el.classList.remove('disabled');
                } else {
                    el.classList.add('disabled');
                }
            }
        });
    }

    spawnFloatingText(x, y, text) {
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);

        // Animate (simple css animation triggers via class)
        // Cleanup after animation
        setTimeout(() => el.remove(), 1000);
    }

    spawnParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;

            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 50 + 20;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);

            this.particleContainer.appendChild(p);
            setTimeout(() => p.remove(), 600);
        }
    }
}
