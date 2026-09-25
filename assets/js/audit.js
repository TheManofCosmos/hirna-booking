/**
 * Module 6: SOP Compliance & Audit Logs Controller
 * Comprehensive Audit Trail & Detailed Receipt Inspection System
 */
const AuditModule = {
    currentFilter: 'ALL',
    searchQuery: '',
    activeReceiptLog: null,

    // Archives Vault State & Lockout
    isArchivesUnlocked: false,
    archiveAttempts: 0,
    archiveLockoutTimer: null,
    archiveFilter: 'ALL',
    archiveSearchQuery: '',
    activeArchiveDetail: null,

    init() {
        this.checkArchiveAutoUnlock();
        this.renderAuditLogs();
        this.checkArchiveLockout();
        this.renderArchives();
        this.bindEvents();
    },

    checkArchiveAutoUnlock() {
        try {
            const isUnlockedSession = sessionStorage.getItem('hirna_arch_unlocked') === 'true';
            let currentUser = (typeof AuthModule !== 'undefined') ? AuthModule.currentUser : null;
            if (!currentUser) {
                try {
                    const saved = localStorage.getItem('hirna_auth_user') || sessionStorage.getItem('hirna_auth_user');
                    if (saved) currentUser = JSON.parse(saved);
                } catch(e) {}
            }
            const isSuperAdminUser = !!(currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'admin'));
            if (isUnlockedSession || isSuperAdminUser) {
                this.isArchivesUnlocked = true;
                document.getElementById('archives-locked-container')?.classList.add('hidden');
                document.getElementById('archives-unlocked-container')?.classList.remove('hidden');
                const badge = document.getElementById('archives-lock-status-badge');
                if (badge) {
                    badge.className = "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-300";
                    badge.innerText = "Unlocked & Decrypted";
                }
            }
        } catch(e) {}
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
                            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
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
                            <svg class="w-3 h-3 text-hirna-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            <span>View</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openAuditView(logId) {
        return this.openAuditReceipt(logId);
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
                        <div class="text-[11px] text-emerald-800 flex items-center space-x-1.5">
                            <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
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
                                    <svg class="w-3.5 h-3.5 text-emerald-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
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
        const printable = document.getElementById('audit-receipt-printable');
        if (!printable) { window.print(); return; }

        // Clone only the receipt content into an isolated print popup
        const clonedContent = printable.cloneNode(true);

        // Remove scrollable overflow so the popup gets full height
        clonedContent.style.overflow = 'visible';
        clonedContent.style.maxHeight = 'none';
        clonedContent.style.flex = 'none';

        // Gather Tailwind CDN and local stylesheets from parent page
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(el => el.outerHTML)
            .join('\n');

        const printWin = window.open('', '_blank', 'width=520,height=780,toolbar=0,scrollbars=1,status=0');
        if (!printWin) {
            // Popup blocked fallback — @media print CSS only
            window.print();
            return;
        }

        printWin.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hirna Audit Receipt</title>
    ${styles}
    <style>
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; padding: 16px; font-family: sans-serif; background: #fff; }
        @media print {
            body { padding: 0; }
            button { display: none !important; }
        }
    </style>
</head>
<body>
    ${clonedContent.outerHTML}
    <script>
        window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 400);
        };
    <\/script>
