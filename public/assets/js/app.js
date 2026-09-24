/**
 * Main Application Orchestrator
 */
const App = {
    async init() {
        console.log("[Hirna] Initializing Hirna: Transport & Delivery Platform...");
        
        // 1. Initialize Supabase / Local DB safely
        try {
            if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.init) {
                await SupabaseBridge.init();
            }
        } catch(e) {
            console.warn("Supabase init warning:", e);
        }

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

        // 2. Initialize Submodules defensively
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
        console.log("[Hirna] Hirna: Transport & Delivery Platform ready!");
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
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
