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
        this.notifKey = 'arcade_notifications';
        this.sessionKey = 'arcade_session';

        // Expose Global API for Games
        window.ArcadeAuth = {
            addPoints: (amount) => this.addPoints(amount),
            getUser: () => this.getSession(),
            addNotification: (text, type) => this.addNotification(text, type),
            showGameOverModal: (options) => this.showGameOverModal(options)
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
                console.log("🎮 ArcadeAuth System V3.0 Initialized");
            });
        } else {
            this.init();
            console.log("🎮 ArcadeAuth System V3.0 Initialized");
        }
    }

    init() {
        this.injectStyles();
        
        // Only inject modals and header controls if we are NOT in a game subfolder
        const isGamePage = window.location.pathname.includes('/games/');
        
        if (!isGamePage) {
            this.injectModals();
            this.bindStaticHeaderControls();
            this.attachGameInterceptors();
        }
        
        this.checkSession();
        this.renderNotifications();

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const notifDropdown = document.getElementById('notification-dropdown');
            const notifBtn = document.getElementById('notification-bell');
            if (notifDropdown && notifDropdown.classList.contains('show')) {
                if (notifBtn && !notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
                    notifDropdown.classList.remove('show');
                }
            }
        });
    }

    bindStaticHeaderControls() {
        // Guest Controls
        const guestLoginBtn = document.getElementById('header-login-btn');
        const guestRegBtn = document.getElementById('header-reg-btn');

        // User Controls
        const avatarBtn = document.getElementById('nav-user-btn');
        const notifBtn = document.getElementById('notification-bell');
        const notifDropdown = document.getElementById('notification-dropdown');

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

        if (notifBtn && notifDropdown) {
            notifBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                notifDropdown.classList.toggle('show');
                
                // Mark all as read when opening
                if (notifDropdown.classList.contains('show')) {
                    this.markAllAsRead();
                }
            });

            notifDropdown.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que se cierre al clickear dentro
            });
        }
    }

    markAllAsRead() {
        const notifs = this.getNotifications();
        notifs.forEach(n => n.unread = false);
        localStorage.setItem(this.notifKey, JSON.stringify(notifs));
        setTimeout(() => this.renderNotifications(), 500); // Delay to let user see unread state briefly
    }

    injectStyles() {
        if (document.getElementById('arcade-auth-styles')) return;
        const style = document.createElement('style');
        style.id = 'arcade-auth-styles';
        style.textContent = `
            /* --- MODALES ARCADE --- */
            .auth-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(10px);
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .auth-overlay.active { display: flex; opacity: 1; }
            .auth-modal {
                background: #0a0a16;
                border: 1px solid var(--accent-cyan, #00f3ff);
                padding: 40px;
                border-radius: 20px;
                width: 90%;
                max-width: 400px;
                position: relative;
                box-shadow: 0 0 30px rgba(0, 243, 255, 0.2);
                text-align: center;
                display: none;
            }
            .auth-modal.active { display: block; animation: modalIn 0.3s ease; }
            @keyframes modalIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

            .auth-form-group { margin-bottom: 20px; }
            .auth-form-group input {
                width: 100%;
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                color: white;
                outline: none;
            }
            .auth-form-group input:focus { border-color: var(--accent-cyan, #00f3ff); }
            .submit-btn {
                width: 100%;
                padding: 14px;
                background: var(--accent-cyan, #00f3ff);
                border: none;
                border-radius: 8px;
                color: black;
                font-family: 'Orbitron', 'Inter', sans-serif;
                font-weight: 700;
                cursor: pointer;
                text-transform: uppercase;
                transition: 0.3s;
            }
            .submit-btn:hover { box-shadow: 0 0 20px rgba(0, 243, 255, 0.6); transform: translateY(-2px); }
            .close-modal-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: #555;
                font-size: 1.5rem;
                cursor: pointer;
            }
            .close-modal-btn:hover { color: white; }
            .auth-error { color: #ff0055; margin-top: 15px; font-size: 0.8rem; display: none; }
            
            /* --- TOAST --- */
            .arcade-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 243, 255, 0.1);
                border: 1px solid var(--accent-cyan, #00f3ff);
                color: white;
                padding: 12px 24px;
                border-radius: 30px;
                backdrop-filter: blur(10px);
                z-index: 11000;
                font-size: 0.9rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                animation: toastIn 0.5s ease forwards;
            }
            @keyframes toastIn { from { bottom: -50px; opacity: 0; } to { bottom: 30px; opacity: 1; } }

            /* --- GAME OVER WHISPER --- */
            .game-over-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.9);
                backdrop-filter: blur(15px);
                z-index: 12000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                animation: fadeIn 0.5s ease forwards;
            }
            .game-over-modal {
                background: rgba(10, 10, 22, 0.95);
                border: 1px solid var(--accent-cyan, #00f3ff);
                padding: 50px;
                border-radius: 24px;
                text-align: center;
                box-shadow: 0 0 50px rgba(0, 243, 255, 0.2);
                max-width: 450px;
                width: 90%;
            }
            .game-over-title {
                font-family: 'Orbitron', sans-serif;
                color: var(--accent-cyan, #00f3ff);
                font-size: 2.5rem;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 4px;
            }
            .game-over-msg {
                color: white;
                font-size: 1.1rem;
                margin-bottom: 30px;
                opacity: 0.8;
                font-family: 'Inter', sans-serif;
            }
            .game-over-actions {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `;
        document.head.appendChild(style);
    }

    injectModals() {
        if (document.getElementById('modal-login')) return;
        const overlay = document.createElement('div');
        overlay.className = 'auth-overlay';
        overlay.id = 'auth-overlay';

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

        // Dashboard Modal
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

            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="submit-btn" id="viewProfileBtn" style="background: #007bff; border: 1px solid #007bff; color: #fff; flex: 1;">Ver Perfil</button>
                <button class="submit-btn" id="logoutActionBtn" style="background: transparent; border: 1px solid #ff0055; color: #ff0055; flex: 1;">Logout System</button>
            </div>
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

        document.getElementById('viewProfileBtn').onclick = () => {
            this.closeAllModals();
            window.location.href = 'profile.html';
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

    showGameOverModal(options = {}) {
        const { title = 'Game Over', message = '', onPlayAgain = null } = options;
        
        // Add notification automatically
        const gameTitle = document.title.split('|')[0].trim();
        this.addNotification(`¡Has completado ${gameTitle}! ${message}`);

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-modal">
                <h1 class="game-over-title">${title}</h1>
                <p class="game-over-msg">${message}</p>
                <div class="game-over-actions">
                    <button class="submit-btn" id="gameOverPlayAgain">Play Again</button>
                    <button class="submit-btn" id="gameOverReturn" style="background: transparent; border: 1px solid #555; color: #fff;">Return to Menu</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('gameOverPlayAgain').onclick = () => {
            overlay.remove();
            if (onPlayAgain) onPlayAgain();
            else window.location.reload();
        };

        document.getElementById('gameOverReturn').onclick = () => {
            window.location.href = '../../index.php';
        };
    }

    getApiPath() {
        return window.location.pathname.includes('/games/') ? '../../user_api.php' : 'user_api.php';
    }

    // --- LOGIC ---

    getSession() { return localStorage.getItem(this.sessionKey); }

    async checkSession() {
        const user = this.getSession();
        this.updateUI(user);
    }

    async addToHistory(username, gameTitle, gameUrl) {
        try {
            await fetch(`${this.getApiPath()}?action=addHistory`, {
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
            const resp = await fetch(`${this.getApiPath()}?action=addPoints`, {
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

    addNotification(text, type = 'game') {
        const notifs = this.getNotifications();
        const newNotif = {
            id: Date.now(),
            text: text,
            type: type,
            time: 'Just now',
            unread: true
        };
        notifs.unshift(newNotif);
        localStorage.setItem(this.notifKey, JSON.stringify(notifs.slice(0, 10))); // Keep last 10
        this.renderNotifications();
        this.showToast(`🔔 ${text}`);
    }

    getNotifications() {
        const data = localStorage.getItem(this.notifKey);
        return data ? JSON.parse(data) : [];
    }

    renderNotifications() {
        const container = document.querySelector('.notification-list');
        const badge = document.getElementById('notif-badge');
        if (!container) return;

        const notifs = this.getNotifications();
        container.innerHTML = '';

        if (notifs.length === 0) {
            container.innerHTML = '<div class="notification-empty" style="padding: 20px; text-align: center; color: #666; font-style: italic;">No new notifications</div>';
        } else {
            notifs.forEach(n => {
                const item = document.createElement('div');
                item.className = `notification-item ${n.unread ? 'unread' : ''}`;
                item.innerHTML = `
                    <div class="notification-icon">${n.type === 'game' ? '🎮' : '👤'}</div>
                    <div class="notification-content">
                        <p class="notification-text">${n.text}</p>
                        <span class="notification-time">${n.time}</span>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        const unreadCount = notifs.filter(n => n.unread).length;
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
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