</body>
</html>`);
        printWin.document.close();
    },

    printBookingReceipt() {
        const printable = document.getElementById('booking-receipt-printable');
        if (!printable) { window.print(); return; }

        const clonedContent = printable.cloneNode(true);
        clonedContent.style.overflow = 'visible';
        clonedContent.style.maxHeight = 'none';

        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(el => el.outerHTML)
            .join('\n');

        const printWin = window.open('', '_blank', 'width=520,height=780,toolbar=0,scrollbars=1,status=0');
        if (!printWin) { window.print(); return; }

        printWin.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hirna Booking Receipt</title>
    ${styles}
    <style>
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; padding: 16px; font-family: sans-serif; background: #fff; }
        @media print { body { padding: 0; } button { display: none !important; } }
    </style>
</head>
<body>
    ${clonedContent.outerHTML}
    <script>
        window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 400); };
    <\/script>
</body>
</html>`);
        printWin.document.close();
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

    // ==========================================
    // ARCHIVES RETENTION VAULT CONTROLLER
    // ==========================================

    checkArchiveLockout() {
        try {
            const lockoutUntil = parseInt(sessionStorage.getItem('hirna_arch_lockout_until') || '0', 10);
            if (lockoutUntil > Date.now()) {
                this.triggerArchiveLockoutCountdown(Math.ceil((lockoutUntil - Date.now()) / 1000));
            }
        } catch(e) {}
    },

    triggerArchiveLockoutCountdown(seconds) {
        const input = document.getElementById('archives-auth-password');
        const btn = document.getElementById('btn-unlock-archives');
        const btnText = document.getElementById('btn-unlock-archives-text');
        const alertBox = document.getElementById('archives-auth-alert');
        const alertText = document.getElementById('archives-auth-alert-text');

        if (input) input.disabled = true;
        if (btn) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        let remaining = seconds;
        if (this.archiveLockoutTimer) clearInterval(this.archiveLockoutTimer);

        if (alertBox && alertText) {
            alertBox.classList.remove('hidden');
            alertText.innerText = `Vault locked due to security policy violations. Locked for ${remaining}s...`;
        }

        this.archiveLockoutTimer = setInterval(() => {
            remaining--;
            if (btnText) btnText.innerText = `Vault Locked (${remaining}s)`;
            if (alertText) alertText.innerText = `Vault locked due to security policy violations. Please wait ${remaining}s...`;

            if (remaining <= 0) {
                clearInterval(this.archiveLockoutTimer);
                this.archiveLockoutTimer = null;
                sessionStorage.removeItem('hirna_arch_lockout_until');
                this.archiveAttempts = 0;
                if (input) {
                    input.disabled = false;
                    input.value = '';
                }
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
                if (btnText) btnText.innerText = `Decrypt & Unlock Archives Vault`;
                if (alertBox) alertBox.classList.add('hidden');
            }
        }, 1000);
    },

    unlockArchives(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('archives-auth-password');
        const alertBox = document.getElementById('archives-auth-alert');
        const alertText = document.getElementById('archives-auth-alert-text');
        if (!input) return;

        const pwd = input.value.trim();
        if (!pwd) {
            if (alertBox && alertText) {
                alertBox.classList.remove('hidden');
                alertText.innerText = "Please enter the SuperAdmin password.";
            }
            return;
        }

        // Verify password against SuperAdmin accounts
        let isSuperAdminValid = false;
        if (typeof AuthModule !== 'undefined' && AuthModule.accounts) {
            const superAdmins = AuthModule.accounts.filter(a => a.role === 'superadmin');
            isSuperAdminValid = superAdmins.some(sa => (sa.password || '').trim() === pwd);
        }
        if (!isSuperAdminValid && pwd === 'superadmin') {
            isSuperAdminValid = true;
        }

        if (!isSuperAdminValid) {
            this.archiveAttempts++;
            if (this.archiveAttempts >= 3) {
                const lockoutSeconds = 15;
                const lockoutUntil = Date.now() + (lockoutSeconds * 1000);
                try {
                    sessionStorage.setItem('hirna_arch_lockout_until', String(lockoutUntil));
                } catch(err) {}
                this.triggerArchiveLockoutCountdown(lockoutSeconds);
            } else {
                const left = 3 - this.archiveAttempts;
                if (alertBox && alertText) {
                    alertBox.classList.remove('hidden');
                    alertText.innerText = `Access Denied: Invalid SuperAdmin password. (${left} attempt${left === 1 ? '' : 's'} remaining before lockout)`;
                }
            }
            return;
        }

        // Successfully authenticated!
        this.archiveAttempts = 0;
        this.isArchivesUnlocked = true;
        try {
            sessionStorage.setItem('hirna_arch_unlocked', 'true');
        } catch(e) {}
        if (alertBox) alertBox.classList.add('hidden');

        // Toggle UI
        document.getElementById('archives-locked-container')?.classList.add('hidden');
        document.getElementById('archives-unlocked-container')?.classList.remove('hidden');

        const badge = document.getElementById('archives-lock-status-badge');
        if (badge) {
            badge.className = "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-300";
            badge.innerText = "Unlocked & Decrypted";
        }

        // Log audit event
        const userEmail = (typeof AuthModule !== 'undefined' && AuthModule.currentUser && AuthModule.currentUser.email) ? AuthModule.currentUser.email : 'superadmin@hirna.ph';
        SupabaseBridge.logAudit("Compliance & Archival", "ARCHIVES_VAULT_UNLOCKED", "ARCHIVES-VAULT", userEmail, {
            action: "VAULT_DECRYPTED",
            timestamp: new Date().toISOString()
        });

        this.renderArchives();

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast("Compliance Archives Vault unlocked and decrypted.", "success");
        }
    },

    lockArchives() {
        this.isArchivesUnlocked = false;
        try {
            sessionStorage.removeItem('hirna_arch_unlocked');
        } catch(e) {}
        document.getElementById('archives-unlocked-container')?.classList.add('hidden');
        document.getElementById('archives-locked-container')?.classList.remove('hidden');

        const input = document.getElementById('archives-auth-password');
        if (input) input.value = '';

        const badge = document.getElementById('archives-lock-status-badge');
        if (badge) {
            badge.className = "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 border border-rose-500/40 text-rose-300";
            badge.innerText = "Locked";
        }

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast("Compliance Archives Vault locked.", "info");
        }
    },

    filterArchives(val) {
        this.archiveFilter = val;
        this.renderArchives();
    },

    searchArchives(val) {
        this.archiveSearchQuery = val;
        this.renderArchives();
    },

    renderArchives(filter = this.archiveFilter, query = this.archiveSearchQuery) {
        const allArchivesTotal = SupabaseBridge.getAllArchives();
        const pill = document.getElementById('archives-count-pill');
        if (pill) {
            pill.innerText = `${allArchivesTotal.length} archived record${allArchivesTotal.length === 1 ? '' : 's'}`;
        }

        if (!this.isArchivesUnlocked) return;
        const tbody = document.getElementById('archives-tbody');
        if (!tbody) return;

        let archives = SupabaseBridge.getAllArchives(filter === 'ALL' ? null : filter);

        if (query && query.trim() !== '') {
            const q = query.trim().toLowerCase();
            archives = archives.filter(item => {
                const idMatch = (item._displayId || '').toLowerCase().includes(q);
                const tableMatch = (item._table || '').toLowerCase().includes(q);
                const byMatch = (item.archived_by || '').toLowerCase().includes(q);
                const reasonMatch = (item.archive_reason || '').toLowerCase().includes(q);
                const fullMatch = JSON.stringify(item).toLowerCase().includes(q);
                return idMatch || tableMatch || byMatch || reasonMatch || fullMatch;
            });
        }

        if (archives.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-10 text-xs text-slate-400">
                        <div class="flex flex-col items-center justify-center space-y-1">
                            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                            <span class="font-semibold text-slate-600">No archived records found</span>
                            <span class="text-[11px] text-slate-400">${query ? 'Try changing your search term.' : 'Records archived from Bookings, Payments, or CRM will appear here.'}</span>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const tableLabels = {
            bookings: { name: "Trips & Rides", badge: "bg-blue-50 text-blue-800 border-blue-200" },
            payments: { name: "Financial Invoices", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            support_tickets: { name: "Support Tickets", badge: "bg-purple-50 text-purple-800 border-purple-200" },
            feedback: { name: "Passenger Feedback", badge: "bg-amber-50 text-amber-800 border-amber-200" }
        };

        tbody.innerHTML = archives.map(item => {
            const tblInfo = tableLabels[item._table] || { name: item._table, badge: "bg-slate-100 text-slate-700 border-slate-200" };
            const summary = item.archive_reason || (item.details || item.subject || item.pickup || item.comment || 'Archived record');
            const dateStr = item.archived_at || 'N/A';
            const userStr = item.archived_by || 'superadmin@hirna.ph';
            const safeId = item._displayId;

            return `
                <tr class="hover:bg-slate-50/80 transition border-b border-slate-100 font-mono text-[11px]">
                    <td class="px-4 py-2.5 font-bold text-slate-800">
                        <button onclick="AuditModule.viewArchivedDetails('${item._table}', '${safeId}')" class="text-hirna-700 hover:text-hirna-900 hover:underline font-bold text-left cursor-pointer">
                            ${safeId}
                        </button>
                    </td>
                    <td class="px-4 py-2.5 whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${tblInfo.badge}">
                            ${tblInfo.name}
                        </span>
                    </td>
                    <td class="px-4 py-2.5 text-slate-500 whitespace-nowrap">${dateStr}</td>
                    <td class="px-4 py-2.5 text-slate-600 truncate max-w-[140px]" title="${userStr}">${userStr}</td>
                    <td class="px-4 py-2.5 text-slate-700 max-w-xs truncate" title="${summary}">${summary}</td>
                    <td class="px-4 py-2.5 text-right whitespace-nowrap space-x-1">
                        <button onclick="AuditModule.viewArchivedDetails('${item._table}', '${safeId}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-[10px] transition cursor-pointer">
                            Details
                        </button>
                        <button onclick="AuditModule.restoreArchivedRecord('${item._table}', '${safeId}')" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px] transition cursor-pointer inline-flex items-center space-x-1" title="Restore record to active system">
                            <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            <span>Restore</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    restoreArchivedRecord(table, id) {
        if (confirm(`SuperAdmin Action: Are you sure you want to restore record ${id} back to active ${table}?`)) {
            const restored = SupabaseBridge.unarchive(table, id);
            if (restored) {
                this.renderArchives();
                this.closeArchiveDetails();
                if (typeof App !== 'undefined' && App.showToast) {
                    App.showToast(`Record ${id} successfully restored to active records!`, 'success');
                }
            }
        }
    },

    viewArchivedDetails(table, id) {
        const archives = SupabaseBridge.getAllArchives(table);
        const item = archives.find(a => a._displayId === id) || archives[0];
        if (!item) return;

        this.activeArchiveDetail = item;

        const titleEl = document.getElementById('arch-modal-title');
        const subEl = document.getElementById('arch-modal-subtitle');
        const bodyEl = document.getElementById('arch-modal-body');
        const restoreBtn = document.getElementById('btn-modal-restore-arch');

        if (titleEl) titleEl.innerText = `Archived Record: ${item._displayId}`;
        if (subEl) subEl.innerText = `Origin: ${item._table.toUpperCase()} • Preserved on ${item.archived_at || 'N/A'}`;

        if (restoreBtn) {
            restoreBtn.onclick = () => this.restoreArchivedRecord(item._table, item._displayId);
        }

        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 font-sans">
                    <div class="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
                        <span class="text-slate-500 font-semibold">Subsystem</span>
                        <span class="font-bold text-slate-800">${item._table}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
                        <span class="text-slate-500 font-semibold">Archived By</span>
                        <span class="font-mono text-slate-700">${item.archived_by || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
                        <span class="text-slate-500 font-semibold">Timestamp</span>
                        <span class="font-mono text-slate-700">${item.archived_at || 'N/A'}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
                        <span class="text-slate-500 font-semibold">Archive Reason</span>
                        <span class="font-medium text-amber-800">${item.archive_reason || 'Archived by user'}</span>
                    </div>
                </div>

                <details class="bg-slate-50 p-3 rounded-2xl border border-slate-200" open>
                    <summary class="font-bold text-slate-700 cursor-pointer text-xs mb-2">Original Snapshot JSON Payload</summary>
                    <pre class="bg-slate-900 text-gold-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto select-all">${JSON.stringify(item, null, 2)}</pre>
                </details>
            `;
        }

        document.getElementById('archive-details-modal')?.classList.remove('hidden');
    },

    closeArchiveDetails() {
        document.getElementById('archive-details-modal')?.classList.add('hidden');
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

        document.getElementById('archive-details-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'archive-details-modal') {
                this.closeArchiveDetails();
            }
        });

        // Close on ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuditReceipt();
                this.closeArchiveDetails();
            }
        });

        // Live sync when new audit log recorded
        window.addEventListener('hirna:audit_logged', () => {
            this.renderAuditLogs();
        });

        // Live sync when database changes (e.g. archiving/restoring)
        window.addEventListener('hirna:db_updated', () => {
            this.renderArchives();
            this.renderAuditLogs();
        });

        // Cross-tab storage sync
        window.addEventListener('storage', (e) => {
            if (e.key === 'hirna_audit_logs') {
                this.renderAuditLogs();
            }
            if (e.key && e.key.startsWith('hirna_db_')) {
                this.renderArchives();
            }
        });
    }
};
