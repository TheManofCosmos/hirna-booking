/**
 * Module 3: Customer-Relationship Management (CRM) & NLP Sentiment Controller
 */
const CRMModule = {
    filters: {
        stars: 'all',          // 'all', '5', '4', '3', '2', '1'
        sortDate: 'desc',       // 'desc' (newest to oldest) or 'asc' (oldest to newest)
        searchChoice: 'all',   // 'all', 'name', 'date', 'words', 'classification'
        searchQuery: ''        // free-text search string
    },

    init() {
        this.renderProfiles();
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
                        ★ ${u.loyalty_tier} Tier
                    </span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 rounded-lg">
                    <div><span class="text-slate-400 block text-[10px]">Points</span><b class="text-slate-800 font-bold">${u.loyalty_points}</b></div>
                    <div><span class="text-slate-400 block text-[10px]">Trips</span><b class="text-slate-800 font-bold">${u.total_trips}</b></div>
                    <div><span class="text-slate-400 block text-[10px]">Rating</span><b class="text-slate-800 font-bold">${u.rating} ★</b></div>
                </div>
            </div>
        `).join('');
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

        // 2. Choice-based Search Filter
        const query = (this.filters.searchQuery || '').trim().toLowerCase();
        if (query) {
            filtered = filtered.filter(f => {
                const passenger = (f.passenger || '').toLowerCase();
                const date = (f.date || '').toLowerCase();
                const comment = (f.comment || '').toLowerCase();
                const category = (f.category || '').toLowerCase();
                const sentiment = (f.sentiment || '').toLowerCase();

                switch (this.filters.searchChoice) {
                    case 'name':
                        return passenger.includes(query);
                    case 'date':
                        return date.includes(query);
                    case 'words':
                        return comment.includes(query);
                    case 'classification':
                        return category.includes(query) || sentiment.includes(query);
                    case 'all':
                    default:
                        return passenger.includes(query) ||
                               date.includes(query) ||
                               comment.includes(query) ||
                               category.includes(query) ||
                               sentiment.includes(query);
                }
            });
        }

        // 3. Date Sort (Newest to Oldest vs. Oldest to Newest)
        filtered.sort((a, b) => {
            const timeA = new Date(a.date || '1970-01-01').getTime();
            const timeB = new Date(b.date || '1970-01-01').getTime();
            if (this.filters.sortDate === 'asc') {
                return timeA - timeB; // Oldest to Newest
            } else {
                return timeB - timeA; // Newest to Oldest
            }
        });

        // 4. Update Summary / Counter Badge
        const countBadge = document.getElementById('crm-feedback-count-badge');
        if (countBadge) {
            if (filtered.length === allFeedback.length) {
                countBadge.innerHTML = `Showing all <b>${allFeedback.length}</b> reviews`;
            } else {
                countBadge.innerHTML = `Showing <b>${filtered.length}</b> of <b>${allFeedback.length}</b> reviews`;
            }
        }

        // 5. Update Active Filter Indicators
        this.renderActiveFilterTags(allFeedback.length, filtered.length);

        // 6. Handle Empty State
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <div class="text-3xl">🔍</div>
                    <h5 class="text-xs font-bold text-slate-800">No Customer Reviews Found</h5>
                    <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
                        No reviews match your current filters 
                        (${this.filters.stars !== 'all' ? `Star: <b>${this.filters.stars} ★</b>, ` : ''}
                         Choice: <b>${this.filters.searchChoice}</b>, 
                         Query: <b>"${this.escapeHtml(this.filters.searchQuery)}"</b>).
                    </p>
                    <button type="button" onclick="CRMModule.resetFilters()" class="inline-flex items-center px-3 py-1.5 bg-hirna-700 text-white rounded-lg text-xs font-bold hover:bg-hirna-800 transition shadow-sm mt-1">
                        ↺ Reset All Filters
                    </button>
                </div>
            `;
            return;
        }

        // 7. Render Filtered Feedback Cards
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
            const starsDisplay = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);

            // Highlight matches if search active
            const shouldHighlightWords = query && (this.filters.searchChoice === 'words' || this.filters.searchChoice === 'all');
            const shouldHighlightName = query && (this.filters.searchChoice === 'name' || this.filters.searchChoice === 'all');
            const shouldHighlightDate = query && (this.filters.searchChoice === 'date' || this.filters.searchChoice === 'all');
            const shouldHighlightCategory = query && (this.filters.searchChoice === 'classification' || this.filters.searchChoice === 'all');

            const highlightedComment = this.highlightText(f.comment, query, shouldHighlightWords);
            const highlightedPassenger = this.highlightText(f.passenger, query, shouldHighlightName);
            const highlightedDate = this.highlightText(f.date, query, shouldHighlightDate);
            const highlightedCategory = this.highlightText(f.category, query, shouldHighlightCategory);

            return `
                <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-hirna-300 hover:shadow-md transition text-xs space-y-2">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center space-x-2.5">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-hirna-700 to-hirna-900 text-gold-300 font-bold flex items-center justify-center text-xs shadow-sm">
                                ${(f.passenger || 'P').charAt(0)}
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
                            <div class="text-right">
                                <div class="text-amber-500 font-bold tracking-wider text-xs">${starsDisplay}</div>
                                <div class="text-[10px] text-slate-500 font-semibold">${starCount}.0 / 5.0</div>
                            </div>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}">
                                NLP: ${sentiment} (${(f.score >= 0 ? '+' : '') + f.score})
                            </span>
                        </div>
                    </div>

                    <p class="text-slate-700 italic bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        "${highlightedComment}"
                    </p>

                    <div class="flex flex-wrap items-center justify-between gap-1 pt-1 text-[11px]">
                        <div class="flex items-center space-x-1.5">
                            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200">
                                🏷️ ${highlightedCategory}
                            </span>
                        <div class="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                            <span>Classification: <span class="text-slate-600 font-semibold">${f.category || 'General'}</span></span>
                            ${(typeof AuthModule !== 'undefined' && AuthModule.isSuperAdmin()) ? `
                                <button onclick="CRMModule.deleteFeedback('${f.id}')" class="text-rose-600 hover:text-rose-800 font-sans font-bold underline cursor-pointer ml-2">Delete Record</button>
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
        this.filters.sortDate = 'desc';
        this.filters.searchChoice = 'all';
        this.filters.searchQuery = '';

        const choiceSelect = document.getElementById('crm-search-choice');
        if (choiceSelect) choiceSelect.value = 'all';

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
                    <button type="button" onclick="CRMModule.setStarFilter('all')" class="ml-1 text-gold-700 hover:text-gold-900 font-black">×</button>
                </span>
            `);
        }

        if (this.filters.sortDate === 'asc') {
            tags.push(`
                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold border border-blue-200">
                    📅 Oldest to Newest
                    <button type="button" onclick="CRMModule.setDateSort('desc')" class="ml-1 text-blue-700 hover:text-blue-900 font-black">×</button>
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
                    <button type="button" onclick="CRMModule.clearSearch()" class="ml-1 text-hirna-700 hover:text-hirna-900 font-black">×</button>
                </span>
            `);
        }

        if (tags.length > 0) {
            container.classList.remove('hidden');
            container.innerHTML = `
                <span class="text-slate-500 font-medium">Active filters:</span>
                ${tags.join('')}
                <button type="button" onclick="CRMModule.resetFilters()" class="text-xs text-hirna-700 hover:underline font-semibold ml-2">
                    Reset all
                </button>
            `;
        } else {
            container.classList.add('hidden');
            container.innerHTML = '';
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
                        <button onclick="CRMModule.deleteTicket('${t.id}')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold cursor-pointer">
                            Delete
                        </button>
                    </td>
                ` : ''}
            </tr>
        `).join('');
    },

    deleteTicket(id) {
        if (typeof AuthModule !== 'undefined' && !AuthModule.canDeleteRecords()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can delete ticket records.", "error");
            return;
        }
        if (confirm(`SuperAdmin Action: Are you sure you want to delete support ticket ${id}?`)) {
            SupabaseBridge.delete('support_tickets', id);
            this.renderTickets();
            if (typeof App !== 'undefined') App.showToast(`Support ticket ${id} deleted.`, 'info');
        }
    },

    deleteFeedback(id) {
        if (typeof AuthModule !== 'undefined' && !AuthModule.canDeleteRecords()) {
            if (typeof App !== 'undefined') App.showToast("Permission Denied: Only SuperAdmin can delete feedback records.", "error");
            return;
        }
        if (confirm(`SuperAdmin Action: Are you sure you want to delete this customer feedback record?`)) {
            SupabaseBridge.delete('feedback', id);
            this.renderFeedback();
            if (typeof App !== 'undefined') App.showToast(`Feedback record deleted.`, 'info');
        }
    },

    bindEvents() {
        // Star rating filter buttons
        document.querySelectorAll('.crm-star-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const star = e.currentTarget.getAttribute('data-star-filter');
                this.setStarFilter(star);
            });
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

            const newFb = {
                id: `fb-${Date.now()}`,
                booking_code: "TNVS-2026-LIVE",
                passenger: "Juan Dela Cruz",
                rating: rating,
                comment: text,
                sentiment: analysis.sentiment,
                score: analysis.score,
                category: analysis.category,
                date: new Date().toISOString().substring(0, 10)
            };

            SupabaseBridge.insert('feedback', newFb);
            if (textInput) textInput.value = '';
            if (previewBox) previewBox.classList.add('hidden');
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast("Review analyzed by NLP AI and saved!", "success");
            }
            this.renderFeedback();
        });
    }
};
