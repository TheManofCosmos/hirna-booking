import os
import re

with open('booking.html', 'r', encoding='utf-8') as f:
    b_html = f.read()

with open('payments.html', 'r', encoding='utf-8') as f:
    p_html = f.read()

# 1. Extract HTML Head from booking.html
head_start = b_html.find('<head>')
head_end = b_html.find('</head>') + len('</head>')
head_content = b_html[head_start:head_end]
head_content = re.sub(r'<title>.*?</title>', '<title>Hirna: Transport & Delivery - Passenger Portal</title>', head_content)

old_guard_re = r'<script>\s*\(function\(\)\s*\{[\s\S]*?\}\)\(\);\s*</script>'
new_guard = """<script>
        (function() {
            try {
                var sessionUser = localStorage.getItem('hirna_auth_user') || sessionStorage.getItem('hirna_auth_user');
                if (!sessionUser) {
                    window.location.replace('login.html');
                }
            } catch (e) {
                window.location.replace('login.html');
            }
        })();
    </script>"""
head_content = re.sub(old_guard_re, new_guard, head_content, count=1)

# 2. Extract tab-booking content
b_tab_start = b_html.find('<div id="tab-booking"')
b_tab_end = b_html.find('</main>', b_tab_start)
b_tab_content = b_html[b_tab_start:b_tab_end].rstrip()
b_tab_content = b_tab_content.replace("window.location.href='payments.html#wallet-section'", "switchPassengerTab('payments')")
b_tab_content = b_tab_content.replace('href="payments.html#wallet-section"', 'href="javascript:void(0)" onclick="switchPassengerTab(\'payments\')"')

# 3. Extract tab-payments content
p_tab_start = p_html.find('<div id="tab-payments"')
p_tab_end = p_html.find('</main>', p_tab_start)
p_tab_content = p_html[p_tab_start:p_tab_end].rstrip()
if 'hidden' not in p_tab_content[:100]:
    p_tab_content = p_tab_content.replace('id="tab-payments" class="tab-content-panel space-y-6 "', 'id="tab-payments" class="tab-content-panel space-y-6 hidden"')
    p_tab_content = p_tab_content.replace('id="tab-payments" class="tab-content-panel space-y-6"', 'id="tab-payments" class="tab-content-panel space-y-6 hidden"')

# 4. Modals from booking.html
b_modals_start = b_html.find('<!-- ================================================================= -->\n    <!-- FOOD & MART ORDER QUANTITY / OPTIONS MODAL', b_tab_end)
if b_modals_start == -1:
    b_modals_start = b_html.find('<!-- FOOD & MART ORDER QUANTITY', b_tab_end)
if b_modals_start == -1:
    b_modals_start = b_html.find('<div id="food-quantity-modal"', b_tab_end)
b_modals_end = b_html.find('<!-- TOAST NOTIFICATION CONTAINER -->', b_modals_start)
b_modals_content = b_html[b_modals_start:b_modals_end]

# 5. Wallet TopUp Modal from payments.html
p_topup_start = p_html.find('<!-- CASH IN / TOP UP WALLET MODAL -->')
if p_topup_start == -1:
    p_topup_start = p_html.find('<div id="wallet-topup-modal"')
p_topup_end = p_html.find('<!-- TOAST NOTIFICATION CONTAINER -->', p_topup_start)
p_topup_content = p_html[p_topup_start:p_topup_end]

