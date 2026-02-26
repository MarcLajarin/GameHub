/**
 * Modular Authentication System V5 - Gamification Edition
 * 
 * FEATURES:
 * - Registration, Login, Local DB
 * - User Avatar & Dropdown with Points Display
 * - History Tracking
 * - Profile Dashboard
 * - POINTS SYSTEM (Global API: window.ArcadeAuth.addPoints)
 * - Toast Notifications
 */

class AuthSystem {
    constructor() {
        this.sessionKey = 'arcade_user_session';
        this.dbKey = 'arcade_users_db';

        // Expose Global API for Games
        window.ArcadeAuth = {
            addPoints: (amount) => this.addPoints(amount),
            getUser: () => this.getSession()
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // No longer injecting styles or header controls
        this.injectModals();
        this.bindStaticHeaderControls();
        this.attachGameInterceptors();
        this.checkSession();

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            // Note: We don't have a dropdown in the new static design yet, 
            // but if we add one for the avatar, this is where we'd handle it.
            // For now, avatar just opens dashboard.
        });
    }

    bindStaticHeaderControls() {
        // Guest Controls
        const guestLoginBtn = document.getElementById('header-login-btn');
        const guestRegBtn = document.getElementById('header-reg-btn');

        // User Controls
        const avatarBtn = document.getElementById('nav-user-btn');

        if (guestLoginBtn) {
            guestLoginBtn.onclick = (e) => {
                e.preventDefault();
                this.openModal('login');
            };
        }

        if (guestRegBtn) {
            guestRegBtn.onclick = (e) => {
                e.preventDefault();
                this.openModal('register');
            };
        }

        if (avatarBtn) {
            avatarBtn.onclick = (e) => {
                e.preventDefault();
                this.openDashboard();
            };
        }
    }

    injectModals() {
        // Check if already injected
        if (document.getElementById('authOverlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'auth-modal-overlay';
        overlay.id = 'authOverlay';

        // Login Modal
        const loginM = `<div class="auth-modal" id="modal-login">
            <button class="close-modal-btn">&times;</button>
            <h2>Player Login</h2>
            <div class="auth-form-group"><input type="text" id="loginUser" placeholder="Username or Email"></div>
            <div class="auth-form-group"><input type="password" id="loginPass" placeholder="Password"></div>
            <button class="submit-btn" id="doLoginBtn">Connect</button>
            <div style="margin-top:10px; font-size: 0.8rem; color: #aaa;">Don't have an account? <a href="#" id="switchToReg" style="color:var(--accent-cyan);">Register</a></div>
            <div class="auth-error" id="loginError"></div>
        </div>`;

        // Register Modal
        const regM = `<div class="auth-modal" id="modal-register">
            <button class="close-modal-btn">&times;</button>
            <h2>New Profile</h2>
            <div class="auth-form-group"><input type="text" id="regName" placeholder="Name"></div>
            <div class="auth-form-group"><input type="text" id="regSurname" placeholder="Surnames"></div>
            <div class="auth-form-group"><input type="tel" id="regPhone" placeholder="Phone Number"></div>
            <div class="auth-form-group"><input type="email" id="regEmail" placeholder="Gmail Address"></div>
            <div class="auth-form-group"><input type="text" id="regUser" placeholder="Username"></div>
            <div class="auth-form-group"><input type="password" id="regPass" placeholder="Password"></div>
            <div class="auth-form-group"><input type="password" id="regConfirm" placeholder="Confirm Password"></div>
            <button class="submit-btn" id="doRegBtn">Initialize</button>
            <div class="auth-error" id="regError"></div>
        </div>`;

        // Dashboard Modal (Simplified for now)
        const dashM = `<div class="auth-modal" id="modal-dashboard" style="max-width: 500px;">
            <button class="close-modal-btn">&times;</button>
            <h2>Agent Dashboard</h2>
            
            <div class="user-avatar-small" style="margin: 0 auto 10px auto; width: 80px; height: 80px; font-size: 2rem;">
                <span>👤</span>
            </div>
            <h3 id="dashUsername" style="color: var(--accent-cyan); margin-bottom: 5px;">User</h3>
            <div style="color: white; font-family: var(--font-display); margin-bottom: 20px; font-size: 1.2rem;">
                <span id="dashPoints">0</span> XP
            </div>

            <h4 style="color: var(--text-secondary); margin-bottom: 10px; text-align:left;">Recent History</h4>
            <ul id="recentGamesList" style="text-align:left; max-height: 200px; overflow-y: auto; list-style:none; margin-bottom:20px;">
                <!-- Dynamic Items -->
            </ul>

            <button class="submit-btn" id="logoutActionBtn" style="background: transparent; border: 1px solid #ff0055; color: #ff0055;">Logout System</button>
            <button class="submit-btn" id="logoutActionBtn" style="background: transparent; border: 1px solid #ff0055; color: #ff0055;">Logout System</button>
        </div>`;

        overlay.innerHTML = loginM + regM + dashM;
        document.body.appendChild(overlay);

        this.bindModalEvents(overlay);
    }

    bindModalEvents(overlay) {
        overlay.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = () => this.closeAllModals());
        overlay.onclick = (e) => { if (e.target === overlay) this.closeAllModals(); };

        document.getElementById('doLoginBtn').onclick = () => this.performLogin();
        document.getElementById('doRegBtn').onclick = () => this.performRegister();

        // Link to switch to register
        const switchBtn = document.getElementById('switchToReg');
        if (switchBtn) switchBtn.onclick = (e) => { e.preventDefault(); this.openModal('register'); };


        // Locked Modal Actions
        const goToLogin = document.getElementById('goToLoginBtn');
        if (goToLogin) goToLogin.onclick = () => this.openModal('login');

        const lockedToReg = document.getElementById('lockedToReg');
        if (lockedToReg) lockedToReg.onclick = (e) => { e.preventDefault(); this.openModal('register'); };

        document.getElementById('logoutActionBtn').onclick = () => {
            this.logout();
            this.closeAllModals();
        };

        ['loginUser', 'loginPass'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => { if (e.key === 'Enter') this.performLogin(); });
        });
        ['regName', 'regSurname', 'regPhone', 'regEmail', 'regUser', 'regPass', 'regConfirm'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => { if (e.key === 'Enter') this.performRegister(); });
        });
    }

    attachGameInterceptors() {
        const cards = document.querySelectorAll('.game-card');

        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const href = card.getAttribute('href');
                if (!href || href === '#' || href.startsWith('javascript')) return;

                const user = this.getSession();

                if (!user) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    this.showToast("⚠️ Login required to play");
                    return false;
                }

                const title = card.querySelector('.game-title')?.innerText || 'Unknown Game';
                this.addToHistory(user, title, href);
            }, true);
        });
    }

    // --- LOGIC ---

    getSession() { return localStorage.getItem(this.sessionKey); }

    async checkSession() {
        const user = this.getSession();
        this.updateUI(user);
    }

    async addToHistory(username, gameTitle, gameUrl) {
        try {
            await fetch('user_api.php?action=addHistory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: username, title: gameTitle, url: gameUrl })
            });
        } catch (e) {
            console.error("History sync failed", e);
        }
    }

    async addPoints(amount) {
        const user = this.getSession();
        if (!user) return;

        try {
            const resp = await fetch('user_api.php?action=addPoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: user, amount: amount })
            });
            const result = await resp.json();
            if (result.success) {
                // Update UI points locally if possible or just refresh
                this.updateUI(user);
                this.showToast(`+${amount} XP Earned!`);
            }
        } catch (e) {
            this.showToast("⚠️ Points sync failed");
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'arcade-toast';
        toast.innerHTML = `<span>💎</span> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('remove'), 2000);
        setTimeout(() => toast.remove(), 2600);
    }

    async openDashboard() {
        const user = this.getSession();
        if (!user) return;

        this.openModal('dashboard');

        try {
            // Fetch history from DB
            const resp = await fetch(`user_api.php?action=getHistory&usuario=${user}`);
            const result = await resp.json();

            document.getElementById('dashUsername').textContent = user;
            // Note: We might want a dedicated getProfile for points, but for now we update it on login
            // For now, let's just use the history to demonstrate DB connectivity

            const history = result.history || [];
            const listContainer = document.getElementById('recentGamesList');
            listContainer.innerHTML = '';

            if (history.length === 0) {
                listContainer.innerHTML = '<li style="color: #666; font-style: italic;">No games played yet.</li>';
            } else {
                history.forEach(game => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '10px';
                    li.style.background = 'rgba(255,255,255,0.05)';
                    li.style.padding = '10px';
                    li.style.borderRadius = '5px';
                    li.innerHTML = `
                        <div style="color:var(--accent-cyan); font-weight:bold;">${game.title}</div>
                        <div style="color:#666; font-size:0.8rem;">${game.date}</div>
                    `;
                    listContainer.appendChild(li);
                });
            }
        } catch (e) {
            console.error("Dashboard load failed", e);
        }
    }

    openModal(type) {
        const overlay = document.getElementById('authOverlay');
        const loginM = document.getElementById('modal-login');
        const regM = document.getElementById('modal-register');
        const dashM = document.getElementById('modal-dashboard');

        if (!overlay) return;

        document.querySelectorAll('.auth-error').forEach(e => e.textContent = '');
        document.querySelectorAll('.auth-modal input').forEach(i => i.value = '');

        overlay.classList.add('active');
        [loginM, regM, dashM].forEach(m => { if (m) m.classList.remove('active'); });

        if (type === 'login') {
            loginM.classList.add('active');
            setTimeout(() => document.getElementById('loginUser')?.focus(), 100);
        } else if (type === 'register') {
            regM.classList.add('active');
            setTimeout(() => document.getElementById('regUser')?.focus(), 100);
        } else if (type === 'dashboard') {
            dashM.classList.add('active');
        }
    }

    closeAllModals() {
        const overlay = document.getElementById('authOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    async performRegister() {
        const data = {
            nombre: document.getElementById('regName').value.trim(),
            apellidos: document.getElementById('regSurname').value.trim(),
            telefono: document.getElementById('regPhone').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            usuario: document.getElementById('regUser').value.trim(),
            password: document.getElementById('regPass').value,
            confirm: document.getElementById('regConfirm').value
        };
        const error = document.getElementById('regError');

        if (!data.nombre || !data.usuario || !data.password) {
            error.textContent = "Required fields missing.";
            return;
        }
        if (data.password !== data.confirm) { error.textContent = "Passwords mismatch."; return; }

        try {
            const resp = await fetch('auth_api.php?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await resp.json();

            if (result.success) {
                localStorage.setItem(this.sessionKey, data.usuario);
                this.updateUI(data.usuario);
                this.closeAllModals();
            } else {
                error.textContent = result.message;
            }
        } catch (e) {
            error.textContent = "Network error.";
        }
    }

    async performLogin() {
        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value;
        const error = document.getElementById('loginError');

        try {
            const resp = await fetch('auth_api.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: user, password: pass })
            });
            const result = await resp.json();

            if (result.success) {
                localStorage.setItem(this.sessionKey, result.user.usuario);
                this.updateUI(result.user.usuario);
                this.closeAllModals();
            } else {
                error.textContent = result.message;
            }
        } catch (e) {
            error.textContent = "Network error.";
        }
    }

    logout() {
        localStorage.removeItem(this.sessionKey);
        this.updateUI(null);
    }

    updateUI(username) {
        const guestControls = document.getElementById('guest-controls');
        const loggedInControls = document.getElementById('logged-in-controls');
        const pointsDisplay = document.getElementById('static-points-display');

        if (!guestControls || !loggedInControls) return;

        if (username) {
            guestControls.style.display = 'none';
            loggedInControls.style.display = 'flex';
            // Points are fetched on login or addPoints, for a full refresh we'd need a getProfile
            if (pointsDisplay && localStorage.getItem('arcade_points')) {
                pointsDisplay.textContent = `${localStorage.getItem('arcade_points')} pts`;
            }
        } else {
            guestControls.style.display = 'flex';
            loggedInControls.style.display = 'none';
        }
    }
}

new AuthSystem();
