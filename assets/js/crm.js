/**
 * Module 3: Customer-Relationship Management (CRM) & NLP Sentiment Controller
 * Provides end-to-end Review Management: Lifecycle Statuses, Operator Responses,
 * 1-Click Support Escalation, Goodwill Vouchers, Driver Safety Flagging & Metrics
 */
const CRMModule = {
    filters: {
        stars: 'all',          // 'all', '5', '4', '3', '2', '1'
        status: 'all',         // 'all', 'Pending Review', 'Under Investigation', 'Responded', 'Resolved'
        sortDate: 'desc',      // 'desc' (newest to oldest) or 'asc' (oldest to newest)
        searchChoice: 'all',   // 'all', 'name', 'date', 'words', 'classification'
        searchQuery: ''        // free-text search string
    },

    activeReplyId: null,

    templates: {
        apology: "Dear passenger, we sincerely apologize for this experience. Our quality assurance team has opened a formal inquiry into this incident and will follow up accordingly.",
        driver_coaching: "Thank you for bringing this to our attention. The driver has been issued a formal reminder and caution regarding Hirna service and safety standards.",
        appreciation: "Thank you so much for your warm words! We have shared your wonderful compliment with Kuya driver to recognize exemplary service."
    },

    getReviewerName() {
        if (typeof AuthModule !== 'undefined' && AuthModule.currentUser) {
            const u = AuthModule.currentUser;
            if (u.name && u.name.trim()) return u.name.trim();
            if (u.full_name && u.full_name.trim()) return u.full_name.trim();
            if (u.email && u.email.trim()) return u.email.trim().split('@')[0];
        }
        try {
            const saved = localStorage.getItem('hirna_auth_user') || sessionStorage.getItem('hirna_auth_user');
            if (saved) {
                const u = JSON.parse(saved);
                if (u.name && u.name.trim()) return u.name.trim();
                if (u.full_name && u.full_name.trim()) return u.full_name.trim();
                if (u.email && u.email.trim()) return u.email.trim().split('@')[0];
            }
        } catch(e) {}
        const local = localStorage.getItem('hirna_user_name');
        if (local && local.trim()) return local.trim();
        if (typeof BookingModule !== 'undefined' && BookingModule.passengerName && BookingModule.passengerName.trim()) {
            return BookingModule.passengerName.trim();
        }
        return 'Customer';
    },

    updateReviewerDisplay() {
        const el = document.getElementById('crm-current-reviewer-display');
        if (el) {
            el.textContent = this.getReviewerName();
        }
    },

    init() {
        this.updateReviewerDisplay();
        this.renderProfiles();
        this.renderMetrics();
        this.renderFeedback();
        this.renderTickets();
        this.bindEvents();
    },

    renderProfiles() {
        const container = document.getElementById('crm-profiles-list');
        if (!container) return;

        const users = SupabaseBridge.getData('users') || [];
        container.innerHTML = users.map(u => `
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                            ${(u.full_name || 'U').charAt(0)}
                        </div>
                        <div>
                            <h4 class="font-semibold text-slate-800 text-sm">${u.full_name}</h4>
                            <p class="text-xs text-slate-500">${u.email}</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${u.loyalty_tier === 'Gold' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700'}">
                        ${u.loyalty_tier} Tier
                    </span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 rounded-lg">
                    <div><span class="text-slate-400 block text-[10px]">Points</span><b class="text-slate-800 font-bold">${u.loyalty_points}</b></div>
                    <div><span class="text-slate-400 block text-[10px]">Trips</span><b class="text-slate-800 font-bold">${u.total_trips}</b></div>
                    <div><span class="text-slate-400 block text-[10px]">Rating</span><b class="text-slate-800 font-bold">${u.rating} / 5</b></div>
                </div>
            </div>
        `).join('');
    },

    renderMetrics() {
        const allFeedback = SupabaseBridge.getData('feedback') || [];
        const total = allFeedback.length;
        const pending = allFeedback.filter(f => !f.status || f.status === 'Pending Review').length;
        const investigating = allFeedback.filter(f => f.status === 'Under Investigation').length;
        const resolved = allFeedback.filter(f => f.status === 'Resolved' || f.status === 'Responded').length;

        const elTotal = document.getElementById('crm-kpi-total');
        const elPending = document.getElementById('crm-kpi-pending');
        const elInvestigating = document.getElementById('crm-kpi-investigating');
        const elResolved = document.getElementById('crm-kpi-resolved');

        if (elTotal) elTotal.textContent = total;
        if (elPending) elPending.textContent = pending;
        if (elInvestigating) elInvestigating.textContent = investigating;
        if (elResolved) elResolved.textContent = resolved;
    },

    renderFeedback() {
        const container = document.getElementById('crm-feedback-list');
        if (!container) return;

        const allFeedback = SupabaseBridge.getData('feedback') || [];

        // 1. Star Rating Filter
        let filtered = allFeedback.filter(f => {
            if (this.filters.stars === 'all') return true;
            return parseInt(f.rating) === parseInt(this.filters.stars);
        });

        // 2. Lifecycle Status Filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(f => {
                const s = f.status || 'Pending Review';
                return s === this.filters.status;
            });
        }

        // 3. Choice-based Search Filter
        const query = (this.filters.searchQuery || '').trim().toLowerCase();
        if (query) {
            filtered = filtered.filter(f => {
                const passenger = (f.passenger || f.passenger_name || '').toLowerCase();
                const date = (f.date || '').toLowerCase();
                const comment = (f.comment || '').toLowerCase();
                const reply = (f.operator_reply || '').toLowerCase();
                const category = (f.category || '').toLowerCase();
                const sentiment = (f.sentiment || '').toLowerCase();
                const status = (f.status || 'Pending Review').toLowerCase();

                switch (this.filters.searchChoice) {
                    case 'name':
                        return passenger.includes(query);
                    case 'date':
                        return date.includes(query);
                    case 'words':
                        return comment.includes(query) || reply.includes(query);
                    case 'classification':
                        return category.includes(query) || sentiment.includes(query) || status.includes(query);
                    case 'all':
                    default:
                        return passenger.includes(query) ||
                               date.includes(query) ||
                               comment.includes(query) ||
                               reply.includes(query) ||
                               category.includes(query) ||
                               sentiment.includes(query) ||
                               status.includes(query);
                }
            });
        }

        // 4. Date Sort (Newest to Oldest vs. Oldest to Newest)
        filtered.sort((a, b) => {
            const timeA = new Date(a.date || '1970-01-01').getTime();
            const timeB = new Date(b.date || '1970-01-01').getTime();
            if (this.filters.sortDate === 'asc') {
                return timeA - timeB; // Oldest to Newest
            } else {
                return timeB - timeA; // Newest to Oldest
            }
        });

        // 5. Update Summary / Counter Badge
        const countBadge = document.getElementById('crm-feedback-count-badge');
        if (countBadge) {
            if (filtered.length === allFeedback.length) {
                countBadge.innerHTML = `Showing all <b>${allFeedback.length}</b> reviews`;
            } else {
                countBadge.innerHTML = `Showing <b>${filtered.length}</b> of <b>${allFeedback.length}</b> reviews`;
            }
        }

        // 6. Update Active Filter Indicators
        this.renderActiveFilterTags(allFeedback.length, filtered.length);

        // 7. Handle Empty State
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <svg class="w-8 h-8 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <h5 class="text-xs font-bold text-slate-800">No Customer Reviews Found</h5>
                    <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
                        No reviews match your current filters 
                        (${this.filters.stars !== 'all' ? `Star: <b>${this.filters.stars} Stars</b>, ` : ''}
                         ${this.filters.status !== 'all' ? `Status: <b>${this.filters.status}</b>, ` : ''}
                         Choice: <b>${this.filters.searchChoice}</b>, 
                         Query: <b>"${this.escapeHtml(this.filters.searchQuery)}"</b>).
                    </p>
                    <button type="button" onclick="CRMModule.resetFilters()" class="inline-flex items-center px-3 py-1.5 bg-hirna-700 text-white rounded-lg text-xs font-bold hover:bg-hirna-800 transition shadow-sm mt-1 cursor-pointer">
                        Reset All Filters
                    </button>
                </div>
            `;
            return;
        }

        // 8. Render Filtered Feedback Cards with Review Management Tools
        container.innerHTML = filtered.map(f => {
            const sentiment = f.sentiment || 'Neutral';
            let badgeClass = 'bg-slate-100 text-slate-800 border-slate-300';
            if (sentiment === 'Positive') {
                badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            } else if (sentiment === 'Negative') {
                badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
            } else if (sentiment === 'Critical') {
                badgeClass = 'bg-red-200 text-red-900 border-red-400 font-black animate-pulse';
            } else if (sentiment === 'Neutral') {
                badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            }

            const starCount = Math.max(1, Math.min(5, parseInt(f.rating) || 5));
            const starsDisplay = `${starCount} / 5 Rating`;

            // Status Styling
            const status = f.status || 'Pending Review';
            let statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
            let statusIcon = '⏳';
            if (status === 'Under Investigation') {
                statusBadge = 'bg-sky-100 text-sky-800 border-sky-300';
                statusIcon = '🔍';
            } else if (status === 'Responded') {
                statusBadge = 'bg-purple-100 text-purple-800 border-purple-300';
                statusIcon = '💬';
            } else if (status === 'Resolved') {
                statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                statusIcon = '✅';
            }

            // Highlight matches if search active
            const shouldHighlightWords = query && (this.filters.searchChoice === 'words' || this.filters.searchChoice === 'all');
            const shouldHighlightName = query && (this.filters.searchChoice === 'name' || this.filters.searchChoice === 'all');
            const shouldHighlightDate = query && (this.filters.searchChoice === 'date' || this.filters.searchChoice === 'all');
            const shouldHighlightCategory = query && (this.filters.searchChoice === 'classification' || this.filters.searchChoice === 'all');

            const passengerName = f.passenger || f.passenger_name || 'Passenger';
            const highlightedComment = this.highlightText(f.comment, query, shouldHighlightWords);
            const highlightedPassenger = this.highlightText(passengerName, query, shouldHighlightName);
            const highlightedDate = this.highlightText(f.date, query, shouldHighlightDate);
            const highlightedCategory = this.highlightText(f.category, query, shouldHighlightCategory);

            return `
                <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-hirna-300 hover:shadow-md transition text-xs space-y-3" id="crm-card-${f.id}">
                    <!-- Card Top Header -->
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center space-x-2.5">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-hirna-700 to-hirna-900 text-gold-300 font-bold flex items-center justify-center text-xs shadow-sm">
                                ${(passengerName || 'P').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <span class="font-bold text-slate-900 block leading-tight">${highlightedPassenger}</span>
                                <span class="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                    <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    ${highlightedDate} • Booking: <b class="text-slate-600">${f.booking_code || 'TNVS-2026'}</b>
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <!-- Lifecycle Status Badge -->
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge} flex items-center space-x-1 shadow-2xs">
                                <span>${statusIcon}</span>
                                <span>${status}</span>
                            </span>
                            <!-- Sentiment Polarity -->
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}">
                                NLP: ${sentiment} (${(f.score >= 0 ? '+' : '') + f.score})
                            </span>
                        </div>
                    </div>

                    <!-- Passenger Review Content -->
                    <div class="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1.5">
                        <div class="flex items-center justify-between">
                            <div class="text-amber-500 font-bold tracking-wider text-xs">
                                ${'★'.repeat(starCount)}${'☆'.repeat(5 - starCount)}
                                <span class="text-[10px] text-slate-500 font-semibold ml-1">${starsDisplay}</span>
                            </div>
                            <span class="px-2 py-0.5 rounded bg-white text-slate-600 font-medium text-[10px] border border-slate-200">
                                🏷️ ${highlightedCategory}
                            </span>
                        </div>
                        <p class="text-slate-800 italic leading-relaxed text-xs">
                            "${highlightedComment}"
                        </p>
                    </div>

                    <!-- Operational Action Badges (Escalations, Compensation, Safety Flags) -->
                    <div class="flex flex-wrap items-center gap-1.5">
                        ${f.escalated_ticket_id ? `
                            <span class="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg text-[10px] font-bold border border-indigo-200">
                                <svg class="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
                                <span>Linked Support Ticket: ${f.escalated_ticket_id}</span>
                            </span>
                        ` : ''}

                        ${f.compensation ? `
                            <span class="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200">
                                <span>🎁 Goodwill Issued: ${f.compensation}</span>
                            </span>
                        ` : ''}

                        ${f.driver_flagged ? `
                            <span class="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200">
                                <span>⚠️ Driver Flagged for Safety Coaching</span>
                            </span>
                        ` : ''}
                    </div>

                    <!-- Official Operator Reply Box (if replied) -->
                    ${f.operator_reply ? `
                        <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200/90 text-xs space-y-1">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-1.5 font-bold text-amber-900">
                                    <svg class="w-3.5 h-3.5 text-amber-700" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/></svg>
                                    <span>Official Hirna Operator Response</span>
                                </div>
                                <span class="text-[10px] text-amber-700 font-mono">${f.replied_at || ''} • By ${f.replied_by || 'Customer Relations'}</span>
                            </div>
                            <p class="text-slate-800 italic pl-5 leading-relaxed">"${this.escapeHtml(f.operator_reply)}"</p>
                            <div class="flex justify-end pt-0.5">
                                <button onclick="CRMModule.openReplyModal('${f.id}')" class="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer">
                                    Edit Official Response
                                </button>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Review Management Action Toolbar -->
                    <div class="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <!-- Quick Status Select -->
                        <div class="flex items-center space-x-1.5">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status:</label>
                            <select onchange="CRMModule.updateReviewStatus('${f.id}', this.value)" class="text-[11px] font-bold py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:ring-1 focus:ring-hirna-500 cursor-pointer shadow-2xs">
                                <option value="Pending Review" ${(!f.status || f.status === 'Pending Review') ? 'selected' : ''}>⏳ Pending Review</option>
                                <option value="Under Investigation" ${f.status === 'Under Investigation' ? 'selected' : ''}>🔍 Under Investigation</option>
                                <option value="Responded" ${f.status === 'Responded' ? 'selected' : ''}>💬 Responded</option>
                                <option value="Resolved" ${f.status === 'Resolved' ? 'selected' : ''}>✅ Resolved</option>
                            </select>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-wrap items-center gap-1.5">
                            <button onclick="CRMModule.openReplyModal('${f.id}')" class="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold shadow-2xs hover:border-slate-300 transition flex items-center space-x-1 cursor-pointer" title="Post Official Response">
                                <span>💬</span>
                                <span>${f.operator_reply ? 'Edit Reply' : 'Reply'}</span>
                            </button>
                            
                            ${!f.escalated_ticket_id ? `
                                <button onclick="CRMModule.escalateToTicket('${f.id}')" class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold shadow-2xs transition flex items-center space-x-1 cursor-pointer" title="Convert Review to Support Ticket">
                                    <span>🎫</span>
                                    <span>Escalate Ticket</span>
                                </button>
                            ` : ''}

                            ${!f.compensation ? `
                                <button onclick="CRMModule.issueCompensation('${f.id}')" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold shadow-2xs transition flex items-center space-x-1 cursor-pointer" title="Credit Goodwill Points or Voucher">
                                    <span>🎁</span>
                                    <span>Issue Voucher</span>
                                </button>
                            ` : ''}

                            ${!f.driver_flagged ? `
                                <button onclick="CRMModule.flagDriver('${f.id}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold shadow-2xs transition flex items-center space-x-1 cursor-pointer" title="Flag Driver for Safety Retraining">
                                    <span>⚠️</span>
                                    <span>Flag Driver</span>
                                </button>
                            ` : ''}

                            ${(typeof AuthModule !== 'undefined' && AuthModule.isSuperAdmin()) ? `
                                <button onclick="CRMModule.archiveFeedback('${f.id}')" class="px-2 py-1 text-slate-400 hover:text-amber-800 hover:bg-amber-50 rounded text-[11px] font-medium cursor-pointer" title="Move to Archives">
                                    🗄️ Archive
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    setStarFilter(star) {
        this.filters.stars = String(star);
        document.querySelectorAll('.crm-star-btn').forEach(btn => {
            if (btn.getAttribute('data-star-filter') === String(star)) {
                btn.className = "crm-star-btn px-2.5 py-1 rounded-lg text-xs font-bold bg-hirna-700 text-white shadow-sm transition";
            } else {
                btn.className = "crm-star-btn px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition";
            }
        });
        this.renderFeedback();
    },

    setStatusFilter(status) {
        this.filters.status = status;
        const select = document.getElementById('crm-status-filter');
        if (select && select.value !== status) {
            select.value = status;
        }
        this.renderFeedback();
    },

    setDateSort(sortOrder) {
        this.filters.sortDate = sortOrder;
        const sortSelect = document.getElementById('crm-date-sort');
        if (sortSelect && sortSelect.value !== sortOrder) {
            sortSelect.value = sortOrder;
        }
        this.renderFeedback();
    },

    setSearchChoice(choice) {
        this.filters.searchChoice = choice;
        const searchInput = document.getElementById('crm-search-input');
        if (searchInput) {
            const placeholders = {
                'name': 'Search by passenger name (e.g. Juan, Maria, Roselle)...',
                'date': 'Search by date (e.g. 2026-09-21, 2026-08)...',
                'words': 'Search review keywords (e.g. clean, polite, surge, detour)...',
                'classification': 'Search classification / sentiment (e.g. Driver Conduct, Positive, Dispute)...',
                'all': 'Search by name, date, words, or classification...'
            };
            searchInput.placeholder = placeholders[choice] || placeholders.all;
        }
        this.renderFeedback();
    },

    clearSearch() {
        this.filters.searchQuery = '';
        const searchInput = document.getElementById('crm-search-input');
        if (searchInput) searchInput.value = '';
        const clearBtn = document.getElementById('crm-search-clear');
        if (clearBtn) clearBtn.classList.add('hidden');
        this.renderFeedback();
    },

    resetFilters() {
        this.filters.stars = 'all';
        this.filters.status = 'all';
        this.filters.sortDate = 'desc';
        this.filters.searchChoice = 'all';
        this.filters.searchQuery = '';

        const choiceSelect = document.getElementById('crm-search-choice');
        if (choiceSelect) choiceSelect.value = 'all';

        const statusSelect = document.getElementById('crm-status-filter');
        if (statusSelect) statusSelect.value = 'all';

        const searchInput = document.getElementById('crm-search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.placeholder = 'Search by name, date, words, or classification...';
        }

        const clearBtn = document.getElementById('crm-search-clear');
        if (clearBtn) clearBtn.classList.add('hidden');

        const sortSelect = document.getElementById('crm-date-sort');
        if (sortSelect) sortSelect.value = 'desc';

        document.querySelectorAll('.crm-star-btn').forEach(btn => {
            if (btn.getAttribute('data-star-filter') === 'all') {
                btn.className = "crm-star-btn px-2.5 py-1 rounded-lg text-xs font-bold bg-hirna-700 text-white shadow-sm transition";
            } else {
                btn.className = "crm-star-btn px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition";
            }
        });

        this.renderFeedback();
    },

    renderActiveFilterTags(totalCount, filteredCount) {
        const container = document.getElementById('crm-active-filter-tags');
        if (!container) return;

        const tags = [];
        if (this.filters.stars !== 'all') {
            tags.push(`
                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-gold-100 text-gold-900 font-bold border border-gold-300">
                    ★ ${this.filters.stars} Stars
                    <button type="button" onclick="CRMModule.setStarFilter('all')" class="ml-1 text-gold-700 hover:text-gold-900 font-black cursor-pointer">&times;</button>
                </span>
            `);
        }

        if (this.filters.status !== 'all') {
            tags.push(`
                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold border border-purple-300">
                    Status: ${this.filters.status}
                    <button type="button" onclick="CRMModule.setStatusFilter('all')" class="ml-1 text-purple-700 hover:text-purple-900 font-black cursor-pointer">&times;</button>
                </span>
            `);
        }

        if (this.filters.sortDate === 'asc') {
            tags.push(`
                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold border border-blue-200">
                    📅 Oldest to Newest
                    <button type="button" onclick="CRMModule.setDateSort('desc')" class="ml-1 text-blue-700 hover:text-blue-900 font-black cursor-pointer">&times;</button>
                </span>
            `);
        }

        if (this.filters.searchQuery.trim()) {
            const choiceLabels = {
                'name': 'Name',
                'date': 'Date',
                'words': 'Words',
                'classification': 'Classification',
                'all': 'All'
            };
            const label = choiceLabels[this.filters.searchChoice] || 'Search';
            tags.push(`
                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-hirna-100 text-hirna-900 font-semibold border border-hirna-300">
                    ${label}: "${this.escapeHtml(this.filters.searchQuery.trim())}"
                    <button type="button" onclick="CRMModule.clearSearch()" class="ml-1 text-hirna-700 hover:text-hirna-900 font-black cursor-pointer">×</button>
                </span>
            `);
        }

        if (tags.length > 0) {
            container.classList.remove('hidden');
            container.innerHTML = `
                <span class="text-slate-500 font-medium">Active filters:</span>
                ${tags.join('')}
                <button type="button" onclick="CRMModule.resetFilters()" class="text-xs text-hirna-700 hover:underline font-semibold ml-2 cursor-pointer">
                    Reset all
                </button>
            `;
        } else {
            container.classList.add('hidden');
            container.innerHTML = '';
        }
    },

    // Review Lifecycle Actions: Update Status
    updateReviewStatus(id, newStatus) {
        SupabaseBridge.update('feedback', id, { status: newStatus });
        this.renderMetrics();
        this.renderFeedback();
        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`Review status updated to "${newStatus}"`, 'success');
        }
    },

    // Official Operator Response Modal & Submission
    openReplyModal(id) {
        const feedbackList = SupabaseBridge.getData('feedback') || [];
        const f = feedbackList.find(item => item.id === id);
        if (!f) return;

        this.activeReplyId = id;
        const modal = document.getElementById('crm-reply-modal');
        const snippet = document.getElementById('crm-modal-review-snippet');
        const textarea = document.getElementById('crm-modal-reply-text');
        const resolveCheckbox = document.getElementById('crm-modal-auto-resolve');

        if (snippet) {
            const passengerName = f.passenger || f.passenger_name || 'Passenger';
            snippet.innerHTML = `
                <div class="flex items-center justify-between text-[11px]">
                    <span class="font-bold text-slate-800">${this.escapeHtml(passengerName)}</span>
                    <span class="text-amber-500 font-bold">${'★'.repeat(f.rating)} (${f.rating} Stars)</span>
                </div>
                <p class="text-slate-600 italic">"${this.escapeHtml(f.comment)}"</p>
                <div class="text-[10px] text-slate-400">Category: ${this.escapeHtml(f.category || 'General')} • ${f.date}</div>
            `;
        }

        if (textarea) {
            textarea.value = f.operator_reply || '';
        }
        if (resolveCheckbox) {
            resolveCheckbox.checked = true;
        }

        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    closeReplyModal() {
        const modal = document.getElementById('crm-reply-modal');
        if (modal) modal.classList.add('hidden');
        this.activeReplyId = null;
    },

    applyTemplate(tplKey) {
        const textarea = document.getElementById('crm-modal-reply-text');
        if (textarea && this.templates[tplKey]) {
            textarea.value = this.templates[tplKey];
            textarea.focus();
        }
    },

    submitReply() {
        if (!this.activeReplyId) return;
        const textarea = document.getElementById('crm-modal-reply-text');
        const replyText = textarea ? textarea.value.trim() : '';

        if (!replyText) {
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast("Please enter a reply message before submitting.", "warning");
            }
            return;
        }

        const autoResolve = document.getElementById('crm-modal-auto-resolve')?.checked ?? true;
        const operatorName = (typeof AuthModule !== 'undefined' && AuthModule.currentUser && AuthModule.currentUser.full_name) 
            ? AuthModule.currentUser.full_name 
            : "Hirna Customer Relations";

        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

        SupabaseBridge.update('feedback', this.activeReplyId, {
            operator_reply: replyText,
            replied_by: operatorName,
            replied_at: nowStr,
            status: autoResolve ? 'Resolved' : 'Responded'
        });

        SupabaseBridge.logAudit("Customer Relations", "REVIEW_REPLY_POSTED", this.activeReplyId, operatorName, {
            reply: replyText,
            status: autoResolve ? 'Resolved' : 'Responded'
        });

        this.closeReplyModal();
        this.renderMetrics();
        this.renderFeedback();

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast("Official response published successfully!", "success");
        }
    },

    // 1-Click Support Ticket Escalation
    escalateToTicket(id) {
        const feedbackList = SupabaseBridge.getData('feedback') || [];
        const f = feedbackList.find(item => item.id === id);
        if (!f) return;

        const ticketCode = `TCK-2026-${Date.now().toString().slice(-4)}`;
        const passengerName = f.passenger || f.passenger_name || 'Passenger';
        const priority = (parseInt(f.rating) <= 2 || f.sentiment === 'Critical' || f.sentiment === 'Negative') ? 'High' : 'Medium';

        const newTicket = {
            id: ticketCode,
            ticket_code: ticketCode,
            user: passengerName,
            subject: `Review Escalation: ${f.category || 'Quality Dispute'} (${f.rating}★)`,
            category: f.category || 'Service Quality',
            priority: priority,
            status: 'In Progress',
            date: new Date().toISOString().substring(0, 10),
            description: `Auto-escalated from Customer Review [${f.id}] (Booking: ${f.booking_code || 'N/A'}). Comment: "${f.comment}"`
        };

        SupabaseBridge.insert('support_tickets', newTicket);

        SupabaseBridge.update('feedback', id, {
            escalated_ticket_id: ticketCode,
            status: 'Under Investigation'
        });

        SupabaseBridge.logAudit("CRM Support Desk", "REVIEW_ESCALATED_TO_TICKET", ticketCode, "CRM_Lead", {
            review_id: f.id,
            passenger: passengerName,
            rating: f.rating,
            ticket_id: ticketCode
        });

        this.renderTickets();
        this.renderMetrics();
        this.renderFeedback();

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`Review escalated to Support Ticket Desk as ${ticketCode}!`, "success");
        }

        // Scroll to Support Ticket Desk
        const desk = document.getElementById('crm-tickets-tbody');
        if (desk) {
            desk.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    // 1-Click Goodwill Compensation (Credit + Points)
    issueCompensation(id) {
        const feedbackList = SupabaseBridge.getData('feedback') || [];
        const f = feedbackList.find(item => item.id === id);
        if (!f) return;

        const passengerName = f.passenger || f.passenger_name || 'Passenger';
        const users = SupabaseBridge.getData('users') || [];
        const userObj = users.find(u => u.full_name && u.full_name.toLowerCase() === passengerName.toLowerCase()) || users[0];

        if (userObj) {
            const currentPoints = parseInt(userObj.loyalty_points) || 0;
            const updatedPoints = currentPoints + 50;
            SupabaseBridge.update('users', userObj.id, { loyalty_points: updatedPoints });
        }

        SupabaseBridge.update('feedback', id, {
            compensation: '₱50 Goodwill Voucher & +50 Points',
            status: 'Resolved'
        });

        SupabaseBridge.logAudit("Customer Relations", "GOODWILL_VOUCHER_ISSUED", f.id, "CRM_Supervisor", {
            passenger: passengerName,
            voucher_amount: 50.00,
            loyalty_points_credited: 50
        });

        this.renderProfiles();
        this.renderMetrics();
        this.renderFeedback();

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`₱50 Goodwill Voucher & 50 Loyalty Points credited to ${passengerName}!`, "success");
        }
    },

    // 1-Click Driver Coaching & Safety Flag
    flagDriver(id) {
        const feedbackList = SupabaseBridge.getData('feedback') || [];
        const f = feedbackList.find(item => item.id === id);
        if (!f) return;

        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

        SupabaseBridge.update('feedback', id, {
            driver_flagged: true,
            driver_flagged_at: nowStr,
            status: 'Under Investigation'
        });

        SupabaseBridge.logAudit("Fleet Operations", "DRIVER_SAFETY_COACHING_FLAGGED", f.id, "Safety_Compliance", {
            review_id: f.id,
            booking_code: f.booking_code,
            category: f.category,
            comment: f.comment
        });

        this.renderMetrics();
        this.renderFeedback();

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast("Driver flagged for Safety Coaching & SOP Retraining Review.", "warning");
        }
    },

    highlightText(text, query, shouldHighlight) {
        if (!text) return '';
        if (!shouldHighlight || !query) return this.escapeHtml(String(text));
        try {
            const safeText = String(text);
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escaped})`, 'gi');
            return safeText.replace(regex, '<mark class="bg-amber-200 text-slate-900 px-0.5 rounded font-bold">$1</mark>');
        } catch (e) {
            return this.escapeHtml(String(text));
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    renderTickets() {
        const tbody = document.getElementById('crm-tickets-tbody');
        if (!tbody) return;

        const isSuperAdmin = typeof AuthModule !== 'undefined' && AuthModule.isSuperAdmin();
        const tickets = SupabaseBridge.getData('support_tickets') || [];
        tbody.innerHTML = tickets.map(t => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="px-4 py-3 font-mono text-xs font-bold text-blue-600">${t.id}</td>
                <td class="px-4 py-3 text-xs font-semibold text-slate-800">${t.user}</td>
                <td class="px-4 py-3 text-xs text-slate-600">${t.subject}</td>
                <td class="px-4 py-3 text-xs">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}">
                        ${t.priority}
                    </span>
                </td>
                <td class="px-4 py-3 text-xs font-medium ${t.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'}">
                    ● ${t.status}
                </td>
                ${isSuperAdmin ? `
                    <td class="px-4 py-3 text-right">
                        <button onclick="CRMModule.archiveTicket('${t.id}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-bold cursor-pointer inline-flex items-center space-x-1" title="Archive Ticket">
                            <svg class="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                            <span>Archive</span>
                        </button>
                    </td>
                ` : ''}
            </tr>
        `).join('');
    },

    archiveTicket(id) {
        if (typeof AuthModule !== 'undefined' && !AuthModule.canDeleteRecords()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can archive ticket records.", "error");
            return;
        }
        if (confirm(`SuperAdmin Action: Are you sure you want to archive support ticket ${id}? It will be moved to Compliance Archives.`)) {
            SupabaseBridge.archive('support_tickets', id, 'Archived from CRM Support Desk');
            this.renderTickets();
            if (typeof App !== 'undefined') App.showToast(`Support ticket ${id} safely moved to Compliance Archives.`, 'success');
        }
    },

    deleteTicket(id) {
        this.archiveTicket(id);
    },

    archiveFeedback(id) {
        if (typeof AuthModule !== 'undefined' && !AuthModule.canDeleteRecords()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can archive feedback records.", "error");
            return;
        }
        if (confirm(`SuperAdmin Action: Are you sure you want to archive this customer feedback record? It will be moved to Compliance Archives.`)) {
            SupabaseBridge.archive('feedback', id, 'Archived from Customer Feedback');
            this.renderFeedback();
            this.renderMetrics();
            if (typeof App !== 'undefined') App.showToast(`Feedback record safely moved to Compliance Archives.`, 'success');
        }
    },

    deleteFeedback(id) {
        this.archiveFeedback(id);
    },

    bindEvents() {
        // Star rating filter buttons
        document.querySelectorAll('.crm-star-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const star = e.currentTarget.getAttribute('data-star-filter');
                this.setStarFilter(star);
            });
        });

        // Lifecycle Status filter dropdown
        const statusFilter = document.getElementById('crm-status-filter');
        statusFilter?.addEventListener('change', (e) => {
            this.setStatusFilter(e.target.value);
        });

        // Date sorting dropdown
        const dateSort = document.getElementById('crm-date-sort');
        dateSort?.addEventListener('change', (e) => {
            this.setDateSort(e.target.value);
        });

        // Search choice dropdown
        const searchChoice = document.getElementById('crm-search-choice');
        searchChoice?.addEventListener('change', (e) => {
            this.setSearchChoice(e.target.value);
        });

        // Search query input & clear button
        const searchInput = document.getElementById('crm-search-input');
        const clearBtn = document.getElementById('crm-search-clear');

        searchInput?.addEventListener('input', (e) => {
            this.filters.searchQuery = e.target.value;
            if (clearBtn) {
                if (e.target.value.trim()) {
                    clearBtn.classList.remove('hidden');
                } else {
                    clearBtn.classList.add('hidden');
                }
            }
            this.renderFeedback();
        });

        clearBtn?.addEventListener('click', () => {
            this.clearSearch();
        });

        // Reset button
        document.getElementById('crm-reset-filters-btn')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Live NLP Preview input
        const textInput = document.getElementById('nlp-feedback-input');
        const previewBox = document.getElementById('nlp-preview-box');

        textInput?.addEventListener('input', (e) => {
            const text = e.target.value;
            if (!text.trim()) {
                if (previewBox) previewBox.classList.add('hidden');
                return;
            }

            const analysis = AIEngines.SentimentNLP.analyzeFeedback(text);
            if (previewBox) {
                previewBox.classList.remove('hidden');
                const sBadge = document.getElementById('nlp-sentiment-badge');
                const cBadge = document.getElementById('nlp-category-badge');
                const pBadge = document.getElementById('nlp-priority-badge');
                if (sBadge) sBadge.innerText = `Sentiment: ${analysis.sentiment} (Score: ${(analysis.score >= 0 ? '+' : '') + analysis.score})`;
                if (cBadge) cBadge.innerText = `Category: ${analysis.category}`;
                if (pBadge) pBadge.innerText = `Priority: ${analysis.priority}`;
            }
        });

        // Submit feedback button
        document.getElementById('btn-submit-feedback')?.addEventListener('click', () => {
            const text = textInput ? textInput.value : '';
            if (!text || !text.trim()) {
                if (typeof App !== 'undefined' && App.showToast) {
                    App.showToast("Please enter feedback comments before submitting.", "warning");
                }
                return;
            }

            const rating = parseInt(document.getElementById('feedback-rating')?.value || 5);
            const analysis = AIEngines.SentimentNLP.analyzeFeedback(text);

            const uniqueCode = (typeof BookingModule !== 'undefined' && BookingModule.currentBooking && BookingModule.currentBooking.booking_code) 
                ? BookingModule.currentBooking.booking_code 
                : `HIRNA-REV-${Date.now().toString().slice(-6)}`;

            const reviewerName = this.getReviewerName();
            const newFb = {
                id: `fb-${Date.now()}`,
                booking_code: uniqueCode,
                passenger: reviewerName,
                passenger_name: reviewerName,
                rating: rating,
                comment: text.trim(),
                sentiment: analysis.sentiment,
                score: analysis.score,
                category: analysis.category,
                date: new Date().toISOString().substring(0, 10),
                created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                status: 'Pending Review',
                is_archived: false
            };

            SupabaseBridge.insert('feedback', newFb);
            if (textInput) textInput.value = '';
            if (previewBox) previewBox.classList.add('hidden');
            this.updateReviewerDisplay();
            this.renderMetrics();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast("Review analyzed by NLP AI and saved!", "success");
            }
            this.renderFeedback();
        });
    }
};

// Live database sync listener for CRM
window.addEventListener('hirna:db_updated', (e) => {
    if (typeof CRMModule !== 'undefined') {
        if (!e.detail || !e.detail.table || e.detail.table === 'support_tickets' || e.detail.table === 'feedback' || e.detail.table === 'users') {
            if (CRMModule.renderProfiles) CRMModule.renderProfiles();
            if (CRMModule.renderMetrics) CRMModule.renderMetrics();
            if (CRMModule.renderTickets) CRMModule.renderTickets();
            if (CRMModule.renderFeedback) CRMModule.renderFeedback();
        }
    }
});
