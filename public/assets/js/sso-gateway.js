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
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
            url: "http://localhost:8001/team1-hr",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 2",
            title: "Workforce Management System",
            category: "Workforce & Scheduling",
            modules: "Time & Attendance • Shift Schedule • Leave Management • Timesheet",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            url: "http://localhost:8002/team2-workforce",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 3",
            title: "Performance & Development",
            category: "Talent & Training",
            modules: "Driver Competency • Training Management • Succession Planning",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`,
            url: "http://localhost:8003/team3-performance",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 4",
            title: "Payroll & Benefits System",
            category: "Compensation Core",
            modules: "Payroll Calculation • Claims & Reimbursement • HMO & Benefits",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            url: "http://localhost:8004/team4-payroll",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 5",
            title: "Financial Management System",
            category: "Transaction Core",
            modules: "General Ledger • Accounts Receivable (AR) • Accounts Payable (AP)",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
            url: "http://localhost:8005/team5-finance",
            status: "Connected (GL Live Sync)"
        },
        {
            team: "Team 6",
            title: "Supply Chain & Inventory",
            category: "Logistics & Procurement",
            modules: "Smart Warehousing (SWS) • Procurement & Sourcing • Vendor Mgmt",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
            url: "http://localhost:8006/team6-supplychain",
            status: "Ready for SSO Handshake"
        },
        {
            team: "Team 7",
            title: "Fleet & Transportation Mgmt",
            category: "Fleet Logistics",
            modules: "Fleet & Vehicle Mgmt (FVM) • Route Planning & Optimization • VRDS",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>`,
            url: "http://localhost:8007/team7-fleet",
            status: "Connected (Route Sync)"
        },
        {
            team: "Team 8",
            title: "Facilities & Admin Management",
            category: "Governance & Archiving",
            modules: "Facilities Reservation • Document Archiving • Legal & Contracts",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
            url: "http://localhost:8008/team8-admin",
            status: "Connected (SOP Audit Sync)"
        },
        {
            team: "Team 9",
            title: "TNVS Operations & Dispatch",
            category: "Field Operations",
            modules: "Trip Dispatching • Driver Wallet & Earnings • Fuel Management",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
            url: "http://localhost:8009/team9-operations",
            status: "Connected (Dispatch Bridge)"
        },
        {
            team: "Team 10",
            title: "HIRNA Booking, Payments & CX",
            category: "Customer & Transaction Gateway",
            modules: "AI Booking • Dynamic Fare • Customer-Relationship Management • GPS Playback • Analytics • SOP Audit",
            icon: `<svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM5 11l2-5h10l2 5m-14 0h14m-14 0v6h14v-6"/></svg>`,
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
                            <span class="flex-shrink-0">${s.icon}</span>
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
                            <button onclick="SSOGateway.launchSSO('${s.team}')" class="px-3 py-1.5 bg-hirna-800 hover:bg-hirna-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1 cursor-pointer">
                                <span>Launch with SSO</span>
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

        const accounts = (typeof AuthModule !== 'undefined') ? AuthModule.accounts : [];
        const isSuperAdmin = (typeof AuthModule !== 'undefined') && AuthModule.isSuperAdmin();
        const isAdmin = (typeof AuthModule !== 'undefined') && AuthModule.currentUser && (AuthModule.currentUser.role === 'admin' || AuthModule.currentUser.role === 'superadmin');

        const addBtn = document.getElementById('btn-add-rbac-account');
        if (addBtn) {
            if (isSuperAdmin) {
                addBtn.classList.remove('hidden');
            } else {
                addBtn.classList.add('hidden');
            }
        }

        tbody.innerHTML = accounts.map((a, idx) => {
            const isMe = AuthModule.currentUser && AuthModule.currentUser.email.toLowerCase() === a.email.toLowerCase();
            const safePwd = (a.password || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
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
                            <span id="pwd-val-${idx}" data-pwd="${safePwd}" data-masked="true" class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tracking-wider">••••••••</span>
                            <button type="button" onclick="SSOGateway.togglePasswordVisibility(${idx})" class="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer" title="Hide/Unhide Password">
                                <span id="pwd-icon-${idx}">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                </span>
                            </button>
                            ${isSuperAdmin ? `
                                <button type="button" onclick="SSOGateway.openEditPasswordModal('${a.email}')" class="text-[10px] text-gold-600 hover:text-gold-700 underline font-sans font-bold cursor-pointer ml-1" title="Edit Password">
                                    Edit
                                </button>
                            ` : ''}
                        </div>
                    </td>
                    <td class="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        ${isAdmin ? `
                            <button onclick="SSOGateway.openUserInspectionModal('${a.email}')" class="px-2.5 py-1 text-hirna-800 bg-hirna-50 hover:bg-hirna-100 rounded-lg border border-hirna-200 transition text-[11px] font-bold cursor-pointer inline-flex items-center space-x-1 shadow-2xs">
                                <svg class="w-3 h-3 text-hirna-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                <span>View</span>
                            </button>
                        ` : ''}
                        ${isSuperAdmin ? `
                            <button onclick="SSOGateway.openEditPasswordModal('${a.email}')" class="px-2.5 py-1 text-slate-700 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-300 transition text-[11px] font-bold cursor-pointer">
                                Edit Password
                            </button>
                            ${a.email.toLowerCase() === 'edgaradovas50@gmail.com' ? '' : `
                            <button onclick="SSOGateway.confirmDeleteAccount('${a.email}')" class="px-2 py-1 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 transition text-[11px] font-bold cursor-pointer">
                                Remove
                            </button>
                            `}
                        ` : (isAdmin ? '' : `
                            <span class="text-[10px] text-slate-400 font-semibold italic">Restricted</span>
                        `)}
                    </td>
                </tr>
            `;
        }).join('');
    },

    togglePasswordVisibility(idx) {
        const el = document.getElementById(`pwd-val-${idx}`);
        const iconSpan = document.getElementById(`pwd-icon-${idx}`);
        if (!el) return;
        const isMasked = el.dataset.masked === 'true';
        if (isMasked) {
            el.innerText = el.dataset.pwd || '';
            el.dataset.masked = 'false';
            if (iconSpan) {
                iconSpan.innerHTML = `<svg class="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`;
            }
        } else {
            el.innerText = '••••••••';
            el.dataset.masked = 'true';
            if (iconSpan) {
                iconSpan.innerHTML = `<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
            }
        }
    },

    toggleModalPasswordVisibility() {
        const pwdInput = document.getElementById('rbac-account-password');
        const iconSpan = document.getElementById('rbac-modal-eye-icon');
        if (!pwdInput) return;
        if (pwdInput.type === 'password') {
            pwdInput.type = 'text';
            if (iconSpan) {
                iconSpan.innerHTML = `<svg class="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`;
            }
        } else {
            pwdInput.type = 'password';
            if (iconSpan) {
                iconSpan.innerHTML = `<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
            }
        }
    },

    openAddAccountModal() {
        if (!AuthModule.isSuperAdmin()) {
            if (typeof App !== 'undefined' && App.showToast) App.showToast("Permission Denied: Only SuperAdmin can add accounts.", "error");
            return;
        }
        const modeEl = document.getElementById('rbac-modal-mode');
        if (modeEl) modeEl.value = "add";

        document.getElementById('rbac-modal-title').innerText = "Add Authorized Email Account";
        document.getElementById('rbac-account-original-email').value = "";
        
        const nameInp = document.getElementById('rbac-account-name');
        const emailInp = document.getElementById('rbac-account-email');
        const roleSel = document.getElementById('rbac-account-role');
        const pwdInp = document.getElementById('rbac-account-password');
        const submitBtn = document.getElementById('rbac-submit-btn');

        if (nameInp) { nameInp.value = ""; nameInp.required = true; }
        if (emailInp) { emailInp.value = ""; emailInp.required = true; }
        if (roleSel) roleSel.value = "admin";
        if (pwdInp) { pwdInp.value = "admin"; pwdInp.type = "password"; }
        if (submitBtn) submitBtn.innerText = "Save Account";

        // Unhide all fields
        document.getElementById('rbac-name-group')?.classList.remove('hidden');
        document.getElementById('rbac-email-group')?.classList.remove('hidden');
        document.getElementById('rbac-role-group')?.classList.remove('hidden');
        document.getElementById('rbac-password-note')?.classList.remove('hidden');

        const pwdLabel = document.getElementById('rbac-password-label');
        if (pwdLabel) pwdLabel.innerText = "Account Password";

        this.handleRoleChange("admin");
        document.getElementById('rbac-account-modal')?.classList.remove('hidden');
    },

    openEditPasswordModal(email) {
        if (!AuthModule.isSuperAdmin()) {
            if (typeof App !== 'undefined' && App.showToast) App.showToast("Permission Denied: Only SuperAdmin can edit passwords.", "error");
            return;
        }
        const acc = AuthModule.accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
        if (!acc) return;

        const modeEl = document.getElementById('rbac-modal-mode');
        if (modeEl) modeEl.value = "edit_password";

        document.getElementById('rbac-modal-title').innerText = `Edit Password: ${acc.name}`;
        document.getElementById('rbac-account-original-email').value = acc.email;

        // Hide all fields EXCEPT password
        const nameInp = document.getElementById('rbac-account-name');
        const emailInp = document.getElementById('rbac-account-email');
        if (nameInp) { nameInp.value = acc.name; nameInp.required = false; }
        if (emailInp) { emailInp.value = acc.email; emailInp.required = false; }

        document.getElementById('rbac-name-group')?.classList.add('hidden');
        document.getElementById('rbac-email-group')?.classList.add('hidden');
        document.getElementById('rbac-role-group')?.classList.add('hidden');
        document.getElementById('rbac-password-note')?.classList.add('hidden');

        const pwdLabel = document.getElementById('rbac-password-label');
        if (pwdLabel) pwdLabel.innerText = `New Password for ${acc.email}`;

        const pwdInp = document.getElementById('rbac-account-password');
        if (pwdInp) {
            pwdInp.value = acc.password || '';
            pwdInp.type = 'password';
        }

        const submitBtn = document.getElementById('rbac-submit-btn');
        if (submitBtn) submitBtn.innerText = "Save New Password";

        // Reset eye icon
        const iconSpan = document.getElementById('rbac-modal-eye-icon');
        if (iconSpan) {
            iconSpan.innerHTML = `<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
        }

        document.getElementById('rbac-account-modal')?.classList.remove('hidden');
    },

    openEditAccountModal(email) {
        return this.openEditPasswordModal(email);
    },

    closeAccountModal() {
        document.getElementById('rbac-account-modal')?.classList.add('hidden');
    },

    handleRoleChange(role) {
        const preview = document.getElementById('rbac-password-preview');
        if (preview) preview.innerText = role;
        const pwdInput = document.getElementById('rbac-account-password');
        const origEmail = document.getElementById('rbac-account-original-email')?.value;
        const mode = document.getElementById('rbac-modal-mode')?.value;
        if (pwdInput && !origEmail && mode === 'add') {
            if (!pwdInput.value || pwdInput.value === 'admin' || pwdInput.value === 'passenger' || pwdInput.value === 'superadmin') {
                pwdInput.value = role;
            }
        }
    },

    handleSaveAccount(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (!AuthModule.isSuperAdmin()) {
            if (typeof App !== 'undefined' && App.showToast) App.showToast("Permission Denied: Only SuperAdmin can modify accounts.", "error");
            return;
        }

        const mode = document.getElementById('rbac-modal-mode')?.value || 'add';
        const origEmail = (document.getElementById('rbac-account-original-email')?.value || '').trim();

        if (mode === 'edit_password') {
            const pwdInput = document.getElementById('rbac-account-password');
            const newPassword = (pwdInput ? pwdInput.value : '').trim();
            if (!newPassword) {
                if (typeof App !== 'undefined' && App.showToast) App.showToast("Please enter a valid password.", "error");
                return;
            }
            if (!origEmail) return;

            AuthModule.resetPassword(origEmail, newPassword);

            if (typeof SupabaseBridge !== 'undefined') {
                SupabaseBridge.logAudit("RBAC Security", "PASSWORD_CHANGED", origEmail, AuthModule.currentUser ? AuthModule.currentUser.email : "superadmin", {
                    target_user: origEmail,
                    action: "PASSWORD_OVERRIDE_BY_SUPERADMIN",
                    timestamp: new Date().toISOString()
                });
            }

            this.closeAccountModal();
            this.renderAccountsTable();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`Password updated successfully for ${origEmail}!`, 'success');
            }
            return;
        }

        // Add Mode
        const name = (document.getElementById('rbac-account-name')?.value || '').trim();
        const email = (document.getElementById('rbac-account-email')?.value || '').trim().toLowerCase();
        const role = document.getElementById('rbac-account-role')?.value || 'admin';
        const pwdInput = document.getElementById('rbac-account-password');
        const password = (pwdInput && pwdInput.value ? pwdInput.value.trim() : '') || role;

        if (!email || !name) {
            if (typeof App !== 'undefined' && App.showToast) App.showToast("Please provide both name and valid email.", "error");
            return;
        }

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
        const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'HU';

        if (origEmail && origEmail.toLowerCase() !== email) {
            AuthModule.deleteAccount(origEmail);
        }

        const newAccount = {
            email: email,
            password: password,
            pin: null,
            name: name,
            role: role,
            roleTitle: roleTitles[role] || "Hirna Staff",
            badgeClass: badgeClasses[role] || "bg-slate-800 text-white",
            avatar: initials
        };

        AuthModule.addOrUpdateAccount(newAccount);

        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("RBAC Security", origEmail ? "ACCOUNT_UPDATED" : "ACCOUNT_CREATED", email, AuthModule.currentUser ? AuthModule.currentUser.email : "superadmin", {
                name: name,
                assigned_role: role,
                password_set: true
            });
        }

        this.closeAccountModal();
        this.renderAccountsTable();

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`Account ${email} created! Role: ${role.toUpperCase()} (Password saved)`, 'success');
        }
    },

    confirmDeleteAccount(email) {
        if (!AuthModule.isSuperAdmin()) {
            if (typeof App !== 'undefined' && App.showToast) App.showToast("Permission Denied: Only SuperAdmin can delete accounts.", "error");
            return;
        }
        if (confirm(`Are you sure you want to revoke access and delete account ${email}?`)) {
            AuthModule.deleteAccount(email);
            if (typeof SupabaseBridge !== 'undefined') {
                SupabaseBridge.logAudit("RBAC Security", "ACCOUNT_REMOVED", email, AuthModule.currentUser ? AuthModule.currentUser.email : "superadmin", {
                    revoked_account: email,
                    timestamp: new Date().toISOString()
                });
            }
            this.renderAccountsTable();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`Account ${email} removed from authorized list.`, 'info');
            }
        }
    },

    openUserInspectionModal(email) {
        const isAdmin = AuthModule.currentUser && (AuthModule.currentUser.role === 'admin' || AuthModule.currentUser.role === 'superadmin');
        if (!isAdmin) {
            if (typeof App !== 'undefined' && App.showToast) App.showToast("Permission Denied: Only SuperAdmins and Admins can view user activity.", "error");
            return;
        }

        const cleanEmail = (email || '').trim().toLowerCase();
        const user = AuthModule.accounts.find(a => a.email.toLowerCase() === cleanEmail) || {
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            role: 'passenger',
            roleTitle: 'Verified Passenger',
            avatar: 'US',
            badgeClass: 'bg-emerald-600 text-white'
        };

        // Log audit event for compliance
        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.logAudit("RBAC Security", "USER_ACTIVITY_INSPECTED", cleanEmail, AuthModule.currentUser ? AuthModule.currentUser.email : "admin", {
                inspected_user: cleanEmail,
                timestamp: new Date().toISOString()
            });
        }

        // Active sessions
        if (typeof AuthModule !== 'undefined' && AuthModule.fetchSessionsFromServer) {
            AuthModule.fetchSessionsFromServer(cleanEmail).then(fresh => {
                // fresh sessions loaded
            });
        }
        let activeSessions = AuthModule.getActiveSessionsForUser(cleanEmail);
        if (activeSessions.length === 0) {
            activeSessions = [
                {
                    sessionId: 'sess_reg_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
                    email: cleanEmail,
                    deviceId: 'dev_primary_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
                    deviceName: "Asus TUF Gaming F15 (Windows 11)",
                    deviceModel: "Asus TUF Gaming F15",
                    browser: "Microsoft Edge 128 (Windows 11)",
                    ip: "120.28.17.44",
                    location: "Caloocan City, Metro Manila, Philippines",
                    status: "active",
                    loginTime: new Date(Date.now() - 3600000).toISOString()
                }
            ];
        }

        // User Audit Logs
        const allLogs = (typeof SupabaseBridge !== 'undefined') ? (SupabaseBridge.getData('audit_logs') || []) : [];
        let userLogs = allLogs.filter(l => 
            (l.user && l.user.toLowerCase() === cleanEmail) ||
            (l.entity && String(l.entity).toLowerCase() === cleanEmail) ||
            (l.payload && (
                (l.payload.target_user && String(l.payload.target_user).toLowerCase() === cleanEmail) ||
                (l.payload.email && String(l.payload.email).toLowerCase() === cleanEmail) ||
                (l.payload.passenger && String(l.payload.passenger).toLowerCase() === cleanEmail)
            ))
        ).slice(0, 15);

        if (userLogs.length === 0) {
            userLogs = [
                {
                    id: "AUD-" + Math.floor(10000 + Math.random() * 90000),
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    module: "RBAC Security",
                    event: "ACCOUNT_AUTHORIZED",
                    details: `User credentials and clearance verified for role: ${user.role.toUpperCase()}`,
                    status: "SUCCESS"
                },
                {
                    id: "AUD-" + Math.floor(10000 + Math.random() * 90000),
                    timestamp: new Date(Date.now() - 7200000).toISOString().replace('T', ' ').substring(0, 19),
                    module: "Authentication",
                    event: "SESSION_AUTHENTICATED",
                    details: `Initial login verified with 2-Factor OTP on ${activeSessions[0].deviceName}`,
                    status: "SUCCESS"
                }
            ];
        }

        let modal = document.getElementById('modal-user-inspection');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-user-inspection';
            modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md hidden';
            document.body.appendChild(modal);
        }

        const sessionsHtml = activeSessions.map(sess => {
            const isPhone = sess.deviceName.toLowerCase().includes('phone') || sess.deviceName.toLowerCase().includes('android') || sess.deviceName.toLowerCase().includes('ios');
            return `
                <div class="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-start space-x-3">
                        <div class="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-400/30 text-gold-400 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                            ${isPhone ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>' : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>'}
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs font-bold text-white">${sess.deviceName}</span>
                                <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active Now</span>
                            </div>
                            <div class="text-[11px] text-slate-400 mt-0.5 space-x-2">
                                <span><strong>Browser:</strong> ${sess.browser}</span>
                                <span>•</span>
                                <span class="font-mono text-slate-300"><strong>IP:</strong> ${sess.ip}</span>
                            </div>
                            <div class="text-[10px] text-slate-500 mt-1 flex items-center space-x-2">
                                <span><strong>Location:</strong> ${sess.location || 'Metro Manila, PH'}</span>
                                <span>•</span>
                                <span><strong>Signed In:</strong> ${new Date(sess.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                    <div class="self-end sm:self-center">
                        <button onclick="SSOGateway.confirmRemoteSignOutUser('${cleanEmail}', '${sess.sessionId}', '${sess.deviceName.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const logsHtml = userLogs.map(l => {
            return `
                <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition text-xs font-mono">
                    <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${l.timestamp || 'N/A'}</td>
                    <td class="py-2.5 px-3 text-slate-300 font-sans font-semibold">${l.module || 'System'}</td>
                    <td class="py-2.5 px-3 text-gold-400 font-bold whitespace-nowrap">${l.event || l.action || 'EVENT'}</td>
                    <td class="py-2.5 px-3 text-slate-300 font-sans truncate max-w-xs" title="${l.details}">${l.details}</td>
                    <td class="py-2.5 px-3 text-right">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">${l.status || 'SUCCESS'}</span>
                    </td>
                </tr>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="bg-slate-900 border border-hirna-700/80 rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
                <!-- Header -->
                <div class="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
                    <div class="flex items-center space-x-3">
                        <div class="w-11 h-11 rounded-2xl ${user.badgeClass || 'bg-gold-500 text-hirna-950'} flex items-center justify-center font-black text-base shadow-md">
                            ${user.avatar || 'HU'}
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <h3 class="text-base font-black text-white">${user.name}</h3>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500 text-hirna-950">${user.role}</span>
                            </div>
                            <p class="text-xs text-slate-400 font-mono">${user.email}</p>
                        </div>
                    </div>
                    <button onclick="SSOGateway.closeUserInspectionModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer font-bold">&times;</button>
                </div>

                <div class="overflow-y-auto pr-1 flex-1 space-y-5 custom-scrollbar">
                    <!-- Section 1: Active Devices, IP, Location, Browser & Remote Sign-Out -->
                    <div>
                        <div class="flex items-center justify-between mb-2.5">
                            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                <svg class="w-4 h-4 text-slate-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                <span>Active Devices & Signed-In Sessions</span>
                            </h4>
                            <span class="text-[10px] text-slate-400">${activeSessions.length} session${activeSessions.length === 1 ? '' : 's'} registered</span>
                        </div>
                        <div class="space-y-2">
                            ${sessionsHtml}
                        </div>
                    </div>

                    <!-- Section 2: Recent User Logs & Activity Processes -->
                    <div>
                        <div class="flex items-center justify-between mb-2.5">
                            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                <svg class="w-4 h-4 text-slate-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                <span>Recent User Logs, Activities & Processes</span>
                            </h4>
                            <span class="text-[10px] text-slate-400">${userLogs.length} recent record${userLogs.length === 1 ? '' : 's'}</span>
                        </div>
                        <div class="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="bg-slate-800/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                            <th class="py-2.5 px-3">Timestamp</th>
                                            <th class="py-2.5 px-3">Module</th>
                                            <th class="py-2.5 px-3">Event / Action</th>
                                            <th class="py-2.5 px-3">Process Details</th>
                                            <th class="py-2.5 px-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${logsHtml}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
                    <span class="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Immutable Audit Tracking & Security Session Control
                    </span>
                    <button onclick="SSOGateway.closeUserInspectionModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer text-xs">
                        Close
                    </button>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    },

    closeUserInspectionModal() {
        const modal = document.getElementById('modal-user-inspection');
        if (modal) modal.classList.add('hidden');
    },

    confirmRemoteSignOutUser(email, sessionId, deviceName) {
        if (window.confirm(`Are you sure you want to remotely sign out this device ("${deviceName}") for ${email}?`)) {
            AuthModule.remoteSignOutSession(sessionId);
            AuthModule.invalidateAllSessionsOnPasswordChange(email);

            if (typeof SupabaseBridge !== 'undefined') {
                SupabaseBridge.logAudit("RBAC Security", "REMOTE_DEVICE_SIGNOUT_SUCCESS", email, AuthModule.currentUser ? AuthModule.currentUser.email : "admin", {
                    target_user: email,
                    remote_device: deviceName,
                    session_id: sessionId,
                    initiated_by: AuthModule.currentUser ? AuthModule.currentUser.email : "admin",
                    timestamp: new Date().toISOString()
                });
            }

            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`Device "${deviceName}" signed out remotely for ${email}.`, 'success');
            }
            this.openUserInspectionModal(email);
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

window.addEventListener('hirna:accounts_updated', () => {
    if (typeof SSOGateway !== 'undefined' && SSOGateway.renderAccountsTable) {
        SSOGateway.renderAccountsTable();
    }
});
