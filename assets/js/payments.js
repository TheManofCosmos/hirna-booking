/**
 * Module 2: Payment & Fare Collection Controller
 * Integrates with Team 5 (Financial Management / Accounts Receivable)
 */

/**
 * Hirna Digital Wallet Management Object
 * Handles live balance, cash in / top-up, role-based visibility, and hash navigation
 */
const HirnaWallet = {
    STORAGE_KEY: 'hirna_wallet_balance',
    DEFAULT_BALANCE: 2450.00,

    getBalance() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored !== null && !isNaN(parseFloat(stored))) {
                return parseFloat(stored);
            }
        } catch (e) {
            console.warn("Error reading wallet balance:", e);
        }
        return this.DEFAULT_BALANCE;
    },

    setBalance(amt) {
        const num = Math.max(0, parseFloat(amt) || 0);
        try {
            localStorage.setItem(this.STORAGE_KEY, num.toFixed(2));
        } catch (e) {
            console.warn("Error saving wallet balance:", e);
        }
        this.updateUI();

        // Update defaultMethods in PaymentsModule if available
        if (typeof PaymentsModule !== 'undefined' && PaymentsModule.defaultMethods) {
            const w = PaymentsModule.defaultMethods.find(m => m.id === 'wallet');
            if (w) {
                w.badge = `Active • ${this.formatCurrency(num)}`;
            }
            if (typeof PaymentsModule.renderPaymentMethods === 'function') {
                PaymentsModule.renderPaymentMethods();
            }
            if (typeof PaymentsModule.renderBookingPaymentOptions === 'function') {
                PaymentsModule.renderBookingPaymentOptions();
            }
        }
        return num;
    },

    formatCurrency(amt) {
        const val = (typeof amt === 'number') ? amt : (parseFloat(amt) || 0);
        return `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    addFunds(amt, note = 'Cash In') {
        const addAmt = parseFloat(amt);
        if (isNaN(addAmt) || addAmt <= 0) return this.getBalance();
        const current = this.getBalance();
        const next = current + addAmt;
        this.setBalance(next);

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`Successfully added ${this.formatCurrency(addAmt)} to Hirna Wallet!`, 'success');
        }

        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.logAudit) {
            const user = (typeof AuthModule !== 'undefined' && AuthModule.currentUser) ? AuthModule.currentUser : null;
            SupabaseBridge.logAudit("Payment Gateway", "WALLET_TOP_UP", `WLT-${Math.floor(10000 + Math.random() * 90000)}`, (user && user.email) || "superadmin@hirna.ph", {
                amount: addAmt,
                previous_balance: current,
                new_balance: next,
                method: note,
                channel: "Hirna Stored Value Wallet",
                payment_status: "COMPLETED"
            });
        }
        return next;
    },

    deductFunds(amt, note = 'Fare Settlement') {
        const deductAmt = parseFloat(amt);
        if (isNaN(deductAmt) || deductAmt <= 0) return true;
        const current = this.getBalance();
        if (current < deductAmt) return false;
        const next = current - deductAmt;
        this.setBalance(next);

        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.logAudit) {
            const user = (typeof AuthModule !== 'undefined' && AuthModule.currentUser) ? AuthModule.currentUser : null;
            SupabaseBridge.logAudit("Payment Gateway", "WALLET_DEBIT", `WLT-${Math.floor(10000 + Math.random() * 90000)}`, (user && user.email) || "customer@hirna.ph", {
                amount: deductAmt,
                previous_balance: current,
                new_balance: next,
                description: note,
                channel: "Hirna Stored Value Wallet",
                payment_status: "SETTLED"
            });
        }
        return true;
    },

    applyRoleVisibility() {
        let role = '';
        if (typeof AuthModule !== 'undefined' && AuthModule.currentUser && AuthModule.currentUser.role) {
            role = AuthModule.currentUser.role.toLowerCase();
        } else {
            try {
                const saved = localStorage.getItem('hirna_auth_user') || sessionStorage.getItem('hirna_auth_user');
                if (saved) {
                    const u = JSON.parse(saved);
                    role = (u.role || '').toLowerCase();
                }
            } catch (e) {}
        }

        // In booking section: Visible for 'superadmin', 'passenger', and 'customer'
        const bookingWallet = document.getElementById('booking-wallet-section');
        if (bookingWallet) {
            if (role === 'superadmin' || role === 'passenger' || role === 'customer') {
                bookingWallet.classList.remove('hidden');
            } else {
                bookingWallet.classList.add('hidden');
            }
        }

        // In payments section: Visible for 'superadmin', 'passenger', and 'customer'
        const paymentsWallet = document.getElementById('payments-wallet-section');
        if (paymentsWallet) {
            if (role === 'superadmin' || role === 'passenger' || role === 'customer') {
                paymentsWallet.classList.remove('hidden');
            } else {
                paymentsWallet.classList.add('hidden');
            }
        }
    },

    updateUI() {
        const bal = this.getBalance();
        const formatted = this.formatCurrency(bal);

        // Update all amount elements with class or ID
        document.querySelectorAll('.hirna-wallet-amount-display').forEach(el => {
            el.innerText = formatted;
        });

        const bookingAmt = document.getElementById('booking-wallet-amount');
        if (bookingAmt) bookingAmt.innerText = formatted;

        const paymentsAmt = document.getElementById('payments-wallet-amount');
        if (paymentsAmt) paymentsAmt.innerText = formatted;

        this.applyRoleVisibility();
    },

    openTopUpModal() {
        const modal = document.getElementById('wallet-topup-modal');
        if (modal) {
            modal.classList.remove('hidden');
            const inp = document.getElementById('wallet-topup-input');
            if (inp) {
                inp.value = '500';
                inp.focus();
            }
        } else {
            const amtStr = prompt("Enter amount to cash in to Hirna Wallet (₱):", "500");
            if (amtStr) {
                const amt = parseFloat(amtStr);
                if (!isNaN(amt) && amt > 0) {
                    this.addFunds(amt);
                }
            }
        }
    },

    closeTopUpModal() {
        const modal = document.getElementById('wallet-topup-modal');
        if (modal) modal.classList.add('hidden');
    },

    confirmTopUp() {
        const inp = document.getElementById('wallet-topup-input');
        const amt = inp ? parseFloat(inp.value) : 0;
        if (isNaN(amt) || amt <= 0) {
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast("Please enter a valid cash-in amount.", "warning");
            }
            return;
        }
        this.addFunds(amt);
        this.closeTopUpModal();
    },

    init() {
        this.updateUI();

        // Handle direct anchor link e.g. payments.html#wallet-section
        if (window.location.hash === '#wallet-section') {
            setTimeout(() => {
                const target = document.getElementById('payments-wallet-section');
                if (target && !target.classList.contains('hidden')) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('ring-4', 'ring-gold-400', 'shadow-2xl');
                    setTimeout(() => {
                        target.classList.remove('ring-4', 'ring-gold-400');
                    }, 2500);
                }
            }, 300);
        }
    }
};

window.HirnaWallet = HirnaWallet;

const PaymentsModule = {
    activeBooking: null,

    defaultMethods: [
        {
            id: 'cash',
            name: 'Cash',
            type: 'Cash',
            icon: '<svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
            iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            badge: 'Active • Offline Channel',
            badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            description: 'Direct physical currency payment to the driver upon dropoff or parcel delivery.',
            meta: 'Zero Gateway Fee',
            bookingSubtitle: 'Pay Cash to Driver',
            isSystem: true
        },
        {
            id: 'gcash',
            name: 'GCash',
            type: 'GCash',
            icon: '<svg class="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
            iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
            badge: 'Active • Linked',
            badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
            description: 'Philippines\' top mobile e-wallet. Contactless QR Ph & instant app settlement.',
            meta: '+63 917 •••• 999',
            bookingSubtitle: 'Instant E-Wallet',
            isSystem: true
        },
        {
            id: 'wallet',
            name: 'Hirna Wallet',
            type: 'Hirna Wallet',
            icon: '<svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
            iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
            badge: 'Active • ₱2,450.00',
            badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
            description: 'Official in-app stored value balance for instant 1-tap booking and loyalty points.',
            meta: '5% Loyalty Cashback',
            bookingSubtitle: 'Account Credits',
            isSystem: true
        }
    ],

    catalogMethods: [
        {
            id: 'qr_payment',
            name: 'QR Payment (QR Ph)',
            type: 'QR Payment',
            icon: '<svg class="w-5 h-5 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>',
            iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
            badge: 'BSP National Standard',
            badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
            tag: 'Recommended • Instant Scan',
            description: 'Interoperable QR Ph standard. Scan using GCash, Maya, BDO, BPI, or any PH mobile banking app.',
            meta: 'Instant Dynamic QR Ph',
            bookingSubtitle: 'Scan & Pay via QR Ph'
        },
        {
            id: 'maya',
            name: 'Maya',
            type: 'Maya',
            icon: '<svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
            iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            badge: 'Digital Bank',
            badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            tag: 'E-Wallet & Bank',
            description: 'Direct contactless digital settlement linked to your verified Maya digital wallet account.',
            meta: 'Maya Digital Wallet',
            bookingSubtitle: 'Maya Mobile E-Wallet'
        },
        {
            id: 'card',
            name: 'Credit / Debit Card',
            type: 'Card',
            icon: '<svg class="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
            iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            badge: 'Visa • Mastercard',
            badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            tag: 'Bank Cards',
            description: 'Secure card-on-file billing supporting Visa, Mastercard, JCB, and local BancNet debit cards.',
            meta: 'BancNet / Visa Gateway',
            bookingSubtitle: 'Visa • Mastercard • Debit'
        },
        {
            id: 'shopeepay',
            name: 'ShopeePay',
            type: 'ShopeePay',
            icon: '<svg class="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
            iconBg: 'bg-orange-50 text-orange-700 border-orange-200',
            badge: 'E-Wallet',
            badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
            tag: 'Cashless',
            description: 'Instant mobile checkout using your integrated ShopeePay verified wallet balance.',
            meta: 'SeaMoney QR Payment',
            bookingSubtitle: 'ShopeePay E-Wallet'
        },
        {
            id: 'corporate',
            name: 'Corporate Account',
            type: 'Corporate Account',
            icon: '<svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
            iconBg: 'bg-slate-100 text-slate-700 border-slate-300',
            badge: 'B2B Enterprise',
            badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
            tag: 'Postpaid',
            description: 'Direct organization account billing with automated monthly consolidated invoice receipts.',
            meta: 'Enterprise Ledger Direct',
            bookingSubtitle: 'Postpaid Corporate Billing'
        }
    ],

    init() {
        if (typeof HirnaWallet !== 'undefined' && HirnaWallet.init) {
            HirnaWallet.init();
        }
        this.bindEvents();
        this.renderPaymentMethods();
        this.renderBookingPaymentOptions();
        this.renderCatalogModal();
        this.renderLedger();
    },

    getPaymentMethods() {
        let methods = [...this.defaultMethods];
        try {
            const stored = localStorage.getItem('hirna_available_payment_methods');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) methods = parsed;
            }
        } catch (e) {
            console.error("Failed to load payment methods:", e);
        }

        // Dynamically sync Hirna Wallet badge with real balance
        const w = methods.find(m => m.id === 'wallet');
        if (w && typeof HirnaWallet !== 'undefined') {
            w.badge = `Active • ${HirnaWallet.formatCurrency(HirnaWallet.getBalance())}`;
        }

        return methods;
    },

    savePaymentMethods(methods) {
        try {
            localStorage.setItem('hirna_available_payment_methods', JSON.stringify(methods));
        } catch (e) {
            console.error("Failed to save payment methods:", e);
        }
    },

    selectCatalogMethod(catalogId) {
        const item = this.catalogMethods.find(m => m.id === catalogId);
        if (!item) return;

        let current = this.getPaymentMethods();
        const existingIdx = current.findIndex(m => m.id === item.id || m.type === item.type);

        if (existingIdx !== -1) {
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`"${item.name}" is already in your booking payment methods!`, 'info');
            }
            this.renderBookingPaymentOptions(item.type);
        } else {
            current.push({
                ...item,
                isSystem: false
            });
            this.savePaymentMethods(current);

            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`"${item.name}" added to your booking payment methods!`, 'success');
            }
        }

        this.renderPaymentMethods();
        this.renderBookingPaymentOptions(item.type);
        this.renderCatalogModal();

        setTimeout(() => {
            this.closeAddMethodModal();
        }, 400);
    },

    renderCatalogModal() {
        const container = document.getElementById('payment-catalog-list');
        if (!container) return;

        const currentMethods = this.getPaymentMethods();
        const currentTypes = new Set(currentMethods.map(m => m.type));

        container.innerHTML = this.catalogMethods.map(cat => {
            const isAdded = currentTypes.has(cat.type);
            return `
                <div onclick="PaymentsModule.selectCatalogMethod('${cat.id}')" class="p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between space-x-3 group ${isAdded ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-hirna-500 hover:bg-hirna-50/30'}">
                    <div class="flex items-center space-x-3 min-w-0">
                        <div class="w-11 h-11 rounded-2xl ${cat.iconBg} flex items-center justify-center text-xl flex-shrink-0 shadow-xs border">
                            ${cat.icon}
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center space-x-2">
                                <h4 class="text-xs font-black text-slate-900 truncate">${cat.name}</h4>
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold ${cat.badgeClass} border uppercase tracking-wider">${cat.badge}</span>
                            </div>
                            <p class="text-[11px] text-slate-500 leading-tight mt-0.5">${cat.description}</p>
                            <span class="text-[10px] text-hirna-700 font-semibold mt-0.5 block">${cat.tag}</span>
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        ${isAdded ? `
                            <span class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1 shadow-xs">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                                <span>In Booking</span>
                            </span>
                        ` : `
                            <button type="button" class="px-3 py-1.5 rounded-xl bg-hirna-700 group-hover:bg-hirna-800 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                                <span>Add to Booking</span>
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderBookingPaymentOptions(selectedType = null) {
        const container = document.getElementById('std-payment-methods-grid');
        if (!container) return;

        const methods = this.getPaymentMethods();
        const currentChecked = selectedType || document.querySelector('input[name="std-payment-method"]:checked')?.value || 'Cash';

        container.innerHTML = methods.map((m, index) => {
            const isChecked = m.type === currentChecked || (!selectedType && index === 0 && !currentChecked);
            return `
                <label class="border border-slate-200 rounded-xl p-2.5 flex items-center space-x-2.5 cursor-pointer hover:border-hirna-500 transition has-[:checked]:border-hirna-600 has-[:checked]:bg-hirna-50/70 has-[:checked]:ring-1 has-[:checked]:ring-hirna-500">
                    <input type="radio" name="std-payment-method" value="${m.type}" ${isChecked ? 'checked' : ''} class="sr-only">
                    <div class="w-8 h-8 rounded-lg ${m.iconBg || 'bg-slate-100 text-slate-700'} flex items-center justify-center flex-shrink-0 text-base shadow-xs">
                        ${m.icon || '<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>'}
                    </div>
                    <div class="text-left min-w-0">
                        <div class="text-xs font-bold text-slate-800 truncate">${m.name}</div>
                        <div class="text-[10px] text-slate-400 truncate">${m.bookingSubtitle || m.description || 'Cashless'}</div>
                    </div>
                </label>
            `;
        }).join('');
    },

    renderPaymentMethods() {
        const container = document.getElementById('available-payment-methods-grid');
        if (!container) return;

        const methods = this.getPaymentMethods();
        let html = methods.map(m => `
            <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 relative group">
                <div class="space-y-2.5">
                    <div class="flex items-start justify-between">
                        <div class="w-10 h-10 rounded-xl ${m.iconBg || 'bg-slate-100 text-slate-700'} border flex items-center justify-center text-xl shadow-xs">
                            ${m.icon || '<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>'}
                        </div>
                        <div class="flex items-center space-x-1.5">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'}">
                                ${m.badge || 'Active'}
                            </span>
                            ${!m.isSystem ? `
                                <button type="button" onclick="PaymentsModule.deletePaymentMethod('${m.id}')" title="Remove from booking methods" class="text-slate-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-rose-50 cursor-pointer">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-hirna-900">${m.name}</h4>
                        <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${m.description}</p>
                    </div>
                </div>
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span class="truncate font-mono">${m.meta || 'Booking Ready'}</span>
                    <span class="text-emerald-600 font-bold text-xs">In Booking</span>
                </div>
            </div>
        `).join('');

        // Card button to Add Payment Method
        html += `
            <button type="button" onclick="PaymentsModule.openAddMethodModal()" class="w-full text-left p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-gold-500 bg-slate-50/50 hover:bg-gold-50/20 transition-all duration-200 flex flex-col items-center justify-center text-center group min-h-[150px] cursor-pointer">
                <div class="w-10 h-10 rounded-full bg-white border border-slate-200 group-hover:border-gold-400 group-hover:bg-gold-50 text-slate-600 group-hover:text-gold-700 flex items-center justify-center shadow-xs transition-colors mb-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                </div>
                <span class="text-xs font-bold text-slate-800 group-hover:text-hirna-900">Add Payment Method</span>
                <span class="text-[11px] text-slate-400 group-hover:text-slate-600 mt-0.5">QR Payment, Maya, Card</span>
            </button>
        `;

        container.innerHTML = html;
    },

    openAddMethodModal() {
        this.renderCatalogModal();
        const modal = document.getElementById('add-payment-method-modal');
        if (modal) modal.classList.remove('hidden');
    },

    closeAddMethodModal() {
        const modal = document.getElementById('add-payment-method-modal');
        if (modal) modal.classList.add('hidden');
    },

    deletePaymentMethod(id) {
        let current = this.getPaymentMethods();
        current = current.filter(m => m.id !== id);
        this.savePaymentMethods(current);
        this.renderPaymentMethods();
        this.renderBookingPaymentOptions();
        this.renderCatalogModal();
        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('Payment method removed from booking options.', 'info');
        }
    },

    openPaymentModal(bookingOrId) {
        if (typeof bookingOrId === 'string') {
            const list = SupabaseBridge.getData('bookings');
            this.activeBooking = list.find(b => b.id === bookingOrId) || list[0];
        } else {
            this.activeBooking = bookingOrId;
        }

        if (!this.activeBooking) return;

        const booking = this.activeBooking;
        const totalFare = parseFloat(booking.total_fare || 155);

        // Populate modal data
        const codeEl = document.getElementById('pay-modal-code');
        const amountEl = document.getElementById('pay-modal-amount');
        const baseEl = document.getElementById('pay-modal-base');
        const distEl = document.getElementById('pay-modal-dist');
        const timeEl = document.getElementById('pay-modal-time');
        const surgeEl = document.getElementById('pay-modal-surge');
        const reasonEl = document.getElementById('pay-modal-reason');

        if (codeEl) codeEl.innerText = booking.booking_code || 'HIRNA-000000';
        if (amountEl) amountEl.innerText = `₱${totalFare.toFixed(2)}`;
        if (baseEl) baseEl.innerText = `₱${parseFloat(booking.base_fare || 45).toFixed(2)}`;
        if (distEl) distEl.innerText = `₱${parseFloat(booking.distance_fare || 85).toFixed(2)} (${booking.distance_km || 0} km)`;
        if (timeEl) timeEl.innerText = `₱${parseFloat(booking.time_fare || 25).toFixed(2)} (${booking.duration_min || 0} min)`;
        if (surgeEl) surgeEl.innerText = `${booking.surge_multiplier || 1.0}x`;
        if (reasonEl) reasonEl.innerText = booking.surge_reason || 'Optimal traffic';

        // Render / pre-select active payment method
        this.renderConfirmPaymentMethods(booking.payment_method || 'GCash');

        // Hide HUD inline payment action bar if open
        const payBar = document.getElementById('hud-payment-action-bar');
        if (payBar) payBar.classList.add('hidden');

        // Display payment confirmation modal
        const modal = document.getElementById('payment-modal');
        if (modal) modal.classList.remove('hidden');
    },

    toggleChangePaymentMethod() {
        const container = document.getElementById('pay-modal-methods-container');
        const chevron = document.getElementById('pay-confirm-change-chevron');
        if (!container) return;
        const isHidden = container.classList.contains('hidden');
        if (isHidden) {
            container.classList.remove('hidden');
            if (chevron) chevron.classList.add('rotate-180');
        } else {
            container.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
        }
    },

    selectConfirmPaymentMethod(type) {
        this.selectedConfirmMethod = type;
        const input = document.getElementById('pay-confirm-method-input');
        if (input) input.value = type;

        const available = this.getPaymentMethods();
        const normSelected = (type || 'GCash').toLowerCase().trim();
        const matched = available.find(m => (m.type || '').toLowerCase().trim() === normSelected || (m.name || '').toLowerCase().trim() === normSelected) || available[0];

        // Update selected card UI if present
        const iconEl = document.getElementById('pay-modal-selected-icon');
        const iconBgEl = document.getElementById('pay-modal-selected-icon-bg');
        const nameEl = document.getElementById('pay-modal-selected-name');
        const badgeEl = document.getElementById('pay-modal-selected-badge');
        const subtitleEl = document.getElementById('pay-modal-selected-subtitle');

        if (iconEl && matched) iconEl.innerHTML = matched.icon || '<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>';
        if (iconBgEl && matched) {
            iconBgEl.className = `w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${matched.iconBg || 'bg-slate-100 text-slate-700 border border-slate-200'}`;
        }
        if (nameEl && matched) nameEl.textContent = matched.name;
        if (badgeEl && matched) {
            badgeEl.textContent = matched.badge || 'Active';
            badgeEl.className = `px-1.5 py-0.5 text-[9px] font-bold rounded-md ${matched.badgeClass || 'bg-slate-100 text-slate-700 border border-slate-200'}`;
        }
        if (subtitleEl && matched) {
            subtitleEl.textContent = matched.bookingSubtitle || matched.description || 'Verified Payment Method';
        }

        // Close dropdown if present
        const chevron = document.getElementById('pay-confirm-change-chevron');
        if (chevron) chevron.classList.remove('rotate-180');

        // Re-render the option list with current selection highlight
        this.renderConfirmPaymentMethods(type, false);
    },

    renderConfirmPaymentMethods(selectedMethod = 'GCash', autoUpdateCard = true) {
        const container = document.getElementById('pay-modal-methods-container');
        if (!container) return;

        const available = this.getPaymentMethods();
        const normSelected = (selectedMethod || this.selectedConfirmMethod || 'GCash').toLowerCase().trim();
        const activeItem = available.find(m => (m.type || '').toLowerCase().trim() === normSelected || (m.name || '').toLowerCase().trim() === normSelected) || available[0];

        this.selectedConfirmMethod = activeItem ? activeItem.type : selectedMethod;

        const input = document.getElementById('pay-confirm-method-input');
        if (input && activeItem) input.value = activeItem.type;

        const totalFare = parseFloat(this.activeBooking?.total_fare || 0);
        const currentBal = typeof HirnaWallet !== 'undefined' ? HirnaWallet.getBalance() : 0;

        if (autoUpdateCard && activeItem) {
            const iconEl = document.getElementById('pay-modal-selected-icon');
            const iconBgEl = document.getElementById('pay-modal-selected-icon-bg');
            const nameEl = document.getElementById('pay-modal-selected-name');
            const badgeEl = document.getElementById('pay-modal-selected-badge');
            const subtitleEl = document.getElementById('pay-modal-selected-subtitle');

            if (iconEl) iconEl.innerHTML = activeItem.icon || '<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>';
            if (iconBgEl) {
                iconBgEl.className = `w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${activeItem.iconBg || 'bg-slate-100 text-slate-700 border border-slate-200'}`;
            }
            if (nameEl) nameEl.textContent = activeItem.name;
            if (badgeEl) {
                badgeEl.textContent = activeItem.badge || 'Active';
                badgeEl.className = `px-1.5 py-0.5 text-[9px] font-bold rounded-md ${activeItem.badgeClass || 'bg-slate-100 text-slate-700 border border-slate-200'}`;
            }
            if (subtitleEl) {
                subtitleEl.textContent = activeItem.bookingSubtitle || activeItem.description || 'Verified Payment Method';
            }
        }

        container.innerHTML = available.map(m => {
            const isSelected = (m.type || '').toLowerCase().trim() === (activeItem?.type || '').toLowerCase().trim();
            const isWallet = m.id === 'wallet';
            let badgeText = m.badge || 'Active';
            let badgeClass = m.badgeClass || 'bg-slate-100 text-slate-700 border border-slate-200';
            let subtitleText = m.bookingSubtitle || m.description || 'Verified';

            if (isWallet && typeof HirnaWallet !== 'undefined') {
                if (currentBal >= totalFare) {
                    badgeText = `Active • ${HirnaWallet.formatCurrency(currentBal)}`;
                    badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                    subtitleText = `Remaining: ${HirnaWallet.formatCurrency(currentBal - totalFare)}`;
                } else {
                    badgeText = `Low Balance • ${HirnaWallet.formatCurrency(currentBal)}`;
                    badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
                    subtitleText = `Short by ${HirnaWallet.formatCurrency(totalFare - currentBal)}`;
                }
            }

            return `
                <div onclick="PaymentsModule.selectConfirmPaymentMethod('${m.type}')" class="p-2.5 rounded-xl border ${isSelected ? 'border-hirna-700 bg-hirna-50/60 ring-1 ring-hirna-700' : 'border-slate-200 bg-white hover:bg-slate-50'} flex items-center justify-between cursor-pointer transition select-none">
                    <div class="flex items-center space-x-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${m.iconBg || 'bg-slate-100 text-slate-700'}">
                            <span>${m.icon || '<svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>'}</span>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center space-x-1.5 flex-wrap">
                                <span class="text-xs font-bold text-slate-800 truncate">${m.name}</span>
                                <span class="px-1.5 py-0.2 text-[8px] font-bold rounded ${badgeClass}">${badgeText}</span>
                            </div>
                            <span class="text-[10px] text-slate-500 block truncate">${subtitleText}</span>
                        </div>
                    </div>
                    <div class="ml-2 shrink-0">
                        ${isSelected ? `
                            <span class="w-5 h-5 rounded-full bg-hirna-700 text-white flex items-center justify-center text-[10px]">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                            </span>
                        ` : `
                            <span class="w-5 h-5 rounded-full border border-slate-300"></span>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    closePaymentModal() {
        document.getElementById('payment-modal')?.classList.add('hidden');

        // Notify BookingModule that payment modal was dismissed/minimized so HUD displays payment action button
        if (typeof BookingModule !== 'undefined' && BookingModule.onPaymentModalDismissed) {
            BookingModule.onPaymentModalDismissed();
        }
    },

    submitActivePayment() {
        if (!this.activeBooking) return;
        const selectedMethod = this.selectedConfirmMethod 
            || document.getElementById('pay-confirm-method-input')?.value 
            || document.querySelector('input[name="pay-confirm-method"]:checked')?.value 
            || this.activeBooking.payment_method 
            || 'GCash';
        this.processPayment(selectedMethod);
    },

    processPayment(method = 'GCash') {
        if (!this.activeBooking) return;
        if (this.activeBooking._processed || this._isProcessing) return;

        const isWallet = (method || '').toLowerCase().includes('wallet');
        const tripFare = parseFloat(this.activeBooking.total_fare) || 0;

        if (isWallet) {
            if (typeof HirnaWallet === 'undefined') {
                console.error("HirnaWallet module not available");
                return;
            }

            const currentBalance = HirnaWallet.getBalance();
            if (currentBalance < tripFare) {
                if (typeof App !== 'undefined' && App.showToast) {
                    App.showToast(`Insufficient Hirna Wallet balance (${HirnaWallet.formatCurrency(currentBalance)} vs Trip Fare: ${HirnaWallet.formatCurrency(tripFare)}). Please cash in or choose another method.`, 'warning');
                }
                return;
            }

            // Deduct the exact trip price from Hirna Wallet
            const bookingCode = this.activeBooking.booking_code || this.activeBooking.id || 'TRIP';
            const deducted = HirnaWallet.deductFunds(tripFare, `Trip Fare Payment - #${bookingCode}`);
            if (!deducted) {
                if (typeof App !== 'undefined' && App.showToast) {
                    App.showToast("Failed to deduct from wallet balance. Please try again.", 'danger');
                }
                return;
            }

            const remainingBalance = HirnaWallet.getBalance();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(`Deducted ${HirnaWallet.formatCurrency(tripFare)} from Hirna Wallet. Remaining Balance: ${HirnaWallet.formatCurrency(remainingBalance)}`, 'success');
            }
        }

        this._isProcessing = true;
        setTimeout(() => { this._isProcessing = false; }, 1500);
        this.activeBooking._processed = true;

        const cleanCode = (method || 'GCASH').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const txnRef = `TXN-${cleanCode || 'PAY'}-${Math.floor(100000 + Math.random() * 900000)}`;
        const invoiceNo = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

        this.activeBooking.payment_status = 'completed';
        this.activeBooking.status = 'completed';
        this.activeBooking.payment_method = method;

        // Persist update in Supabase / Local storage if possible
        try {
            const list = SupabaseBridge.getData('bookings');
            const idx = list.findIndex(b => b.id === this.activeBooking.id || b.booking_code === this.activeBooking.booking_code);
            if (idx !== -1) {
                list[idx] = { ...list[idx], ...this.activeBooking };
                localStorage.setItem('hirna_db_bookings', JSON.stringify(list));
            }
        } catch (e) {
            console.warn("Failed to update booking in local storage:", e);
        }

        // Log transaction to Audit
        SupabaseBridge.logAudit("Payment Gateway", "PAYMENT_CONFIRMED", invoiceNo, this.activeBooking.passenger_name || "juan.delacruz@example.com", {
            invoice_no: invoiceNo,
            txn_ref: txnRef,
            amount: parseFloat(this.activeBooking.total_fare || 0),
            base_fare: parseFloat(this.activeBooking.base_fare || (this.activeBooking.total_fare * 0.35)).toFixed(2),
            distance_fare: parseFloat(this.activeBooking.distance_fare || (this.activeBooking.total_fare * 0.45)).toFixed(2),
            time_fare: parseFloat(this.activeBooking.time_fare || (this.activeBooking.total_fare * 0.10)).toFixed(2),
            surge_multiplier: this.activeBooking.surge_multiplier || 1.0,
            vat_amount: (this.activeBooking.total_fare * 0.12).toFixed(2),
            channel: method,
            payment_status: "SETTLED",
            wallet_deducted: isWallet ? tripFare : 0,
            wallet_remaining_balance: isWallet ? HirnaWallet.getBalance() : undefined,
            team5_sync: "AUTO_TRANSMITTED_TO_GENERAL_LEDGER"
        });

        // Trigger BPA sync event with Team 5
        if (typeof BPAIntegrations !== 'undefined' && BPAIntegrations.triggerSync) {
            BPAIntegrations.triggerSync('Team 5', 'RECORD_FARE_COLLECTION', {
                invoice: invoiceNo,
                amount: this.activeBooking.total_fare,
                tax_amount: (this.activeBooking.total_fare * 0.12).toFixed(2),
                account_receivable: "SETTLED",
                driver_payout: (this.activeBooking.total_fare * 0.80).toFixed(2)
            });
        }

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast("Payment Receipt Generated", 'success');
        }

        this.closePaymentModal();

        // Cleanup simulation in booking module
        if (typeof BookingModule !== 'undefined' && BookingModule.cleanupTripSimulation) {
            BookingModule.cleanupTripSimulation();
        }

        if (typeof BookingModule !== 'undefined' && BookingModule.renderHistory) {
            BookingModule.renderHistory();
        }

        this.renderLedger();

        // Show official receipt modal
        this.showReceipt(this.activeBooking, txnRef, invoiceNo, method);
    },

    showReceipt(booking, txnRef, invoiceNo, method) {
        if (!booking) return;

        const bookingKey = booking.booking_code || booking.id;
        const now = Date.now();
        if (this._lastShownReceiptId === bookingKey && (now - (this._lastShownReceiptTime || 0)) < 1500) {
            return;
        }
        this._lastShownReceiptId = bookingKey;
        this._lastShownReceiptTime = now;

        const modal = document.getElementById('receipt-modal');
        if (!modal) return;

        const codeEl = document.getElementById('rcpt-booking-code');
        const invEl = document.getElementById('rcpt-invoice-no');
        const dtEl = document.getElementById('rcpt-datetime');
        const durEl = document.getElementById('rcpt-duration');
        const methEl = document.getElementById('rcpt-method');
        const pPick = document.getElementById('rcpt-pickup');
        const pDrop = document.getElementById('rcpt-dropoff');
        const roleEl = document.getElementById('rcpt-booker-role');
        const passEl = document.getElementById('rcpt-passenger');
        const passPhoneEl = document.getElementById('rcpt-passenger-phone');
        const drivEl = document.getElementById('rcpt-driver');
        const drivPhoneEl = document.getElementById('rcpt-driver-phone');
        const recContainer = document.getElementById('rcpt-recipient-container');
        const recNameEl = document.getElementById('rcpt-recipient-name');
        const recPhoneEl = document.getElementById('rcpt-recipient-phone');
        const bBase = document.getElementById('rcpt-base');
        const bDist = document.getElementById('rcpt-dist');
        const bTime = document.getElementById('rcpt-time');
        const bSurge = document.getElementById('rcpt-surge');
        const bVat = document.getElementById('rcpt-vat');
        const bTotal = document.getElementById('rcpt-total');

        if (codeEl) codeEl.innerText = booking.booking_code || 'HIRNA-000000';
        if (invEl) invEl.innerText = invoiceNo || `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

        // Duration calculation & formatted display
        const durationMin = Math.max(1, Math.round(parseFloat(booking.duration_min) || 25));
        const durHours = Math.floor(durationMin / 60);
        const durMinsRem = durationMin % 60;
        let durationFormatted = '';
        if (durHours > 0) {
            durationFormatted = `${durHours} hr${durHours > 1 ? 's' : ''}${durMinsRem > 0 ? ' ' + durMinsRem + ' mins' : ''}`;
        } else {
            durationFormatted = `${durationMin} mins`;
        }
        if (durEl) durEl.innerText = durationFormatted;

        // Date and Time: Sync to elapsed travel time from real-world time
        // (e.g. current time is 03:30 PM + 1 hr travel time = 04:30 PM)
        const arrivalTimestamp = new Date(Date.now() + durationMin * 60000);
        const pad2 = n => String(n).padStart(2, '0');
        const year = arrivalTimestamp.getFullYear();
        const month = pad2(arrivalTimestamp.getMonth() + 1);
        const day = pad2(arrivalTimestamp.getDate());
        let hours = arrivalTimestamp.getHours();
        const minutes = pad2(arrivalTimestamp.getMinutes());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeFormatted = `${year}-${month}-${day} ${pad2(hours)}:${minutes} ${ampm}`;
        if (dtEl) dtEl.innerText = timeFormatted;

        const isWalletReceipt = (method || booking.payment_method || '').toLowerCase().includes('wallet');
        if (methEl) {
            if (isWalletReceipt) {
                methEl.innerText = 'Hirna Wallet (Stored Value)';
                methEl.className = 'font-bold text-amber-600';
            } else if ((method || booking.payment_method || '').toLowerCase().includes('cash')) {
                methEl.innerText = 'Cash (Driver Collection)';
                methEl.className = 'font-bold text-emerald-600';
            } else {
                methEl.innerText = method || booking.payment_method || 'GCash';
                methEl.className = 'font-bold text-blue-600';
            }
        }
        if (pPick) pPick.innerText = booking.pickup || 'Pickup Location';
        if (pDrop) pDrop.innerText = booking.dropoff || 'Dropoff Destination';

        // Booker (Passenger or Sender) Details
        const isParcel = booking.service_type === 'parcel';
        const bookerName = booking.sender_name || booking.passenger_name || 'Juan Dela Cruz';
        const bookerPhone = booking.sender_phone || booking.passenger_phone || '+63 917 888 9999';

        if (roleEl) roleEl.innerText = isParcel ? 'Booker (Sender)' : 'Passenger / Booker';
        if (passEl) passEl.innerText = bookerName;
        if (passPhoneEl) passPhoneEl.innerText = `Tel: ${bookerPhone}`;

        // Driver Details
        const driverName = booking.driver_name || 'Ricardo Dalisay';
        const driverPlate = booking.vehicle_plate || 'TXI-5431';
        const driverPhone = booking.driver_phone || '+63 920 555 1234';

        if (drivEl) drivEl.innerText = `${driverName} (${driverPlate})`;
        if (drivPhoneEl) drivPhoneEl.innerText = `Tel: ${driverPhone}`;

        // Recipient Details (Parcel Only)
        if (recContainer) {
            if (isParcel && (booking.recipient_name || booking.recipient_phone)) {
                recContainer.classList.remove('hidden');
                if (recNameEl) recNameEl.innerText = booking.recipient_name || 'Recipient';
                if (recPhoneEl) recPhoneEl.innerText = `Tel: ${booking.recipient_phone || '+63 918 987 6543'}`;
            } else {
                recContainer.classList.add('hidden');
            }
        }

        const totalFare = parseFloat(booking.total_fare || 155);
        if (bBase) bBase.innerText = `₱${parseFloat(booking.base_fare || 45).toFixed(2)}`;
        if (bDist) bDist.innerText = `₱${parseFloat(booking.distance_fare || 85).toFixed(2)}`;
        if (bTime) bTime.innerText = `₱${parseFloat(booking.time_fare || 25).toFixed(2)}`;
        if (bSurge) bSurge.innerText = `${booking.surge_multiplier || 1.0}x (${booking.surge_reason || 'Normal demand'})`;
        if (bVat) bVat.innerText = `₱${(totalFare * 0.12).toFixed(2)}`;
        if (bTotal) bTotal.innerText = `₱${totalFare.toFixed(2)}`;

        // Dynamic QR Ph verification display if QR payment
        const qrSection = document.getElementById('rcpt-qr-section');
        const isQr = (method || booking.payment_method || '').toLowerCase().includes('qr');
        if (qrSection) {
            if (isQr) {
                qrSection.classList.remove('hidden');
                qrSection.classList.add('flex');
                const qrImg = document.getElementById('rcpt-qr-image');
                if (qrImg) {
                    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=QRPH-HIRNA-${booking.booking_code || 'BOOKING'}-${totalFare}`;
                }
            } else {
                qrSection.classList.add('hidden');
                qrSection.classList.remove('flex');
            }
        }

        modal.classList.remove('hidden');
    },

    closeReceiptModal() {
        document.getElementById('receipt-modal')?.classList.add('hidden');
    },

    renderLedger() {
        const tbody = document.getElementById('payment-ledger-tbody');
        if (!tbody) return;

        const isSuperAdmin = typeof AuthModule !== 'undefined' && AuthModule.isSuperAdmin();
        const bookings = SupabaseBridge.getData('bookings');
        const seen = new Set();
        const uniqueBookings = bookings.filter(b => {
            const key = b.booking_code || b.id;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        tbody.innerHTML = uniqueBookings.map(b => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="px-4 py-3 font-mono text-xs font-semibold text-slate-800">${b.booking_code}</td>
                <td class="px-4 py-3 text-xs text-slate-600">${b.created_at}</td>
                <td class="px-4 py-3 text-xs font-medium text-blue-600">${b.payment_method || 'GCash'}</td>
                <td class="px-4 py-3 text-xs font-bold text-slate-900">₱${parseFloat(b.total_fare).toFixed(2)}</td>
                <td class="px-4 py-3 text-xs font-semibold text-slate-700">
                    ${b.service_type === 'parcel' 
                        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Parcel Delivery</span>' 
                        : (b.service_type === 'scheduled'
                            ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Scheduled Ride</span>'
                            : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-hirna-100 text-hirna-900">${b.vehicle_class || 'Standard Taxi'}</span>`)}
                </td>
                <td class="px-4 py-3 text-xs text-right space-x-1">
                    <button onclick="PaymentsModule.printReceipt('${b.id || b.booking_code}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-xs cursor-pointer">
                        View e-Receipt
                    </button>
                    ${isSuperAdmin ? `
                        <button onclick="PaymentsModule.archiveReceipt('${b.id || b.booking_code}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded font-bold text-xs cursor-pointer inline-flex items-center space-x-1" title="SuperAdmin Archive">
                            <svg class="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                            <span>Archive Receipt</span>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },

    archiveReceipt(id) {
        if (typeof AuthModule !== 'undefined' && !AuthModule.canDeleteRecords()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can archive receipts and financial records.", "error");
            return;
        }
        if (confirm(`SuperAdmin Action: Are you sure you want to archive receipt & transaction record ${id}? It will be moved to Compliance Archives.`)) {
            const archived = SupabaseBridge.archive('bookings', id, 'Archived from Payments Ledger');
            if (archived) {
                this.renderLedger();
                this.closeReceiptModal();
                if (typeof App !== 'undefined') App.showToast(`Receipt record ${id} safely moved to Compliance Archives.`, 'success');
            }
        }
    },

    deleteReceipt(id) {
        this.archiveReceipt(id);
    },

    printReceipt(id) {
        const list = SupabaseBridge.getData('bookings');
        const b = list.find(item => item.id === id || item.booking_code === id) || this.activeBooking || list[0];
        if (b) {
            this.showReceipt(b, `TXN-${(b.payment_method || 'GCASH').toUpperCase()}-994120`, `INV-2026-88219`, b.payment_method || 'GCash');
        }
    },

    printReceiptDocument() {
        const modal = document.getElementById('receipt-modal');
        const receiptCard = document.querySelector('#receipt-modal .receipt-printable-card');
        if (!receiptCard || !modal) {
            window.print();
            return;
        }

        const clone = receiptCard.cloneNode(true);
        // Remove action buttons from clone
        const actions = clone.querySelectorAll('.receipt-actions, button, .no-print');
        actions.forEach(el => el.remove());

        const printWin = window.open('', '_blank', 'width=520,height=760,toolbar=0,scrollbars=1,status=0');
        if (!printWin) {
            // Fallback: temporarily make modal visible and use window.print()
            const wasHidden = modal.classList.contains('hidden');
            if (wasHidden) modal.classList.remove('hidden');
            setTimeout(() => {
                window.print();
                if (wasHidden) modal.classList.add('hidden');
            }, 100);
            return;
        }

        printWin.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hirna Official Trip Receipt</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        hirna: { 50:'#fef2f2',100:'#fee2e2',200:'#fecaca',300:'#fca5a5',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c',800:'#991b1b',900:'#7f1d1d',950:'#450a0a' },
                        gold: { 400:'#fbbf24',500:'#f59e0b',600:'#d97706' }
                    }
                }
            }
        }
    <\/script>
    <style>
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
        body { margin: 0; padding: 20px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; display: flex; justify-content: center; }
        .receipt-printable-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; width: 100% !important; max-width: 440px !important; margin: 0 auto !important; }
        @media print {
            body { padding: 0; }
            button, .receipt-actions, .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    ${clone.outerHTML}
    <script>
        // Wait for Tailwind to process classes before printing
        function tryPrint() {
            setTimeout(function() {
                window.print();
                window.close();
            }, 600);
        }
        if (document.readyState === 'complete') {
            tryPrint();
        } else {
            window.onload = tryPrint;
        }
    <\/script>
</body>
</html>`);
        printWin.document.close();
    },

    bindEvents() {
        document.getElementById('btn-close-pay-modal')?.addEventListener('click', () => this.closePaymentModal());
    }
};

// Live database sync listener
window.addEventListener('hirna:db_updated', (e) => {
    if (typeof PaymentsModule !== 'undefined' && PaymentsModule.renderLedger) {
        if (!e.detail || !e.detail.table || e.detail.table === 'bookings' || e.detail.table === 'payments') {
            PaymentsModule.renderLedger();
        }
    }
});

// Auto-run wallet initialization on DOM load
window.addEventListener('DOMContentLoaded', () => {
    if (typeof HirnaWallet !== 'undefined' && HirnaWallet.init) {
        HirnaWallet.init();
    }
});
