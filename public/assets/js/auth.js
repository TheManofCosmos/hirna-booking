/**
 * Authentication & Role-Based Access Control (RBAC) Module
 * Handles SuperAdmin, Dispatch, Finance, and CRM sessions + SSO Tokens
 */
const AuthModule = {
    // Allowed Accounts: superadmin, admin, and passenger
    defaultAccounts: [
        {
            email: "edgaradovas50@gmail.com",
            password: "superadmin",
            pin: "1234",
            name: "Edgar Adovas (SuperAdmin)",
            role: "superadmin",
            roleTitle: "SuperAdmin (Full Access & Role Control)",
            badgeClass: "bg-gold-500 text-hirna-950 font-black",
            avatar: "EA"
        },
        {
            email: "superadmin@hirna.ph",
            password: "superadmin",
            pin: null,
            name: "SuperAdmin Hirna",
            role: "superadmin",
            roleTitle: "SuperAdmin (Full Access)",
            badgeClass: "bg-gold-500 text-hirna-950 font-black",
            avatar: "SA"
        },
        {
            email: "admin@hirna.ph",
            password: "admin",
            pin: null,
            name: "Operations Admin",
            role: "admin",
            roleTitle: "Operations Administrator",
            badgeClass: "bg-blue-600 text-white",
            avatar: "AD"
        },
        {
            email: "adovasjayvincent@gmail.com",
            password: "admin",
            pin: null,
            name: "Jay Vincent Adovas",
            role: "admin",
            roleTitle: "Operations Administrator",
            badgeClass: "bg-blue-600 text-white",
            avatar: "JV"
        },
        {
            email: "passenger@hirna.ph",
            password: "passenger",
            pin: null,
            name: "Verified Passenger",
            role: "passenger",
            roleTitle: "Verified Passenger",
            badgeClass: "bg-emerald-600 text-white",
            avatar: "PA"
        },
        {
            email: "customer@hirna.ph",
            password: "passenger",
            pin: null,
            name: "Verified Passenger",
            role: "passenger",
            roleTitle: "Verified Passenger",
            badgeClass: "bg-emerald-600 text-white",
            avatar: "PA"
        }
    ],

    get accounts() {
        try {
            const saved = localStorage.getItem('hirna_custom_accounts');
            let list = JSON.parse(JSON.stringify(this.defaultAccounts));
            if (saved) {
                let parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    parsed.forEach(p => {
                        const cleanP = { ...p, email: (p.email || '').trim().toLowerCase() };
                        const idx = list.findIndex(d => d.email.toLowerCase() === cleanP.email);
                        if (idx >= 0) {
                            list[idx] = { ...list[idx], ...cleanP };
                        } else {
                            list.push(cleanP);
                        }
                    });
                }
            }
            return list.map(acc => {
                if (acc.role === 'customer') {
                    acc.role = 'passenger';
                    acc.roleTitle = 'Verified Passenger';
                    if (acc.password === 'customer') acc.password = 'passenger';
                    if (acc.email === 'customer@hirna.ph') acc.email = 'passenger@hirna.ph';
                }
                if (acc.pin === "1234") {
                    acc.pin = null;
                }
                acc.email = (acc.email || '').trim().toLowerCase();
                acc.password = (acc.password || '').trim();
                return acc;
            });
        } catch (e) {}
        return this.defaultAccounts;
    },

    saveAccounts(newList) {
        localStorage.setItem('hirna_custom_accounts', JSON.stringify(newList));
        try {
            window.dispatchEvent(new CustomEvent('hirna:accounts_updated', { detail: newList }));
        } catch(e) {}
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const bc = new BroadcastChannel('hirna_sync');
                bc.postMessage({ type: 'ACCOUNTS_UPDATE', accounts: newList });
            } catch(e) {}
        }
    },

    addOrUpdateAccount(accountData) {
        const cleanEmail = (accountData.email || '').trim().toLowerCase();
        const cleanPassword = (accountData.password || '').trim();
        const cleanData = {
            ...accountData,
            email: cleanEmail,
            password: cleanPassword,
            pin: accountData.pin ? String(accountData.pin).trim() : null
        };
        let current = [...this.accounts];
        const idx = current.findIndex(a => a.email.toLowerCase() === cleanEmail);
        if (idx >= 0) {
            current[idx] = { ...current[idx], ...cleanData };
        } else {
            current.push(cleanData);
        }
        this.saveAccounts(current);
        return current;
    },

    setAccountPin(email, newPin) {
        const cleanEmail = (email || '').trim().toLowerCase();
        let current = [...this.accounts];
        const idx = current.findIndex(a => a.email.toLowerCase() === cleanEmail);
        if (idx === -1) {
            return { success: false, message: "Account not found." };
        }
        current[idx].pin = newPin ? String(newPin).trim() : null;
        this.saveAccounts(current);
        
        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("Authentication", "PIN_UPDATE_SUCCESS", cleanEmail, cleanEmail, {
                target_user: cleanEmail,
                timestamp: new Date().toISOString()
            });
        }
        return { success: true, message: `4-Digit PIN updated successfully for ${cleanEmail}` };
    },

    deleteAccount(email) {
        const cleanEmail = (email || '').trim().toLowerCase();
        let current = this.accounts.filter(a => a.email.toLowerCase() !== cleanEmail);
        this.saveAccounts(current);
        return current;
    },

    isSuperAdmin() {
        return !!(this.currentUser && this.currentUser.role === 'superadmin');
    },

    isAdmin() {
        return !!(this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'superadmin'));
    },

    isPassenger() {
        return !!(this.currentUser && this.currentUser.role === 'passenger');
    },

    canEditPasswords() {
        return this.isSuperAdmin();
    },

    canDeleteRecords() {
        return this.isSuperAdmin();
    },

    canManageAccounts() {
        return this.isSuperAdmin();
    },

    updatePassword(email, newPassword) {
        if (!this.canEditPasswords()) {
            return { success: false, message: "Permission Denied: Only SuperAdmin can modify account passwords." };
        }
        return this.resetPassword(email, newPassword);
    },

    resetPassword(email, newPassword) {
        let current = [...this.accounts];
        const idx = current.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
        if (idx === -1) {
            return { success: false, message: "Account not found." };
        }
        current[idx].password = newPassword;
        this.saveAccounts(current);
        
        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("Authentication", "PASSWORD_RESET_SUCCESS", email, email, {
                target_user: email,
                timestamp: new Date().toISOString()
            });
        }
        return { success: true, message: `Password reset successfully for ${email}` };
    },

    currentUser: null,

    init() {
        this.loadSession();
        this.bindEvents();
        this.updateUI();
        this.bindGlobalListeners();
    },

    loadSession() {
        // Hydrate from localStorage or sessionStorage for permanent persistence
        const saved = localStorage.getItem('hirna_auth_user') || sessionStorage.getItem('hirna_auth_user');
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
                if (this.currentUser && this.currentUser.role === 'customer') {
                    this.currentUser.role = 'passenger';
                    this.currentUser.roleTitle = 'Verified Passenger';
                    localStorage.setItem('hirna_auth_user', JSON.stringify(this.currentUser));
                    sessionStorage.setItem('hirna_auth_user', JSON.stringify(this.currentUser));
                }
            } catch (e) {
                this.currentUser = null;
            }
        } else {
            this.currentUser = null;
        }
        
        const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
        const filename = path.split('/').pop() || '';
        const isLoginPage = filename === 'login.html' || filename === 'login' || path === '' || path === '/';
        const isPassengerPage = filename === 'passenger.html' || filename === 'passenger';

        // If not logged in and not on login page, redirect to login.html
        if (!this.currentUser && !isLoginPage) {
            window.location.replace('login.html');
            return;
        }

        // If passenger attempts to access admin portal pages, redirect to passenger.html
        if (this.currentUser && this.currentUser.role === 'passenger') {
            if (!isPassengerPage && !isLoginPage) {
                window.location.replace('passenger.html');
                return;
            }
        }
    },

    login(email, password) {
        const user = this.accounts.find(a => 
            a.email.toLowerCase() === email.toLowerCase() && 
            a.password === password
        );
        
        if (!user) {
            return { 
                success: false, 
                message: "Access restricted. Only superadmin, admin, and passenger accounts are permitted, and credentials must match." 
            };
        }

        this.setSession(user);
        return { success: true, user };
    },

    setSession(user, rememberMe = false) {
        this.currentUser = user;
        // Always save in sessionStorage for the active session
        sessionStorage.setItem('hirna_auth_user', JSON.stringify(user));
        if (rememberMe) {
            localStorage.setItem('hirna_auth_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('hirna_auth_user');
        }
        
        // Log to immutable Audit System
        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("Authentication", "ADMIN_LOGIN_SUCCESS", user.email, user.name, {
                role: user.role,
                remember_device: !!rememberMe,
                session_token: `JWT_SSO_${Date.now()}`
            });
        }

        this.updateUI();
        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`Welcome back, ${user.name}! Authenticated as ${user.roleTitle}`, 'success');
        }
    },

    logout() {
        this.confirmLogout();
    },

    confirmLogout() {
        this.closeDropdown();
        const modal = document.getElementById('logout-confirm-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            if (window.confirm("Are you sure you want to log out?")) {
                this.proceedLogout();
            }
        }
    },

    cancelLogout() {
        const modal = document.getElementById('logout-confirm-modal');
        if (modal) modal.classList.add('hidden');
    },

    proceedLogout() {
        const modal = document.getElementById('logout-confirm-modal');
        if (modal) modal.classList.add('hidden');

        if (this.currentUser && typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("Authentication", "ADMIN_LOGOUT", this.currentUser.email, this.currentUser.name, {});
        }
        this.currentUser = null;
        sessionStorage.removeItem('hirna_auth_user');
        localStorage.removeItem('hirna_auth_user');
        
        // Redirect to login page
        window.location.replace('login.html');
    },

    toggleDropdown(e) {
        if (e) e.stopPropagation();
        const menu = document.getElementById('profile-dropdown-menu');
        const chevron = document.getElementById('profile-chevron');
        if (menu) {
            const isHidden = menu.classList.toggle('hidden');
            if (chevron) {
                chevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }
    },

    closeDropdown() {
        const menu = document.getElementById('profile-dropdown-menu');
        const chevron = document.getElementById('profile-chevron');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
    },

    bindGlobalListeners() {
        document.addEventListener('click', (e) => {
            const profileContainer = document.getElementById('header-user-profile');
            if (profileContainer && !profileContainer.contains(e.target)) {
                this.closeDropdown();
            }
        });
    },

    updateUI() {
        const profileContainer = document.getElementById('header-user-profile');
        const adminBannerName = document.getElementById('banner-admin-name');
        const superadminGateTab = document.getElementById('tab-btn-sso-gateway');

        if (this.currentUser) {
            if (profileContainer) {
                profileContainer.innerHTML = `
                    <div class="relative">
                        <button id="profile-dropdown-btn" onclick="AuthModule.toggleDropdown(event)" class="flex items-center space-x-2.5 bg-hirna-900/90 hover:bg-hirna-900 px-3.5 py-1.5 rounded-xl border border-hirna-700/80 shadow-md transition transform hover:scale-[1.02] focus:outline-none cursor-pointer">
                            <div class="w-7 h-7 rounded-full bg-gold-500 text-hirna-950 flex items-center justify-center font-black text-xs shadow">
                                ${this.currentUser.avatar || 'SA'}
                            </div>
                            <div class="text-left hidden sm:block">
                                <span class="text-xs font-bold text-white block leading-tight">${this.currentUser.name}</span>
                                <span class="text-[9px] text-gold-300 font-medium block">${this.currentUser.roleTitle}</span>
                            </div>
                            <svg class="w-3 h-3 text-slate-400 ml-1 transition-transform duration-200" id="profile-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>

                        <!-- Sleek Dropdown Menu -->
                        <div id="profile-dropdown-menu" class="hidden absolute right-0 mt-2 w-64 bg-slate-900/95 border border-hirna-700/80 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden divide-y divide-slate-800">
                            <!-- User Info Header in Dropdown -->
                            <div class="p-3.5 bg-gradient-to-r from-hirna-950 to-slate-900">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-xl bg-gold-500 text-hirna-950 flex items-center justify-center font-black text-sm shadow">
                                        ${this.currentUser.avatar || 'SA'}
                                    </div>
                                    <div class="overflow-hidden">
                                        <p class="text-xs font-black text-white truncate">${this.currentUser.name}</p>
                                        <p class="text-[11px] text-slate-400 truncate">${this.currentUser.email || this.currentUser.phone || 'admin@hirna.ph'}</p>
                                        <span class="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-bold ${this.currentUser.badgeClass || 'bg-gold-500 text-hirna-950'}">
                                            ${this.currentUser.roleTitle}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Dropdown Quick Actions -->
                            <div class="p-1.5 space-y-1">
                                <a href="login.html" class="w-full px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-hirna-900/80 rounded-xl transition flex items-center space-x-2">
                                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg><span>Switch Account</span>
                                </a>
                            </div>

                            <!-- Logout Action (Red / Rose) -->
                            <div class="p-1.5 bg-slate-950/50">
                                <button onclick="AuthModule.logout()" class="w-full px-3 py-2.5 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-700 rounded-xl transition flex items-center space-x-2 group">
                                    <svg class="w-3.5 h-3.5 text-rose-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (adminBannerName) {
                adminBannerName.innerText = `Signed in as ${this.currentUser.name}`;
            }

            // Unhide SuperAdmin Subsystem Switcher if SuperAdmin
            if (superadminGateTab) {
                if (this.currentUser.role === 'superadmin') {
                    superadminGateTab.classList.remove('hidden');
                } else {
                    superadminGateTab.classList.add('hidden');
                }
            }
        } else {
            if (profileContainer) {
                profileContainer.innerHTML = `
                    <a href="login.html" class="px-3.5 py-1.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-hirna-950 text-xs font-black rounded-xl shadow-md transition flex items-center space-x-1.5 transform hover:scale-105">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg><span>Sign In</span>
                    </a>
                `;
            }
            if (adminBannerName) {
                adminBannerName.innerText = `Not Signed In • Please authenticate to access Hirna Administrative Controls`;
            }
        }

        // Sync Hirna App button state
        if (typeof HirnaAppBridge !== 'undefined' && HirnaAppBridge.updateButtons) {
            HirnaAppBridge.updateButtons();
        }

        // Sync Hirna Wallet role visibility & amount displays
        if (typeof HirnaWallet !== 'undefined' && HirnaWallet.updateUI) {
            HirnaWallet.updateUI();
        }
    },

    bindEvents() {
        // Modal forms removed in favor of standalone login.html
    },

    quickDemoLogin(roleKey) {
        const user = this.accounts.find(a => a.role === roleKey) || this.accounts[0];
        this.setSession(user);
    }
};

// Auto-run on DOM load
window.addEventListener('DOMContentLoaded', () => {
    AuthModule.init();
});

// Multi-Tab Accounts & Session Synchronization
if (typeof BroadcastChannel !== 'undefined') {
    try {
        const authBc = new BroadcastChannel('hirna_sync');
        authBc.onmessage = (event) => {
            const data = event.data;
            if (!data) return;
            if (data.type === 'ACCOUNTS_UPDATE') {
                if (typeof SSOGateway !== 'undefined' && SSOGateway.renderAccountsTable) {
                    SSOGateway.renderAccountsTable();
                }
            } else if (data.type === 'SESSION_UPDATE') {
                AuthModule.loadSession();
                AuthModule.updateUI();
            }
        };
    } catch(e) {}
}

window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === 'hirna_custom_accounts') {
        if (typeof SSOGateway !== 'undefined' && SSOGateway.renderAccountsTable) {
            SSOGateway.renderAccountsTable();
        }
        try {
            window.dispatchEvent(new CustomEvent('hirna:accounts_updated'));
        } catch(err) {}
    } else if (e.key === 'hirna_auth_user') {
        AuthModule.loadSession();
        AuthModule.updateUI();
    }
});