template = """<!DOCTYPE html>
<html lang="en">
__HEAD_CONTENT__
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">

    <!-- HIRNA TOP BRANDING HEADER (PASSENGER PORTAL) -->
    <header class="bg-hirna-800 text-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="h-16 flex items-center justify-between">
                <!-- Hirna Logo & Title -->
                <div class="flex items-center space-x-3.5">
                    <div class="w-11 h-11 rounded-xl border-2 border-gold-400/90 shadow-lg transform transition hover:scale-105 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <img src="assets/hirna-badge.png" alt="Hirna Official Logo" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <div class="flex items-center space-x-2">
                            <h1 class="text-base font-black tracking-wide text-white uppercase">Hirna: Transport & Delivery</h1>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white uppercase tracking-wider">Passenger Portal</span>
                        </div>
                        <p class="text-[11px] text-hirna-200">Online Ride Booking, Parcel, Food & Mart Delivery • Cashless Payments</p>
                    </div>
                </div>

                <!-- Status Badges & Dynamic Profile with Dropdown -->
                <div class="flex items-center space-x-2.5">
                    <!-- Quick Wallet Balance Pill -->
                    <button type="button" onclick="switchPassengerTab('payments')" class="px-3 py-1.5 bg-hirna-900 hover:bg-hirna-950 border border-hirna-700/80 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-sm group" title="Click to view digital wallet">
                        <span class="text-gold-400 text-sm">👛</span>
                        <div class="text-left">
                            <span class="text-[9px] text-slate-300 block font-medium leading-none">Wallet</span>
                            <span class="font-mono text-white text-xs font-black hirna-wallet-amount-display" id="passenger-header-wallet-amount">₱2,450.00</span>
                        </div>
                    </button>

                    <div class="relative" id="hirna-app-btn-wrapper">
                        <button type="button" onclick="HirnaAppBridge.handleAppClick(event)" data-hirna-app-btn class="hirna-app-trigger px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-hirna-950 text-xs font-black rounded-xl shadow-md transition flex items-center space-x-1.5 transform hover:scale-105 cursor-pointer">
                            <svg class="w-3.5 h-3.5 text-hirna-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            <span>Download Hirna App</span>
                        </button>
                    </div>

                    <!-- Profile with Interactive Dropdown (contains Logout) -->
                    <div id="header-user-profile" class="relative"></div>
                </div>
            </div>

            <!-- HIRNA PASSENGER NAVIGATION TABS (BOOKING & FARE/PAYMENTS ONLY) -->
            <nav class="flex space-x-2 py-2 border-t border-hirna-700/60">
                <button id="nav-btn-booking" onclick="switchPassengerTab('booking')" class="passenger-nav-btn px-4 py-2 rounded-xl text-xs font-bold bg-gold-500 text-hirna-950 shadow-md transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM5 11l2-5h10l2 5m-14 0h14m-14 0v6h14v-6"/></svg>
                    <span>1. Booking</span>
                </button>
                <button id="nav-btn-payments" onclick="switchPassengerTab('payments')" class="passenger-nav-btn px-4 py-2 rounded-xl text-xs font-semibold text-hirna-100 hover:bg-hirna-700/70 hover:text-white transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                    <span>2. Fare & Payments</span>
                </button>
            </nav>
            <div class="flex items-center justify-between text-xs py-1 border-t border-hirna-700/40">
                <div class="flex items-center space-x-3">
                    <span class="font-medium text-slate-200 text-[11px]">Allow Hirna to use your device location?</span>
                    <button id="btn-allow-location" onclick="DeviceLocationManager.requestLocation()" class="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-hirna-950 font-black rounded-lg text-[11px] transition shadow-xs cursor-pointer flex items-center space-x-1 active:scale-95">
                        <svg class="w-3 h-3 text-hirna-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span>Allow</span>
                    </button>
                </div>
                <div class="flex items-center space-x-2">
                    <span id="location-status-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300 flex items-center space-x-1.5">
                        <span id="location-status-dot" class="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span id="location-status-label">Location: Disabled</span>
                    </span>
                </div>
            </div>
        </div>
    </header>

    <!-- MAIN CONTENT CONTAINER -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <!-- TAB 1: BOOKING & DISPATCH (MODULE 1) -->
        __B_TAB_CONTENT__

        <!-- TAB 2: FARE & PAYMENTS (MODULE 2) -->
        __P_TAB_CONTENT__
    </main>

    <!-- MODALS FROM BOOKING SYSTEM -->
    __B_MODALS_CONTENT__

    <!-- MODALS FROM PAYMENTS SYSTEM -->
    __P_TOPUP_CONTENT__

    <!-- TOAST NOTIFICATION CONTAINER -->
    <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col space-y-2"></div>

    <!-- JAVASCRIPT BUNDLE (Cache-Busted) -->
    <script src="assets/js/ai-engines.js?v=20260916_rev1"></script>
    <script src="assets/js/supabase-config.js?v=20260916_rev1"></script>
    <script src="assets/js/auth.js?v=20260916_rev1"></script>
    <script src="assets/js/booking.js?v=20260921_routefix"></script>
    <script src="assets/js/payments.js?v=20260919_pay1"></script>
    <script src="assets/js/hirna-app-bridge.js?v=20260918_rev1"></script>
    <script src="assets/js/app.js?v=20260916_rev1"></script>

    <!-- PASSENGER PORTAL TAB CONTROLLER -->
    <script>
        function switchPassengerTab(tab) {
            const bTab = document.getElementById('tab-booking');
            const pTab = document.getElementById('tab-payments');
            const bBtn = document.getElementById('nav-btn-booking');
            const pBtn = document.getElementById('nav-btn-payments');

            if (!bTab || !pTab) return;

            if (tab === 'payments') {
                bTab.classList.add('hidden');
                pTab.classList.remove('hidden');
                if (pBtn) pBtn.className = "passenger-nav-btn px-4 py-2 rounded-xl text-xs font-bold bg-gold-500 text-hirna-950 shadow-md transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer";
                if (bBtn) bBtn.className = "passenger-nav-btn px-4 py-2 rounded-xl text-xs font-semibold text-hirna-100 hover:bg-hirna-700/70 hover:text-white transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer";
                
                if (typeof PaymentsModule !== 'undefined' && PaymentsModule.renderLedger) {
                    PaymentsModule.renderLedger();
                }
                if (typeof HirnaWallet !== 'undefined' && HirnaWallet.updateUI) {
                    HirnaWallet.updateUI();
                }
            } else {
                pTab.classList.add('hidden');
                bTab.classList.remove('hidden');
                if (bBtn) bBtn.className = "passenger-nav-btn px-4 py-2 rounded-xl text-xs font-bold bg-gold-500 text-hirna-950 shadow-md transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer";
                if (pBtn) pBtn.className = "passenger-nav-btn px-4 py-2 rounded-xl text-xs font-semibold text-hirna-100 hover:bg-hirna-700/70 hover:text-white transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer";

                if (typeof BookingModule !== 'undefined' && BookingModule.map) {
                    setTimeout(() => BookingModule.map.invalidateSize(), 200);
                }
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            // Update passenger portal wallet balance badge
            if (typeof HirnaWallet !== 'undefined') {
                const badge = document.getElementById('passenger-header-wallet-amount');
                if (badge) {
                    badge.innerText = `₱${HirnaWallet.getBalance().toFixed(2)}`;
                }
            }
        });
    </script>
</body>
</html>
"""

passenger_html = template.replace('__HEAD_CONTENT__', head_content)
passenger_html = passenger_html.replace('__B_TAB_CONTENT__', b_tab_content)
passenger_html = passenger_html.replace('__P_TAB_CONTENT__', p_tab_content)
passenger_html = passenger_html.replace('__B_MODALS_CONTENT__', b_modals_content)
passenger_html = passenger_html.replace('__P_TOPUP_CONTENT__', p_topup_content)

with open('passenger.html', 'w', encoding='utf-8') as f:
    f.write(passenger_html)

print("Successfully written passenger.html! Total length:", len(passenger_html))
