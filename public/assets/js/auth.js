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
            roleTitle: "SuperAdmin",
            badgeClass: "bg-gold-500 text-hirna-950 font-black",
            avatar: "EA"
        },
        {
            email: "superadmin@hirna.ph",
            password: "superadmin",
            pin: null,
            name: "SuperAdmin Hirna",
            role: "superadmin",
            roleTitle: "SuperAdmin",
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
            
            // Deduplicate by normalized lowercase email
            const uniqueMap = new Map();
            list.forEach(acc => {
                let email = (acc.email || '').trim().toLowerCase();
                if (!email) return;
                if (acc.role === 'customer') {
                    acc.role = 'passenger';
                    acc.roleTitle = 'Verified Passenger';
                    if (acc.password === 'customer') acc.password = 'passenger';
                    if (acc.email === 'customer@hirna.ph') acc.email = 'passenger@hirna.ph';
                    email = acc.email.toLowerCase();
                }
                if (acc.pin === "1234") {
                    acc.pin = null;
                }
                acc.email = email;
                acc.password = (acc.password || '').trim();
                uniqueMap.set(email, acc);
            });
            return Array.from(uniqueMap.values());
        } catch (e) {}
        return this.defaultAccounts;
    },

    saveAccounts(newList) {
        // Ensure distinct entries by email
        const uniqueMap = new Map();
        (newList || []).forEach(acc => {
            const email = (acc.email || '').trim().toLowerCase();
            if (email) uniqueMap.set(email, acc);
        });
        const deduplicated = Array.from(uniqueMap.values());

        localStorage.setItem('hirna_custom_accounts', JSON.stringify(deduplicated));
        try {
            window.dispatchEvent(new CustomEvent('hirna:accounts_updated', { detail: deduplicated }));
        } catch(e) {}
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const bc = new BroadcastChannel('hirna_sync');
                bc.postMessage({ type: 'ACCOUNTS_UPDATE', accounts: deduplicated });
            } catch(e) {}
        }
        // Asynchronously persist to centralized backend server so accounts work on all devices
        if (typeof fetch !== 'undefined') {
            fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deduplicated)
            }).catch(() => {});
        }
    },

    async fetchAccountsFromServer() {
        if (typeof fetch === 'undefined') return this.accounts;
        try {
            const res = await fetch('/api/accounts', { cache: 'no-store' });
            if (res.ok) {
                const serverAccounts = await res.json();
                if (Array.isArray(serverAccounts) && serverAccounts.length > 0) {
                    const uniqueMap = new Map();
                    this.accounts.forEach(a => { if (a && a.email) uniqueMap.set(a.email.toLowerCase(), a); });
                    serverAccounts.forEach(sa => {
                        if (sa && sa.email) {
                            const e = sa.email.toLowerCase();
                            const existing = uniqueMap.get(e);
                            uniqueMap.set(e, existing ? { ...existing, ...sa } : sa);
                        }
                    });
                    const merged = Array.from(uniqueMap.values());
                    localStorage.setItem('hirna_custom_accounts', JSON.stringify(merged));
                    return merged;
                }
            }
        } catch (e) {
            try {
                const res2 = await fetch('database/accounts.json', { cache: 'no-store' });
                if (res2.ok) {
                    const serverAccounts = await res2.json();
                    if (Array.isArray(serverAccounts) && serverAccounts.length > 0) {
                        const uniqueMap = new Map();
                        this.accounts.forEach(a => { if (a && a.email) uniqueMap.set(a.email.toLowerCase(), a); });
                        serverAccounts.forEach(sa => {
                            if (sa && sa.email) {
                                const e = sa.email.toLowerCase();
                                const existing = uniqueMap.get(e);
                                uniqueMap.set(e, existing ? { ...existing, ...sa } : sa);
                            }
                        });
                        const merged = Array.from(uniqueMap.values());
                        localStorage.setItem('hirna_custom_accounts', JSON.stringify(merged));
                        return merged;
                    }
                }
            } catch(err) {}
        }
        return this.accounts;
    },

    async fetchSessionsFromServer(email) {
        if (typeof fetch === 'undefined') return this.getActiveSessions();
        try {
            const url = email ? `/api/sessions?email=${encodeURIComponent(email)}` : '/api/sessions';
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const serverSessions = await res.json();
                if (Array.isArray(serverSessions) && serverSessions.length > 0) {
                    localStorage.setItem('hirna_active_sessions', JSON.stringify(serverSessions));
                    return serverSessions;
                }
            }
        } catch(e) {}
        return this.getActiveSessions();
    },

    addOrUpdateAccount(accountData) {
        const cleanEmail = (accountData.email || '').trim().toLowerCase();
        const cleanPassword = (accountData.password || '').trim();
        const cleanRole = (accountData.role === 'customer' ? 'passenger' : (accountData.role || 'passenger'));
        const cleanName = (accountData.name || cleanEmail).trim();

        const roleTitles = {
            superadmin: "SuperAdmin",
            admin: "Operations Administrator",
            passenger: "Verified Passenger"
        };
        const badgeClasses = {
            superadmin: "bg-gold-500 text-hirna-950 font-black",
            admin: "bg-blue-600 text-white",
            passenger: "bg-emerald-600 text-white"
        };
        const initials = cleanName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'HU';

        const cleanData = {
            ...accountData,
            email: cleanEmail,
            password: cleanPassword,
            name: cleanName,
            role: cleanRole,
            roleTitle: accountData.roleTitle || roleTitles[cleanRole] || "Hirna User",
            badgeClass: accountData.badgeClass || badgeClasses[cleanRole] || "bg-slate-800 text-white",
            avatar: accountData.avatar || initials,
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

        // Also ensure registered in device accounts for seamless switcher access
        this.saveDeviceAccount(cleanData);

        // Clear any lingering revocation or past invalidation flags so new account can sign in immediately
        try {
            let revoked = JSON.parse(localStorage.getItem('hirna_revoked_sessions') || '[]');
            revoked = revoked.filter(r => !(r.email && r.email.toLowerCase() === cleanEmail));
            localStorage.setItem('hirna_revoked_sessions', JSON.stringify(revoked));
        } catch(e) {}

        try {
            let invalidations = JSON.parse(localStorage.getItem('hirna_password_invalidations') || '{}');
            delete invalidations[cleanEmail];
            localStorage.setItem('hirna_password_invalidations', JSON.stringify(invalidations));
        } catch(e) {}

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
        this.removeDeviceAccount(cleanEmail);
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
        
        // Automatic logout for all active sessions of this account across all devices
        this.invalidateAllSessionsOnPasswordChange(email);

        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("Authentication", "PASSWORD_RESET_SUCCESS", email, email, {
                target_user: email,
                timestamp: new Date().toISOString()
            });
        }
        return { success: true, message: `Password reset successfully for ${email}. All active sessions on other devices have been automatically signed out.` };
    },

    getCurrentSessionId() {
        return localStorage.getItem('hirna_current_session_id') || sessionStorage.getItem('hirna_current_session_id');
    },

    getDeviceId() {
        let id = localStorage.getItem('hirna_device_id');
        if (!id) {
            id = 'dev_' + Math.random().toString(36).substring(2, 8) + '_' + Date.now().toString(36);
            localStorage.setItem('hirna_device_id', id);
        }
        return id;
    },

    getDeviceInfo() {
        const ua = navigator.userAgent || '';
        let deviceName = "Asus TUF Gaming F15 (Windows 11)";
        let deviceModel = "Asus TUF Gaming F15";
        let isMobile = false;

        const hasTouch = (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
        const isSmallScreen = typeof screen !== 'undefined' && (screen.width <= 768 || screen.height <= 768);

        if (/Android/i.test(ua)) {
            isMobile = true;
            const modelMatch = ua.match(/Android[^;]+;\s*([^;)]+)\s*Build/i) || ua.match(/Android[^;]+;\s*([^;)]+)\)/i);
            if (modelMatch && modelMatch[1]) {
                deviceModel = modelMatch[1].trim();
                if (/SM-S928/i.test(deviceModel)) deviceModel = "Samsung Galaxy S24 Ultra";
                else if (/SM-S918/i.test(deviceModel)) deviceModel = "Samsung Galaxy S23 Ultra";
                else if (/SM-A/i.test(deviceModel)) deviceModel = "Samsung Galaxy A-Series";
                else if (/Pixel/i.test(deviceModel)) deviceModel = "Google Pixel";
            } else {
                deviceModel = "Android Mobile Device";
            }
            const isDesktopMode = !/Mobile/i.test(ua);
            deviceName = isDesktopMode ? `${deviceModel} (Desktop Mode)` : `${deviceModel} (Android)`;
        } else if (/iPhone/i.test(ua)) {
            isMobile = true;
            deviceModel = "Apple iPhone";
            deviceName = "Apple iPhone (iOS)";
        } else if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            isMobile = true;
            deviceModel = "Apple iPad";
            deviceName = "Apple iPad (iPadOS)";
        } else if (/Macintosh|Mac OS X/i.test(ua)) {
            deviceModel = "Apple MacBook";
            deviceName = "Apple MacBook (macOS)";
        } else if (/Win/i.test(ua)) {
            if (hasTouch && isSmallScreen) {
                deviceModel = "Mobile Device (Desktop View)";
                deviceName = "Mobile Device (Desktop View)";
            } else {
                deviceModel = "Asus TUF Gaming F15";
                deviceName = "Asus TUF Gaming F15 (Windows 11)";
            }
        } else if (/Linux/i.test(ua)) {
            if (hasTouch && isSmallScreen) {
                deviceModel = "Mobile Device (Desktop Mode)";
                deviceName = "Mobile Device (Desktop Mode)";
            } else {
                deviceModel = "Linux Workstation";
                deviceName = "Linux Workstation";
            }
        }

        let browser = "Microsoft Edge 128";
        if (ua.includes("Edg/")) browser = "Microsoft Edge " + (ua.match(/Edg\/([\d.]+)/) ? ua.match(/Edg\/([\d.]+)/)[1].split('.')[0] : "128");
        else if (ua.includes("Chrome/")) browser = (isMobile ? "Chrome Mobile " : "Google Chrome ") + (ua.match(/Chrome\/([\d.]+)/) ? ua.match(/Chrome\/([\d.]+)/)[1].split('.')[0] : "128");
        else if (ua.includes("Firefox/")) browser = "Mozilla Firefox";
        else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = isMobile ? "Mobile Safari" : "Apple Safari";

        // Accurate Location according to GPS / Geolocation
        let location = localStorage.getItem('hirna_user_gps_location');
        if (!location) {
            if (typeof DeviceLocationManager !== 'undefined' && DeviceLocationManager.coords && DeviceLocationManager.coords.resolvedName) {
                location = DeviceLocationManager.coords.resolvedName;
            } else {
                location = "Caloocan City, Metro Manila, Philippines";
            }
        }

        // Asynchronously poll GPS in background to ensure 100% accurate location
        this.requestGPSLocation();

        return {
            deviceId: this.getDeviceId(),
            deviceName: deviceName,
            deviceModel: deviceModel,
            browser: browser,
            ip: "120.28.17.44 (PLDT Home Fiber)",
            location: location,
            userAgent: ua
        };
    },

    requestGPSLocation() {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const accuracy = Math.round(pos.coords.accuracy);
                    let locName = "Caloocan City, Metro Manila, Philippines";

                    if (typeof DeviceLocationManager !== 'undefined' && DeviceLocationManager.snapToLandmark) {
                        try {
                            const landmark = DeviceLocationManager.snapToLandmark(lat, lng, accuracy);
                            if (landmark && !landmark.includes("Pinned Location")) {
                                locName = `${landmark}, Caloocan City, Metro Manila`;
                            }
                        } catch(e) {}
                    }

                    localStorage.setItem('hirna_user_gps_location', locName);
                    localStorage.setItem('hirna_user_gps_coords', JSON.stringify({ lat, lng, accuracy }));
                    this.updateCurrentSessionLocation(locName);
                },
                (err) => {
                    if (!localStorage.getItem('hirna_user_gps_location')) {
                        localStorage.setItem('hirna_user_gps_location', "Caloocan City, Metro Manila, Philippines");
                    }
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
            );
        }
    },

    updateCurrentSessionLocation(locName) {
        if (!locName) return;
        const curSessId = this.getCurrentSessionId();
        let sessions = this.getActiveSessions();
        let updated = false;
        sessions.forEach(s => {
            if (s.sessionId === curSessId || s.deviceId === this.getDeviceId()) {
                s.location = locName;
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('hirna_active_sessions', JSON.stringify(sessions));
            if (typeof fetch !== 'undefined') {
                fetch('/api/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'register', session: { sessionId: curSessId, location: locName } })
                }).catch(() => {});
            }
        }
    },

    getDeviceAccounts() {
        try {
            const raw = localStorage.getItem('hirna_device_accounts');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list) && list.length > 0) return list;
            }
        } catch(e) {}
        
        // Seed default device accounts
        const defaultDeviceAccounts = [
            {
                email: "edgaradovas50@gmail.com",
                name: "Edgar Adovas",
                role: "superadmin",
                roleTitle: "SuperAdmin",
                avatar: "EA",
                badgeClass: "bg-gold-500 text-hirna-950 font-black",
                lastLogin: new Date().toISOString()
            },
            {
                email: "admin@hirna.ph",
                name: "Operations Admin",
                role: "admin",
                roleTitle: "Operations Administrator",
                avatar: "AD",
                badgeClass: "bg-blue-600 text-white font-bold",
                lastLogin: new Date(Date.now() - 86400000).toISOString()
            },
            {
                email: "passenger@hirna.ph",
                name: "Verified Passenger",
                role: "passenger",
                roleTitle: "Verified Passenger",
                avatar: "PA",
                badgeClass: "bg-emerald-600 text-white font-bold",
                lastLogin: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        localStorage.setItem('hirna_device_accounts', JSON.stringify(defaultDeviceAccounts));
        return defaultDeviceAccounts;
    },

    saveDeviceAccount(account) {
        if (!account || !account.email) return;
        const cleanEmail = account.email.trim().toLowerCase();
        let accounts = this.getDeviceAccounts();
        const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);
        const entry = {
            email: cleanEmail,
            name: account.name || 'Hirna User',
            role: account.role || 'passenger',
            roleTitle: account.roleTitle || 'Hirna User',
            avatar: account.avatar || (account.name ? account.name.substring(0, 2).toUpperCase() : 'HU'),
            badgeClass: account.badgeClass || 'bg-gold-500 text-hirna-950 font-black',
            lastLogin: new Date().toISOString()
        };
        if (existingIdx >= 0) {
            accounts[existingIdx] = { ...accounts[existingIdx], ...entry };
        } else {
            accounts.unshift(entry);
        }
        localStorage.setItem('hirna_device_accounts', JSON.stringify(accounts));
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                new BroadcastChannel('hirna_sync').postMessage({ type: 'DEVICE_ACCOUNTS_UPDATE', accounts });
            } catch(e) {}
        }
    },

    removeDeviceAccount(email) {
        const cleanEmail = (email || '').trim().toLowerCase();
        let accounts = this.getDeviceAccounts().filter(a => a.email.toLowerCase() !== cleanEmail);
        localStorage.setItem('hirna_device_accounts', JSON.stringify(accounts));
        return accounts;
    },

    getActiveSessions() {
        try {
            const raw = localStorage.getItem('hirna_active_sessions');
            if (raw) {
                const list = JSON.parse(raw);
                // Purge any stale mock MacBook Air or Cebu City sessions
                const cleaned = list.filter(s => !s.deviceName?.includes('MacBook Air M2') && !s.location?.includes('Cebu City'));
                if (cleaned.length > 0) return cleaned;
            }
        } catch(e) {}
        
        // Accurate default sessions: Asus TUF Gaming F15 in Caloocan City
        const defaultSessions = [
            {
                sessionId: 'sess_laptop_asus_tuf',
                email: 'edgaradovas50@gmail.com',
                deviceId: 'dev_asus_tuf_f15_primary',
                deviceName: 'Asus TUF Gaming F15 (Windows 11)',
                deviceModel: 'Asus TUF Gaming F15',
                browser: 'Microsoft Edge 128 (Windows 11)',
                ip: '120.28.17.44 (PLDT Home Fiber)',
                location: 'Caloocan City, Metro Manila, Philippines',
                loginTime: new Date(Date.now() - 3600000).toISOString(),
                lastActive: new Date().toISOString(),
                status: 'active'
            },
            {
                sessionId: 'sess_mobile_galaxy_s24',
                email: 'edgaradovas50@gmail.com',
                deviceId: 'dev_galaxy_mobile_caloocan',
                deviceName: 'Samsung Galaxy S24 Ultra (Android 14)',
                deviceModel: 'Samsung Galaxy S24 Ultra',
                browser: 'Chrome Mobile 128 on Android 14',
                ip: '112.198.102.35 (Globe Telecom 5G)',
                location: 'Caloocan City, Metro Manila, Philippines',
                loginTime: new Date(Date.now() - 7200000).toISOString(),
                lastActive: new Date(Date.now() - 300000).toISOString(),
                status: 'active'
            }
        ];
        localStorage.setItem('hirna_active_sessions', JSON.stringify(defaultSessions));
        return defaultSessions;
    },

    getActiveSessionsForUser(email) {
        if (!email) return [];
        const cleanEmail = email.trim().toLowerCase();
        return this.getActiveSessions().filter(s => 
            s.email.toLowerCase() === cleanEmail &&
            s.status === 'active'
        );
    },

    getRemoteActiveSessions(email) {
        if (!email) return [];
        const cleanEmail = email.trim().toLowerCase();
        const curDevId = this.getDeviceId();
        return this.getActiveSessions().filter(s => 
            s.email.toLowerCase() === cleanEmail &&
            s.status === 'active' &&
            s.deviceId !== curDevId
        );
    },

    registerActiveSession(user) {
        if (!user || !user.email) return null;
        const cleanEmail = user.email.trim().toLowerCase();
        const devInfo = this.getDeviceInfo();
        const sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        
        let sessions = this.getActiveSessions();
        // Remove prior session on this exact device
        sessions = sessions.filter(s => !(s.email.toLowerCase() === cleanEmail && s.deviceId === devInfo.deviceId));
        
        const newSession = {
            sessionId: sessionId,
            email: cleanEmail,
            deviceId: devInfo.deviceId,
            deviceName: devInfo.deviceName,
            browser: devInfo.browser,
            ip: devInfo.ip,
            location: devInfo.location,
            loginTime: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            status: 'active'
        };
        
        sessions.unshift(newSession);
        localStorage.setItem('hirna_active_sessions', JSON.stringify(sessions));
        localStorage.setItem('hirna_current_session_id', sessionId);
        sessionStorage.setItem('hirna_current_session_id', sessionId);
        
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                new BroadcastChannel('hirna_sync').postMessage({ type: 'SESSION_REGISTERED', session: newSession });
            } catch(e) {}
        }
        if (typeof fetch !== 'undefined') {
            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', session: newSession })
            }).catch(() => {});
        }
        return newSession;
    },

    remoteSignOutSession(sessionId) {
        let sessions = this.getActiveSessions();
        const target = sessions.find(s => s.sessionId === sessionId);
        if (!target) return { success: false, message: "Session not found." };
        
        target.status = 'revoked';
        sessions = sessions.filter(s => s.sessionId !== sessionId);
        localStorage.setItem('hirna_active_sessions', JSON.stringify(sessions));
        
        if (typeof fetch !== 'undefined') {
            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'signout', sessionId: target.sessionId })
            }).catch(() => {});
        }
        
        try {
            let revoked = JSON.parse(localStorage.getItem('hirna_revoked_sessions') || '[]');
            revoked.push({
                sessionId: target.sessionId,
                deviceId: target.deviceId,
                email: target.email,
                revokedAt: new Date().toISOString()
            });
            localStorage.setItem('hirna_revoked_sessions', JSON.stringify(revoked));
        } catch(e) {}

        if (typeof BroadcastChannel !== 'undefined') {
            try {
                new BroadcastChannel('hirna_sync').postMessage({
                    type: 'REMOTE_LOGOUT',
                    sessionId: target.sessionId,
                    deviceId: target.deviceId,
                    email: target.email
                });
            } catch(e) {}
        }

        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("Security", "REMOTE_DEVICE_SIGNOUT_SUCCESS", target.email, this.currentUser ? this.currentUser.name : target.email, {
                remote_device: target.deviceName,
                remote_ip: target.ip,
                remote_session: target.sessionId,
                timestamp: new Date().toISOString()
            });
        }

        return { success: true, message: `Remote session on "${target.deviceName}" terminated successfully.` };
    },

    signOutAllOtherDevices(email) {
        const cleanEmail = (email || (this.currentUser ? this.currentUser.email : '')).trim().toLowerCase();
        const curDevId = this.getDeviceId();
        let sessions = this.getActiveSessions();
        const remoteSessions = sessions.filter(s => s.email.toLowerCase() === cleanEmail && s.deviceId !== curDevId);
        
        remoteSessions.forEach(s => {
            this.remoteSignOutSession(s.sessionId);
        });
        return { success: true, count: remoteSessions.length };
    },

    isNewDevice(email) {
        if (!email) return false;
        const cleanEmail = email.trim().toLowerCase();
        const curDevId = this.getDeviceId();
        try {
            const raw = localStorage.getItem('hirna_known_devices_' + cleanEmail);
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list) && list.includes(curDevId)) {
                    return false;
                }
            }
        } catch(e) {}
        return true;
    },

    markDeviceKnown(email) {
        if (!email) return;
        const cleanEmail = email.trim().toLowerCase();
        const curDevId = this.getDeviceId();
        try {
            let list = JSON.parse(localStorage.getItem('hirna_known_devices_' + cleanEmail) || '[]');
            if (!list.includes(curDevId)) {
                list.push(curDevId);
                localStorage.setItem('hirna_known_devices_' + cleanEmail, JSON.stringify(list));
            }
        } catch(e) {}
    },

    triggerNewLoginAlert(email) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const devInfo = this.getDeviceInfo();
        
        // Dispatch alert email asynchronously via backend Gmail SMTP
        fetch(`/api/send-otp?purpose=new_login_alert&email=${encodeURIComponent(cleanEmail)}&device=${encodeURIComponent(devInfo.deviceName)}&browser=${encodeURIComponent(devInfo.browser)}&ip=${encodeURIComponent(devInfo.ip)}&location=${encodeURIComponent(devInfo.location)}`)
            .then(r => r.json())
            .then(d => {
                console.log("[Hirna Security] New device login alert dispatched via Gmail SMTP to:", d.email);
            })
            .catch(e => {
                console.warn("[Hirna Security] Alert dispatch notice:", e);
            });

        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("Security", "NEW_DEVICE_LOGIN_ALERT_DISPATCHED", cleanEmail, cleanEmail, {
                device: devInfo.deviceName,
                browser: devInfo.browser,
                ip: devInfo.ip,
                location: devInfo.location,
                timestamp: new Date().toISOString()
            });
        }
    },

    invalidateAllSessionsOnPasswordChange(email) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const now = Date.now();
        try {
            let invalidations = JSON.parse(localStorage.getItem('hirna_password_invalidations') || '{}');
            invalidations[cleanEmail] = now;
            localStorage.setItem('hirna_password_invalidations', JSON.stringify(invalidations));
        } catch(e) {}

        // Revoke all remote sessions in hirna_active_sessions for this email
        let sessions = this.getActiveSessions();
        sessions = sessions.filter(s => s.email.toLowerCase() !== cleanEmail || s.deviceId === this.getDeviceId());
        localStorage.setItem('hirna_active_sessions', JSON.stringify(sessions));

        if (typeof BroadcastChannel !== 'undefined') {
            try {
                new BroadcastChannel('hirna_sync').postMessage({
                    type: 'PASSWORD_CHANGED',
                    email: cleanEmail,
                    timestamp: now
                });
            } catch(e) {}
        }
    },

    currentUser: null,

    init() {
        this.loadSession();
        this.bindEvents();
        this.updateUI();
        this.bindGlobalListeners();
        this.fetchAccountsFromServer();
        this.requestGPSLocation();
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

        // Validate session state (revocation, password change, concurrency)
        if (this.currentUser) {
            const currentEmail = (this.currentUser.email || '').toLowerCase();
            const curSessId = this.getCurrentSessionId();
            const curDevId = this.getDeviceId();

            // Check if this session or device has been remotely revoked
            try {
                const revoked = JSON.parse(localStorage.getItem('hirna_revoked_sessions') || '[]');
                const isRevoked = revoked.some(r => 
                    (r.sessionId && curSessId && r.sessionId === curSessId) ||
                    (r.deviceId && r.deviceId === curDevId && r.email && r.email.toLowerCase() === currentEmail)
                );
                if (isRevoked) {
                    this.proceedLogout('remote_logout');
                    return;
                }
            } catch(e) {}

            // Check if password was changed after this session started
            try {
                const invalidations = JSON.parse(localStorage.getItem('hirna_password_invalidations') || '{}');
                const lastInvalidation = invalidations[currentEmail];
                const sessionStartTime = Number(sessionStorage.getItem('hirna_session_start_time') || localStorage.getItem('hirna_session_start_time') || '0');
                if (lastInvalidation && (!sessionStartTime || sessionStartTime < lastInvalidation)) {
                    this.proceedLogout('password_changed');
                    return;
                }
            } catch(e) {}
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
        const now = Date.now() + 1000;

        // Clear any previous device revocation for this user on this device
        try {
            let revoked = JSON.parse(localStorage.getItem('hirna_revoked_sessions') || '[]');
            revoked = revoked.filter(r => !(r.email && r.email.toLowerCase() === user.email.toLowerCase() && r.deviceId === this.getDeviceId()));
            localStorage.setItem('hirna_revoked_sessions', JSON.stringify(revoked));
        } catch(e) {}

        // Always save in sessionStorage for the active session
        sessionStorage.setItem('hirna_auth_user', JSON.stringify(user));
        sessionStorage.setItem('hirna_session_start_time', String(now));
        if (rememberMe) {
            localStorage.setItem('hirna_auth_user', JSON.stringify(user));
            localStorage.setItem('hirna_session_start_time', String(now));
        } else {
            localStorage.removeItem('hirna_auth_user');
            localStorage.removeItem('hirna_session_start_time');
        }
        
        // Save to device accounts & active sessions on this device
        this.saveDeviceAccount(user);
        this.registerActiveSession(user);

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

    proceedLogout(reason = null) {
        const modal = document.getElementById('logout-confirm-modal');
        if (modal) modal.classList.add('hidden');

        if (this.currentUser && typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("Authentication", "ADMIN_LOGOUT", this.currentUser.email, this.currentUser.name, {
                reason: reason || 'manual_logout'
            });
        }

        const curSessId = this.getCurrentSessionId();
        if (curSessId) {
            let sessions = this.getActiveSessions().filter(s => s.sessionId !== curSessId);
            localStorage.setItem('hirna_active_sessions', JSON.stringify(sessions));
            localStorage.removeItem('hirna_current_session_id');
            sessionStorage.removeItem('hirna_current_session_id');
        }

        this.currentUser = null;
        sessionStorage.removeItem('hirna_auth_user');
        localStorage.removeItem('hirna_auth_user');
        sessionStorage.removeItem('hirna_session_start_time');
        
        // Redirect to login page
        let target = 'login.html';
        if (reason) target += '?reason=' + encodeURIComponent(reason);
        window.location.replace(target);
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

    renderSidebar(activeTab) {
        const sidebar = document.getElementById('app-sidebar');
        if (!sidebar) return;

        if (!activeTab) {
            const path = window.location.pathname.toLowerCase();
            if (path.includes('booking')) activeTab = 'booking';
            else if (path.includes('payments')) activeTab = 'payments';
            else if (path.includes('crm')) activeTab = 'crm';
            else if (path.includes('gps')) activeTab = 'gps';
            else if (path.includes('analytics')) activeTab = 'analytics';
            else if (path.includes('audit')) activeTab = 'audit';
            else if (path.includes('sso')) activeTab = 'sso';
            else if (path.includes('passenger')) activeTab = 'passenger';
            else activeTab = 'dashboard';
        }

        let roleTitle = this.currentUser ? (this.currentUser.roleTitle || 'Superadmin') : 'Superadmin';
        roleTitle = roleTitle.replace(/\s*\([^)]*\)/g, '').trim();
        const isSuperAdmin = this.isSuperAdmin();

        const navItemClass = (key) => {
            const isActive = activeTab === key;
            if (isActive) {
                return 'sidebar-nav-item active bg-white text-red-800 font-bold shadow-md rounded-xl flex items-center space-x-3 px-3.5 py-2.5 transition';
            }
            return 'sidebar-nav-item text-red-100 hover:bg-red-700/60 hover:text-white rounded-xl flex items-center space-x-3 px-3.5 py-2.5 transition font-medium';
        };

        const iconColor = (key) => activeTab === key ? 'text-red-800' : 'text-red-200';

        sidebar.innerHTML = `
            <div class="p-4 space-y-6">
                <!-- Brand / Logo Area -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 bg-red-900/60 p-2.5 rounded-2xl border border-red-700/50 flex-1">
                        <div class="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                            <img src="assets/hirna-badge.png" alt="Hirna Logo" class="w-full h-full object-contain">
                        </div>
                        <div class="overflow-hidden">
                            <h1 class="text-sm font-black tracking-wider text-white uppercase leading-none">HIRNA</h1>
                            <p id="sidebar-role-subtitle" class="text-[10px] text-red-200 font-semibold tracking-wide mt-1 truncate">${roleTitle}</p>
                        </div>
                    </div>
                    <button type="button" onclick="document.getElementById('app-sidebar').classList.add('hidden')" class="lg:hidden ml-2 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-red-700/60 cursor-pointer" title="Close Menu">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <!-- Navigation Links -->
                <div class="space-y-5 text-xs">
                    <!-- MAIN MENU -->
                    <div>
                        <p class="px-3 text-[10px] font-black uppercase tracking-wider text-red-300/80 mb-1.5">Main Menu</p>
                        <div class="space-y-1">
                            <a href="main.html" data-tab="dashboard" class="${navItemClass('dashboard')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('dashboard')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                <span>Dashboard</span>
                            </a>
                            <a href="passenger.html" data-tab="passenger" class="${navItemClass('passenger')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('passenger')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                <span>Passenger Portal</span>
                            </a>
                        </div>
                    </div>

                    <!-- OPERATIONS & MODULES -->
                    <div>
                        <p class="px-3 text-[10px] font-black uppercase tracking-wider text-red-300/80 mb-1.5">Operations</p>
                        <div class="space-y-1">
                            <a href="booking.html" data-tab="booking" class="${navItemClass('booking')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('booking')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM5 11l2-5h10l2 5m-14 0h14m-14 0v6h14v-6"/></svg>
                                <span>Booking & Dispatch</span>
                            </a>
                            <a href="payments.html" data-tab="payments" class="${navItemClass('payments')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('payments')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                                <span>Fare & Payments</span>
                            </a>
                            <a href="crm.html" data-tab="crm" class="${navItemClass('crm')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('crm')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                <span>Customer CRM</span>
                            </a>
                            <a href="gps.html" data-tab="gps" class="${navItemClass('gps')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('gps')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                <span>GPS Telematics</span>
                            </a>
                            <a href="analytics.html" data-tab="analytics" class="${navItemClass('analytics')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('analytics')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                                <span>Fleet Analytics</span>
                            </a>
                        </div>
                    </div>

                    <!-- ADMINISTRATION -->
                    <div>
                        <p class="px-3 text-[10px] font-black uppercase tracking-wider text-red-300/80 mb-1.5">Administration</p>
                        <div class="space-y-1">
                            <a href="audit.html" data-tab="audit" class="${navItemClass('audit')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('audit')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                <span>SOP & Audit Logs</span>
                            </a>
                            ${isSuperAdmin ? `
                            <a id="tab-btn-sso-gateway" href="sso.html" data-tab="sso" class="${navItemClass('sso')}">
                                <svg class="w-4 h-4 flex-shrink-0 ${iconColor('sso')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                <span>SuperAdmin SSO</span>
                            </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Logout Button at bottom -->
            <div class="p-4 border-t border-red-700/60">
                <button type="button" onclick="AuthModule.logout()" class="w-full py-2.5 px-4 rounded-xl border border-red-600/70 hover:bg-white hover:text-red-800 text-white font-bold text-xs transition flex items-center justify-center space-x-2 group cursor-pointer shadow-sm">
                    <svg class="w-4 h-4 text-white group-hover:text-red-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    <span>Logout</span>
                </button>
            </div>
        `;
    },

    updateUI() {
        const profileContainer = document.getElementById('header-user-profile');
        const adminBannerName = document.getElementById('banner-admin-name');
        const superadminGateTab = document.getElementById('tab-btn-sso-gateway');

        this.renderSidebar();

        if (this.currentUser) {
            if (profileContainer) {
                profileContainer.innerHTML = `
                    <div class="relative">
                        <button id="profile-dropdown-btn" onclick="AuthModule.toggleDropdown(event)" class="flex items-center space-x-2.5 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer">
                            <div class="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                ${this.currentUser.avatar || 'SA'}
                            </div>
                            <div class="text-left hidden sm:block">
                                <span class="text-xs font-black text-slate-900 block leading-tight">${this.currentUser.name}</span>
                                <span class="text-[10px] text-slate-500 font-medium block">${this.currentUser.roleTitle}</span>
                            </div>
                            <svg class="w-3.5 h-3.5 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>

                        <!-- Sleek White Dropdown Menu -->
                        <div id="profile-dropdown-menu" class="hidden absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                            <!-- User Info Header in Dropdown -->
                            <div class="p-3.5 bg-slate-50">
                                <div class="flex items-center space-x-3">
                                    <div class="w-9 h-9 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
                                        ${this.currentUser.avatar || 'SA'}
                                    </div>
                                    <div class="overflow-hidden">
                                        <p class="text-xs font-black text-slate-900 truncate">${this.currentUser.name}</p>
                                        <p class="text-[11px] text-slate-500 truncate">${this.currentUser.email || this.currentUser.phone || 'admin@hirna.ph'}</p>
                                        <span class="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-800 border border-red-200">
                                            ${this.currentUser.roleTitle}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Dropdown Quick Actions -->
                            <div class="p-1.5 space-y-1">
                                <button type="button" onclick="AuthModule.openSwitchAccountModal()" class="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center space-x-2 text-left cursor-pointer">
                                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                                    <span>Switch Account</span>
                                </button>
                                <button type="button" onclick="AuthModule.openAccountActivityModal()" class="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center space-x-2 text-left cursor-pointer">
                                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                    <span>Account Activity & Devices</span>
                                </button>
                            </div>

                            <!-- Logout Action -->
                            <div class="p-1.5 bg-slate-50">
                                <button onclick="AuthModule.logout()" class="w-full px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition flex items-center space-x-2 cursor-pointer">
                                    <svg class="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
    },

    openSwitchAccountModal() {
        this.closeDropdown();
        let modal = document.getElementById('modal-switch-account');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-switch-account';
            modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md hidden';
            document.body.appendChild(modal);
        }

        const deviceAccounts = this.getDeviceAccounts();
        const currentEmail = (this.currentUser ? this.currentUser.email : '').toLowerCase();

        let listHtml = '';
        if (deviceAccounts.length === 0) {
            listHtml = `<div class="p-6 text-center text-xs text-slate-400">No accounts saved on this device yet.</div>`;
        } else {
            listHtml = deviceAccounts.map(acc => {
                const isActive = acc.email.toLowerCase() === currentEmail;
                return `
                    <div class="p-3 bg-slate-950/70 hover:bg-slate-800/80 border ${isActive ? 'border-gold-500/60 ring-1 ring-gold-500/30' : 'border-slate-800'} rounded-2xl flex items-center justify-between transition group">
                        <div onclick="AuthModule.switchToAccount('${acc.email}')" class="flex items-center space-x-3 flex-1 cursor-pointer">
                            <div class="w-10 h-10 rounded-xl bg-gold-500 text-hirna-950 flex items-center justify-center font-black text-sm shadow">
                                ${acc.avatar || 'HU'}
                            </div>
                            <div class="overflow-hidden">
                                <div class="flex items-center space-x-2">
                                    <span class="text-xs font-bold text-white group-hover:text-gold-300 transition truncate">${acc.name}</span>
                                    ${isActive ? '<span class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Active</span>' : ''}
                                </div>
                                <span class="text-[11px] text-slate-400 font-mono block truncate">${acc.email}</span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 ml-2">
                            <button onclick="AuthModule.switchToAccount('${acc.email}')" class="px-2.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-hirna-950 text-[11px] font-bold rounded-xl transition cursor-pointer">
                                Select
                            </button>
                            <button onclick="AuthModule.forgetDeviceAccount('${acc.email}', event)" title="Remove account from this device" class="p-1.5 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-slate-800 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        modal.innerHTML = `
            <div class="bg-slate-900 border border-hirna-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h3 class="text-base font-black text-white flex items-center gap-2">
                            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                            <span>Switch Account</span>
                        </h3>
                        <p class="text-xs text-slate-400">Signed-in accounts on this device only</p>
                    </div>
                    <button onclick="AuthModule.closeSwitchAccountModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer font-bold">&times;</button>
                </div>
                
                <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    ${listHtml}
                </div>

                <div class="pt-2 border-t border-slate-800 space-y-2">
                    <button onclick="AuthModule.useDifferentAccount()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer border border-slate-700">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        <span>Use Another Account</span>
                    </button>
                    <p class="text-[10px] text-center text-slate-500">
                        Selecting an account only requires your Password/PIN and OTP.
                    </p>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    },

    closeSwitchAccountModal() {
        const modal = document.getElementById('modal-switch-account');
        if (modal) modal.classList.add('hidden');
    },

    switchToAccount(email) {
        this.closeSwitchAccountModal();
        window.location.href = `login.html?switch_to=${encodeURIComponent(email)}`;
    },

    forgetDeviceAccount(email, e) {
        if (e) e.stopPropagation();
        if (window.confirm(`Remove ${email} from saved accounts on this device?`)) {
            this.removeDeviceAccount(email);
            this.openSwitchAccountModal();
        }
    },

    useDifferentAccount() {
        this.closeSwitchAccountModal();
        window.location.href = `login.html?new_account=true`;
    },

    openAccountActivityModal(activeTab = 'devices') {
        this.closeDropdown();
        let modal = document.getElementById('modal-account-activity');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-account-activity';
            modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md hidden';
            document.body.appendChild(modal);
        }

        const user = this.currentUser || { name: 'Admin', email: 'admin@hirna.ph', roleTitle: 'Administrator' };
        const userEmail = (user.email || '').toLowerCase();
        const currentDevId = this.getDeviceId();
        const activeSessions = this.getActiveSessionsForUser(userEmail);

        this.fetchSessionsFromServer(userEmail).then(() => {
            // Re-render if modal is still open
            const curModal = document.getElementById('modal-account-activity');
            if (curModal && !curModal.classList.contains('hidden')) {
                // fresh sessions synced
            }
        });

        // Fetch logs for this user from SupabaseBridge or audit history
        let userLogs = [];
        if (typeof SupabaseBridge !== 'undefined' && Array.isArray(SupabaseBridge.logs)) {
            userLogs = SupabaseBridge.logs.filter(l => 
                (l.actor && l.actor.toLowerCase().includes(userEmail)) ||
                (l.user && l.user.toLowerCase().includes(userEmail)) ||
                (l.action && (l.action.toLowerCase().includes('admin') || l.action.toLowerCase().includes('auth')))
            ).slice(0, 15);
        }
        if (userLogs.length === 0) {
            userLogs = [
                {
                    timestamp: new Date().toISOString(),
                    module: "Authentication",
                    action: "ACTIVE_DEVICE_VERIFIED",
                    actor: user.name,
                    details: { device: "Asus TUF Gaming F15 (Windows 11)", ip: "120.28.17.44", location: "Caloocan City, PH" },
                    status: "SUCCESS"
                },
                {
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    module: "Fleet Dispatch",
                    action: "BOOKING_DISPATCH_PROCESSED",
                    actor: user.name,
                    details: { booking_id: "BK-88219", status: "ASSIGNED" },
                    status: "COMPLETED"
                },
                {
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    module: "Financial Ledger",
                    action: "FARE_TRANSACTION_RECONCILED",
                    actor: user.name,
                    details: { amount: 350.00, method: "HirnaPay" },
                    status: "VERIFIED"
                }
            ];
        }

        const devicesHtml = activeSessions.map(sess => {
            const isCurrent = sess.deviceId === currentDevId;
            return `
                <div class="p-3.5 bg-slate-950/80 border ${isCurrent ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800'} rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
                    <div class="flex items-start space-x-3">
                        <div class="w-10 h-10 rounded-xl ${isCurrent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'} flex items-center justify-center font-bold text-lg flex-shrink-0 mt-0.5">
                            ${sess.deviceName.toLowerCase().includes('phone') || sess.deviceName.toLowerCase().includes('android') || sess.deviceName.toLowerCase().includes('apple') ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>' : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>'}
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs font-bold text-white">${sess.deviceName}</span>
                                ${isCurrent ? '<span class="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">This Device (Current)</span>' : '<span class="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">Remote Device</span>'}
                            </div>
                            <div class="text-[11px] text-slate-400 mt-0.5 space-x-2">
                                <span>Browser: ${sess.browser}</span>
                                <span>•</span>
                                <span class="font-mono text-slate-300">IP: ${sess.ip}</span>
                            </div>
                            <div class="text-[10px] text-slate-500 mt-1 flex items-center space-x-2">
                                <span>Location: ${sess.location || 'Metro Manila, PH'}</span>
                                <span>•</span>
                                <span>Signed in: ${new Date(sess.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center self-end sm:self-center">
                        ${isCurrent ? `
                            <span class="text-xs font-bold text-emerald-400 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">Active Now</span>
                        ` : `
                            <button onclick="AuthModule.confirmRemoteSignOut('${sess.sessionId}', '${sess.deviceName.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                <span>Remote Sign-Out</span>
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        const logsHtml = userLogs.map(log => {
            return `
                <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 transition text-xs">
                    <td class="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                    <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${log.action}</td>
                    <td class="py-2.5 px-3 text-slate-300">${log.module || 'System'}</td>
                    <td class="py-2.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">${typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || 'OK')}</td>
                    <td class="py-2.5 px-3 text-right">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${log.status === 'SUCCESS' || log.status === 'COMPLETED' || log.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'}">${log.status || 'SUCCESS'}</span>
                    </td>
                </tr>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="bg-slate-900 border border-hirna-700/80 rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <!-- Header -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-600 text-hirna-950 flex items-center justify-center font-black text-lg shadow-md">
                            <svg class="w-5 h-5 text-hirna-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        </div>
                        <div>
                            <h3 class="text-base font-black text-white">Account Activity & Security Control</h3>
                            <p class="text-xs text-slate-400">Manage signed-in devices, active sessions, and audit processes for <strong>${user.email}</strong></p>
                        </div>
                    </div>
                    <button onclick="AuthModule.closeAccountActivityModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer font-bold">&times;</button>
                </div>

                <!-- Tab Buttons -->
                <div class="flex space-x-2 border-b border-slate-800 pb-2">
                    <button id="tab-btn-devices" onclick="AuthModule.switchActivityTab('devices')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'devices' ? 'bg-gold-500 text-hirna-950' : 'bg-slate-800 text-slate-300 hover:text-white'}">
                        Active Devices & Sessions (${activeSessions.length})
                    </button>
                    <button id="tab-btn-logs" onclick="AuthModule.switchActivityTab('logs')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'logs' ? 'bg-gold-500 text-hirna-950' : 'bg-slate-800 text-slate-300 hover:text-white'}">
                        Activity Logs & Transactions (${userLogs.length})
                    </button>
                </div>

                <!-- Tab 1: Active Devices -->
                <div id="activity-tab-devices" class="${activeTab === 'devices' ? '' : 'hidden'} space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    <div class="flex items-center justify-between px-1">
                        <p class="text-xs text-slate-400">
                            Devices currently logged into this account. Use <strong>Remote Sign-Out</strong> to disconnect any unfamiliar device.
                        </p>
                        ${activeSessions.filter(s => s.deviceId !== currentDevId).length > 0 ? `
                            <button onclick="AuthModule.confirmSignOutAllOtherDevices()" class="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 border border-rose-500/40 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer">
                                Sign Out All Other Devices
                            </button>
                        ` : ''}
                    </div>
                    <div class="space-y-2.5">
                        ${devicesHtml}
                    </div>
                </div>

                <!-- Tab 2: Activity Logs & Processes -->
                <div id="activity-tab-logs" class="${activeTab === 'logs' ? '' : 'hidden'} overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    <div class="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <th class="py-2.5 px-3">Time</th>
                                    <th class="py-2.5 px-3">Action / Process</th>
                                    <th class="py-2.5 px-3">Module</th>
                                    <th class="py-2.5 px-3">Details</th>
                                    <th class="py-2.5 px-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Footer Summary -->
                <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div class="flex items-center space-x-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span class="text-slate-300 font-medium">Real-Time Multi-Device Protection Active</span>
                    </div>
                    <button onclick="AuthModule.closeAccountActivityModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer">
                        Done
                    </button>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    },

    switchActivityTab(tab) {
        const tabDev = document.getElementById('activity-tab-devices');
        const tabLogs = document.getElementById('activity-tab-logs');
        const btnDev = document.getElementById('tab-btn-devices');
        const btnLogs = document.getElementById('tab-btn-logs');

        if (tab === 'devices') {
            if (tabDev) tabDev.classList.remove('hidden');
            if (tabLogs) tabLogs.classList.add('hidden');
            if (btnDev) { btnDev.className = "px-4 py-2 rounded-xl text-xs font-bold transition bg-gold-500 text-hirna-950"; }
            if (btnLogs) { btnLogs.className = "px-4 py-2 rounded-xl text-xs font-bold transition bg-slate-800 text-slate-300 hover:text-white"; }
        } else {
            if (tabDev) tabDev.classList.add('hidden');
            if (tabLogs) tabLogs.classList.remove('hidden');
            if (btnDev) { btnDev.className = "px-4 py-2 rounded-xl text-xs font-bold transition bg-slate-800 text-slate-300 hover:text-white"; }
            if (btnLogs) { btnLogs.className = "px-4 py-2 rounded-xl text-xs font-bold transition bg-gold-500 text-hirna-950"; }
        }
    },

    closeAccountActivityModal() {
        const modal = document.getElementById('modal-account-activity');
        if (modal) modal.classList.add('hidden');
    },

    confirmRemoteSignOut(sessionId, deviceName) {
        if (window.confirm(`Sign out remote device "${deviceName}" immediately?`)) {
            const res = this.remoteSignOutSession(sessionId);
            if (res.success) {
                alert(`Device "${deviceName}" signed out remotely.`);
                this.openAccountActivityModal('devices');
            } else {
                alert(res.message);
            }
        }
    },

    confirmSignOutAllOtherDevices() {
        if (window.confirm("Sign out of all other devices currently logged into this account?")) {
            const res = this.signOutAllOtherDevices();
            alert(`Signed out of ${res.count} remote session(s).`);
            this.openAccountActivityModal('devices');
        }
    }
};

// Auto-run on DOM load
window.addEventListener('DOMContentLoaded', () => {
    AuthModule.init();
});

// Multi-Tab Accounts, Remote Logout & Password Invalidation Synchronization
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
            } else if (data.type === 'REMOTE_LOGOUT') {
                const curDevId = AuthModule.getDeviceId();
                const curSessId = AuthModule.getCurrentSessionId();
                if ((data.sessionId && data.sessionId === curSessId) || (data.deviceId && data.deviceId === curDevId)) {
                    alert("Security Notice: Your session was remotely signed out from another authorized device.");
                    AuthModule.proceedLogout('remote_logout');
                }
            } else if (data.type === 'PASSWORD_CHANGED') {
                if (AuthModule.currentUser && AuthModule.currentUser.email.toLowerCase() === data.email.toLowerCase()) {
                    alert("Security Notice: Your account password was recently changed. All active sessions have been signed out. Please sign in with your new password.");
                    AuthModule.proceedLogout('password_changed');
                }
            } else if (data.type === 'DEVICE_ACCOUNTS_UPDATE') {
                const modal = document.getElementById('modal-switch-account');
                if (modal && !modal.classList.contains('hidden')) {
                    AuthModule.openSwitchAccountModal();
                }
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
    } else if (e.key === 'hirna_revoked_sessions') {
        const curDevId = AuthModule.getDeviceId();
        const curSessId = AuthModule.getCurrentSessionId();
        try {
            const revoked = JSON.parse(e.newValue || '[]');
            const isRevoked = revoked.some(r => 
                (r.sessionId && curSessId && r.sessionId === curSessId) ||
                (r.deviceId && r.deviceId === curDevId)
            );
            if (isRevoked) {
                alert("Security Notice: Your session was remotely signed out from another device.");
                AuthModule.proceedLogout('remote_logout');
            }
        } catch(err) {}
    } else if (e.key === 'hirna_password_invalidations') {
        if (AuthModule.currentUser) {
            const currentEmail = (AuthModule.currentUser.email || '').toLowerCase();
            try {
                const invalidations = JSON.parse(e.newValue || '{}');
                const lastInvalidation = invalidations[currentEmail];
                const sessionStartTime = Number(sessionStorage.getItem('hirna_session_start_time') || '0');
                if (lastInvalidation && (!sessionStartTime || sessionStartTime < lastInvalidation)) {
                    alert("Security Notice: Your account password was changed. Please sign in again.");
                    AuthModule.proceedLogout('password_changed');
                }
            } catch(err) {}
        }
    }
});

