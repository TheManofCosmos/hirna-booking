/**
 * Hirna Android App Bridge
 * Manages app installation state, dynamic "Download" vs "Open" button states,
 * tooltip-style dialogue box for app downloads, and Play Store redirection.
 */
const HirnaAppBridge = {
    PLAY_STORE_URL: "https://play.google.com/store/apps/details?id=com.hirna.customer",
    PLAY_STORE_MARKET_URI: "market://details?id=com.hirna.customer",
    ANDROID_INTENT_URI: "intent://open#Intent;scheme=hirna;package=com.hirna.customer;end",
    STORAGE_KEY: "hirna_app_installed",

    init() {
        // Purge any stale persistent lock so button is unstuck from "Open Hirna App"
        localStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.STORAGE_KEY);

        this.injectTooltip();
        this.checkNativePwaInstall();
        this.updateButtons();
        this.bindGlobalListeners();
        
        // Listen to storage changes across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                this.updateButtons();
            }
        });
    },

    bindGlobalListeners() {
        document.addEventListener('click', (e) => {
            const tooltip = document.getElementById('hirna-download-tooltip');
            const isTrigger = e.target.closest('.hirna-app-trigger, [data-hirna-app-btn]');
            if (tooltip && !tooltip.classList.contains('hidden')) {
                if (!tooltip.contains(e.target) && !isTrigger) {
                    this.closeTooltip();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTooltip();
            }
        });
    },

    isInstalled() {
        // Detected if running inside native Hirna Android app / WebView wrapper
        const isNativeApp = /HirnaApp|HirnaPassenger/i.test(navigator.userAgent) || !!window.HirnaNativeBridge;
        if (isNativeApp) return true;

        return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
    },

    setInstalled(installed) {
        if (installed) {
            sessionStorage.setItem(this.STORAGE_KEY, 'true');
        } else {
            sessionStorage.removeItem(this.STORAGE_KEY);
        }
        localStorage.removeItem(this.STORAGE_KEY);
        this.updateButtons();
    },

    checkNativePwaInstall() {
        // Check if Android related app is installed (Chromium standard)
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(relatedApps => {
                const hasHirna = relatedApps && relatedApps.some(app => app.id === 'com.hirna.customer' || app.platform === 'play');
                if (hasHirna) {
                    sessionStorage.setItem(this.STORAGE_KEY, 'true');
                    this.updateButtons();
                }
            }).catch(() => {});
        }
    },

    handleAppClick(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.isInstalled()) {
            this.launchApp();
        } else {
            this.toggleTooltip(event ? event.currentTarget : null);
        }
    },

    toggleTooltip(triggerBtn) {
        const tooltip = document.getElementById('hirna-download-tooltip');
        if (!tooltip) {
            this.injectTooltip();
        }
        const el = document.getElementById('hirna-download-tooltip');
        if (!el) return;

        if (!el.classList.contains('hidden')) {
            this.closeTooltip();
        } else {
            this.openTooltip(triggerBtn);
        }
    },

    openTooltip(triggerBtn) {
        const tooltip = document.getElementById('hirna-download-tooltip');
        if (!tooltip) return;

        // Position tooltip directly below the clicked button's container
        const targetBtn = triggerBtn || document.querySelector('[data-hirna-app-btn]');
        if (targetBtn && targetBtn.parentElement) {
            const parent = targetBtn.parentElement;
            parent.classList.add('relative');
            if (tooltip.parentElement !== parent) {
                parent.appendChild(tooltip);
            }
        }

        tooltip.classList.remove('hidden');
    },

    closeTooltip() {
        const tooltip = document.getElementById('hirna-download-tooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    },

    // Legacy aliases
    openDownloadModal() {
        this.openTooltip();
    },

    closeDownloadModal() {
        this.closeTooltip();
    },

    launchApp() {
        const isAndroid = /Android/i.test(navigator.userAgent);
        
        if (isAndroid) {
            // Attempt Android Intent with fallback to passenger.html
            const fallbackUrl = window.location.origin + '/passenger.html';
            const intentUrl = `intent://open#Intent;scheme=hirna;package=com.hirna.customer;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
            
            const start = Date.now();
            window.location.href = intentUrl;
            
            // Fallback if app not reachable within timeout
            setTimeout(() => {
                if (Date.now() - start < 2000) {
                    window.location.href = "passenger.html";
                }
            }, 1200);
        } else {
            // Desktop/Web simulation
            window.open('passenger.html', '_blank');
        }
    },

    downloadInPlayStore() {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const targetUrl = isAndroid ? this.PLAY_STORE_MARKET_URI : this.PLAY_STORE_URL;

        // Redirect user to Play Store
        const win = window.open(this.PLAY_STORE_URL, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
            window.location.href = targetUrl;
        }

        this.closeTooltip();
    },

    updateButtons() {
        const installed = this.isInstalled();
        const text = installed ? "Open Hirna App" : "Download Hirna App";
        
        // Icon when installed vs when not installed
        const iconOpen = `<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`;
        const iconDownload = `<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`;
        const icon = installed ? iconOpen : iconDownload;

        // Update all elements with class .hirna-app-trigger or data-hirna-app-btn
        document.querySelectorAll('.hirna-app-trigger, [data-hirna-app-btn]').forEach(el => {
            el.setAttribute('title', installed ? 'Launch Hirna Android App' : 'Download Hirna Android App');
            const span = el.querySelector('span:not(.icon-wrapper)');
            if (span) {
                span.innerText = text;
            } else {
                el.innerText = text;
            }

            // Update SVG icon inside button if found
            const svg = el.querySelector('svg');
            if (svg) {
                svg.outerHTML = icon;
            }
        });
    },

    injectTooltip() {
        if (document.getElementById('hirna-download-tooltip')) return;

        const tooltipHtml = `
        <div id="hirna-download-tooltip" class="hidden absolute right-0 top-full mt-2.5 w-84 sm:w-96 bg-hirna-800 border-2 border-hirna-700/90 rounded-2xl shadow-2xl shadow-black/70 ring-1 ring-gold-500/30 z-50 p-4 text-white animate-in fade-in zoom-in-95 duration-150">
            <!-- Tooltip Arrow Beak pointing up at button (Matching Header bg-hirna-800) -->
            <div class="absolute -top-2 right-6 sm:right-8 w-3.5 h-3.5 bg-hirna-800 border-t-2 border-l-2 border-hirna-700/90 rotate-45 pointer-events-none"></div>

            <!-- Header with Title & Close Button -->
            <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-hirna-700/70 relative z-10">
                <div class="flex items-center space-x-2.5">
                    <div class="w-8 h-8 rounded-lg bg-white p-0.5 border border-gold-400 flex items-center justify-center shadow flex-shrink-0 overflow-hidden">
                        <img src="assets/hirna-badge.png" alt="Hirna" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <h4 class="text-xs font-black text-white leading-tight">Get the Hirna App</h4>
                        <span class="text-[9px] text-gold-400 font-bold block leading-none uppercase tracking-wider mt-0.5">Transport &amp; Delivery</span>
                    </div>
                </div>
                <button type="button" onclick="HirnaAppBridge.closeTooltip()" class="w-6 h-6 rounded-lg bg-hirna-900 hover:bg-hirna-950 text-hirna-200 hover:text-white border border-hirna-700/70 flex items-center justify-center transition cursor-pointer" title="Close">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <!-- Clear & High-Contrast Description matching Header Palette -->
            <p class="text-xs text-white font-medium leading-relaxed mb-3 relative z-10">
                Download the official Hirna app on your Android device to experience fast ride-hailing and parcel deliveries across the Philippines. Enjoy seamless nearest-driver dispatch, live GPS route telemetry, secure cashless fare payments, and 24/7 passenger trip safety.
            </p>

            <!-- Primary Action: Google Play Button -->
            <div class="space-y-2 pt-1 relative z-10">
                <button type="button" onclick="HirnaAppBridge.downloadInPlayStore()" class="w-full py-2.5 px-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-800 border border-emerald-500/80 hover:border-emerald-400 text-white rounded-xl shadow-lg transition flex items-center justify-center space-x-2.5 cursor-pointer group">
                    <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 512 512" fill="none">
                        <path d="M47.1 27.2C44.4 30.1 42.7 34.7 42.7 40.7v430.6c0 6 1.7 10.6 4.4 13.5l1.6 1.6 240.7-240.7v-5.6L48.7 25.6l-1.6 1.6z" fill="#00D3FF"/>
                        <path d="M369.8 328.7l-80.4-80.4v-5.6l80.4-80.4 1.8 1 95.3 54.1c27.2 15.4 27.2 40.6 0 56.1l-95.3 54.2-1.8 1z" fill="#FFCE00"/>
                        <path d="M289.4 248.3L47.1 484.8c8.9 9.4 23.6 10.6 40.1 1.2l284.4-161.6-82.2-76.1z" fill="#FF334B"/>
                        <path d="M289.4 263.7l82.2-76.1L87.2 26c-16.5-9.4-31.2-8.2-40.1 1.2l242.3 236.5z" fill="#00E676"/>
                    </svg>
                    <div class="text-left">
                        <span class="text-[8px] block text-slate-400 font-semibold uppercase leading-none">GET IT ON</span>
                        <span class="text-xs font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">Google Play Store</span>
                    </div>
                </button>

                <!-- Sub-Links -->
                <div class="flex items-center justify-between text-[11px] pt-0.5 text-hirna-200">
                    <button type="button" onclick="HirnaAppBridge.launchApp(); HirnaAppBridge.closeTooltip();" class="hover:text-gold-300 transition underline cursor-pointer">
                        Already installed? Open
                    </button>
                    <a href="passenger.html" target="_blank" onclick="HirnaAppBridge.closeTooltip()" class="hover:text-white transition flex items-center space-x-1">
                        <span>Web Simulator</span>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                </div>
            </div>
        </div>
        `;

        const targetWrapper = document.getElementById('hirna-app-btn-wrapper') || document.body;
        const temp = document.createElement('div');
        temp.innerHTML = tooltipHtml;
        targetWrapper.appendChild(temp.firstElementChild);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HirnaAppBridge.init());
} else {
    HirnaAppBridge.init();
}
