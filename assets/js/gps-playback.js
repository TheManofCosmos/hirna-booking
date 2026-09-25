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
    routePolyline: null,
    traveledPolyline: null,
    activeBooking: null,
    waypoints: [],
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
    isPlaying: false,
    playbackSpeed: 1,
    animRafId: null,
    lastFrameTime: 0,
    autoTrack: true,
    currentCoords: null,

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

        // Listen for storage events in case bookings are added in other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'hirna_db_bookings') {
                this.renderRecordedTrips();
            }
        });

        // Listen for custom database update events (central server or local)
        window.addEventListener('hirna:db_updated', (e) => {
            if (!e.detail || !e.detail.table || e.detail.table === 'bookings') {
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

        return bookings;
    },

    renderRecordedTrips() {
        const tbody = document.getElementById('recorded-trips-tbody');
        if (!tbody) return;

        const bookings = this.getAllBookings();
        const countBadge = document.getElementById('trip-count-badge');
        if (countBadge) {
            countBadge.innerText = `${bookings.length} ${bookings.length === 1 ? 'Trip' : 'Trips'} Recorded`;
        }

        if (bookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                        No recorded trips found. Create a booking in Module 1 to see its GPS telemetry here.
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
            const isCompleted = (b.status || '').toLowerCase() === 'completed';

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
                        <div class="text-xs text-slate-500 truncate mt-0.5" title="${b.dropoff}">
                            <span class="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1"></span>${b.dropoff}
                        </div>
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
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                            ● ${(b.status || 'COMPLETED').toUpperCase()}
                        </span>
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
                                endDist: runningDist + d
                            };
                            runningDist += d;
                            return m;
                        }).filter(m => m.name);

                        return { waypoints, steps: milestones };
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

        // 1. Update Title and Badges
        const titleEl = document.getElementById('playback-trip-title');
        const subTitleEl = document.getElementById('playback-route-subtitle');
        const badgeEl = document.getElementById('playback-booking-badge');
        if (titleEl) titleEl.innerText = `${booking.pickup} → ${booking.dropoff}`;
        if (subTitleEl) subTitleEl.innerText = `Replaying ${isParcel ? 'Parcel Delivery' : 'Ride'}: ${booking.booking_code} • Duration: ${booking.duration_min || 22} mins`;
        if (badgeEl) badgeEl.innerText = `#${booking.booking_code}`;

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
            serviceBadge.innerText = isParcel ? "PARCEL DELIVERY" : (booking.service_type ? booking.service_type.toUpperCase() : "TRANSPORT");
            serviceBadge.className = isParcel 
                ? "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase"
                : "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase";
        }
        if (durationEl) durationEl.innerText = `${booking.duration_min || 22} mins`;
        if (bookerLabel) bookerLabel.innerText = isParcel ? "Booker / Sender:" : "Booker / Passenger:";
        if (bookerNameEl) bookerNameEl.innerText = bookerName;
        if (bookerPhoneEl) bookerPhoneEl.innerText = bookerPhone;
        if (driverNameEl) driverNameEl.innerText = booking.driver_name || 'Ricardo Dalisay';
        if (vehicleInfoEl) vehicleInfoEl.innerText = `${booking.vehicle_model || 'Toyota Vios'} (${booking.vehicle_plate || 'TXI-5431'})`;
        if (distEl) distEl.innerText = `${booking.distance_km || 5.8} km`;

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
        this.totalDurationMin = parseInt(booking.duration_min) || 22;
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

        const routeResult = await this.fetchRouteWaypointsAndSteps(pickup, dropoff, booking.id);
        this.waypoints = routeResult.waypoints || [pickup, dropoff];
        this.stepMilestones = routeResult.steps || [];

        // Precompute cumulative distances
        this.segmentDistances = [];
        this.cumDistances = [0];
        let totalD = 0;
        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const d = this.computeDistanceMeters(this.waypoints[i], this.waypoints[i + 1]);
            this.segmentDistances.push(d);
            totalD += d;
            this.cumDistances.push(totalD);
        }
        this.totalDistM = totalD > 0 ? totalD : 5800;

        // 5. Setup Leaflet Map Layers
        if (this.routePolyline) this.map.removeLayer(this.routePolyline);
        if (this.traveledPolyline) this.map.removeLayer(this.traveledPolyline);
        if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
        if (this.dropoffMarker) this.map.removeLayer(this.dropoffMarker);
        if (this.carMarker) this.map.removeLayer(this.carMarker);

        // Solid background road route
        this.routePolyline = L.polyline(this.waypoints, {
            color: '#cbd5e1',
            weight: 6,
            opacity: 0.75,
            lineJoin: 'round'
        }).addTo(this.map);

        // Traveled dynamic highlight polyline
        this.traveledPolyline = L.polyline([this.waypoints[0]], {
            color: '#10b981',
            weight: 6,
            opacity: 0.95,
            lineJoin: 'round'
        }).addTo(this.map);

        this.map.fitBounds(this.routePolyline.getBounds(), { padding: [50, 50] });

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

        // Add Dropoff Pin
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

        // Reset to initial location
        this.autoTrack = true;
        this.updateTrackButtonUI(true);
        this.seekToProgress(0);
    },

    getCurrentStreetName(targetDist, progress) {
        if (!this.activeBooking) return 'Ayala Malls Circuit, Makati';
        if (progress <= 0.02) return this.activeBooking.pickup || 'Pickup Location';
        if (progress >= 0.98) return this.activeBooking.dropoff || 'Dropoff Destination';

        // Check milestones
        if (this.stepMilestones && this.stepMilestones.length > 0) {
            const m = this.stepMilestones.find(s => targetDist >= s.startDist && targetDist <= s.endDist);
            if (m && m.name) return m.name;
        }

        // Interpolated default descriptions
        if (this.activeBooking.pickup.includes('Circuit')) {
            if (progress < 0.15) return 'A.P. Reyes Avenue, Makati';
            if (progress < 0.35) return 'Kalayaan Avenue, Makati';
            if (progress < 0.65) return 'Senator Gil J. Puyat Ave (Buendia)';
            if (progress < 0.85) return 'Kalayaan Flyover / BGC Entrance';
            return '32nd Street, Bonifacio Global City';
        }

        return this.activeBooking.pickup;
    },

    seekToProgress(progress) {
        if (!this.waypoints || this.waypoints.length === 0) return;

        progress = Math.max(0, Math.min(1.0, progress));
        this.currentProgress = progress;

        const targetDist = progress * this.totalDistM;

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

        // Auto-Tracking Feature from Booking: pan map to follow vehicle if enabled
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

        // Realistic instantaneous speed
        let speed = 0.0;
        if (progress > 0.001 && progress < 0.995) {
            const curve = Math.sin(progress * Math.PI);
            const cornerSlowing = 0.8 + 0.2 * Math.sin(progress * 25);
            speed = Math.max(18.0, Math.min(58.0, (28.0 + curve * 24.0) * cornerSlowing));
        }
        const speedEl = document.getElementById('hud-speed');
        if (speedEl) speedEl.innerText = `${speed.toFixed(1)} km/h`;

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
        }

        this.isPlaying = true;
        this.updatePlayPauseButton(true);

        this.lastFrameTime = performance.now();

        const animateLoop = (now) => {
            if (!this.isPlaying) return;

            const deltaMs = now - this.lastFrameTime;
            this.lastFrameTime = now;

            // Total replay duration scaled by playback speed (1x = 22s, 2x = 11s, 4x = 5.5s)
            const activeDurationMs = this.baseDurationMs / this.playbackSpeed;
            const stepProgress = deltaMs / activeDurationMs;

            const newProgress = Math.min(1.0, this.currentProgress + stepProgress);
            this.seekToProgress(newProgress);

            if (newProgress >= 1.0) {
                this.pause();
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
