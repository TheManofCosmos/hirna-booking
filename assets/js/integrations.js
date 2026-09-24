/**
 * BPA Inter-Team Integration Simulator (Teams 3, 5, 7, 8, 9)
 * Maps 1-to-1 with the BPA Data Flow Architecture
 */
const BPAIntegrations = {
    history: [],

    init() {
        this.bindEvents();
        this.renderHistory();
    },

    triggerSync(targetTeam, actionName, customPayload = null) {
        let payload = customPayload;

        if (!payload) {
            switch (targetTeam) {
                case 'Team 9':
                    payload = {
                        action: "DISPATCH_TRIP_REQUEST",
                        source: "Team 10 Booking System",
                        booking_code: "TNVS-2026-0091",
                        pickup: "Ayala Malls Circuit",
                        dropoff: "BGC High Street",
                        vehicle_required: "Sedan (4-Seater)",
                        status: "DISPATCH_ACCEPTED"
                    };
                    break;
                case 'Team 5':
                    payload = {
                        action: "RECORD_FARE_COLLECTION",
                        source: "Team 10 Payments",
                        invoice: "INV-2026-00091",
                        gross_fare: 237.60,
                        tax_12pct: 28.51,
                        net_revenue: 209.09,
                        accounts_receivable: "SYNCED_TO_GENERAL_LEDGER"
                    };
                    break;
                case 'Team 8':
                    payload = {
                        action: "STORE_AUDIT_DOCUMENTATION",
                        source: "Team 10 SOP Compliance",
                        compliance_hash: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                        driver_contract_status: "ACTIVE_VALID"
                    };
                    break;
                case 'Team 3':
                    payload = {
                        action: "SUBMIT_DRIVER_PERFORMANCE_REPORT",
                        source: "Team 10 Analytics & GPS",
                        driver_id: "drv-101",
                        driver_name: "Ricardo Dalisay",
                        safety_score: 99,
                        customer_rating_avg: 4.92,
                        training_status: "SOP_CERTIFIED"
                    };
                    break;
                case 'Team 7':
                    payload = {
                        action: "UPDATE_ROUTE_AND_FLEET_AVAILABILITY",
                        source: "Team 10 GPS Playback",
                        vehicle_plate: "NFD-8892",
                        telemetry_points: 8,
                        route_status: "TRIP_COMPLETED",
                        fleet_availability: "READY_FOR_NEXT_DISPATCH"
                    };
                    break;
            }
        }

        const logEntry = {
            id: `SYNC-${Date.now().toString().slice(-4)}`,
            target: targetTeam,
            action: actionName,
            timestamp: new Date().toLocaleTimeString(),
            payload: payload,
            status: "200 OK (SUCCESS)"
        };

        this.history.unshift(logEntry);
        SupabaseBridge.logAudit("BPA Integration", actionName, logEntry.id, "BPA_Gateway", payload);
        
        if (actionName === 'RECORD_FARE_COLLECTION') {
            App.showToast("Transaction Recorded to Fare & Payments", 'success');
        } else {
            App.showToast(`BPA Webhook sent to ${targetTeam}: ${actionName}`, 'success');
        }
        this.renderHistory();
        this.showPayloadModal(logEntry);
    },

    renderHistory() {
        const tbody = document.getElementById('bpa-integration-tbody');
        if (!tbody) return;

        tbody.innerHTML = this.history.map(h => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100 font-mono text-xs">
                <td class="px-4 py-2.5 font-bold text-blue-600">${h.id}</td>
                <td class="px-4 py-2.5 text-slate-500">${h.timestamp}</td>
                <td class="px-4 py-2.5 font-semibold text-slate-800">${h.target}</td>
                <td class="px-4 py-2.5 text-slate-600">${h.action}</td>
                <td class="px-4 py-2.5 text-emerald-600 font-bold">● ${h.status}</td>
                <td class="px-4 py-2.5 text-right">
                    <button onclick="BPAIntegrations.inspect('${h.id}')" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]">Inspect</button>
                </td>
            </tr>
        `).join('');
    },

    inspect(id) {
        const item = this.history.find(h => h.id === id);
        if (item) this.showPayloadModal(item);
    },

    showPayloadModal(item) {
        const box = document.getElementById('bpa-payload-viewer');
        if (!box) return;
        box.innerText = JSON.stringify(item, null, 2);
    },

    bindEvents() {
        document.querySelectorAll('.btn-trigger-bpa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.dataset.team;
                const action = e.target.dataset.action;
                this.triggerSync(target, action);
            });
        });
    }
};
