/**
 * Module 6: SOP Compliance & Audit Logs Controller
 * Comprehensive Audit Trail & Detailed Receipt Inspection System
 */
const AuditModule = {
    currentFilter: 'ALL',
    searchQuery: '',
    activeReceiptLog: null,

    init() {
        this.renderAuditLogs();
        this.bindEvents();
    },

    getModuleBadgeClass(module) {
        switch ((module || '').toLowerCase()) {
            case 'booking system':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'payment gateway':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'sop compliance':
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'authentication':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'sso gateway':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'gps & telemetry':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'demand analytics':
                return 'bg-cyan-50 text-cyan-800 border-cyan-200';
            case 'crm & retention':
                return 'bg-pink-50 text-pink-700 border-pink-200';
            case 'bpa integration':
                return 'bg-teal-50 text-teal-800 border-teal-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    },

    renderAuditLogs(filter = this.currentFilter, query = this.searchQuery) {
        this.currentFilter = filter;
        this.searchQuery = query;

        const tbody = document.getElementById('audit-logs-tbody');
        if (!tbody) return;

        let logs = SupabaseBridge.getData('audit_logs') || [];

        // Apply module filter
        if (filter !== 'ALL') {
            logs = logs.filter(l => l.module === filter);
        }

        // Apply search query
        if (query && query.trim() !== '') {
            const q = query.trim().toLowerCase();
            logs = logs.filter(l => {
                const idMatch = (l.id || '').toLowerCase().includes(q);
                const eventMatch = (l.event || '').toLowerCase().includes(q);
                const moduleMatch = (l.module || '').toLowerCase().includes(q);
                const userMatch = (l.user || '').toLowerCase().includes(q);
                const detailsMatch = (l.details || '').toLowerCase().includes(q);
                const entityMatch = (l.entity || '').toLowerCase().includes(q);
                const payloadMatch = l.payload ? JSON.stringify(l.payload).toLowerCase().includes(q) : false;
                return idMatch || eventMatch || moduleMatch || userMatch || detailsMatch || entityMatch || payloadMatch;
            });
        }

        if (logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8 text-xs text-slate-400">
                        <div class="flex flex-col items-center justify-center space-y-1">
                            <span class="text-2xl">📋</span>
                            <span class="font-semibold text-slate-600">No audit logs matching criteria</span>
                            <span class="text-[11px] text-slate-400">Try adjusting the filter or search query.</span>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = logs.map(l => {
            const badgeClass = this.getModuleBadgeClass(l.module);
            return `
                <tr class="hover:bg-slate-50/80 transition border-b border-slate-100 font-mono text-[11px]">
                    <td class="px-4 py-2.5 font-bold text-slate-800">
                        <button onclick="AuditModule.openAuditReceipt('${l.id}')" class="text-hirna-700 hover:text-hirna-900 hover:underline font-bold text-left cursor-pointer">
                            ${l.id}
                        </button>
                    </td>
                    <td class="px-4 py-2.5 text-slate-500 whitespace-nowrap">${l.timestamp}</td>
                    <td class="px-4 py-2.5 whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeClass}">${l.module}</span>
                    </td>
                    <td class="px-4 py-2.5 font-semibold text-slate-800 whitespace-nowrap">${l.event}</td>
                    <td class="px-4 py-2.5 text-slate-600 truncate max-w-[130px]" title="${l.user}">${l.user}</td>
                    <td class="px-4 py-2.5 text-slate-600 max-w-xs truncate" title="${l.details}">${l.details}</td>
                    <td class="px-4 py-2.5 text-emerald-600 font-bold whitespace-nowrap">● ${l.status || 'SUCCESS'}</td>
                    <td class="px-4 py-2.5 text-right whitespace-nowrap">
                        <button onclick="AuditModule.openAuditReceipt('${l.id}')" class="px-2.5 py-1 bg-hirna-50 hover:bg-hirna-100 text-hirna-800 border border-hirna-200 rounded-lg font-bold text-[10px] transition inline-flex items-center space-x-1 cursor-pointer shadow-2xs">
                            <svg class="w-3 h-3 text-hirna-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            <span>Receipt</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openAuditReceipt(logId) {
        const logs = SupabaseBridge.getData('audit_logs') || [];
        const log = logs.find(l => l.id === logId) || logs[0];
        if (!log) return;

        this.activeReceiptLog = log;

        // Populate Metadata Header
        document.getElementById('arcpt-log-id').innerText = log.id;
        document.getElementById('arcpt-module').innerText = log.module;
        document.getElementById('arcpt-event').innerText = log.event;
        document.getElementById('arcpt-timestamp').innerText = log.timestamp;
        document.getElementById('arcpt-user').innerText = log.user;
        document.getElementById('arcpt-ip').innerText = log.ip || '120.28.17.44';
        document.getElementById('arcpt-entity').innerText = log.entity || 'N/A';
        document.getElementById('arcpt-status-badge').innerText = (log.status || 'RECORDED & VERIFIED').toUpperCase();

        const hash = log.syslog_hash || SupabaseBridge.generateAuditHash(log.id, log.timestamp, log.event, log.entity);
        document.getElementById('arcpt-hash').innerText = hash;

        // Dynamic QR code for verification
        const qrEl = document.getElementById('arcpt-qr-image');
        if (qrEl) {
            const qrData = encodeURIComponent(`HIRNA-AUDIT-VERIFY|${log.id}|${log.event}|${log.entity}|${hash.substring(0, 16)}`);
            qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;
        }

        // Raw JSON inspection
        const rawJsonEl = document.getElementById('arcpt-raw-json');
        if (rawJsonEl) {
            rawJsonEl.innerText = JSON.stringify(log, null, 2);
        }

        // Render Dynamic Body based on event & module
        this.renderReceiptBody(log);

        const modal = document.getElementById('audit-receipt-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    renderReceiptBody(log) {
        const container = document.getElementById('arcpt-dynamic-content');
        if (!container) return;

        const p = log.payload || {};
        const mod = (log.module || '').toLowerCase();
        const evt = (log.event || '').toLowerCase();

        // 1. PAYMENT / FINANCIAL RECEIPT
        if (mod.includes('payment') || evt.includes('payment') || evt.includes('wallet') || p.amount || p.total_fare) {
            const amount = parseFloat(p.amount || p.total_fare || 0);
            const baseFare = parseFloat(p.base_fare || (amount * 0.35)).toFixed(2);
            const distFare = parseFloat(p.distance_fare || (amount * 0.45)).toFixed(2);
            const timeFare = parseFloat(p.time_fare || (amount * 0.10)).toFixed(2);
            const vatAmount = parseFloat(p.vat_amount || (amount * 0.12)).toFixed(2);
            const channel = p.channel || p.method || p.payment_method || 'GCash Standard';
            const invoiceNo = p.invoice_no || p.invoice || log.entity || 'INV-2026-00000';
            const txnRef = p.txn_ref || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

            container.innerHTML = `
                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div class="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
                        <span class="text-slate-500 font-semibold">Payment Channel</span>
                        <span class="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${channel}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
                        <span class="text-slate-500 font-semibold">Invoice Number</span>
                        <span class="font-mono font-bold text-slate-800">${invoiceNo}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
                        <span class="text-slate-500 font-semibold">Gateway Transaction Ref</span>
                        <span class="font-mono text-slate-700">${txnRef}</span>
                    </div>

                    <!-- Itemized Charges -->
                    <div class="space-y-1 text-xs pt-1">
                        <div class="flex justify-between text-slate-600">
                            <span>Base Flagdown</span>
                            <span class="font-mono text-slate-800">₱${baseFare}</span>
                        </div>
                        <div class="flex justify-between text-slate-600">
                            <span>Distance Traveled</span>
                            <span class="font-mono text-slate-800">₱${distFare}</span>
                        </div>
                        <div class="flex justify-between text-slate-600">
                            <span>Travel Time Fare</span>
                            <span class="font-mono text-slate-800">₱${timeFare}</span>
                        </div>
                        <div class="flex justify-between text-slate-600">
                            <span>Dynamic Demand Surge</span>
                            <span class="font-mono text-amber-700">${p.surge_multiplier || '1.0'}x</span>
                        </div>
                        <div class="flex justify-between text-slate-400 text-[10px]">
                            <span>VAT (12% Included)</span>
                            <span class="font-mono">₱${vatAmount}</span>
                        </div>
                    </div>

                    <!-- Total -->
                    <div class="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black">
                        <span class="text-xs text-slate-900">Total Settled Amount</span>
                        <span class="text-lg font-mono text-hirna-800">₱${amount.toFixed(2)}</span>
                    </div>
                </div>
            `;
            return;
        }

        // 2. BOOKING & DISPATCH RECEIPT
        if (mod.includes('booking') || evt.includes('trip') || evt.includes('dispatch') || p.pickup) {
            container.innerHTML = `
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                        <div>
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Service Vertical</span>
                            <span class="font-bold text-hirna-900">${(p.service_type || 'Transport Taxi').toUpperCase()}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Vehicle Category</span>
                            <span class="font-semibold text-slate-700">${p.vehicle_class || 'Sedan (4-Seater)'}</span>
                        </div>
                    </div>

                    <!-- Route Details -->
                    <div class="space-y-1.5 py-1">
                        <div class="flex items-start space-x-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                            <div class="truncate">
                                <span class="text-[9px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                                <span class="text-slate-800 font-semibold block truncate">${p.pickup || 'Ayala Malls Circuit, Makati City'}</span>
                            </div>
                        </div>
                        <div class="flex items-start space-x-2">
                            <span class="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0"></span>
                            <div class="truncate">
                                <span class="text-[9px] uppercase font-bold text-slate-400 block">Dropoff Destination</span>
                                <span class="text-slate-800 font-semibold block truncate">${p.dropoff || 'Bonifacio High Street, BGC, Taguig'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Dispatch Assignment Details -->
                    <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Assigned Driver</span>
                            <span class="font-bold text-slate-800 truncate block">${p.driver_name || 'Ricardo Dalisay'}</span>
                            <span class="text-[10px] text-slate-600 font-mono block">${p.driver_plate || 'TXI-5431'}</span>
                        </div>
                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Passenger / Requester</span>
                            <span class="font-bold text-slate-800 truncate block">${p.passenger_name || log.user}</span>
                            <span class="text-[10px] text-emerald-700 font-bold block">Fare: ₱${parseFloat(p.total_fare || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        // 3. SOP COMPLIANCE INSPECTION RECEIPT
        if (mod.includes('sop') || evt.includes('inspection') || evt.includes('sop') || p.checklist) {
            const chk = p.checklist || {
                brakes_and_tires: "PASSED",
                dashcam_telemetry: "PASSED",
                headlights_and_signals: "PASSED",
                first_aid_kit: "PASSED",
                seatbelts_and_airbags: "PASSED"
            };

            container.innerHTML = `
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Inspected Driver</span>
                            <span class="font-bold text-slate-900 text-sm">${p.driver || 'Ricardo Dalisay'}</span>
                            <span class="text-[10px] text-slate-500 font-mono">License: ${p.license_no || log.entity} (${p.license_status || 'VALID_UNTIL_2028'})</span>
                        </div>
                        <div class="text-right">
                            <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-black text-xs">
                                100% COMPLIANT
                            </span>
                        </div>
                    </div>

                    <div class="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 space-y-1">
                        <span class="text-[10px] font-bold text-emerald-900 block uppercase">LTFRB Franchise & Safety Status</span>
                        <div class="text-[11px] text-emerald-800 flex items-center space-x-1">
                            <span>✓</span>
                            <span class="font-medium">${p.ltfrb_franchise || 'ACTIVE_VERIFIED_LTFRB-2026-TXI-041'}</span>
                        </div>
                    </div>

                    <!-- Checklist items -->
                    <div class="space-y-1.5 pt-1">
                        <span class="text-[9px] uppercase font-bold text-slate-400 block">Pre-Trip Safety Inspection Criteria</span>
                        ${Object.entries(chk).map(([item, status]) => `
                            <div class="flex items-center justify-between text-[11px] py-1 border-b border-slate-100">
                                <span class="capitalize text-slate-700">${item.replace(/_/g, ' ')}</span>
                                <span class="font-bold text-emerald-700 font-mono flex items-center space-x-1">
                                    <span>✓</span>
                                    <span>${status}</span>
                                </span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="text-[10px] text-slate-500 italic pt-1 text-right">
                        Audited by: <span class="font-semibold text-slate-700">${p.auditor || 'Engr. Ramon Bautista (Chief Safety Inspector)'}</span>
                    </div>
                </div>
            `;
            return;
        }

        // 4. AUTHENTICATION & RBAC SECURITY RECEIPT
        if (mod.includes('auth') || mod.includes('sso') || evt.includes('login') || evt.includes('role')) {
            container.innerHTML = `
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Authenticated Account</span>
                            <span class="font-bold text-slate-900 text-sm">${p.operator || p.target_account || log.user}</span>
                        </div>
                        <span class="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 font-bold rounded-full text-[10px]">
                            ${p.role || p.assigned_role || 'Superadmin'}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-[11px]">
                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Authentication Protocol</span>
                            <span class="font-semibold text-slate-800">${p.auth_method || 'Google 2FA Passkey (OTP)'}</span>
                        </div>
                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Security Clearance</span>
                            <span class="font-semibold text-slate-800">${p.clearance_level || 'Tier 4 - Root Security Clearance'}</span>
                        </div>
                    </div>

                    <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px]">
                        <span class="font-bold text-slate-700 block mb-1">Active Security Token & Permissions</span>
                        <div class="font-mono text-slate-600 truncate">${p.session_token || 'jwt_sec_token_active_verified_2026'}</div>
                    </div>
                </div>
            `;
            return;
        }

        // 5. DEMAND ANALYTICS & DYNAMIC SURGE RECEIPT
        if (mod.includes('analytics') || evt.includes('surge') || p.demand_ratio) {
            container.innerHTML = `
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Target Zone</span>
                            <span class="font-bold text-slate-900 text-sm">${p.zone || log.entity}</span>
                        </div>
                        <span class="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-black rounded-full text-xs">
                            ${p.multiplier_after || '1.35'}x Surge Applied
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-[11px]">
                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Active Requests</span>
                            <span class="font-mono font-bold text-slate-800">${p.active_requests || 89} Bookers</span>
                        </div>
                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Supply Drivers</span>
                            <span class="font-mono font-bold text-slate-800">${p.available_drivers || 64} Available</span>
                        </div>
                    </div>

                    <p class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        Reason: <span class="font-medium text-slate-800">${log.details}</span>
                    </p>
                </div>
            `;
            return;
        }

        // 6. DEFAULT / DATABASE / PROCESS CHANGE RECEIPT
        container.innerHTML = `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div class="text-slate-500 font-semibold mb-1">Process / System Change Details</div>
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800 space-y-1">
                    <div><span class="text-slate-400">Summary:</span> ${log.details}</div>
                    <div><span class="text-slate-400">Entity:</span> ${log.entity}</div>
                    <div><span class="text-slate-400">Module:</span> ${log.module}</div>
                </div>
            </div>
        `;
    },

    closeAuditReceipt() {
        document.getElementById('audit-receipt-modal')?.classList.add('hidden');
    },

    printAuditReceipt() {
        window.print();
    },

    copyAuditProof() {
        if (!this.activeReceiptLog) return;
        const proof = {
            id: this.activeReceiptLog.id,
            timestamp: this.activeReceiptLog.timestamp,
            module: this.activeReceiptLog.module,
            event: this.activeReceiptLog.event,
            entity: this.activeReceiptLog.entity,
            user: this.activeReceiptLog.user,
            hash: this.activeReceiptLog.syslog_hash || SupabaseBridge.generateAuditHash(this.activeReceiptLog.id, this.activeReceiptLog.timestamp, this.activeReceiptLog.event, this.activeReceiptLog.entity),
            details: this.activeReceiptLog.details,
            payload: this.activeReceiptLog.payload
        };

        const str = JSON.stringify(proof, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(str).then(() => {
                if (typeof App !== 'undefined' && App.showToast) {
                    App.showToast("Audit proof copied to clipboard!", "success");
                }
            });
        }
    },

    bindEvents() {
        // Module filter change
        document.getElementById('audit-filter-select')?.addEventListener('change', (e) => {
            this.renderAuditLogs(e.target.value, this.searchQuery);
        });

        // Search input
        document.getElementById('audit-search-input')?.addEventListener('input', (e) => {
            this.renderAuditLogs(this.currentFilter, e.target.value);
        });

        // SOP Pre-Trip checklist button
        document.getElementById('btn-verify-driver-sop')?.addEventListener('click', () => {
            const driverName = document.getElementById('sop-driver-select')?.value || "Ricardo Dalisay";
            
            // Record SOP compliance verification
            const newLog = SupabaseBridge.logAudit("SOP Compliance", "DRIVER_PRE_TRIP_INSPECTION", "N01-19-123456", "Safety_Auditor", {
                driver: driverName,
                license_no: "N01-19-123456",
                license_status: "VALID_UNTIL_2028",
                ltfrb_franchise: "ACTIVE_VERIFIED_LTFRB-2026-TXI-041",
                vehicle_plate: "NFD-8892",
                vehicle_safety_check: "PASSED (Brakes, Tires, Lights, Dashcam, First Aid)",
                checklist: {
                    brakes_and_tires: "PASSED",
                    dashcam_telemetry: "PASSED",
                    headlights_and_signals: "PASSED",
                    first_aid_kit: "PASSED",
                    seatbelts_and_airbags: "PASSED"
                },
                compliance_score: "100%",
                auditor: "Engr. Ramon Bautista (Chief Safety Inspector)"
            });

            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`SOP Compliance Verified for ${driverName}! Logged in audit records.`, 'success');
            }
            this.renderAuditLogs();

            // Automatically open receipt view for the newly created audit log!
            setTimeout(() => {
                this.openAuditReceipt(newLog.id);
            }, 300);
        });

        // Close on background click
        document.getElementById('audit-receipt-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'audit-receipt-modal') {
                this.closeAuditReceipt();
            }
        });

        // Close on ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuditReceipt();
            }
        });

        // Live sync when new audit log recorded
        window.addEventListener('hirna:audit_logged', () => {
            this.renderAuditLogs();
        });

        // Cross-tab storage sync
        window.addEventListener('storage', (e) => {
            if (e.key === 'hirna_audit_logs') {
                this.renderAuditLogs();
            }
        });
    }
};
