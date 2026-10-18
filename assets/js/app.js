/**
 * Main Application Orchestrator
 */
const App = {
    async init() {
        console.log("[Hirna] Initializing Hirna: Transport & Delivery Platform...");
        
        // 1. Hydrate local DB synchronously so all modules and active trips resume immediately (0ms delay)
        try {
            if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.hydrateAllFromLocalStorage) {
                SupabaseBridge.hydrateAllFromLocalStorage();
            }
        } catch(e) {}

        // Helper to safely initialize each submodule
        const safeInit = (modName, fn) => {
            try {
                if (typeof fn === 'function') {
                    fn();
                    console.log(`[Hirna] ${modName} initialized.`);
                }
            } catch (err) {
                console.error(`Error initializing ${modName}:`, err);
            }
        };

        // 2. Initialize Submodules immediately without waiting on remote network timeouts
        safeInit('AuthModule', () => typeof AuthModule !== 'undefined' && AuthModule.init && AuthModule.init());
        safeInit('BookingModule', () => typeof BookingModule !== 'undefined' && BookingModule.init && BookingModule.init());
        safeInit('PaymentsModule', () => typeof PaymentsModule !== 'undefined' && PaymentsModule.init && PaymentsModule.init());
        safeInit('CRMModule', () => typeof CRMModule !== 'undefined' && CRMModule.init && CRMModule.init());
        safeInit('GPSModule', () => typeof GPSModule !== 'undefined' && GPSModule.init && GPSModule.init());
        safeInit('AnalyticsModule', () => typeof AnalyticsModule !== 'undefined' && AnalyticsModule.init && AnalyticsModule.init());
        safeInit('AuditModule', () => typeof AuditModule !== 'undefined' && AuditModule.init && AuditModule.init());
        safeInit('SSOGateway', () => typeof SSOGateway !== 'undefined' && SSOGateway.renderAccountsTable && SSOGateway.renderAccountsTable());

        // 3. Bind Navigation Tabs (Guaranteed to execute)
        this.bindNavigation();

        // 4. Initialize Persistent Floating Trip Mini-Player (Music player style across pages)
        try {
            this.initTripMiniPlayer();
        } catch(e) {}

        console.log("[Hirna] Hirna: Transport & Delivery Platform ready!");

        // 5. Sync with Supabase Cloud / remote DB in background and refresh views on new records
        try {
            if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.init) {
                await SupabaseBridge.init();
                if (SupabaseBridge.refreshActiveModules) {
                    ['bookings', 'payments', 'support_tickets', 'feedback', 'audit_logs'].forEach(tbl => {
                        SupabaseBridge.refreshActiveModules(tbl);
                    });
                }
            }
        } catch(e) {
            console.warn("Supabase init warning:", e);
        }
    },

    bindNavigation() {
        const pageMap = {
            'main.html': 'dashboard',
            'main': 'dashboard',
            'index.html': 'dashboard',
            'index': 'dashboard',
            '': 'dashboard',
            'booking.html': 'booking',
            'booking': 'booking',
            'payments.html': 'payments',
            'payments': 'payments',
            'crm.html': 'crm',
            'crm': 'crm',
            'gps.html': 'gps',
            'gps': 'gps',
            'analytics.html': 'analytics',
            'analytics': 'analytics',
            'audit.html': 'audit',
            'audit': 'audit',
            'sso.html': 'sso',
            'sso': 'sso',
            'passenger.html': 'passenger',
            'passenger': 'passenger'
        };

        const currentFile = window.location.pathname.split('/').pop() || 'main.html';
        const currentTabKey = pageMap[currentFile] || 'dashboard';

        // Highlight matching navigation tab based on current page
        document.querySelectorAll('.nav-tab-btn, .nav-tab-link').forEach(link => {
            const tabName = link.dataset.tab;
            const href = link.getAttribute('href');
            const isMatch = (tabName && tabName === currentTabKey) || (href && href.endsWith(currentFile));

            if (isMatch) {
                link.classList.remove('text-hirna-100', 'hover:bg-hirna-700/70', 'hover:text-white', 'font-semibold', 'bg-hirna-900', 'text-gold-400');
                link.classList.add('bg-gold-500', 'text-hirna-950', 'font-bold', 'shadow-md');
            }
        });

        // Retain in-page tab switching if tab-content-panels exist in same DOM
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            if (btn.tagName === 'A') return; // Regular anchor handles navigation
            btn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    },

    switchTab(targetTab) {
        const tabToPage = {
            'dashboard': 'main.html',
            'main': 'main.html',
            'booking': 'booking.html',
            'payments': 'payments.html',
            'crm': 'crm.html',
            'gps': 'gps.html',
            'analytics': 'analytics.html',
            'audit': 'audit.html',
            'sso': 'sso.html'
        };

        const targetPage = tabToPage[targetTab];
        const activePanel = document.getElementById(`tab-${targetTab}`);

        if (activePanel) {
            document.querySelectorAll('.tab-content-panel').forEach(panel => panel.classList.add('hidden'));
            activePanel.classList.remove('hidden');

            document.querySelectorAll('.nav-tab-btn, .nav-tab-link').forEach(b => {
                b.classList.remove('bg-gold-500', 'text-hirna-950', 'font-bold', 'shadow-md');
                b.classList.add('text-hirna-100', 'hover:bg-hirna-700/70', 'hover:text-white', 'font-semibold');
            });
            const activeBtn = document.querySelector(`[data-tab="${targetTab}"]`);
            if (activeBtn) {
                activeBtn.classList.add('bg-gold-500', 'text-hirna-950', 'font-bold', 'shadow-md');
                activeBtn.classList.remove('text-hirna-100', 'hover:bg-hirna-700/70', 'hover:text-white', 'font-semibold');
            }

            if (targetTab === 'booking' && typeof BookingModule !== 'undefined' && BookingModule.map) {
                setTimeout(() => BookingModule.map.invalidateSize(), 150);
            }
            if (targetTab === 'gps' && typeof GPSModule !== 'undefined' && GPSModule.map) {
                setTimeout(() => GPSModule.map.invalidateSize(), 150);
            }
        } else if (targetPage) {
            window.location.href = targetPage;
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const bg = type === 'success' ? 'bg-emerald-600' : 'bg-slate-900';
        toast.className = `${bg} text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 transition-all transform duration-300 translate-y-2 opacity-0`;
        toast.innerHTML = `<svg class="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
        setTimeout(() => {
            toast.classList.add('opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    initTripMiniPlayer() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('hirna-trip-mini-player')) return;

        const el = document.createElement('div');
        el.id = 'hirna-trip-mini-player';
        el.className = 'hidden fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-[430px] z-[1600] bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden transition-all duration-300 select-none';
        el.innerHTML = `
            <div class="w-full bg-slate-800 h-1 overflow-hidden">
                <div id="mini-player-progress-bar" class="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-1 transition-all duration-300" style="width: 0%"></div>
            </div>
            <div class="p-3 flex items-center justify-between gap-2.5">
                <div class="flex items-center space-x-2.5 min-w-0 flex-1 cursor-pointer" onclick="App.openActiveTripMap()">
                    <div id="mini-player-avatar" class="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                    </div>
                    <div class="min-w-0 flex-1 leading-tight">
                        <div class="flex items-center space-x-1.5 truncate">
                            <span id="mini-player-driver" class="text-xs font-bold text-white truncate">Ricardo Dalisay</span>
                            <span class="text-slate-500 text-[10px]">•</span>
                            <span id="mini-player-vehicle" class="text-[11px] text-slate-300 truncate">Toyota Vios</span>
                        </div>
                        <div class="flex items-center space-x-1.5 mt-0.5 text-[11px]">
                            <span id="mini-player-status" class="font-bold text-emerald-400 truncate">En Route</span>
                            <span class="text-slate-500">•</span>
                            <span id="mini-player-telemetry" class="text-slate-300 font-mono font-medium">850 m</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-1.5 flex-shrink-0">
                    <button type="button" onclick="App.openActiveTripMap()" class="px-2.5 sm:px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs active:scale-95" title="View live trip on interactive map">
                        <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                        <span>Map</span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(el);

        // Run initial check and start live update loop (music player style across pages)
        this.updateTripMiniPlayer();
        if (!this._miniPlayerInterval) {
            this._miniPlayerInterval = setInterval(() => this.updateTripMiniPlayer(), 1000);
        }

        // Listen for window scroll or resize to evaluate visibility
        window.addEventListener('scroll', () => this.checkTripMiniPlayerVisibility(), { passive: true });
        window.addEventListener('resize', () => this.checkTripMiniPlayerVisibility(), { passive: true });
    },

    openActiveTripMap() {
        const currentFile = window.location.pathname.split('/').pop() || 'main.html';
        const isBookingPage = currentFile === 'booking.html' || currentFile === 'booking';
        const isPassengerPage = currentFile === 'passenger.html' || currentFile === 'passenger';

        if (isBookingPage || isPassengerPage) {
            const mapEl = document.getElementById('booking-map');
            if (mapEl) {
                mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            const hud = document.getElementById('active-trip-hud');
            if (hud) {
                hud.classList.remove('hidden');
                if (typeof BookingModule !== 'undefined' && BookingModule.checkHudDocking) {
                    BookingModule.checkHudDocking();
                }
            }
            if (typeof BookingModule !== 'undefined' && BookingModule.recenterTripMap) {
                BookingModule.recenterTripMap();
            }
            this.checkTripMiniPlayerVisibility();
        } else {
            const currentUser = (typeof AuthModule !== 'undefined') ? AuthModule.currentUser : null;
            const isPassenger = (typeof AuthModule !== 'undefined' && AuthModule.isPassenger && AuthModule.isPassenger()) || (currentUser && (currentUser.role === 'passenger' || currentUser.role === 'customer'));
            window.location.href = isPassenger ? 'passenger.html' : 'booking.html';
        }
    },

    checkTripMiniPlayerVisibility() {
        const miniPlayer = document.getElementById('hirna-trip-mini-player');
        if (!miniPlayer) return;

        let savedRaw = null;
        try { savedRaw = localStorage.getItem('hirna_active_trip_sim'); } catch(e) {}
        if (!savedRaw) {
            miniPlayer.classList.add('hidden');
            return;
        }

        let trip = null;
        try { trip = JSON.parse(savedRaw); } catch(e) {}
        if (!trip || !trip.booking) {
            miniPlayer.classList.add('hidden');
            return;
        }

        const refTime = trip.lastUpdatedAt || trip.phaseStartedAt || trip.timestamp || 0;
        const elapsed = Math.max(0, Date.now() - refTime);
        if (elapsed > 180 * 1000) {
            miniPlayer.classList.add('hidden');
            return;
        }

        // Check if database status is finished
        const dbBookings = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData) ? SupabaseBridge.getData('bookings') : [];
        const bKey = trip.booking?.booking_code || trip.booking?.id;
        const matched = dbBookings.find(b => (b.booking_code && b.booking_code === bKey) || (b.id && b.id === bKey));
        if (matched && (matched.status === 'completed' || matched.status === 'completed_early' || matched.status === 'cancelled')) {
            miniPlayer.classList.add('hidden');
            return;
        }

        // Check if active HUD is seen
        const hud = document.getElementById('active-trip-hud');
        const isHudVisible = hud && !hud.classList.contains('hidden') && hud.offsetParent !== null;

        // If the main HUD is visible on screen, HIDE the mini-player!
        if (isHudVisible) {
            miniPlayer.classList.add('hidden');
            return;
        }

        // If a full-screen or prominent modal is open on the booking page, hide mini-player
        const pickupModal = document.getElementById('pickup-arrival-modal');
        const payModal = document.getElementById('payment-modal');
        if ((pickupModal && !pickupModal.classList.contains('hidden')) || (payModal && !payModal.classList.contains('hidden'))) {
            miniPlayer.classList.add('hidden');
            return;
        }

        // Otherwise HUD is NOT seen (e.g. on other modules or HUD hidden): SHOW mini player!
        miniPlayer.classList.remove('hidden');
    },

    updateTripMiniPlayer() {
        this.checkTripMiniPlayerVisibility();

        const miniPlayer = document.getElementById('hirna-trip-mini-player');
        if (!miniPlayer || miniPlayer.classList.contains('hidden')) return;

        let savedRaw = null;
        try { savedRaw = localStorage.getItem('hirna_active_trip_sim'); } catch(e) {}
        if (!savedRaw) return;

        let trip = null;
        try { trip = JSON.parse(savedRaw); } catch(e) {}
        if (!trip || !trip.booking) return;

        const booking = trip.booking;
        const phase = trip.phase || 'en_route_pickup';
        const now = Date.now();
        const phaseStartedAt = trip.phaseStartedAt || trip.lastUpdatedAt || trip.timestamp || now;
        const elapsedMs = Math.max(0, now - phaseStartedAt);
        const legDurationMs = Number(trip.legDurationMs) || 45000;
        const totalDist = Number(trip.totalDist) || 1200;

        let progress = typeof trip.progress === 'number' ? trip.progress : 0;
        let statusLabel = 'En Route';
        let statusColor = 'text-emerald-400';
        let remDistM = Math.max(0, Math.round(totalDist * (1 - progress)));
        let remMin = Math.max(1, Math.ceil(remDistM / 280));
        let telemetryText = '';

        if (phase === 'assigning') {
            statusLabel = 'Assigning Driver...';
            statusColor = 'text-amber-400';
            progress = Math.min(1.0, elapsedMs / 3400);
            telemetryText = 'Locating nearest vehicle';
        } else if (phase === 'en_route_pickup') {
            statusLabel = 'Driver En Route to Pickup';
            statusColor = 'text-emerald-400';
            progress = Math.min(1.0, Math.max(progress, elapsedMs / legDurationMs));
            remDistM = Math.max(0, Math.round(totalDist * (1 - progress)));
            remMin = Math.max(1, Math.ceil(remDistM / 280));
            const distStr = remDistM >= 1000 ? `${(remDistM / 1000).toFixed(1)} km` : `${remDistM} m`;
            telemetryText = progress >= 0.98 ? 'Arriving Now' : `${distStr} • ${remMin} min`;
        } else if (phase === 'arrived_pickup') {
            statusLabel = 'Driver Arrived at Pickup';
            statusColor = 'text-emerald-300';
            progress = 1.0;
            telemetryText = 'Waiting for passenger • Ready';
        } else if (phase === 'en_route_dropoff') {
            statusLabel = 'In Transit to Destination';
            statusColor = 'text-teal-400';
            progress = Math.min(1.0, Math.max(progress, elapsedMs / legDurationMs));
            remDistM = Math.max(0, Math.round(totalDist * (1 - progress)));
            remMin = Math.max(1, Math.ceil(remDistM / 280));
            const distStr = remDistM >= 1000 ? `${(remDistM / 1000).toFixed(1)} km` : `${remDistM} m`;
            telemetryText = progress >= 0.98 ? 'Arriving Destination' : `${distStr} • ${remMin} min`;
        } else if (phase === 'arrived_dropoff') {
            statusLabel = 'Destination Reached';
            statusColor = 'text-emerald-400';
            progress = 1.0;
            telemetryText = 'Trip Completed • Tap to Settle';
        }

        const bar = document.getElementById('mini-player-progress-bar');
        const driverEl = document.getElementById('mini-player-driver');
        const vehicleEl = document.getElementById('mini-player-vehicle');
        const statusEl = document.getElementById('mini-player-status');
        const telemEl = document.getElementById('mini-player-telemetry');

        if (bar) bar.style.width = `${Math.min(100, Math.round(progress * 100))}%`;
        if (driverEl) driverEl.innerText = booking.driver_name || 'Ricardo Dalisay';
        if (vehicleEl) vehicleEl.innerText = `${booking.vehicle_model || 'Toyota Vios'} (${booking.vehicle_plate || 'TXI-5431'})`;
        if (statusEl) {
            statusEl.innerText = statusLabel;
            statusEl.className = `font-bold ${statusColor} truncate`;
        }
        if (telemEl) telemEl.innerText = telemetryText;
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
