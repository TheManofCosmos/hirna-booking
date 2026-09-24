/**
 * SuperAdmin Single Sign-On (SSO) Subsystem Gateway
 * Enables SuperAdmin to cross-authenticate into all 10 TNVS Teams seamlessly
 */
const SSOGateway = {
    subsystems: [
        {
            team: "Team 1",
            title: "HR & Recruitment Management",
            category: "Human Capital Management (HCM)",
            modules: "Applicant Management • Recruitment • Core HR • Onboarding",
            icon: "👥",
            url: "http://localhost:8001/team1-hr",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 2",
            title: "Workforce Management System",
            category: "Workforce & Scheduling",
            modules: "Time & Attendance • Shift Schedule • Leave Management • Timesheet",
            icon: "⏱️",
            url: "http://localhost:8002/team2-workforce",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 3",
            title: "Performance & Development",
            category: "Talent & Training",
            modules: "Driver Competency • Training Management • Succession Planning",
            icon: "📈",
            url: "http://localhost:8003/team3-performance",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 4",
            title: "Payroll & Benefits System",
            category: "Compensation Core",
            modules: "Payroll Calculation • Claims & Reimbursement • HMO & Benefits",
            icon: "💰",
            url: "http://localhost:8004/team4-payroll",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 5",
            title: "Financial Management System",
            category: "Transaction Core",
            modules: "General Ledger • Accounts Receivable (AR) • Accounts Payable (AP)",
            icon: "🏦",
            url: "http://localhost:8005/team5-finance",
            status: "Connected (GL Live Sync)"
        },
        {
            team: "Team 6",
            title: "Supply Chain & Inventory",
            category: "Logistics & Procurement",
            modules: "Smart Warehousing (SWS) • Procurement & Sourcing • Vendor Mgmt",
            icon: "📦",
            url: "http://localhost:8006/team6-supplychain",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 7",
            title: "Fleet & Transportation Mgmt",
            category: "Fleet Logistics",
            modules: "Fleet & Vehicle Mgmt (FVM) • Route Planning & Optimization • VRDS",
            icon: "🚚",
            url: "http://localhost:8007/team7-fleet",
            status: "Connected (Route Sync)"
        },
        {
            team: "Team 8",
            title: "Facilities & Admin Management",
            category: "Governance & Archiving",
            modules: "Facilities Reservation • Document Archiving • Legal & Contracts",
            icon: "🏛️",
            url: "http://localhost:8008/team8-admin",
            status: "Connected (SOP Audit Sync)"
        },
        {
            team: "Team 9",
            title: "TNVS Operations & Dispatch",
            category: "Field Operations",
            modules: "Trip Dispatching • Driver Wallet & Earnings • Fuel Management",
            icon: "🚦",
            url: "http://localhost:8009/team9-operations",
            status: "Connected (Dispatch Bridge)"
        },
        {
            team: "Team 10",
            title: "HIRNA Booking, Payments & CX",
            category: "Customer & Transaction Gateway",
            modules: "AI Booking • Dynamic Fare • Customer-Relationship Management • GPS Playback • Analytics • SOP Audit",
            icon: "🚕",
            url: "main.html",
            status: "Active System (Host Core)"
        }
    ],

    init() {
        this.renderSubsystems();
    },

    renderSubsystems() {
        const container = document.getElementById('sso-subsystems-grid');
        if (!container) return;

        container.innerHTML = this.subsystems.map(s => {
            const isSelf = s.team === 'Team 10';
            return `
                <div class="p-5 bg-white rounded-2xl border ${isSelf ? 'border-2 border-gold-500 bg-hirna-50/20' : 'border-slate-200'} shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-hirna-100 text-hirna-900 border border-hirna-200">
                                ${s.team}
                            </span>
                            <span class="text-[10px] font-bold ${s.status.includes('Connected') || isSelf ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-600 bg-slate-100'} px-2 py-0.5 rounded-full">
                                ● ${s.status}
                            </span>
                        </div>
                        <div class="flex items-center space-x-2.5 pt-1">
                            <span class="text-2xl">${s.icon}</span>
                            <div>
                                <h4 class="font-bold text-slate-900 text-sm leading-tight">${s.title}</h4>
                                <span class="text-[10px] text-slate-500 font-semibold block">${s.category}</span>
                            </div>
                        </div>
                        <p class="text-[11px] text-slate-600 pt-1">${s.modules}</p>
                    </div>

                    <div class="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">${s.url}</span>
                        ${isSelf ? `
                            <span class="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Current Core</span>
                        ` : `
                            <button onclick="SSOGateway.launchSSO('${s.team}')" class="px-3 py-1.5 bg-hirna-800 hover:bg-hirna-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1">
                                <span>🔑 Launch with SSO</span>
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    launchSSO(teamName) {
        const sub = this.subsystems.find(s => s.team === teamName);
        if (!sub) return;

        const ssoToken = `HIRNA_SSO_${Date.now().toString(36).toUpperCase()}`;
        const ssoPayload = {
            sso_token: ssoToken,
            authenticated_user: AuthModule.currentUser ? AuthModule.currentUser.email : "superadmin@hirna.ph",
            user_name: AuthModule.currentUser ? AuthModule.currentUser.name : "SuperAdmin",
            role: "superadmin",
            target_subsystem: sub.team,
            target_title: sub.title,
            target_endpoint: sub.url,
            handshake_timestamp: new Date().toISOString(),
            bypass_login: true
        };

        // Log SSO handshake to audit system
        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("SSO Gateway", "SUPERADMIN_SUBSYSTEM_HANDSHAKE", sub.team, ssoPayload.authenticated_user, ssoPayload);
        }

        // Show SSO Simulation Modal
        const modal = document.getElementById('sso-launch-modal');
        if (modal) {
            document.getElementById('sso-modal-team').innerText = `${sub.team}: ${sub.title}`;
            document.getElementById('sso-modal-url').innerText = `${sub.url}?sso_token=${ssoToken}&role=superadmin&bypass_auth=true`;
            document.getElementById('sso-modal-payload').innerText = JSON.stringify(ssoPayload, null, 2);
            modal.classList.remove('hidden');
        }

        if (typeof App !== 'undefined') {
            App.showToast(`SSO Handshake generated for ${sub.team}! Authenticated as SuperAdmin.`, 'success');
        }
    },

    renderAccountsTable() {
        const tbody = document.getElementById('rbac-accounts-tbody');
        if (!tbody) return;

        const isSuperAdmin = typeof AuthModule !== 'undefined' && AuthModule.isSuperAdmin();
        const addBtn = document.getElementById('btn-add-rbac-account');
        if (addBtn) {
            if (isSuperAdmin) {
                addBtn.classList.remove('hidden');
            } else {
                addBtn.classList.add('hidden');
            }
        }

        const accounts = (typeof AuthModule !== 'undefined') ? AuthModule.accounts : [];
        tbody.innerHTML = accounts.map(a => {
            const isMe = AuthModule.currentUser && AuthModule.currentUser.email.toLowerCase() === a.email.toLowerCase();
            const isSuper = a.role === 'superadmin';
            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="px-4 py-3">
                        <div class="flex items-center space-x-2.5">
                            <div class="w-7 h-7 rounded-full ${a.badgeClass || 'bg-gold-500 text-hirna-950'} flex items-center justify-center font-black text-xs shadow-sm">
                                ${a.avatar || a.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <span class="font-bold text-slate-900 block">${a.name} ${isMe ? '<span class="text-[10px] text-gold-600 bg-gold-50 border border-gold-200 px-1.5 py-0.2 rounded font-black ml-1">YOU</span>' : ''}</span>
                                <span class="text-[10px] text-slate-400 font-medium">${a.roleTitle}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">${a.email}</span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            a.role === 'superadmin' ? 'bg-gold-100 text-amber-900 border border-gold-300' :
                            a.role === 'admin' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                            'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }">
                            ${a.role}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex items-center space-x-1.5 font-mono text-[11px] text-slate-700">
                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">${a.password}</span>
                            ${isSuperAdmin ? `
                                <button onclick="SSOGateway.openEditAccountModal('${a.email}')" class="text-[10px] text-gold-600 hover:text-gold-700 underline font-sans font-bold cursor-pointer" title="Edit Password">
                                    Edit
                                </button>
                            ` : ''}
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <svg class="w-3 h-3 text-emerald-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            Real Gmail OTP
                        </span>
                    </td>
                    <td class="px-4 py-3 text-right space-x-1.5">
                        ${isSuperAdmin ? `
                            <button onclick="SSOGateway.openEditAccountModal('${a.email}')" class="px-2.5 py-1 text-slate-700 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-300 transition text-[11px] font-bold cursor-pointer">
                                Edit Password & Role
                            </button>
                            ${a.email.toLowerCase() === 'edgaradovas50@gmail.com' ? '' : `
                            <button onclick="SSOGateway.confirmDeleteAccount('${a.email}')" class="px-2 py-1 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 transition text-[11px] font-bold cursor-pointer">
                                Remove
                            </button>
                            `}
                        ` : `
                            <span class="text-[10px] text-slate-400 font-semibold italic">SuperAdmin Only</span>
                        `}
                    </td>
                </tr>
            `;
        }).join('');
    },

    openAddAccountModal() {
        if (!AuthModule.isSuperAdmin()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can add accounts.", "error");
            return;
        }
        document.getElementById('rbac-modal-title').innerText = "Add Authorized Email Account";
        document.getElementById('rbac-account-original-email').value = "";
        document.getElementById('rbac-account-name').value = "";
        document.getElementById('rbac-account-email').value = "";
        document.getElementById('rbac-account-role').value = "admin";
        document.getElementById('rbac-account-password').value = "admin";
        this.handleRoleChange("admin");
        document.getElementById('rbac-account-modal')?.classList.remove('hidden');
    },

    openEditAccountModal(email) {
        if (!AuthModule.isSuperAdmin()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can edit accounts and passwords.", "error");
            return;
        }
        const acc = AuthModule.accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
        if (!acc) return;
        document.getElementById('rbac-modal-title').innerText = `Edit Account & Password: ${acc.name}`;
        document.getElementById('rbac-account-original-email').value = acc.email;
        document.getElementById('rbac-account-name').value = acc.name;
        document.getElementById('rbac-account-email').value = acc.email;
        document.getElementById('rbac-account-role').value = acc.role;
        document.getElementById('rbac-account-password').value = acc.password;
        this.handleRoleChange(acc.role);
        document.getElementById('rbac-account-modal')?.classList.remove('hidden');
    },

    closeAccountModal() {
        document.getElementById('rbac-account-modal')?.classList.add('hidden');
    },

    handleRoleChange(role) {
        const preview = document.getElementById('rbac-password-preview');
        if (preview) preview.innerText = role;
        const pwdInput = document.getElementById('rbac-account-password');
        const origEmail = document.getElementById('rbac-account-original-email')?.value;
        if (pwdInput && !origEmail) {
            pwdInput.value = role;
        }
    },

    handleSaveAccount(e) {
        e.preventDefault();
        if (!AuthModule.isSuperAdmin()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can modify accounts.", "error");
            return;
        }
        const origEmail = document.getElementById('rbac-account-original-email').value.trim();
        const name = document.getElementById('rbac-account-name').value.trim();
        const email = document.getElementById('rbac-account-email').value.trim().toLowerCase();
        const role = document.getElementById('rbac-account-role').value;
        const password = document.getElementById('rbac-account-password').value.trim() || role;

        const roleTitles = {
            superadmin: "SuperAdmin (Full Access & Role Control)",
            admin: "Operations Administrator",
            passenger: "Verified Passenger"
        };
        const badgeClasses = {
            superadmin: "bg-gold-500 text-hirna-950 font-black",
            admin: "bg-blue-600 text-white",
            passenger: "bg-emerald-600 text-white"
        };

        const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'US';

        // If editing and email changed, remove old email
        if (origEmail && origEmail.toLowerCase() !== email) {
            AuthModule.deleteAccount(origEmail);
        }

        const newAccount = {
            email: email,
            password: password,
            name: name,
            role: role,
            roleTitle: roleTitles[role] || "Hirna Staff",
            badgeClass: badgeClasses[role] || "bg-slate-800 text-white",
            avatar: initials
        };

        AuthModule.addOrUpdateAccount(newAccount);

        // Audit log
        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("RBAC Security", "ACCOUNT_ROLE_CONFIGURED", email, AuthModule.currentUser ? AuthModule.currentUser.email : "superadmin", {
                name: name,
                assigned_role: role,
                password_updated: true
            });
        }

        this.closeAccountModal();
        this.renderAccountsTable();

        if (typeof App !== 'undefined') {
            App.showToast(`Account ${email} updated! Role: ${role.toUpperCase()} (Password saved)`, 'success');
        }
    },

    confirmDeleteAccount(email) {
        if (!AuthModule.isSuperAdmin()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can delete accounts.", "error");
            return;
        }
        if (confirm(`Are you sure you want to revoke access and delete account ${email}?`)) {
            AuthModule.deleteAccount(email);
            this.renderAccountsTable();
            if (typeof App !== 'undefined') {
                App.showToast(`Account ${email} removed from authorized list.`, 'info');
            }
        }
    },

    closeSSOModal() {
        document.getElementById('sso-launch-modal')?.classList.add('hidden');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    SSOGateway.init();
    SSOGateway.renderAccountsTable();
});
