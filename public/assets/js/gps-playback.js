/**
 * Module 4: GPS Tracking & Trip Playback Studio
 * Interactive road telemetry replay, recorded trip list management,
 * auto-tracking, real street location HUD, and synchronized trip progress.
 */
const GPSModule = {
    _initialized: false,
    _eventsBound: false,
    map: null,
    carMarker: null,
    pickupMarker: null,
    dropoffMarker: null,
    origDropoffMarker: null,
    routePolyline: null,
    traveledPolyline: null,
    cancelledPolyline: null,
    activeBooking: null,
    isCancelledMidTrip: false,
    waypoints: [],
    cancelledWaypoints: [],
    stepMilestones: [],
    segmentDistances: [],
    cumDistances: [],
    totalDistM: 0,
    totalDurationMin: 22,
    baseDurationMs: 22000, // 22 seconds baseline replay duration at 1x
    startTimeStr: "08:30:00 AM",
    arrivalTimeStr: "08:52:00 AM",
    startDateObj: null,
    currentProgress: 0, // 0.0 to 1.0
    currentDistM: 0,
    isPlaying: false,
    playbackSpeed: 1,
    animRafId: null,
    lastFrameTime: 0,
    autoTrack: true,
    currentCoords: null,
    // Real-world driving dynamics engine state (synced with booking.js)
    drivingDynamics: {
        finalStops: [],
        signalStops: [],
        connectedIntersections: [],
        roadBends: [],
        trafficCruisingMultiplier: 1.0,
        trafficLabel: "Normal Commute Speed",
        trafficDotClass: "bg-emerald-400",
        trafficModeClass: "text-emerald-400",
        currentVarianceKmh: 0,
        targetVarianceKmh: 0,
        nextVarianceChangeTime: 0,
        currentSpeedFactor: 0.25,
        smoothedSpeedKmh: 38,
        activeStop: null
    },

    init() {
        if (this._initialized) {
            // Already initialized, just ensure trips are rendered
            this.renderRecordedTrips();
            return;
        }
        this._initialized = true;

        this.bindEvents();
        this.renderRecordedTrips();

        // Check URL parameters for direct trip deep-link
        const urlParams = new URLSearchParams(window.location.search);
        const tripParam = urlParams.get('trip') || urlParams.get('id') || urlParams.get('booking');

        if (tripParam) {
            this.viewTrip(tripParam);
        }
    },

    bindEvents() {
        if (this._eventsBound) return;
        this._eventsBound = true;

        // Scrubber range input (live dragging)
        const scrubber = document.getElementById('playback-scrubber');
        if (scrubber) {
            scrubber.addEventListener('input', (e) => {
                const pct = parseFloat(e.target.value);
                this.seekToProgress(pct / 100);
            });
        }

        // Replay speed buttons
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.speed-btn').forEach(b => {
                    b.classList.remove('bg-gold-500', 'text-hirna-950', 'font-bold');
                    b.classList.add('bg-hirna-800', 'text-white');
                });
                const clickedBtn = e.currentTarget;
                clickedBtn.classList.remove('bg-hirna-800', 'text-white');
                clickedBtn.classList.add('bg-gold-500', 'text-hirna-950', 'font-bold');
                this.playbackSpeed = parseFloat(clickedBtn.dataset.speed) || 1;
            });
        });

        // Listen for storage events in case bookings or payments are added in other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'hirna_db_bookings' || e.key === 'hirna_db_payments') {
                this.renderRecordedTrips();
            }
        });

        // Listen for custom database update events (central server or local)
        window.addEventListener('hirna:db_updated', (e) => {
            if (!e.detail || !e.detail.table || e.detail.table === 'bookings' || e.detail.table === 'payments') {
                this.renderRecordedTrips();
            }
        });
    },

    initMap() {
        const container = document.getElementById('gps-playback-map');
        if (!container) return;

        if (this.map) {
            this.map.invalidateSize();
            return;
        }

        this.map = L.map('gps-playback-map', {
            zoomControl: true
        }).setView([14.5635, 121.0310], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Turn off auto-tracking when the user manually drags or pans the map
        this.map.on('dragstart', () => {
            this.disableAutoTrack();
        });
    },

    toggleAutoTrack() {
        this.autoTrack = !this.autoTrack;
        this.updateTrackButtonUI(this.autoTrack);
        if (this.autoTrack && this.map && this.currentCoords) {
            this.map.panTo(this.currentCoords, { animate: true });
        }
    },

    enableAutoTrack() {
        this.autoTrack = true;
        this.updateTrackButtonUI(true);
        if (this.map && this.currentCoords) {
            this.map.panTo(this.currentCoords, { animate: true });
        }
    },

    disableAutoTrack() {
        if (!this.autoTrack) return;
        this.autoTrack = false;
        this.updateTrackButtonUI(false);
    },

    updateTrackButtonUI(isActive) {
        const btn = document.getElementById('btn-track-location');
        const pulse = document.getElementById('hud-track-pulse');
        const label = document.getElementById('hud-track-label');
        if (!btn) return;
        if (isActive) {
            btn.className = "px-2.5 sm:px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95";
            if (pulse) pulse.className = "w-2 h-2 rounded-full bg-emerald-400 animate-ping";
            if (label) label.innerText = "Auto-Tracking: On";
        } else {
            btn.className = "px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95";
            if (pulse) pulse.className = "w-2 h-2 rounded-full bg-slate-500";
            if (label) label.innerText = "Auto-Tracking: Off";
        }
    },

    getAllBookings() {
        let bookings = [];
        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData) {
            bookings = [...SupabaseBridge.getData('bookings')];
        }

        // Also merge local storage bookings if any
        try {
            const stored = localStorage.getItem('hirna_db_bookings');
            if (stored) {
                const localList = JSON.parse(stored);
                if (Array.isArray(localList)) {
                    localList.forEach(lb => {
                        const exists = bookings.some(b => b.id === lb.id || (b.booking_code && b.booking_code === lb.booking_code));
                        if (!exists) {
                            bookings.unshift(lb);
                        }
                    });
                }
            }
        } catch (e) {}

        // Exclude all template records, dummy seed data, and archived bookings
        const TEMPLATE_CODES_AND_IDS = [
            'TNVS-2026-0091', 'TNVS-2026-0092', 'HIRNA-PCL-892104', 'HIRNA-ARC-99120',
            'c0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002',
            'c0000001-0000-0000-0000-000000000003', 'b-archived-01', 'test-bk-999'
        ];

        bookings = bookings.filter(b => {
            if (!b) return false;
            if (b.is_archived) return false;
            if (TEMPLATE_CODES_AND_IDS.includes(b.booking_code) || TEMPLATE_CODES_AND_IDS.includes(b.id)) return false;
            return true;
        });

        // Also integrate payments table records so any paid live trip/receipt is immediately visible in GPS Playback
        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData) {
            const payments = SupabaseBridge.getData('payments') || [];
            payments.forEach(p => {
                const code = p.booking_code || p.invoice_no;
                if (!code) return;
                if (TEMPLATE_CODES_AND_IDS.includes(code) || TEMPLATE_CODES_AND_IDS.includes(p.booking_id) || TEMPLATE_CODES_AND_IDS.includes(p.id)) return;
                if (p.is_archived) return;
                const existingIdx = bookings.findIndex(b => (b.booking_code && b.booking_code === code) || b.id === p.booking_id || b.id === p.id);
                if (existingIdx !== -1) {
                    const eb = bookings[existingIdx];
                    if (p.is_cancelled_mid_trip || p.status === 'completed_early' || (p.cancellation_note && p.cancellation_note.includes('mid-trip'))) {
                        eb.is_cancelled_mid_trip = true;
                        eb.cancelled_mid_trip = true;
                        eb.status = 'completed_early';
                        if (p.cancellation_coords && !eb.cancellation_coords) eb.cancellation_coords = p.cancellation_coords;
                        if (p.actual_dropoff_coords && !eb.actual_dropoff_coords) eb.actual_dropoff_coords = p.actual_dropoff_coords;
                        if (p.cancellation_street && !eb.cancellation_street) eb.cancellation_street = p.cancellation_street;
                        if (p.cancellation_progress && !eb.cancellation_progress) eb.cancellation_progress = p.cancellation_progress;
                        if (p.traveled_waypoints && !eb.traveled_waypoints) eb.traveled_waypoints = p.traveled_waypoints;
                        if (p.all_waypoints && !eb.all_waypoints) eb.all_waypoints = p.all_waypoints;
                        if (p.traffic_telemetry && !eb.traffic_telemetry) eb.traffic_telemetry = p.traffic_telemetry;
                        if (p.cancellation_note && !eb.cancellation_note) eb.cancellation_note = p.cancellation_note;
                    }
                } else {
                    const isCancelled = p.status === 'completed_early' || !!p.is_cancelled_mid_trip || !!p.cancelled_mid_trip || (p.cancellation_note && p.cancellation_note.includes('mid-trip'));
                    bookings.push({
                        id: p.booking_id || p.id || `b-${p.invoice_no}`,
                        booking_code: code,
                        user_email: p.user_email || '',
                        user_id: p.user_id || '',
                        service_type: p.service_type || 'standard',
                        passenger_name: p.passenger_name || 'Passenger',
                        passenger_phone: p.passenger_phone || '+63 917 123 4567',
                        driver_name: p.driver_name || 'Ricardo Dalisay',
                        vehicle_plate: p.vehicle_plate || 'TXI-5431',
                        vehicle_model: p.vehicle_model || 'Toyota Vios',
                        pickup: p.pickup || 'Metro Manila Hub',
                        dropoff: p.dropoff || 'Bonifacio Global City, Taguig',
                        total_fare: p.total_fare || p.amount || 150,
                        payment_method: p.payment_method || 'GCash',
                        payment_status: 'completed',
                        status: p.status || (isCancelled ? 'completed_early' : 'completed'),
                        is_cancelled_mid_trip: isCancelled,
                        cancelled_mid_trip: isCancelled,
                        cancellation_coords: p.cancellation_coords || null,
                        actual_dropoff_coords: p.actual_dropoff_coords || null,
                        cancellation_street: p.cancellation_street || null,
                        cancellation_progress: p.cancellation_progress || null,
                        traveled_waypoints: p.traveled_waypoints || null,
                        all_waypoints: p.all_waypoints || null,
                        traffic_telemetry: p.traffic_telemetry || null,
                        cancellation_note: p.cancellation_note || null,
                        created_at: p.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
                        duration_min: p.duration_min || (isCancelled ? 12 : 22),
                        distance_km: p.distance_km || (isCancelled ? 3.4 : 6.8)
                    });
                }
            });
        }

        return bookings;
    },

    renderRecordedTrips() {
        const tbody = document.getElementById('recorded-trips-tbody');
        if (!tbody) return;

        let bookings = this.getAllBookings();

        const currentUser = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
        const isPassenger = (typeof AuthModule !== 'undefined' && AuthModule.isPassenger && AuthModule.isPassenger()) ||
                            (currentUser && (currentUser.role === 'passenger' || currentUser.role === 'customer')) ||
                            window.location.pathname.includes('passenger.html');

        if (isPassenger && currentUser) {
            bookings = bookings.filter(b => {
                if (typeof BookingModule !== 'undefined' && typeof BookingModule.isTripOwnedByUser === 'function') {
                    return BookingModule.isTripOwnedByUser(b, currentUser);
                }
                const uEmail = (currentUser.email || '').trim().toLowerCase();
                const uPhone = (currentUser.phone || '').replace(/\D/g, '');
                const uName = (currentUser.name || '').trim().toLowerCase();
                if (b.user_email && uEmail && b.user_email.trim().toLowerCase() === uEmail) return true;
                if (b.user_id && currentUser.id && b.user_id === currentUser.id) return true;
                try {
                    const myCodes = JSON.parse(localStorage.getItem('hirna_my_booking_codes') || '[]');
                    const code = b.booking_code || b.id;
                    if (code && myCodes.includes(code)) return true;
                } catch(e) {}
                const bPhone = (b.passenger_phone || b.sender_phone || '').replace(/\D/g, '');
                if (bPhone && uPhone && (bPhone.endsWith(uPhone) || uPhone.endsWith(bPhone))) return true;
                const bName = (b.passenger_name || b.sender_name || '').trim().toLowerCase();
                if (bName && uName && (bName.includes(uName) || uName.includes(bName))) return true;
                return false;
            });
        }

        const countBadge = document.getElementById('trip-count-badge');
        if (countBadge) {
            countBadge.innerText = `${bookings.length} ${bookings.length === 1 ? 'Trip' : 'Trips'} Recorded`;
        }

        if (bookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                        ${isPassenger ? 'No recorded trips found for your account. Book a ride or delivery to view its GPS telemetry here.' : 'No recorded trips found. Create a booking in Module 1 to see its GPS telemetry here.'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = bookings.map(b => {
            const isParcel = b.service_type === 'parcel';
            const isFood = b.service_type === 'food';
            const isPremium = b.service_type === 'premium';
            
            let serviceBadge = '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">RIDE</span>';
            if (isParcel) {
                serviceBadge = '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">PARCEL</span>';
            } else if (isFood) {
                serviceBadge = '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">FOOD</span>';
            } else if (isPremium) {
                serviceBadge = '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">PREMIUM</span>';
            }

            const bookerName = b.sender_name || b.passenger_name || 'Passenger';
            const bookerPhone = b.sender_phone || b.passenger_phone || '+63 917 123 4567';
            const driver = b.driver_name || 'Ricardo Dalisay';
            const vehicle = b.vehicle_model || 'Toyota Vios';
            const plate = b.vehicle_plate || 'TXI-5431';
            const duration = b.duration_min ? `${b.duration_min} mins` : '20 mins';
            const dist = b.distance_km ? `${parseFloat(b.distance_km).toFixed(1)} km` : '5.5 km';
            const isCancelledMidTrip = b.status === 'completed_early' || !!b.is_cancelled_mid_trip || !!b.cancelled_mid_trip || (b.cancellation_note && b.cancellation_note.includes('mid-trip'));
            const isCompleted = (b.status || '').toLowerCase() === 'completed';

            let statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">● ${(b.status || 'COMPLETED').toUpperCase()}</span>`;
            if (isCancelledMidTrip) {
                statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">● CANCELLED MID-TRIP</span>`;
            }

            const dropoffDisplay = isCancelledMidTrip
                ? `<div class="text-xs text-amber-800 font-semibold truncate mt-0.5" title="Cancelled Mid-Trip at: ${b.cancellation_street || 'Ended Mid-Trip'}">
                    <span class="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1"></span>${b.cancellation_street || 'Ended Mid-Trip'} <span class="text-[10px] text-slate-400 line-through">(${b.dropoff})</span>
                   </div>`
                : `<div class="text-xs text-slate-500 truncate mt-0.5" title="${b.dropoff}">
                    <span class="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1"></span>${b.dropoff}
                   </div>`;

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="px-4 py-3.5">
                        <div class="font-mono font-bold text-hirna-800 text-xs">${b.booking_code}</div>
                        <div class="mt-0.5">${serviceBadge}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${b.created_at || 'Recently Recorded'}</div>
                    </td>
                    <td class="px-4 py-3.5">
                        <div class="font-bold text-slate-900">${bookerName}</div>
                        <div class="text-[11px] text-slate-500 font-mono">${bookerPhone}</div>
                        ${isParcel && b.recipient_name ? `<div class="text-[10px] text-amber-700 font-medium mt-0.5">To: ${b.recipient_name} (${b.recipient_phone || ''})</div>` : ''}
                    </td>
                    <td class="px-4 py-3.5 max-w-xs">
                        <div class="text-xs text-slate-800 font-medium truncate" title="${b.pickup}">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>${b.pickup}
                        </div>
                        ${dropoffDisplay}
                    </td>
                    <td class="px-4 py-3.5">
                        <div class="font-semibold text-slate-800">${driver}</div>
                        <div class="text-[11px] text-slate-500 font-mono">${vehicle} • ${plate}</div>
                    </td>
                    <td class="px-4 py-3.5">
                        <div class="font-bold text-slate-900 font-mono">${duration}</div>
                        <div class="text-[11px] text-slate-500 font-mono">${dist}</div>
                    </td>
                    <td class="px-4 py-3.5">
                        ${statusBadge}
                    </td>
                    <td class="px-4 py-3.5 text-right whitespace-nowrap">
                        <button type="button" onclick="GPSModule.viewTrip('${b.id || b.booking_code}')" class="px-3.5 py-1.5 bg-hirna-700 hover:bg-hirna-800 active:scale-95 text-white font-bold rounded-xl shadow-sm transition inline-flex items-center space-x-1.5 cursor-pointer">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            <span>View</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    viewTrip(bookingIdOrCode) {
        const bookings = this.getAllBookings();
        const booking = bookings.find(b => b.id === bookingIdOrCode || b.booking_code === bookingIdOrCode) || bookings[0];

        if (!booking) return;

        // Switch View visibility: hide list, show playback studio
        const listView = document.getElementById('recorded-trips-view');
        const playbackView = document.getElementById('gps-playback-view');
        if (listView) listView.classList.add('hidden');
        if (playbackView) playbackView.classList.remove('hidden');

        // Scroll to top of playback view smoothly
        playbackView?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        this.initMap();
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 80);

        this.loadTripPlayback(booking);
    },

    backToTripList() {
        this.pause();

        const listView = document.getElementById('recorded-trips-view');
        const playbackView = document.getElementById('gps-playback-view');
        if (playbackView) playbackView.classList.add('hidden');
        if (listView) listView.classList.remove('hidden');

        this.renderRecordedTrips();
    },

    normalizeCoords(c, fallback = [14.5583, 121.0189]) {
        if (!c) return fallback;
        if (Array.isArray(c) && c.length >= 2) {
            const lat = parseFloat(c[0]);
            const lng = parseFloat(c[1]);
            if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
        }
        if (typeof c === 'object') {
            const lat = parseFloat(c.lat ?? c.latitude);
            const lng = parseFloat(c.lng ?? c.lon ?? c.longitude);
            if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
        }
        return fallback;
    },

    computeDistanceMeters(p1, p2) {
        const lat1 = p1[0] * Math.PI / 180;
        const lat2 = p2[0] * Math.PI / 180;
        const dLat = (p2[0] - p1[0]) * Math.PI / 180;
        const dLng = (p2[1] - p1[1]) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(6371000 * c);
    },

    async fetchRouteWaypointsAndSteps(pickup, dropoff, bookingId) {
        // 1. Check if database already has real road telemetry points (>= 20 points)
        const db = typeof SupabaseBridge !== 'undefined' ? SupabaseBridge.db : null;
        if (db && db.telemetry_routes && db.telemetry_routes[bookingId] && db.telemetry_routes[bookingId].length >= 20) {
            const pts = db.telemetry_routes[bookingId].map(p => [p.lat, p.lng]);
            return {
                waypoints: pts,
                steps: this.buildDefaultMilestones(bookingId, pickup, dropoff)
            };
        }

        // 2. Fetch from routing service
        const startLng = pickup[1];
        const startLat = pickup[0];
        const endLng = dropoff[1];
        const endLat = dropoff[0];

        const apiBase = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getApiBase) ? SupabaseBridge.getApiBase() : '';
        const endpoints = [
            `${apiBase}/api/route?start=${startLat},${startLng}&end=${endLat},${endLng}&steps=true`,
            `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`
        ];

        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500);
                const resp = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (resp.ok) {
                    const data = await resp.json();
                    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        const geoCoords = route.geometry.coordinates; // [lng, lat]
                        const waypoints = geoCoords.map(c => [c[1], c[0]]);

                        // Extract street milestones
                        const steps = route.legs && route.legs[0] && route.legs[0].steps;
                        let runningDist = 0;
                        const milestones = (steps || []).map(s => {
                            const d = s.distance || 0;
                            const m = {
                                name: (s.name && s.name.trim()) ? s.name.trim() : null,
                                startDist: runningDist,
                                endDist: runningDist + d,
                                maneuver: s.maneuver || null,
                                intersections: Array.isArray(s.intersections) ? s.intersections : null
                            };
                            runningDist += d;
                            return m;
                        });

                        const congestion = [];
                        for (const lg of (route.legs || [])) {
                            const c = lg.annotation && lg.annotation.congestion;
                            if (Array.isArray(c)) congestion.push(...c);
                        }

                        return { waypoints, steps: milestones, congestion };
                    }
                }
            } catch (e) {}
        }

        // 3. Fallback: check database again or generate realistic road curve
        if (db && db.telemetry_routes && db.telemetry_routes[bookingId] && db.telemetry_routes[bookingId].length > 0) {
            const pts = db.telemetry_routes[bookingId].map(p => [p.lat, p.lng]);
            return {
                waypoints: pts,
                steps: this.buildDefaultMilestones(bookingId, pickup, dropoff)
            };
        }

        return {
            waypoints: this.generateSyntheticRoadWaypoints(pickup, dropoff),
            steps: this.buildDefaultMilestones(bookingId, pickup, dropoff)
        };
    },

    buildDefaultMilestones(bookingId, pickup, dropoff) {
        if (bookingId === 'c0000001-0000-0000-0000-000000000001') {
            return [
                { name: 'West Gala Drive, Circuit Makati', startDist: 0, endDist: 200 },
                { name: 'A. P. Reyes Avenue', startDist: 200, endDist: 600 },
                { name: 'Chino Roces Avenue', startDist: 600, endDist: 800 },
                { name: 'Kalayaan Avenue', startDist: 800, endDist: 1800 },
                { name: 'Nicanor T. Garcia Street', startDist: 1800, endDist: 2300 },
                { name: 'Senator Gil J. Puyat Avenue (Buendia)', startDist: 2300, endDist: 3700 },
                { name: 'Kalayaan Overpass / BGC Entry', startDist: 3700, endDist: 5300 },
                { name: '32nd Street, Bonifacio Global City', startDist: 5300, endDist: 6150 },
                { name: 'Lane D, Bonifacio High Street', startDist: 6150, endDist: 6600 }
            ];
        }
        return [];
    },

    generateSyntheticRoadWaypoints(p1, p2) {
        const waypoints = [p1];
        const latDiff = p2[0] - p1[0];
        const lngDiff = p2[1] - p1[1];
        const steps = 40;
        for (let i = 1; i < steps; i++) {
            const fraction = i / steps;
            const midJitter = Math.sin(fraction * Math.PI * 3) * 0.0015;
            waypoints.push([
                p1[0] + latDiff * fraction + midJitter,
                p1[1] + lngDiff * fraction + midJitter * 0.5
            ]);
        }
        waypoints.push(p2);
        return waypoints;
    },

    async loadTripPlayback(booking) {
        if (!this.map) this.initMap();
        this.pause();

        this.activeBooking = booking;

        const isParcel = booking.service_type === 'parcel';
        const bookerName = booking.sender_name || booking.passenger_name || 'Passenger';
        const bookerPhone = booking.sender_phone || booking.passenger_phone || '+63 917 123 4567';

        // Detect if this trip was completed early due to mid-trip cancellation
        const isCancelledMidTrip = booking.status === 'completed_early' ||
            !!booking.is_cancelled_mid_trip ||
            !!booking.cancelled_mid_trip ||
            (booking.cancellation_note && booking.cancellation_note.toLowerCase().includes('mid-trip')) ||
            (booking.cancellation_street && booking.cancellation_street.length > 0 && booking.cancellation_street !== booking.dropoff);
        this.isCancelledMidTrip = isCancelledMidTrip;

        // 1. Update Title and Badges
        const titleEl = document.getElementById('playback-trip-title');
        const subTitleEl = document.getElementById('playback-route-subtitle');
        const badgeEl = document.getElementById('playback-booking-badge');
        const cancelNotice = document.getElementById('hud-cancelled-notice');
        const cancelNoticeText = document.getElementById('hud-cancelled-notice-text');

        if (titleEl) {
            titleEl.innerText = isCancelledMidTrip
                ? `${booking.pickup} → ${booking.cancellation_street || 'Ended Mid-Trip'}`
                : `${booking.pickup} → ${booking.dropoff}`;
        }
        if (subTitleEl) {
            subTitleEl.innerText = isCancelledMidTrip
                ? `Replaying ${isParcel ? 'Parcel Delivery' : 'Ride'} (Ended Mid-Trip): ${booking.booking_code} • Duration: ${booking.duration_min || 12} mins`
                : `Replaying ${isParcel ? 'Parcel Delivery' : 'Ride'}: ${booking.booking_code} • Duration: ${booking.duration_min || 22} mins`;
        }
        if (badgeEl) {
            badgeEl.innerText = isCancelledMidTrip ? `#${booking.booking_code} [MID-TRIP CANCELLED]` : `#${booking.booking_code}`;
            badgeEl.className = isCancelledMidTrip
                ? "px-3 py-1 bg-amber-50 text-amber-800 font-mono text-xs font-bold rounded-xl border border-amber-300 shadow-xs"
                : "px-3 py-1 bg-hirna-50 text-hirna-800 font-mono text-xs font-bold rounded-xl border border-hirna-200 shadow-xs";
        }

        if (cancelNotice) {
            if (isCancelledMidTrip) {
                cancelNotice.classList.remove('hidden');
                if (cancelNoticeText) {
                    cancelNoticeText.innerText = booking.cancellation_note || `Ride ended mid-trip at km ${booking.distance_km || 'prorated'} (${booking.duration_min || 'prorated'} mins) near ${booking.cancellation_street || 'Mid-Trip Point'}`;
                }
            } else {
                cancelNotice.classList.add('hidden');
            }
        }

        // 2. Populate Trip Details HUD
        const codeEl = document.getElementById('detail-booking-code');
        const serviceBadge = document.getElementById('detail-service-type-badge');
        const durationEl = document.getElementById('detail-trip-duration');
        const bookerLabel = document.getElementById('detail-booker-label');
        const bookerNameEl = document.getElementById('detail-booker-name');
        const bookerPhoneEl = document.getElementById('detail-booker-phone');
        const driverNameEl = document.getElementById('detail-driver-name');
        const vehicleInfoEl = document.getElementById('detail-vehicle-info');
        const distEl = document.getElementById('detail-distance');

        if (codeEl) codeEl.innerText = booking.booking_code;
        if (serviceBadge) {
            if (isCancelledMidTrip) {
                serviceBadge.innerText = "CANCELLED MID-TRIP";
                serviceBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase";
            } else {
                serviceBadge.innerText = isParcel ? "PARCEL DELIVERY" : (booking.service_type ? booking.service_type.toUpperCase() : "TRANSPORT");
                serviceBadge.className = isParcel 
                    ? "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase"
                    : "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase";
            }
        }
        if (durationEl) durationEl.innerText = `${booking.duration_min || (isCancelledMidTrip ? 12 : 22)} mins`;
        if (bookerLabel) bookerLabel.innerText = isParcel ? "Booker / Sender:" : "Booker / Passenger:";
        if (bookerNameEl) bookerNameEl.innerText = bookerName;
        if (bookerPhoneEl) bookerPhoneEl.innerText = bookerPhone;
        if (driverNameEl) driverNameEl.innerText = booking.driver_name || 'Ricardo Dalisay';
        if (vehicleInfoEl) vehicleInfoEl.innerText = `${booking.vehicle_model || 'Toyota Vios'} (${booking.vehicle_plate || 'TXI-5431'})`;
        if (distEl) distEl.innerText = `${booking.distance_km || (isCancelledMidTrip ? 3.4 : 5.8)} km`;

        // Recipient details (if parcel)
        const recipientBox = document.getElementById('detail-recipient-box');
        const recNameEl = document.getElementById('detail-recipient-name');
        const recPhoneEl = document.getElementById('detail-recipient-phone');

        if (isParcel && (booking.recipient_name || booking.recipient_phone)) {
            if (recipientBox) recipientBox.classList.remove('hidden');
            if (recNameEl) recNameEl.innerText = booking.recipient_name || 'Recipient';
            if (recPhoneEl) recPhoneEl.innerText = booking.recipient_phone || '+63 917 555 4321';
        } else {
            if (recipientBox) recipientBox.classList.add('hidden');
        }

        // 3. Setup Trip Timers & Arrival Times
        this.totalDurationMin = parseInt(booking.duration_min) || (isCancelledMidTrip ? 12 : 22);
        let baseDate = new Date();
        if (booking.created_at) {
            const parsed = new Date(booking.created_at);
            if (!isNaN(parsed.getTime())) baseDate = parsed;
        }
        this.startDateObj = baseDate;

        const formatTimeAmPm = (d) => {
            let h = d.getHours();
            const m = d.getMinutes().toString().padStart(2, '0');
            const s = d.getSeconds().toString().padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return `${h.toString().padStart(2, '0')}:${m}:${s} ${ampm}`;
        };

        this.startTimeStr = formatTimeAmPm(baseDate);
        const arrivalDate = new Date(baseDate.getTime() + this.totalDurationMin * 60 * 1000);
        this.arrivalTimeStr = formatTimeAmPm(arrivalDate);

        const startEl = document.getElementById('hud-start-time');
        const arrivalEl = document.getElementById('hud-arrival-time');
        if (startEl) startEl.innerText = this.startTimeStr;
        if (arrivalEl) arrivalEl.innerText = this.arrivalTimeStr;

        // 4. Fetch / calculate real road route coordinates and street milestones
        const pickup = this.normalizeCoords(booking.pickup_coords, [14.5758, 121.0183]);
        const dropoff = this.normalizeCoords(booking.dropoff_coords, [14.5517, 121.0509]);

        let fullWaypoints = [];
        let fullSteps = [];

        // Check if all original road waypoints are preserved
        if (Array.isArray(booking.all_waypoints) && booking.all_waypoints.length >= 2) {
            fullWaypoints = booking.all_waypoints.map(p => this.normalizeCoords(p));
        }

        const routeResult = await this.fetchRouteWaypointsAndSteps(pickup, dropoff, booking.id);
        if (fullWaypoints.length === 0) {
            fullWaypoints = routeResult.waypoints || [pickup, dropoff];
        }
        fullSteps = routeResult.steps || [];
        this.routeCongestion = (Array.isArray(routeResult.congestion) && routeResult.congestion.length === fullWaypoints.length - 1)
            ? routeResult.congestion
            : [];

        if (isCancelledMidTrip) {
            // Check if traveled_waypoints was explicitly stored at cancellation time
            if (Array.isArray(booking.traveled_waypoints) && booking.traveled_waypoints.length > 2) {
                this.waypoints = booking.traveled_waypoints.map(p => this.normalizeCoords(p));
            } else {
                // Determine slice point: either cancellation_coords or cancellation_progress / prorated distance ratio
                const cancelCoords = booking.cancellation_coords || booking.actual_dropoff_coords;
                let sliceIdx = -1;

                if (cancelCoords) {
                    const normCancel = this.normalizeCoords(cancelCoords);
                    let minDist = Infinity;
                    for (let i = 0; i < fullWaypoints.length; i++) {
                        const d = this.computeDistanceMeters(normCancel, fullWaypoints[i]);
                        if (d < minDist) {
                            minDist = d;
                            sliceIdx = i;
                        }
                    }
                }

                if (sliceIdx <= 0 || sliceIdx >= fullWaypoints.length) {
                    const prog = (typeof booking.cancellation_progress === 'number' && booking.cancellation_progress > 0)
                        ? booking.cancellation_progress
                        : (booking.distance_km ? Math.min(0.85, parseFloat(booking.distance_km) / 6.5) : 0.55);
                    sliceIdx = Math.max(2, Math.min(fullWaypoints.length - 2, Math.round(fullWaypoints.length * Math.min(0.9, prog))));
                }

                this.waypoints = fullWaypoints.slice(0, sliceIdx + 1);
                if (cancelCoords) {
                    const lastWp = this.waypoints[this.waypoints.length - 1];
                    const normCancel = this.normalizeCoords(cancelCoords);
                    if (!lastWp || this.computeDistanceMeters(lastWp, normCancel) > 5) {
                        this.waypoints.push(normCancel);
                    }
                }
            }

            // Untraveled / Cancelled segment beyond early dropoff
            if (fullWaypoints.length > 0) {
                const lastTraveledPt = this.waypoints[this.waypoints.length - 1];
                let matchIdx = fullWaypoints.length - 1;
                let bestD = Infinity;
                for (let i = 0; i < fullWaypoints.length; i++) {
                    const d = this.computeDistanceMeters(lastTraveledPt, fullWaypoints[i]);
                    if (d < bestD) {
                        bestD = d;
                        matchIdx = i;
                    }
                }
                const remaining = fullWaypoints.slice(matchIdx);
                this.cancelledWaypoints = [lastTraveledPt, ...remaining];
            } else {
                this.cancelledWaypoints = [];
            }

            // Scale base replay duration proportionally for early cancelled trip
            this.baseDurationMs = Math.max(12000, Math.min(20000, Math.round(22000 * ((booking.distance_km || 3.5) / 6.0))));
        } else {
            this.waypoints = fullWaypoints;
            this.cancelledWaypoints = [];
            this.baseDurationMs = 22000;
        }

        this.stepMilestones = fullSteps;

        // Precompute cumulative distances for traveled waypoints
        this.segmentDistances = [];
        this.cumDistances = [0];
        let totalD = 0;
        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const d = this.computeDistanceMeters(this.waypoints[i], this.waypoints[i + 1]);
            this.segmentDistances.push(d);
            totalD += d;
            this.cumDistances.push(totalD);
        }
        this.totalDistM = totalD > 0 ? totalD : (isCancelledMidTrip ? 3400 : 5800);

        // 5. Setup Leaflet Map Layers
        if (this.routePolyline) this.map.removeLayer(this.routePolyline);
        if (this.traveledPolyline) this.map.removeLayer(this.traveledPolyline);
        if (this.cancelledPolyline) this.map.removeLayer(this.cancelledPolyline);
        if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
        if (this.dropoffMarker) this.map.removeLayer(this.dropoffMarker);
        if (this.origDropoffMarker) this.map.removeLayer(this.origDropoffMarker);
        if (this.carMarker) this.map.removeLayer(this.carMarker);

        // Solid background road route for traveled portion
        this.routePolyline = L.polyline(this.waypoints, {
            color: '#cbd5e1',
            weight: 6,
            opacity: 0.75,
            lineJoin: 'round'
        }).addTo(this.map);

        // If cancelled mid-trip, render dashed red line for untraveled remaining route to original destination
        if (isCancelledMidTrip && this.cancelledWaypoints.length >= 2) {
            this.cancelledPolyline = L.polyline(this.cancelledWaypoints, {
                color: '#ef4444',
                weight: 5,
                opacity: 0.65,
                dashArray: '6, 8',
                lineJoin: 'round'
            }).addTo(this.map);
        }

        // Traveled dynamic highlight polyline
        this.traveledPolyline = L.polyline([this.waypoints[0]], {
            color: '#10b981',
            weight: 6,
            opacity: 0.95,
            lineJoin: 'round'
        }).addTo(this.map);

        // Fit map bounds to encompass both traveled and cancelled routes
        const allBoundsPts = (isCancelledMidTrip && this.cancelledWaypoints.length > 0)
            ? [...this.waypoints, ...this.cancelledWaypoints]
            : this.waypoints;
        this.map.fitBounds(L.polyline(allBoundsPts).getBounds(), { padding: [50, 50] });

        // Add Pickup Pin
        const pickupIcon = L.divIcon({
            className: 'pickup-flag',
            html: `
                <div class="flex items-center space-x-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white">
                    <span class="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                    <span class="whitespace-nowrap">Pickup</span>
                </div>
            `,
            iconSize: [60, 24],
            iconAnchor: [30, 24]
        });
        this.pickupMarker = L.marker(this.waypoints[0], { icon: pickupIcon }).addTo(this.map)
            .bindPopup(`<b>Pickup Location:</b><br>${booking.pickup}`);

        // Add Dropoff / Cancellation Pin
        if (isCancelledMidTrip) {
            const cancelPinIcon = L.divIcon({
                className: 'cancel-dropoff-flag',
                html: `
                    <div class="flex items-center space-x-1 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white animate-pulse">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-200 inline-block"></span>
                        <span class="whitespace-nowrap">⚠️ Cancelled Mid-Trip</span>
                    </div>
                `,
                iconSize: [130, 24],
                iconAnchor: [65, 24]
            });
            this.dropoffMarker = L.marker(this.waypoints[this.waypoints.length - 1], { icon: cancelPinIcon }).addTo(this.map)
                .bindPopup(`<b>Trip Ended Mid-Transit:</b><br>${booking.cancellation_street || 'Mid-Trip Cancellation Point'}<br><span class="text-xs text-amber-600 font-bold">${booking.cancellation_note || 'Prorated ride completed early'}</span>`);

            // Add faded original destination marker
            if (this.cancelledWaypoints.length > 0) {
                const origDestIcon = L.divIcon({
                    className: 'orig-dest-flag',
                    html: `
                        <div class="flex items-center space-x-1 bg-slate-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow border border-slate-300 opacity-60">
                            <span class="line-through whitespace-nowrap">Original Dest: ${booking.dropoff.substring(0, 16)}...</span>
                        </div>
                    `,
                    iconSize: [140, 20],
                    iconAnchor: [70, 20]
                });
                const origDropoffPt = this.cancelledWaypoints[this.cancelledWaypoints.length - 1];
                this.origDropoffMarker = L.marker(origDropoffPt, { icon: origDestIcon }).addTo(this.map)
                    .bindPopup(`<b>Original Destination (Not Reached):</b><br>${booking.dropoff}`);
            }
        } else {
            const dropoffIcon = L.divIcon({
                className: 'dropoff-flag',
                html: `
                    <div class="flex items-center space-x-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white">
                        <span class="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                        <span class="whitespace-nowrap">Dropoff</span>
                    </div>
                `,
                iconSize: [65, 24],
                iconAnchor: [32, 24]
            });
            this.dropoffMarker = L.marker(this.waypoints[this.waypoints.length - 1], { icon: dropoffIcon }).addTo(this.map)
                .bindPopup(`<b>Destination:</b><br>${booking.dropoff}`);
        }

        // Add animated vehicle marker (motorcycle for parcel courier, taxi for standard)
        const markerAvatar = isParcel ? '<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>' : '<svg class="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM5 11l2-5h10l2 5m-14 0h14m-14 0v6h14v-6"/></svg>';
        const carIcon = L.divIcon({
            className: 'hirna-playback-car',
            html: `
                <div class="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-2xl border-2 border-gold-400 text-base transform transition-transform">
                    ${markerAvatar}
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        this.carMarker = L.marker(this.waypoints[0], { icon: carIcon, zIndexOffset: 1000 }).addTo(this.map);

        // 6. Initialize Real-World Driving Dynamics Engine (synced with booking.js)
        this.initDrivingDynamics();

        // Reset to initial location
        this.autoTrack = true;
        this.updateTrackButtonUI(true);
        this.seekToProgress(0);
    },

    // -------------------------------------------------------------------------
    // REAL-WORLD DRIVING DYNAMICS ENGINE INITIALIZATION (SYNCED WITH BOOKING.JS)
    // -------------------------------------------------------------------------
    initDrivingDynamics() {
        const totalDist = this.totalDistM;
        const waypoints = this.waypoints;
        const cumDistances = this.cumDistances;

        const routeTraffic = this.activeBooking?.traffic_telemetry || {};
        const congestionLevel = routeTraffic?.congestion_level || 'low';
        const congestionRatio = routeTraffic?.congestion_ratio || 1.0;

        let trafficStopDelayFactor = 1.0;
        if (congestionLevel === 'severe' || congestionRatio >= 1.60) trafficStopDelayFactor = 1.65;
        else if (congestionLevel === 'heavy' || congestionRatio >= 1.30) trafficStopDelayFactor = 1.35;
        else if (congestionLevel === 'moderate' || congestionRatio >= 1.15) trafficStopDelayFactor = 1.15;

        const computeBearing = (p1, p2) => {
            const dLat = (p2[0] - p1[0]);
            const avgLatRad = ((p1[0] + p2[0]) / 2) * Math.PI / 180;
            const dLng = (p2[1] - p1[1]) * Math.cos(avgLatRad);
            let angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
            return (angle + 360) % 360;
        };

        const milestones = this.stepMilestones || [];

        // ---------------------------------------------------------------------
        // REAL ROAD EVENTS from Mapbox/OSRM step intersection data:
        //  - Full stop (2-4s) ONLY at traffic signals, stop signs, and 4-way intersections you turn at
        //  - 3-way junctions, side streets and ordinary turns are slowdowns, NOT stops
        // ---------------------------------------------------------------------
        const roadEvents = buildRoadEvents(waypoints, cumDistances, totalDist, milestones);
        const finalStops = roadEvents.finalStops;
        const connectedIntersections = roadEvents.connectedIntersections;

        // 3. ROAD BENDS / CURVES (chord bearing change >= 12 deg across ~22m lookahead)
        const roadBends = [];
        if (waypoints.length >= 3) {
            for (let i = 1; i < waypoints.length - 1; i++) {
                let backIdx = i - 1;
                while (backIdx > 0 && (cumDistances[i] - cumDistances[backIdx]) < 22) {
                    backIdx--;
                }
                let fwdIdx = i + 1;
                while (fwdIdx < waypoints.length - 1 && (cumDistances[fwdIdx] - cumDistances[i]) < 22) {
                    fwdIdx++;
                }

                const bBack = computeBearing(waypoints[backIdx], waypoints[i]);
                const bFwd = computeBearing(waypoints[i], waypoints[fwdIdx]);
                let diff = Math.abs(bFwd - bBack);
                if (diff > 180) diff = 360 - diff;

                if (diff >= 12) {
                    const spanStart = Math.max(0, cumDistances[i] - 25);
                    const spanEnd = Math.min(totalDist, cumDistances[i] + 25);

                    if (roadBends.length > 0 && (cumDistances[i] - roadBends[roadBends.length - 1].spanEnd) < 35) {
                        roadBends[roadBends.length - 1].spanEnd = spanEnd;
                        roadBends[roadBends.length - 1].dist = Math.round((roadBends[roadBends.length - 1].spanStart + spanEnd) / 2);
                        roadBends[roadBends.length - 1].angleDiff = Math.max(roadBends[roadBends.length - 1].angleDiff, diff);
                    } else {
                        roadBends.push({
                            dist: cumDistances[i],
                            spanStart: spanStart,
                            spanEnd: spanEnd,
                            angleDiff: diff
                        });
                    }
                }
            }
        }

        let trafficCruisingMultiplier = 1.22;
        let trafficLabel = "Smooth Traffic Commute";
        let trafficDotClass = "bg-emerald-400";
        let trafficModeClass = "text-emerald-400";

        if (congestionLevel === 'severe' || congestionRatio >= 1.60) {
            trafficCruisingMultiplier = 0.42;
            trafficLabel = "Severe Traffic Congestion";
            trafficDotClass = "bg-rose-500 animate-pulse";
            trafficModeClass = "text-rose-400";
        } else if (congestionLevel === 'heavy' || congestionRatio >= 1.30) {
            trafficCruisingMultiplier = 0.65;
            trafficLabel = "Heavy Traffic Slowdown";
            trafficDotClass = "bg-orange-500 animate-pulse";
            trafficModeClass = "text-orange-400";
        } else if (congestionLevel === 'moderate' || congestionRatio >= 1.15) {
            trafficCruisingMultiplier = 0.90;
            trafficLabel = "Moderate Traffic Flow";
            trafficDotClass = "bg-amber-400";
            trafficModeClass = "text-amber-400";
        }

        this.drivingDynamics = {
            finalStops: finalStops,
            signalStops: finalStops,
            connectedIntersections: connectedIntersections,
            roadBends: roadBends,
            trafficCruisingMultiplier: trafficCruisingMultiplier,
            trafficLabel: trafficLabel,
            trafficDotClass: trafficDotClass,
            trafficModeClass: trafficModeClass,
            currentVarianceKmh: 0,
            targetVarianceKmh: 0,
            nextVarianceChangeTime: performance.now() + 2500,
            currentSpeedFactor: 0.25,
            smoothedSpeedKmh: Math.round(38 * trafficCruisingMultiplier),
            liveCongestion: Array.isArray(this.routeCongestion) ? this.routeCongestion : [],
            cruiseSeg: 0,
            activeStop: null
        };
    },

    getCurrentStreetName(targetDist, progress) {
        if (!this.activeBooking) return 'Ayala Malls Circuit, Makati';
        if (progress <= 0.02) return this.activeBooking.pickup || 'Pickup Location';
        if (progress >= 0.98) {
            return this.isCancelledMidTrip
                ? (this.activeBooking.cancellation_street || 'Ended Mid-Trip')
                : (this.activeBooking.dropoff || 'Dropoff Destination');
        }

        // Check milestones
        if (this.stepMilestones && this.stepMilestones.length > 0) {
            const m = this.stepMilestones.find(s => s.name && targetDist >= s.startDist && targetDist <= s.endDist);
            if (m && m.name) return m.name;
        }

        // Interpolated default descriptions
        if (this.activeBooking.pickup && this.activeBooking.pickup.includes('Circuit')) {
            if (progress < 0.15) return 'A.P. Reyes Avenue, Makati';
            if (progress < 0.35) return 'Kalayaan Avenue, Makati';
            if (progress < 0.65) return 'Senator Gil J. Puyat Ave (Buendia)';
            if (progress < 0.85) return 'Kalayaan Flyover / BGC Entrance';
            return '32nd Street, Bonifacio Global City';
        }

        return this.activeBooking.pickup;
    },

    seekToProgress(progress, overrideBehavior = null) {
        if (!this.waypoints || this.waypoints.length === 0) return;

        progress = Math.max(0, Math.min(1.0, progress));
        this.currentProgress = progress;
        this.currentDistM = progress * this.totalDistM;

        const targetDist = this.currentDistM;

        // Find which road segment vehicle is currently on
        let segIdx = 0;
        for (let i = 0; i < this.cumDistances.length - 1; i++) {
            if (targetDist <= this.cumDistances[i + 1]) {
                segIdx = i;
                break;
            }
            segIdx = i;
        }

        const p1 = this.waypoints[segIdx] || this.waypoints[0];
        const p2 = this.waypoints[segIdx + 1] || p1;
        const segStartDist = this.cumDistances[segIdx] || 0;
        const segLen = this.segmentDistances[segIdx] || 0.0001;
        const segProgress = Math.max(0, Math.min(1.0, (targetDist - segStartDist) / segLen));

        const curLat = p1[0] + (p2[0] - p1[0]) * segProgress;
        const curLng = p1[1] + (p2[1] - p1[1]) * segProgress;
        this.currentCoords = [curLat, curLng];

        // Update Car Marker
        if (this.carMarker) {
            this.carMarker.setLatLng([curLat, curLng]);
        }

        // Update Traveled Polyline (from start up to current position)
        if (this.traveledPolyline) {
            const traveledPts = this.waypoints.slice(0, segIdx + 1);
            traveledPts.push([curLat, curLng]);
            this.traveledPolyline.setLatLngs(traveledPts);
        }

        // Auto-Tracking Feature: pan map to follow vehicle if enabled
        if (this.autoTrack && this.map) {
            try {
                this.map.panTo([curLat, curLng], { animate: false });
            } catch (e) {}
        }

        // Update UI Controls
        const pct = progress * 100;
        const scrubber = document.getElementById('playback-scrubber');
        if (scrubber) scrubber.value = pct;

        // Progress percentage bubble directly above progress circle thumb
        const bubble = document.getElementById('scrubber-bubble');
        const bubbleText = document.getElementById('hud-progress-bubble');
        if (bubble && bubbleText) {
            bubbleText.innerText = `${Math.round(pct)}%`;
            bubble.style.left = `${pct}%`;
        }

        // Elapsed Time (counts proportionally up to totalDurationMin)
        const totalTripSecs = this.totalDurationMin * 60;
        const elapsedSecs = Math.round(progress * totalTripSecs);
        const elM = Math.floor(elapsedSecs / 60);
        const elS = elapsedSecs % 60;
        const elapsedStr = `${elM.toString().padStart(2, '0')}:${elS.toString().padStart(2, '0')}`;
        const elapsedEl = document.getElementById('hud-elapsed-time');
        if (elapsedEl) elapsedEl.innerText = elapsedStr;

        // Calculate Road Driving Dynamics Speed & Behavior (synced with booking.js)
        let speed = 0;
        let behavior = "Cruising";
        let behaviorClass = "text-emerald-400";

        if (overrideBehavior) {
            speed = overrideBehavior.speed;
            behavior = overrideBehavior.behavior;
            behaviorClass = overrideBehavior.behaviorClass;
        } else {
            // Seek state calculation: compute speed factor from targetDist
            const dyn = this.drivingDynamics;
            const dist = targetDist;
            const totalDist = this.totalDistM;

            let targetFactor = 1.0;
            behavior = "Cruising";

            if (dist < 35) {
                targetFactor = 0.25 + (dist / 35) * 0.35;
                behavior = "Departing";
                behaviorClass = "text-teal-300";
            } else if (dist >= totalDist - 50) {
                const arriveRatio = Math.max(0, (totalDist - dist) / 50);
                targetFactor = 0.20 + (arriveRatio * 0.25);
                behavior = this.isCancelledMidTrip ? "Trip Ended Mid-Transit" : "Arriving at Destination";
                behaviorClass = this.isCancelledMidTrip ? "text-amber-400" : "text-emerald-300";
            } else {
                // Check stops (turns and intersections)
                const nearStop = (dyn.finalStops || dyn.signalStops) && (dyn.finalStops || dyn.signalStops).find(st => Math.abs(st.dist - dist) < 55);
                if (nearStop) {
                    const ratio = Math.abs(nearStop.dist - dist) / 55;
                    targetFactor = Math.pow(ratio, 1.4) * 0.70;
                    behavior = `Approaching ${nearStop.label || "Intersection"}`;
                    behaviorClass = "text-amber-400";
                } else {
                    const nearBend = dyn.roadBends && dyn.roadBends.find(b => dist >= b.spanStart && dist <= b.spanEnd);
                    const nearIntersection = dyn.connectedIntersections && dyn.connectedIntersections.find(ci => dist >= ci.spanStart && dist <= ci.spanEnd);
                    if (nearBend) {
                        targetFactor = 0.46;
                        behavior = "Navigating Bend";
                        behaviorClass = "text-teal-400";
                    } else if (nearIntersection) {
                        targetFactor = 0.48;
                        behavior = "Crossing Intersection";
                        behaviorClass = "text-amber-300";
                    } else {
                        targetFactor = dyn.trafficCruisingMultiplier || 1.15;
                        behavior = dyn.trafficLabel || "Cruising Speed";
                        behaviorClass = "text-emerald-400";
                    }
                }
            }

            speed = (dist <= 0 || dist >= totalDist) ? 0 : Math.max(12, Math.round(38 * targetFactor));
        }

        const speedEl = document.getElementById('hud-speed');
        if (speedEl) speedEl.innerText = `${speed.toFixed(1)} km/h`;

        const behaviorEl = document.getElementById('hud-driving-behavior');
        if (behaviorEl) {
            behaviorEl.innerText = behavior;
            behaviorEl.className = `text-[10px] font-bold ${behaviorClass} mt-0.5 truncate`;
        }

        // Current Location (Street Name) and Coordinates Below It
        const currentLocEl = document.getElementById('hud-current-location');
        const coordsEl = document.getElementById('hud-coords');

        if (currentLocEl) {
            currentLocEl.innerText = this.getCurrentStreetName(targetDist, progress);
        }
        if (coordsEl) {
            coordsEl.innerText = `${curLat.toFixed(5)}, ${curLng.toFixed(5)}`;
        }

        // Check for AI anomaly alert
        const alertBox = document.getElementById('hud-anomaly-alert');
        if (alertBox) {
            if (speed > 55.0) {
                alertBox.classList.remove('hidden');
                alertBox.innerText = `AI Anomaly: High speed recorded (${speed.toFixed(1)} km/h > 55 km/h)`;
            } else {
                alertBox.classList.add('hidden');
            }
        }
    },

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    play() {
        if (this.isPlaying) return;

        // If at the end, restart from beginning
        if (this.currentProgress >= 1.0) {
            this.seekToProgress(0);
            this.initDrivingDynamics();
        }

        this.isPlaying = true;
        this.updatePlayPauseButton(true);

        this.lastFrameTime = performance.now();

        const totalDist = this.totalDistM;
        const totalDurationMs = this.baseDurationMs;
        const dyn = this.drivingDynamics;

        const animateLoop = (now) => {
            if (!this.isPlaying) return;

            const dtSec = Math.max(0.001, Math.min(0.1, (now - this.lastFrameTime) / 1000));
            this.lastFrameTime = now;

            // 1. Calculate base nominal speed factor (m/s) scaled by playbackSpeed
            const scaledDurationMs = totalDurationMs / this.playbackSpeed;
            const nominalSpeedMps = totalDist / (scaledDurationMs / 1000);

            // Periodic commuter variance update (-10 to +10 km/h)
            if (now >= dyn.nextVarianceChangeTime) {
                dyn.targetVarianceKmh = (Math.random() * 20) - 10;
                dyn.nextVarianceChangeTime = now + (3500 + Math.random() * 3500);
            }
            dyn.currentVarianceKmh += (dyn.targetVarianceKmh - dyn.currentVarianceKmh) * Math.min(1.0, dtSec * 1.5);

            let currentDist = this.currentDistM;

            // 2. Identify nearest upcoming turn or intersection stop or active halt
            let activeStop = dyn.activeStop;
            if (!activeStop) {
                const frameStep = Math.max(2, nominalSpeedMps * dyn.currentSpeedFactor * dtSec * 1.2);
                for (const st of (dyn.finalStops || dyn.signalStops)) {
                    if (!st.hasStopped) {
                        if (currentDist >= st.dist - frameStep && currentDist <= st.dist + 4) {
                            activeStop = st;
                            dyn.activeStop = st;
                            currentDist = st.dist;
                            dyn.currentSpeedFactor = 0.0;
                            break;
                        }
                    }
                }
            }

            let targetSpeedFactor = 1.0;
            let drivingBehavior = "Cruising";
            let behaviorClass = "text-emerald-400";

            if (activeStop) {
                // FULL STOP AT TURN OR INTERSECTION (2s - 4s scaled by replay speed)
                if (activeStop.stopStartTime === 0) {
                    activeStop.stopStartTime = now;
                    activeStop.stoppedMs = 0;
                } else {
                    activeStop.stoppedMs += dtSec * 1000;
                }
                const scaledStopDuration = activeStop.stopDurationMs / this.playbackSpeed;
                const stoppedElapsed = activeStop.stoppedMs;
                if (stoppedElapsed < scaledStopDuration) {
                    currentDist = activeStop.dist;
                    targetSpeedFactor = 0.0;
                    dyn.currentSpeedFactor = 0.0;
                    dyn.smoothedSpeedKmh = 0;
                    drivingBehavior = `Stopped at ${activeStop.label || "Intersection"}`;
                    behaviorClass = "text-rose-400";
                } else {
                    // Clear to go: Accelerate smoothly out
                    activeStop.hasStopped = true;
                    dyn.activeStop = null;
                    activeStop = null;
                    targetSpeedFactor = 0.45;
                    dyn.currentSpeedFactor = 0.05;
                    drivingBehavior = "Accelerating into Road";
                    behaviorClass = "text-amber-300";
                }
            } else {
                // Check if approaching a turn or intersection stop ahead
                let distToNextStop = 99999;
                let nextStopObj = null;
                for (const st of (dyn.finalStops || dyn.signalStops)) {
                    if (!st.hasStopped && st.dist > currentDist) {
                        const d = st.dist - currentDist;
                        if (d < distToNextStop) {
                            distToNextStop = d;
                            nextStopObj = st;
                        }
                    }
                }

                const stopDecelHorizon = Math.max(65, nominalSpeedMps * 1.3);
                if (distToNextStop <= stopDecelHorizon) {
                    const stopRatio = Math.max(0, distToNextStop / stopDecelHorizon);
                    targetSpeedFactor = Math.pow(stopRatio, 1.4) * 0.70;
                    drivingBehavior = `Approaching ${nextStopObj?.label || "Intersection"}`;
                    behaviorClass = "text-amber-400";
                } else {
                    // Check bends
                    let activeBend = null;
                    let distToNextBend = 99999;
                    for (const b of dyn.roadBends) {
                        if (currentDist >= b.spanStart && currentDist <= b.spanEnd) {
                            activeBend = b;
                            break;
                        }
                        if (b.dist > currentDist) {
                            const d = b.dist - currentDist;
                            if (d < distToNextBend) distToNextBend = d;
                        }
                    }

                    // Check connected intersections
                    let activeConnected = null;
                    let distToNextConnected = 99999;
                    for (const ci of dyn.connectedIntersections) {
                        if (currentDist >= ci.spanStart && currentDist <= ci.spanEnd) {
                            activeConnected = ci;
                            break;
                        }
                        if (ci.dist > currentDist) {
                            const d = ci.dist - currentDist;
                            if (d < distToNextConnected) distToNextConnected = d;
                        }
                    }

                    const bendDecelHorizon = Math.max(40, nominalSpeedMps * 0.8);

                    if (activeBend) {
                        targetSpeedFactor = 0.46;
                        drivingBehavior = "Navigating Bend";
                        behaviorClass = "text-teal-400";
                    } else if (distToNextBend <= bendDecelHorizon) {
                        const bendRatio = Math.max(0, distToNextBend / bendDecelHorizon);
                        targetSpeedFactor = 0.46 + (bendRatio * 0.24);
                        drivingBehavior = "Slowing for Bend";
                        behaviorClass = "text-teal-300";
                    } else if (activeConnected) {
                        targetSpeedFactor = 0.48;
                        drivingBehavior = "Crossing Intersection (Straight)";
                        behaviorClass = "text-amber-300";
                    } else if (distToNextConnected <= 40) {
                        const ciRatio = Math.max(0, distToNextConnected / 40);
                        targetSpeedFactor = 0.48 + (ciRatio * 0.22);
                        drivingBehavior = "Yielding at Cross Street";
                        behaviorClass = "text-amber-300";
                    } else if (currentDist < 35) {
                        const departRatio = Math.min(1.0, currentDist / 35);
                        targetSpeedFactor = 0.25 + (departRatio * 0.35);
                        drivingBehavior = "Departing";
                        behaviorClass = "text-teal-300";
                    } else if (currentDist >= totalDist - 50) {
                        const arriveRatio = Math.max(0, (totalDist - currentDist) / 50);
                        targetSpeedFactor = 0.20 + (arriveRatio * 0.25);
                        drivingBehavior = this.isCancelledMidTrip ? "Trip Ended Mid-Transit" : "Arriving at Destination";
                        behaviorClass = this.isCancelledMidTrip ? "text-amber-400" : "text-emerald-300";
                    } else {
                        while (dyn.cruiseSeg > 0 && currentDist < this.cumDistances[dyn.cruiseSeg]) dyn.cruiseSeg--;
                        while (dyn.cruiseSeg < this.cumDistances.length - 2 && currentDist > this.cumDistances[dyn.cruiseSeg + 1]) dyn.cruiseSeg++;
                        const segLevel = dyn.liveCongestion ? dyn.liveCongestion[dyn.cruiseSeg] : undefined;
                        let cruiseMul = dyn.trafficCruisingMultiplier;
                        let cruiseLabel = dyn.trafficLabel;
                        let cruiseClass = dyn.trafficModeClass;
                        if (segLevel === 'low') {
                            cruiseMul = 1.22; cruiseLabel = "Smooth Traffic Commute"; cruiseClass = "text-emerald-400";
                        } else if (segLevel === 'moderate') {
                            cruiseMul = 0.90; cruiseLabel = "Moderate Traffic Flow"; cruiseClass = "text-amber-400";
                        } else if (segLevel === 'heavy') {
                            cruiseMul = 0.65; cruiseLabel = "Heavy Traffic Slowdown"; cruiseClass = "text-orange-400";
                        } else if (segLevel === 'severe') {
                            cruiseMul = 0.42; cruiseLabel = "Severe Traffic Congestion"; cruiseClass = "text-rose-400";
                        }
                        const varianceFactor = dyn.currentVarianceKmh / 42.0;
                        targetSpeedFactor = Math.max(0.25, cruiseMul + varianceFactor);
                        if (dyn.currentVarianceKmh >= 3.0) {
                            drivingBehavior = `${cruiseLabel} (+${Math.round(dyn.currentVarianceKmh)} km/h)`;
                        } else if (dyn.currentVarianceKmh <= -3.0) {
                            drivingBehavior = `${cruiseLabel} (${Math.round(dyn.currentVarianceKmh)} km/h)`;
                        } else {
                            drivingBehavior = cruiseLabel;
                        }
                        behaviorClass = cruiseClass;
                    }
                }
            }

            // Progressive Acceleration & Deceleration Smoothing Curve
            if (!activeStop) {
                const easeRate = (targetSpeedFactor < dyn.currentSpeedFactor) ? 2.2 : 1.5;
                dyn.currentSpeedFactor += (targetSpeedFactor - dyn.currentSpeedFactor) * Math.min(1.0, dtSec * easeRate);
                currentDist += nominalSpeedMps * dyn.currentSpeedFactor * dtSec;
                if (currentDist > totalDist) currentDist = totalDist;
            }

            const speedFactor = dyn.currentSpeedFactor;
            const targetKmh = (speedFactor < 0.05 || activeStop) ? 0 : Math.max(12, Math.round(38 * speedFactor + (Math.sin(now / 450) * 1.5)));
            if (activeStop) {
                dyn.smoothedSpeedKmh = 0;
            } else {
                dyn.smoothedSpeedKmh = Math.round(dyn.smoothedSpeedKmh + (targetKmh - dyn.smoothedSpeedKmh) * Math.min(1.0, dtSec * 3.5));
            }

            const newProgress = totalDist > 0 ? Math.min(1.0, currentDist / totalDist) : 1.0;
            this.currentDistM = currentDist;

            this.seekToProgress(newProgress, {
                speed: dyn.smoothedSpeedKmh,
                behavior: drivingBehavior,
                behaviorClass: behaviorClass
            });

            if (newProgress >= 1.0) {
                this.pause();
                this.seekToProgress(1.0, {
                    speed: 0,
                    behavior: this.isCancelledMidTrip ? "Trip Ended Mid-Transit" : "Arrived at Destination",
                    behaviorClass: this.isCancelledMidTrip ? "text-amber-400" : "text-emerald-300"
                });
                return;
            }

            this.animRafId = requestAnimationFrame(animateLoop);
        };

        this.animRafId = requestAnimationFrame(animateLoop);
    },

    pause() {
        this.isPlaying = false;
        if (this.animRafId) {
            cancelAnimationFrame(this.animRafId);
            this.animRafId = null;
        }
        this.updatePlayPauseButton(false);
    },

    reset() {
        this.pause();
        this.initDrivingDynamics();
        this.seekToProgress(0);
    },

    updatePlayPauseButton(isPlaying) {
        const icon = document.getElementById('btn-play-pause-icon');
        const text = document.getElementById('btn-play-pause-text');
        if (icon) {
            icon.innerHTML = isPlaying 
                ? '<svg class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' 
                : '<svg class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        }
        if (text) text.innerText = isPlaying ? 'Pause' : 'Play';
    }
};

// Safe Auto-Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GPSModule.init());
} else {
    GPSModule.init();
}

// -----------------------------------------------------------------------------
// ROAD EVENT EXTRACTION (shared by booking.js and gps-playback.js)
// Uses the per-step `intersections[]` returned by Mapbox/OSRM directions:
//   - traffic_signal / stop_sign flags  -> FULL STOP (2-4s)
//   - 4-way intersection that the route TURNS at (no signal) -> FULL STOP (2-4s)
//   - every other junction (3-way, side streets, plain turns) -> slowdown only
// Without intersection data (e.g. synthetic/fallback routes) no full stops are created.
// -----------------------------------------------------------------------------
function buildRoadEvents(waypoints, cumDistances, totalDist, milestones) {
    const finalStops = [];
    const connectedIntersections = [];
    if (!Array.isArray(milestones) || !Array.isArray(waypoints) || waypoints.length < 2) {
        return { finalStops, connectedIntersections };
    }

    const angDiff = (a, b) => {
        const d = Math.abs(a - b) % 360;
        return d > 180 ? 360 - d : d;
    };
    const cosLat = Math.cos(waypoints[0][0] * Math.PI / 180);

    // Distance along the route of the polyline vertex nearest to an intersection (lat, lng),
    // restricted to the step's own distance window so repeated roads can't be confused.
    const locateDist = (lat, lng, lo, hi) => {
        let best = Infinity;
        let bestIdx = -1;
        for (let i = 0; i < waypoints.length; i++) {
            if (cumDistances[i] < lo || cumDistances[i] > hi) continue;
            const dy = waypoints[i][0] - lat;
            const dx = (waypoints[i][1] - lng) * cosLat;
            const d2 = dx * dx + dy * dy;
            if (d2 < best) { best = d2; bestIdx = i; }
        }
        if (bestIdx < 0 || Math.sqrt(best) * 111320 > 40) return null;
        return cumDistances[bestIdx];
    };

    const raw = [];
    milestones.forEach((step) => {
        const ints = step && step.intersections;
        if (!Array.isArray(ints)) return;
        const lo = (step.startDist || 0) - 60;
        const hi = (step.endDist != null ? step.endDist : (step.startDist || 0)) + 60;
        ints.forEach((it) => {
            // Skip depart/arrive points (no incoming or outgoing road)
            if (!it || !Array.isArray(it.location) || it.in === undefined || it.out === undefined) return;
            const bearings = Array.isArray(it.bearings) ? it.bearings : [];
            let turnAngle = 0;
            if (bearings[it.in] !== undefined && bearings[it.out] !== undefined) {
                // bearings[in] points back along the road we arrived on
                turnAngle = angDiff(bearings[it.out], (bearings[it.in] + 180) % 360);
            }
            const d = locateDist(it.location[1], it.location[0], lo, hi);
            if (d === null || d <= 45 || d >= totalDist - 45) return;
            raw.push({
                dist: Math.round(d),
                signal: !!it.traffic_signal,
                stopSign: !!it.stop_sign,
                legs: bearings.length,
                turnAngle: turnAngle,
                name: step.name || null
            });
        });
    });
    raw.sort((a, b) => a.dist - b.dist);

    // Merge duplicate reports of the same junction (within 25m)
    const events = [];
    for (const e of raw) {
        const prev = events[events.length - 1];
        if (prev && e.dist - prev.dist < 25) {
            prev.signal = prev.signal || e.signal;
            prev.stopSign = prev.stopSign || e.stopSign;
            prev.legs = Math.max(prev.legs, e.legs);
            prev.turnAngle = Math.max(prev.turnAngle, e.turnAngle);
        } else {
            events.push(e);
        }
    }

    const classify = (e) => {
        if (e.signal) return { kind: 'signal', label: 'Traffic Light' };
        if (e.stopSign) return { kind: 'stop_sign', label: 'Stop Sign' };
        if (e.legs >= 4 && e.turnAngle >= 35) return { kind: 'intersection', label: '4-Way Intersection' };
        return null;
    };

    for (const e of events) {
        const cls = classify(e);
        if (cls) {
            const stop = {
                dist: e.dist,
                name: e.name ? `${cls.label} (${e.name})` : cls.label,
                kind: cls.kind,
                label: cls.label,
                isTurn: e.turnAngle >= 35,
                stopDurationMs: Math.round(2000 + Math.random() * 2000), // 2s to 4s
                hasStopped: false,
                stopStartTime: 0
            };
            const prev = finalStops[finalStops.length - 1];
            if (prev && stop.dist - prev.dist < 60) {
                // Keep the more authoritative control (signal > stop sign > 4-way)
                const rank = (s) => (s.kind === 'signal' ? 3 : s.kind === 'stop_sign' ? 2 : 1);
                if (rank(stop) > rank(prev)) finalStops[finalStops.length - 1] = stop;
            } else {
                finalStops.push(stop);
            }
        }
    }

    // Uncontrolled junctions: slow down & go through (no full stop)
    for (const e of events) {
        if (e.legs < 3) continue;
        if (finalStops.some(st => Math.abs(st.dist - e.dist) < 60)) continue;
        if (connectedIntersections.some(ci => Math.abs(ci.dist - e.dist) < 40)) continue;
        connectedIntersections.push({
            dist: e.dist,
            name: e.name || "Connected Side Street",
            spanStart: Math.max(0, e.dist - 25),
            spanEnd: Math.min(totalDist, e.dist + 18)
        });
    }
    connectedIntersections.sort((a, b) => a.dist - b.dist);

    return { finalStops, connectedIntersections };
}
