/**
 * Module 1: Booking System Controller
 * Supports 4 Multi-Vertical Services: Transport, Parcel, Food, Mart
 * Featuring Address Autocomplete, Saved Addresses, GPS Lock, and Specialized Parcel Workflow
 */

const SavedAddressManager = {
    getHome() {
        try {
            const saved = localStorage.getItem('hirna_home_address');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },
    hasHome() {
        return Boolean(this.getHome());
    },
    setHome(place) {
        try {
            localStorage.setItem('hirna_home_address', JSON.stringify(place));
        } catch (e) {
            console.error("Failed to save home address:", e);
        }
    },
    getSavedRoutes() {
        try {
            const saved = localStorage.getItem('hirna_saved_routes');
            if (saved) return JSON.parse(saved);
            
            // Demo default route so users instantly see 1-tap route functionality
            const home = this.getHome();
            const defaultHome = home ? home : { name: "Home Location, Mandaluyong City", lat: 14.5822, lng: 121.0545, city: "Mandaluyong" };
            return [
                {
                    id: "route-demo-1",
                    label: "Home → SM Megamall",
                    pickup: defaultHome,
                    dropoff: { name: "SM Megamall, Ortigas, Pasig", city: "Mandaluyong / Pasig", lat: 14.5843, lng: 121.0567 },
                    savedAt: "Frequently Used"
                }
            ];
        } catch (e) {
            return [];
        }
    },
    saveRoute(pickup, dropoff, customLabel = null) {
        try {
            const routes = this.getSavedRoutes().filter(r => 
                !(r.pickup.name === pickup.name && r.dropoff.name === dropoff.name)
            );
            const pShort = pickup.name.split(',')[0].trim();
            const dShort = dropoff.name.split(',')[0].trim();
            const label = customLabel || `${pShort} → ${dShort}`;
            const newRoute = {
                id: 'route-' + Date.now(),
                label: label,
                pickup: pickup,
                dropoff: dropoff,
                savedAt: "Saved Route"
            };
            routes.unshift(newRoute);
            localStorage.setItem('hirna_saved_routes', JSON.stringify(routes.slice(0, 15)));
            return newRoute;
        } catch (e) {
            console.error("Failed to save route:", e);
            return null;
        }
    },
    deleteRoute(routeId) {
        try {
            const routes = this.getSavedRoutes().filter(r => r.id !== routeId);
            localStorage.setItem('hirna_saved_routes', JSON.stringify(routes));
        } catch (e) {
            console.error("Failed to delete route:", e);
        }
    },
    getSaved() {
        try {
            const saved = localStorage.getItem('hirna_saved_addresses');
            return saved ? JSON.parse(saved) : [
                { name: "SM Fairview, Quezon City", city: "Quezon City", lat: 14.7344, lng: 121.0583, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', label: "Favorite SM Mall" }
            ];
        } catch (e) {
            return [
                { name: "SM Fairview, Quezon City", city: "Quezon City", lat: 14.7344, lng: 121.0583, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', label: "Favorite SM Mall" }
            ];
        }
    },
    saveAddress(place, label) {
        try {
            const list = this.getSaved().filter(x => x.name !== place.name);
            list.unshift({ ...place, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', label: label || place.name });
            localStorage.setItem('hirna_saved_addresses', JSON.stringify(list.slice(0, 10)));
        } catch (e) {
            console.error("Failed to save address:", e);
        }
    },
    deleteAddress(name) {
        try {
            const list = this.getSaved().filter(x => x.name !== name);
            localStorage.setItem('hirna_saved_addresses', JSON.stringify(list));
        } catch (e) {
            console.error("Failed to delete address:", e);
        }
    },
    getRecent() {
        try {
            const saved = localStorage.getItem('hirna_recent_addresses');
            const parsed = saved ? JSON.parse(saved) : null;
            if (Array.isArray(parsed)) {
                return parsed.filter(x => x && x.name && x.name !== 'undefined' && !x.name.includes('undefined'));
            }
            return [
                { name: "Ayala Malls Circuit, Makati", city: "Makati City", lat: 14.5758, lng: 121.0183, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                { name: "Bonifacio High Street, BGC", city: "Taguig", lat: 14.5517, lng: 121.0509, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
            ];
        } catch (e) {
            return [
                { name: "Ayala Malls Circuit, Makati", city: "Makati City", lat: 14.5758, lng: 121.0183, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                { name: "Bonifacio High Street, BGC", city: "Taguig", lat: 14.5517, lng: 121.0509, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
            ];
        }
    },
    addRecent(place) {
        try {
            if (!place) return;
            const placeName = place.name || place.fullName || place.main;
            if (!placeName || placeName === 'undefined' || placeName.includes('undefined')) return;
            let list = this.getRecent().filter(x => x && x.name && x.name !== placeName);
            list.unshift({ ...place, name: placeName, icon: place.icon || "" });
            localStorage.setItem('hirna_recent_addresses', JSON.stringify(list.slice(0, 6)));
        } catch (e) {
            console.error("Failed to add recent address:", e);
        }
    },
    deleteRecent(name) {
        try {
            let list = this.getRecent().filter(x => x && x.name !== name);
            localStorage.setItem('hirna_recent_addresses', JSON.stringify(list));
        } catch (e) {
            console.error("Failed to delete recent address:", e);
        }
    }
};

const ContactHistoryManager = {
    getBookers() {
        try {
            const saved = localStorage.getItem('hirna_booker_history');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
            return [
                { id: 'b-1', name: "Juan Dela Cruz", phone: "+63 917 888 9999", lastUsed: Date.now() },
                { id: 'b-2', name: "Maria Clara Santos", phone: "+63 928 555 1234", lastUsed: Date.now() - 3600000 }
            ];
        } catch (e) {
            return [
                { id: 'b-1', name: "Juan Dela Cruz", phone: "+63 917 888 9999", lastUsed: Date.now() },
                { id: 'b-2', name: "Maria Clara Santos", phone: "+63 928 555 1234", lastUsed: Date.now() - 3600000 }
            ];
        }
    },
    addBooker(name, phone) {
        try {
            name = (name || '').trim();
            phone = (phone || '').trim();
            if (!name && !phone) return;
            let list = this.getBookers().filter(x => !(x.name.toLowerCase() === name.toLowerCase() || (phone && x.phone === phone)));
            list.unshift({
                id: 'b-' + Date.now(),
                name: name || 'Passenger',
                phone: phone || '',
                lastUsed: Date.now()
            });
            localStorage.setItem('hirna_booker_history', JSON.stringify(list.slice(0, 10)));
        } catch (e) {
            console.error("Failed to add booker history:", e);
        }
    },
    deleteBooker(idOrName) {
        try {
            let list = this.getBookers().filter(x => x.id !== idOrName && x.name !== idOrName);
            localStorage.setItem('hirna_booker_history', JSON.stringify(list));
        } catch (e) {
            console.error("Failed to delete booker history:", e);
        }
    },

    getRecipients() {
        try {
            const saved = localStorage.getItem('hirna_recipient_history');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
            return [
                { id: 'r-1', name: "Jose Rizal", phone: "+63 918 987 6543", lastUsed: Date.now() },
                { id: 'r-2', name: "Andres Bonifacio", phone: "+63 919 456 7890", lastUsed: Date.now() - 3600000 }
            ];
        } catch (e) {
            return [
                { id: 'r-1', name: "Jose Rizal", phone: "+63 918 987 6543", lastUsed: Date.now() },
                { id: 'r-2', name: "Andres Bonifacio", phone: "+63 919 456 7890", lastUsed: Date.now() - 3600000 }
            ];
        }
    },
    addRecipient(name, phone) {
        try {
            name = (name || '').trim();
            phone = (phone || '').trim();
            if (!name && !phone) return;
            let list = this.getRecipients().filter(x => !(x.name.toLowerCase() === name.toLowerCase() || (phone && x.phone === phone)));
            list.unshift({
                id: 'r-' + Date.now(),
                name: name || 'Recipient',
                phone: phone || '',
                lastUsed: Date.now()
            });
            localStorage.setItem('hirna_recipient_history', JSON.stringify(list.slice(0, 10)));
        } catch (e) {
            console.error("Failed to add recipient history:", e);
        }
    },
    deleteRecipient(idOrName) {
        try {
            let list = this.getRecipients().filter(x => x.id !== idOrName && x.name !== idOrName);
            localStorage.setItem('hirna_recipient_history', JSON.stringify(list));
        } catch (e) {
            console.error("Failed to delete recipient history:", e);
        }
    }
};

const DeviceLocationManager = {
    isEnabled: false,
    coords: null, // { lat: number, lng: number, accuracy: number, resolvedName: string }
    watchId: null,
    permissionStatus: null,
    userLocationMarker: null,
    userAccuracyCircle: null,
    hasCenteredMap: false,
    recentSamples: [],
    bestAccuracy: 9999,
    reverseGeoCache: {},
    onNextLock: null,
    isRequesting: false,

    init() {
        this.isEnabled = false;
        this.coords = null;
        this.updateUI();

        // Listen to native browser permissions API
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(status => {
                this.permissionStatus = status;
                this.handlePermissionState(status.state, false);

                status.onchange = () => {
                    this.handlePermissionState(status.state, true);
                };
            }).catch(e => {
                console.info("Permissions query unavailable, device location standby:", e);
            });
        }
    },

    handlePermissionState(state, isLiveChange = false) {
        if (state === 'granted') {
            this.verifyLiveDeviceLocation(isLiveChange);
        } else if (state === 'denied') {
            this.disableLocation(isLiveChange, "Device location permission is blocked in browser settings.");
        } else {
            // 'prompt' - keep clean standby
            this.updateUI();
        }
    },

    verifyLiveDeviceLocation(isLiveChange = false) {
        if (!navigator.geolocation) {
            this.disableLocation(false, "Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.enableLocationWithCoords(pos, isLiveChange);
            },
            (err) => {
                // Secondary attempt with standard accuracy if high-accuracy timed out
                navigator.geolocation.getCurrentPosition(
                    (pos2) => {
                        this.enableLocationWithCoords(pos2, isLiveChange);
                    },
                    (err2) => {
                        console.info("Device GPS not currently locked.");
                        this.disableLocation(false);
                    },
                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
                );
            },
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        );
    },

    requestLocation() {
        if (!navigator.geolocation) {
            if (typeof App !== 'undefined') App.showToast("Geolocation is not supported by your browser.", "warning");
            return;
        }

        if (this.isRequesting) return;
        this.isRequesting = true;

        const btn = document.getElementById('btn-allow-location');
        if (btn) {
            btn.innerHTML = `<span class="inline-block animate-spin mr-1"></span> Acquiring GPS...`;
        }

        // Tier 1: High-accuracy hardware GPS
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.isRequesting = false;
                this.enableLocationWithCoords(pos, true);
            },
            (err) => {
                console.info("Tier 1 GPS timeout, querying network-assisted location...", err);
                // Tier 2: Network-assisted Wi-Fi / IP positioning
                navigator.geolocation.getCurrentPosition(
                    (fallbackPos) => {
                        this.isRequesting = false;
                        this.enableLocationWithCoords(fallbackPos, true);
                    },
                    (fallbackErr) => {
                        this.isRequesting = false;
                        console.warn("Device location unavailable:", fallbackErr);
                        this.disableLocation(true, "Unable to acquire device GPS. Please ensure location access is allowed in browser and device settings.");
                        this.showWindowsLocationGuideModal();
                    },
                    { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
                );
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    },

    showWindowsLocationGuideModal() {
        const modal = document.getElementById('windows-location-guide-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else if (typeof App !== 'undefined') {
            App.showToast("Windows Location service is turned off. Please turn on Location in Windows Settings.", "warning");
        }
    },

    closeWindowsLocationGuideModal() {
        const modal = document.getElementById('windows-location-guide-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    openWindowsLocationSettings(event) {
        try {
            window.location.href = 'ms-settings:privacy-location';
        } catch (e) {
            console.warn("Could not launch ms-settings protocol:", e);
        }
        if (typeof App !== 'undefined') {
            App.showToast("Opening Windows Location Settings... Turn ON 'Location services' and 'Let desktop apps access your location'.", "info");
        }
    },

    onOpenedWindowsSettings() {
        this.openWindowsLocationSettings();
        this.closeWindowsLocationGuideModal();
    },

    processLocationSample(pos) {
        const rawLat = parseFloat(pos.coords.latitude);
        const rawLng = parseFloat(pos.coords.longitude);
        const rawAcc = Math.max(1, Math.round(pos.coords.accuracy || 15));

        // Outlier rejection: if locked on high accuracy (<25m) and get a sudden coarse spike (>120m), reject it
        if (this.coords && this.bestAccuracy <= 25 && rawAcc > 120) {
            console.warn(`[GPS Filter] Discarded coarse position spike: ±${rawAcc}m`);
            return this.coords;
        }

        if (rawAcc < this.bestAccuracy) {
            this.bestAccuracy = rawAcc;
        }

        // Keep rolling sample buffer (up to 5 samples)
        this.recentSamples.push({ lat: rawLat, lng: rawLng, accuracy: rawAcc, time: Date.now() });
        if (this.recentSamples.length > 5) {
            this.recentSamples.shift();
        }

        // Inverse-variance weighted coordinate fusion: w_i = 1 / (acc_i^2)
        let sumWeights = 0;
        let weightedLat = 0;
        let weightedLng = 0;

        for (const s of this.recentSamples) {
            const w = 1 / (s.accuracy * s.accuracy);
            sumWeights += w;
            weightedLat += s.lat * w;
            weightedLng += s.lng * w;
        }

        const fusedLat = parseFloat((weightedLat / sumWeights).toFixed(6));
        const fusedLng = parseFloat((weightedLng / sumWeights).toFixed(6));
        const effectiveAcc = Math.min(rawAcc, Math.max(2, Math.round(1 / Math.sqrt(sumWeights))));

        return {
            lat: fusedLat,
            lng: fusedLng,
            accuracy: effectiveAcc
        };
    },

    updateMapLocationMarker(lat, lng, accuracy, panTo = false) {
        if (typeof BookingModule === 'undefined' || !BookingModule.map || typeof L === 'undefined') {
            return;
        }

        const map = BookingModule.map;
        const currentCoords = [lat, lng];
        const accRadius = Math.max(8, accuracy);

        // 1. Update or create Accuracy Circle (semi-transparent GPS radius)
        if (this.userAccuracyCircle && map.hasLayer(this.userAccuracyCircle)) {
            this.userAccuracyCircle.setLatLng(currentCoords);
            this.userAccuracyCircle.setRadius(accRadius);
        } else {
            this.userAccuracyCircle = L.circle(currentCoords, {
                radius: accRadius,
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                weight: 1.5,
                interactive: false
            }).addTo(map);
        }

        // 2. Update or create pulsing Location Puck Marker
        const puckHtml = `
            <div class="relative flex items-center justify-center select-none pointer-events-auto" style="width: 32px; height: 32px;">
                <!-- Pulsing blue radar ripple -->
                <div class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping pointer-events-none"></div>
                <!-- Semi-transparent halo -->
                <div class="absolute w-6 h-6 rounded-full bg-blue-500/20 pointer-events-none"></div>
                <!-- Crisp blue puck with white core and border -->
                <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                    <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
            </div>
        `;

        const puckIcon = L.divIcon({
            html: puckHtml,
            className: 'hirna-user-location-puck',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const popupContent = `
            <div class="p-1 space-y-1.5 min-w-[200px] text-left">
                <div class="flex items-center space-x-1.5 text-blue-600 font-black text-xs">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Your Current Location</span>
                </div>
                <div class="text-[11px] font-semibold text-slate-800 leading-tight" id="user-location-popup-addr">
                    ${this.coords?.resolvedName || 'Acquiring street address...'}
                </div>
                <div class="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1">
                    <span>Precision:</span>
                    <span class="font-mono font-bold text-emerald-600">±${Math.round(accuracy)}m</span>
                </div>
                <button type="button" onclick="BookingModule.useCurrentLocationAsPickup()" class="w-full mt-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs cursor-pointer active:scale-95">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    <span>Set as Pickup Location</span>
                </button>
            </div>
        `;

        if (this.userLocationMarker && map.hasLayer(this.userLocationMarker)) {
            this.userLocationMarker.setLatLng(currentCoords);
            this.userLocationMarker.setPopupContent(popupContent);
        } else {
            this.userLocationMarker = L.marker(currentCoords, {
                icon: puckIcon,
                zIndexOffset: 1000,
                title: "Your Live Location"
            }).addTo(map);

            this.userLocationMarker.bindPopup(popupContent, { offset: [0, -10] });
        }

        // 3. Pan or fly map to current location if requested or on initial lock
        if (panTo || !this.hasCenteredMap) {
            this.hasCenteredMap = true;
            try {
                const curZoom = map.getZoom();
                const targetZoom = curZoom < 15 ? 15 : curZoom;
                map.flyTo(currentCoords, targetZoom, { animate: true, duration: 0.8 });
            } catch (e) {
                map.panTo(currentCoords);
            }
        }
    },

    removeMapLocationMarker() {
        if (typeof BookingModule === 'undefined' || !BookingModule.map) return;
        const map = BookingModule.map;
        if (this.userLocationMarker) {
            try { map.removeLayer(this.userLocationMarker); } catch(e) {}
            this.userLocationMarker = null;
        }
        if (this.userAccuracyCircle) {
            try { map.removeLayer(this.userAccuracyCircle); } catch(e) {}
            this.userAccuracyCircle = null;
        }
        this.hasCenteredMap = false;
        this.recentSamples = [];
        this.bestAccuracy = 9999;
    },

    recenterMap() {
        if (this.isEnabled && this.coords && typeof this.coords.lat === 'number') {
            if (typeof BookingModule !== 'undefined' && BookingModule.map) {
                const mapEl = document.getElementById('booking-map');
                if (mapEl) {
                    const rect = mapEl.getBoundingClientRect();
                    if (rect.top < 0 || rect.bottom > window.innerHeight) {
                        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                this.updateMapLocationMarker(this.coords.lat, this.coords.lng, this.coords.accuracy, true);
                if (this.userLocationMarker) {
                    this.userLocationMarker.openPopup();
                }
                if (typeof App !== 'undefined') {
                    App.showToast(`Centered on live GPS (±${Math.round(this.coords.accuracy)}m)`, "info");
                }
            }
        } else {
            this.requestLocation();
        }
    },

    enableLocationWithCoords(pos, showToast = false) {
        this.isEnabled = true;
        const processed = this.processLocationSample(pos);
        const lat = processed.lat;
        const lng = processed.lng;
        const accuracy = processed.accuracy;
        const resolvedName = this.snapToLandmark(lat, lng, accuracy);

        this.coords = { lat, lng, accuracy, resolvedName };
        this.updateUI();
        this.updateMapLocationMarker(lat, lng, accuracy, false);
        this.startContinuousWatch();

        if (typeof this.onNextLock === 'function') {
            const cb = this.onNextLock;
            this.onNextLock = null;
            cb(this.coords);
        }

        if (showToast && typeof App !== 'undefined') {
            App.showToast(`Device location synced! Precision: ±${accuracy}m`, "success");
        }

        if (typeof FoodDeliveryModule !== 'undefined') {
            FoodDeliveryModule.onLocationChanged();
        }
    },

    disableLocation(showToast = false, toastMsg = '') {
        this.isEnabled = false;
        this.coords = null;
        if (this.watchId !== null) {
            try { navigator.geolocation.clearWatch(this.watchId); } catch(e) {}
            this.watchId = null;
        }
        this.removeMapLocationMarker();
        this.updateUI();

        if (showToast && typeof App !== 'undefined' && toastMsg) {
            App.showToast(toastMsg, "warning");
        }

        if (typeof FoodDeliveryModule !== 'undefined') {
            FoodDeliveryModule.onLocationChanged();
        }
    },

    updateUI() {
        const btn = document.getElementById('btn-allow-location');
        const badge = document.getElementById('location-status-badge');
        const dot = document.getElementById('location-status-dot');
        const label = document.getElementById('location-status-label');

        if (this.isEnabled && this.coords) {
            const acc = this.coords.accuracy ? `(±${Math.round(this.coords.accuracy)}m)` : '(GPS Locked)';
            if (btn) {
                btn.className = "px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm cursor-pointer flex items-center space-x-1.5";
                btn.innerHTML = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg><span>GPS: Live</span>`;
                btn.title = `High-Accuracy Device GPS is active ${acc}. Click to re-center.`;
            }
            if (badge) {
                badge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center space-x-1.5";
            }
            if (dot) {
                dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
            }
            if (label) {
                label.innerText = `Location: Live GPS ${acc}`;
            }
        } else {
            if (btn) {
                btn.className = "px-3 py-1 bg-amber-500 hover:bg-amber-400 text-hirna-950 font-black rounded-lg text-xs transition shadow-sm cursor-pointer flex items-center space-x-1.5 active:scale-95";
                btn.innerHTML = `<svg class="w-3.5 h-3.5 text-hirna-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>Allow GPS</span>`;
                btn.title = "Allow Hirna to access device GPS";
            }
            if (badge) {
                badge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300 flex items-center space-x-1.5";
            }
            if (dot) {
                dot.className = "w-2 h-2 rounded-full bg-rose-500";
            }
            if (label) {
                label.innerText = "Location: Disabled";
            }
        }
    },

    snapToLandmark(lat, lng, accuracy) {
        if (typeof BookingModule !== 'undefined' && BookingModule.presets) {
            let closest = null;
            let minD = 999;
            for (const p of BookingModule.presets) {
                const d = BookingModule.calculateDistance(lat, lng, p.lat, p.lng);
                if (d < minD) {
                    minD = d;
                    closest = p;
                }
            }
            // Strict 50-meter threshold so coordinates and location are true to reality
            if (closest && minD <= 0.05) {
                return `${closest.name} (${closest.city}) • ±${Math.round(accuracy)}m`;
            }
        }

        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        if (this.reverseGeoCache && this.reverseGeoCache[cacheKey]) {
            return `${this.reverseGeoCache[cacheKey]} • ±${Math.round(accuracy)}m`;
        }

        this.fetchNominatimAddress(lat, lng, accuracy);
        return `Current Device GPS (${lat.toFixed(5)}, ${lng.toFixed(5)}) • ±${Math.round(accuracy)}m`;
    },

    fetchNominatimAddress(lat, lng, accuracy) {
        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        if (this._fetchingGeo && this._fetchingGeo[cacheKey]) return;
        if (!this._fetchingGeo) this._fetchingGeo = {};
        this._fetchingGeo[cacheKey] = true;

        if (typeof BookingModule !== 'undefined' && typeof BookingModule.reverseGeocodeLandmark === 'function') {
            BookingModule.reverseGeocodeLandmark(lat, lng, (resolved) => {
                if (resolved && !resolved.startsWith('Pinned Location') && !resolved.startsWith('Resolving')) {
                    if (!this.reverseGeoCache) this.reverseGeoCache = {};
                    this.reverseGeoCache[cacheKey] = resolved;
                    if (this.coords && Math.abs(this.coords.lat - lat) < 0.0001 && Math.abs(this.coords.lng - lng) < 0.0001) {
                        this.coords.resolvedName = `${resolved} • ±${Math.round(this.coords.accuracy)}m`;
                        const label = document.getElementById('location-status-label');
                        if (label && this.isEnabled) {
                            label.innerText = `Location: Enabled (±${Math.round(this.coords.accuracy)}m)`;
                        }
                        const popupAddr = document.getElementById('user-location-popup-addr');
                        if (popupAddr) popupAddr.innerText = this.coords.resolvedName;
                    }
                }
            });
        }
    },

    startContinuousWatch() {
        if (!navigator.geolocation) return;
        if (this.watchId !== null) {
            try { navigator.geolocation.clearWatch(this.watchId); } catch(e) {}
            this.watchId = null;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const processed = this.processLocationSample(pos);
                const lat = processed.lat;
                const lng = processed.lng;
                const accuracy = processed.accuracy;

                const resolvedName = this.snapToLandmark(lat, lng, accuracy);
                this.coords = { lat, lng, accuracy, resolvedName };
                this.isEnabled = true;
                this.updateUI();
                this.updateMapLocationMarker(lat, lng, accuracy, false);

                if (typeof FoodDeliveryModule !== 'undefined') {
                    FoodDeliveryModule.onLocationChanged();
                }
            },
            (err) => {
                console.warn("GPS watch interrupted (device location turned off):", err);
                if (err.code === 1 || err.code === 2) {
                    this.disableLocation(true, "Device location was turned off. Switched back to Home Address.");
                }
            },
            options
        );
    },

    getActiveAnchor() {
        if (this.isEnabled && this.coords && typeof this.coords.lat === 'number') {
            return {
                type: 'current',
                label: 'Current Location',
                name: this.coords.resolvedName || 'Current Device Location',
                lat: this.coords.lat,
                lng: this.coords.lng,
                accuracy: this.coords.accuracy || 10,
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
            };
        }

        const home = SavedAddressManager.getHome();
        if (home && typeof home.lat === 'number') {
            return {
                type: 'home',
                label: 'Home Address',
                name: home.name,
                lat: home.lat,
                lng: home.lng,
                accuracy: 5,
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
            };
        }

        // Fallback default home
        return {
            type: 'home',
            label: 'Home Address',
            name: 'Home Location, Mandaluyong City',
            lat: 14.5822,
            lng: 121.0545,
            accuracy: 5,
            icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
        };
    }
};

const FoodDeliveryModule = {
    selectedCraving: 'Chinese Cuisine',
    selectedStore: null,
    cart: [],
    currentStep: 'craving', // 'craving', 'stores', 'menu', 'cart', 'checkout'
    modalItem: null,
    modalQty: 1,
    dropoffCoords: null,
    dropoffName: '',
    deliveryPrice: 0,
    storeMarkers: [],
    foodRouteLine: null,
    foodStoreMarker: null,
    foodDropoffMarker: null,

    cravingCategories: [
        'Chinese Cuisine',
        'Coffee',
        'Food & Beverage',
        'Food and Supplements',
        'Sandwich'
    ],

    storesData: {
        'Chinese Cuisine': [
            {
                id: 'store-c1',
                name: "Dimsum Diner",
                category: "Chinese Cuisine",
                cuisineDesc: "Dim Sum, Noodles & Cantonese Specialties",
                rating: 4.8,
                reviews: 340,
                distance: "1.2 km",
                distanceNum: 1.2,
                eta: "15-25 mins",
                lat: 14.5685,
                lng: 121.0250,
                address: "Chino Roces Ave, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-c1-1', name: "Steamed Pork & Shrimp Siomai (4 pcs)", price: 145, desc: "Authentic pork and shrimp dumplings with chili garlic dip", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c1-2', name: "Hakaw Crystal Dumpling (4 pcs)", price: 185, desc: "Translucent steamed wrapper filled with juicy whole shrimps", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c1-3', name: "Yang Chow Wok Fried Rice", price: 240, desc: "Wok-fried jasmine rice with asado bits, shrimp, and scrambled eggs", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c1-4', name: "Sweet & Sour Pork with Pineapple", price: 295, desc: "Crispy pork chunks tossed in tangy pineapple bell pepper glaze", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c1-5', name: "Braised Beef Brisket Noodle Soup", price: 260, desc: "Slow-cooked tender beef brisket with egg noodles in rich broth", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-c2',
                name: "Hap Chan Tea House",
                category: "Chinese Cuisine",
                cuisineDesc: "Authentic Cantonese & Hong Kong Roasted",
                rating: 4.7,
                reviews: 215,
                distance: "1.8 km",
                distanceNum: 1.8,
                eta: "20-30 mins",
                lat: 14.5570,
                lng: 121.0200,
                address: "Makati Cinema Square, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-c2-1', name: "Asado Siopao (2 pcs)", price: 150, desc: "Fluffy steamed buns stuffed with sweet savory roasted pork", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c2-2', name: "Crispy Fried Wonton (6 pcs)", price: 165, desc: "Golden fried wontons served with sweet & sour dip", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c2-3', name: "Cantonese Fried Noodles", price: 280, desc: "Crispy egg noodles topped with mixed seafood, pork, and greens", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c2-4', name: "Hototay Traditional Soup", price: 230, desc: "Hearty egg-drop broth with chicken strips, liver, and fresh greens", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-c3',
                name: "Mandarin Tea Garden",
                category: "Chinese Cuisine",
                cuisineDesc: "Davao Chinese Heritage & Steamed Delicacies",
                rating: 4.9,
                reviews: 420,
                distance: "2.1 km",
                distanceNum: 2.1,
                eta: "20-30 mins",
                lat: 14.5505,
                lng: 121.0330,
                address: "Perea St, Legazpi Village, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-c3-1', name: "Xiao Long Bao Soup Dumplings (6 pcs)", price: 210, desc: "Steamed dumplings bursting with flavorful pork broth", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c3-2', name: "Steamed Spareribs with Taosi", price: 185, desc: "Pork spareribs steamed in fermented salted black bean sauce", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c3-3', name: "Braised Beef Shank Rice Bowl", price: 220, desc: "Five-spice tender beef shank served over fragrant jasmine rice", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c3-4', name: "Pan-Fried Radish Cake (3 pcs)", price: 140, desc: "Crispy daikon radish cake with dried shrimp bits and scallions", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-c4',
                name: "Chowking",
                category: "Chinese Cuisine",
                cuisineDesc: "Chinese Fast Food & Rice Bowls",
                rating: 4.6,
                reviews: 580,
                distance: "0.8 km",
                distanceNum: 0.8,
                eta: "10-20 mins",
                lat: 14.5750,
                lng: 121.0180,
                address: "Circuit Makati, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-c4-1', name: "Chao Fan with Pork Siomai", price: 155, desc: "Signature wok-style fried rice topped with fried pork siomai", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c4-2', name: "Sweet & Sour Chicken Lauriat", price: 235, desc: "Complete meal: chicken, chao fan, siomai, buchi, and chicharap", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c4-3', name: "Halo-Halo Supreme", price: 115, desc: "Shaved ice with sweetened beans, leche flan, ube, and ice cream", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-c4-4', name: "Pork Wanton Mami", price: 145, desc: "Comforting egg noodles in clear broth with pork wontons", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            }
        ],
        'Coffee': [
            {
                id: 'store-cf1',
                name: "Bo's Coffee",
                category: "Coffee",
                cuisineDesc: "Philippine Single-Origin & Artisan Brews",
                rating: 4.8,
                reviews: 290,
                distance: "1.1 km",
                distanceNum: 1.1,
                eta: "15-25 mins",
                lat: 14.5590,
                lng: 121.0195,
                address: "Dela Rosa St, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-cf1-1', name: "Philippine Highland Brewed Coffee", price: 140, desc: "Single-origin Arabica from Mt. Apo & Sagada mountains", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf1-2', name: "Iced Spanish Latte", price: 175, desc: "Fresh espresso with sweetened condensed milk and cold whole milk", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf1-3', name: "Froccino Mocha Blast", price: 195, desc: "Blended iced coffee with rich dark chocolate and whipped cream", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf1-4', name: "Blueberry Cheesecake Slice", price: 180, desc: "Creamy New York cheesecake topped with whole blueberry compote", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-cf2',
                name: "Highlands Coffee",
                category: "Coffee",
                cuisineDesc: "Traditional Phin Drip & Artisan Espresso",
                rating: 4.7,
                reviews: 180,
                distance: "1.6 km",
                distanceNum: 1.6,
                eta: "15-25 mins",
                lat: 14.5540,
                lng: 121.0280,
                address: "Salcedo Village, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-cf2-1', name: "Phin Drip Iced Coffee with Condensed Milk", price: 135, desc: "Slow-drip traditional bold coffee with sweetened milk", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf2-2', name: "Caramel Macchiato", price: 170, desc: "Espresso layered with steamed milk and rich vanilla-caramel drizzle", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf2-3', name: "Matcha Green Tea Freeze", price: 190, desc: "Pure ceremonial matcha blended with cream and ice", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf2-4', name: "Banh Mi Roast Pork Sandwich", price: 160, desc: "Crispy warm baguette filled with roast pork, pate, and fresh herbs", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-cf3',
                name: "Blugré Coffee",
                category: "Coffee",
                cuisineDesc: "Home of the Famous Durian Coffee & Pastries",
                rating: 4.9,
                reviews: 310,
                distance: "2.0 km",
                distanceNum: 2.0,
                eta: "20-30 mins",
                lat: 14.5650,
                lng: 121.0350,
                address: "Bel-Air, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-cf3-1', name: "Durian Gavanccino", price: 210, desc: "Davao's signature espresso blended with sweet fresh durian puree", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf3-2', name: "Hot Durian Coffee", price: 185, desc: "Smooth brewed coffee infused with aromatic real durian notes", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf3-3', name: "Davao Artisan Tablea Hot Cocoa", price: 160, desc: "Pure melted Davao cacao tablea with warm fresh milk", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf3-4', name: "Durian Cheesecake", price: 195, desc: "Velvety baked cheesecake made with premium fresh durian", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-cf4',
                name: "Starbucks Reserve",
                category: "Coffee",
                cuisineDesc: "Handcrafted Reserve Beverages & Frappuccinos",
                rating: 4.8,
                reviews: 670,
                distance: "2.4 km",
                distanceNum: 2.4,
                eta: "20-30 mins",
                lat: 14.5515,
                lng: 121.0505,
                address: "Bonifacio High Street, Taguig",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-cf4-1', name: "Reserve Cold Brew Float", price: 245, desc: "Small-batch cold brew with a scoop of vanilla bean ice cream", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf4-2', name: "Iced Brown Sugar Shaken Espresso", price: 220, desc: "Blonde espresso shaken with brown sugar and cinnamon, oat milk", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf4-3', name: "White Chocolate Mocha", price: 205, desc: "Espresso with white chocolate sauce, steamed milk, and cream", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-cf4-4', name: "Classic Dark Chocolate Cake", price: 185, desc: "Moist chocolate sponge with rich fudge chocolate ganache", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            }
        ],
        'Food & Beverage': [
            {
                id: 'store-fb1',
                name: "Jollibee",
                category: "Food & Beverage",
                cuisineDesc: "Langhap-Sarap Chickenjoy & Jolly Spaghetti",
                rating: 4.8,
                reviews: 950,
                distance: "0.8 km",
                distanceNum: 0.8,
                eta: "10-20 mins",
                lat: 14.5740,
                lng: 121.0190,
                address: "Circuit Makati, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-fb1-1', name: "2pc Chickenjoy with Rice & Drink", price: 199, desc: "Crispylicious, juicylicious fried chicken with signature gravy", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb1-2', name: "Jolly Spaghetti with Yumburger", price: 165, desc: "Meaty sweet spaghetti with hotdog slices and classic beef burger", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb1-3', name: "1pc Chickenjoy with Jolly Spaghetti", price: 185, desc: "Combo of crispy Chickenjoy and sweet Jolly Spaghetti", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb1-4', name: "Peach Mango Pie (2 pcs)", price: 95, desc: "Crispy golden crust filled with sweet tropical peach and mango", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-fb2',
                name: "Mang Inasal",
                category: "Food & Beverage",
                cuisineDesc: "Charcoal-Grilled Chicken Inasal & Native Rice",
                rating: 4.7,
                reviews: 520,
                distance: "1.4 km",
                distanceNum: 1.4,
                eta: "15-25 mins",
                lat: 14.5600,
                lng: 121.0240,
                address: "Buendia Ave, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-fb2-1', name: "Chicken Inasal Pecho Large with Rice", price: 195, desc: "Charcoal-grilled marinated chicken breast and wing with chicken oil", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb2-2', name: "Pork BBQ with Rice (2 sticks)", price: 155, desc: "Sweet-savory pork skewers basted in rich barbecue glaze", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb2-3', name: "Palabok Special", price: 135, desc: "Rice noodles in rich golden shrimp sauce with tinapa and chicharon", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb2-4', name: "Extra Crema Halo-Halo", price: 110, desc: "Shaved ice with leche flan, ube, sweetened banana, and creamy milk", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-fb3',
                name: "Kuya J Restaurant",
                category: "Food & Beverage",
                cuisineDesc: "Filipino Comfort Dining & Crispy Pata",
                rating: 4.8,
                reviews: 310,
                distance: "2.8 km",
                distanceNum: 2.8,
                eta: "25-35 mins",
                lat: 14.5535,
                lng: 121.0450,
                address: "BGC 30th, Taguig",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-fb3-1', name: "Kuya J Crispy Pata (Regular)", price: 595, desc: "Deep-fried pork knuckle with crackling skin and tender meat", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb3-2', name: "Kare-Kareng Baka", price: 420, desc: "Tender beef shank in rich savory peanut sauce with native bagoong", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb3-3', name: "Sizzling Sisig with Egg", price: 260, desc: "Crisp seasoned pork cheeks and ears topped with fresh egg and chili", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb3-4', name: "Sinigang na Baboy", price: 340, desc: "Sour tamarind broth with pork belly chunks, kangkong, and radish", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-fb4',
                name: "Penong's Barbeque",
                category: "Food & Beverage",
                cuisineDesc: "Davao's Favorite Charcoal BBQ & Kinilaw",
                rating: 4.9,
                reviews: 440,
                distance: "1.7 km",
                distanceNum: 1.7,
                eta: "20-30 mins",
                lat: 14.5665,
                lng: 121.0130,
                address: "Tejeros, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-fb4-1', name: "Penong's Chicken BBQ with Rice", price: 175, desc: "Davao smoky grilled chicken marinated in native secret marinade", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb4-2', name: "Grilled Pork Liempo", price: 240, desc: "Thick-cut pork belly grilled over charcoal with calamansi dip", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb4-3', name: "Kinilaw na Tuna Special", price: 260, desc: "Fresh raw yellowfin tuna in spiced vinegar, ginger, and coconut cream", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fb4-4', name: "Sizzling Garlic Bangus", price: 295, desc: "Boneless milkfish topped with generous golden toasted garlic", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            }
        ],
        'Food and Supplements': [
            {
                id: 'store-fs1',
                name: "Healthy Options",
                category: "Food and Supplements",
                cuisineDesc: "Organic Groceries, Vitamins & Superfoods",
                rating: 4.9,
                reviews: 380,
                distance: "2.2 km",
                distanceNum: 2.2,
                eta: "20-30 mins",
                lat: 14.5510,
                lng: 121.0255,
                address: "Greenbelt 5, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-fs1-1', name: "Vitamin C 1000mg with Rose Hips (100 tabs)", price: 650, desc: "High-potency immune defense antioxidant supplement", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs1-2', name: "Raw Organic Apple Cider Vinegar (946ml)", price: 295, desc: "Unfiltered, unpasteurized vinegar containing the natural 'Mother'", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs1-3', name: "Organic Black Chia Seeds (454g)", price: 340, desc: "Superfood seeds rich in Omega-3, dietary fiber, and protein", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs1-4', name: "Plant Protein Powder Chocolate (1lb)", price: 980, desc: "20g organic pea and brown rice protein per serving", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-fs2',
                name: "GNC Live Well",
                category: "Food and Supplements",
                cuisineDesc: "Clinically Studied Nutrients & Performance",
                rating: 4.8,
                reviews: 240,
                distance: "2.7 km",
                distanceNum: 2.7,
                eta: "20-30 mins",
                lat: 14.5525,
                lng: 121.0270,
                address: "Glorietta 2, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-fs2-1', name: "Mega Men Daily Multivitamin (90 Caplets)", price: 1250, desc: "Clinically formulated multivitamin for men's vitality and health", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs2-2', name: "Women's Ultra Mega Multivitamin (90 Caplets)", price: 1250, desc: "Advanced nutrition blend for women's energy, skin, and bones", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs2-3', name: "Triple Strength Fish Oil 1000mg (60 Softgels)", price: 890, desc: "Purified EPA/DHA Omega-3 heart, brain, and joint support", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs2-4', name: "Melatonin 5mg Gummies (60 pcs)", price: 580, desc: "Natural strawberry sleep aid gummies for restful recovery", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-fs3',
                name: "Real Fresh Organics",
                category: "Food and Supplements",
                cuisineDesc: "Cold-Pressed Juices & Superfood Bowls",
                rating: 4.7,
                reviews: 160,
                distance: "1.9 km",
                distanceNum: 1.9,
                eta: "15-25 mins",
                lat: 14.5580,
                lng: 121.0320,
                address: "Salcedo Market, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-fs3-1', name: "Cold-Pressed Green Detox Juice (500ml)", price: 180, desc: "Kale, cucumber, green apple, celery, and ginger", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs3-2', name: "Immunity Booster Ginger Turmeric Shot (100ml)", price: 95, desc: "Fresh pressed native turmeric, ginger, cayenne, and lemon", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs3-3', name: "Acai Berry Superfood Smoothie Bowl", price: 280, desc: "Organic frozen acai topped with sliced banana, granola, and chia", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs3-4', name: "Wild Forest Raw Honey (350ml)", price: 320, desc: "100% pure unpasteurized wild honey from Philippine native bees", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-fs4',
                name: "SaladStop!",
                category: "Food and Supplements",
                cuisineDesc: "Fresh Gourmet Salads & Warm Protein Bowls",
                rating: 4.8,
                reviews: 410,
                distance: "3.0 km",
                distanceNum: 3.0,
                eta: "25-35 mins",
                lat: 14.5530,
                lng: 121.0480,
                address: "Bonifacio High Street, Taguig",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-fs4-1', name: "Hail Caesar Salad Bowl", price: 360, desc: "Romaine lettuce, grilled chicken breast, grated parmesan, croutons", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs4-2', name: "Oh Crab Lah! Warm Grain Bowl", price: 390, desc: "Crab sticks, vermicelli, cherry tomatoes, and Singapore chili crab dressing", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs4-3', name: "Tuna San Salad Wrap", price: 380, desc: "Seared tuna loin, romaine, avocado, mandarin oranges, and wasabi honey", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-fs4-4', name: "Spirulina Super Booster Smoothie", price: 210, desc: "Almond milk, banana, baby spinach, spirulina, and agave nectar", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            }
        ],
        'Sandwich': [
            {
                id: 'store-sw1',
                name: "Subway",
                category: "Sandwich",
                cuisineDesc: "Custom Fresh Subs & Fresh Baked Cookies",
                rating: 4.7,
                reviews: 390,
                distance: "1.3 km",
                distanceNum: 1.3,
                eta: "15-25 mins",
                lat: 14.5585,
                lng: 121.0220,
                address: "Makati Ave, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-sw1-1', name: "Italian B.M.T. Sub (6-inch)", price: 195, desc: "Genoa salami, spicy pepperoni, and black forest ham on toasted bread", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw1-2', name: "Subway Club Sub (6-inch)", price: 215, desc: "Sliced turkey breast, lean roast beef, and tender ham with choice of veggies", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw1-3', name: "Tuna Sub with Melted Cheese (6-inch)", price: 180, desc: "Flaked tuna blended with creamy mayo and crisp lettuce, pickles", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw1-4', name: "Chocolate Chip Cookie (3 pcs)", price: 110, desc: "Freshly baked soft cookies loaded with rich chocolate chips", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-sw2',
                name: "The Sandwich Guy",
                category: "Sandwich",
                cuisineDesc: "Healthy Hexagonal Whole Wheat Toasts",
                rating: 4.6,
                reviews: 260,
                distance: "1.8 km",
                distanceNum: 1.8,
                eta: "15-25 mins",
                lat: 14.5610,
                lng: 121.0160,
                address: "Chino Roces, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-sw2-1', name: "Ultimate Roast Beef Sandwich", price: 165, desc: "Tender seasoned roast beef with garlic mayo on whole wheat hexagonal toast", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw2-2', name: "Country Chicken Sandwich", price: 145, desc: "Grilled chicken breast, cheese, sliced tomatoes, and honey mustard", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw2-3', name: "Cheesy Bacon Sandwich", price: 155, desc: "Crispy smoked bacon strips, melted cheddar cheese, and fresh lettuce", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw2-4', name: "Cream of Mushroom Soup", price: 85, desc: "Warm creamy soup with chopped button mushrooms and herb croutons", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-sw3',
                name: "Earl of Sandwich",
                category: "Sandwich",
                cuisineDesc: "The World's Greatest Hot Gourmet Sandwiches",
                rating: 4.8,
                reviews: 320,
                distance: "2.5 km",
                distanceNum: 2.5,
                eta: "20-30 mins",
                lat: 14.5520,
                lng: 121.0515,
                address: "BGC High Street Central, Taguig",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-sw3-1', name: "The Original 1762 Hot Sandwich", price: 320, desc: "Warm roast beef, sharp cheddar, and horseradish sauce on artisan loaf", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw3-2', name: "Holiday Turkey Sandwich", price: 340, desc: "Roasted turkey, cornbread stuffing, cranberry sauce, and mayonnaise", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw3-3', name: "The Full Montagu", price: 325, desc: "Roast beef, turkey, Swiss cheese, cheddar, lettuce, and Earl's mustard", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw3-4', name: "Tomato & Mozzarella Warm Panini", price: 280, desc: "Fresh mozzarella, ripe tomatoes, basil, and balsamic reduction", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            },
            {
                id: 'store-sw4',
                name: "Army Navy Burger + Burrito",
                category: "Sandwich",
                cuisineDesc: "Classic Burgers, Gourmet Subs & Burritos",
                rating: 4.8,
                reviews: 490,
                distance: "2.1 km",
                distanceNum: 2.1,
                eta: "20-30 mins",
                lat: 14.5720,
                lng: 121.0210,
                address: "Circuit Makati, Makati",
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
                menu: [
                    { id: 'm-sw4-1', name: "Bully Boy Burger (Triple Patty)", price: 395, desc: "Three 100% quarter-pound beef patties with melted cheese and toasted sesame bun", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw4-2', name: "Classic Single Burger", price: 225, desc: "Quarter-pound beef patty with fresh lettuce, onions, and tomato", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw4-3', name: "Steak Burrito Special", price: 295, desc: "Tender beef steak strips, Spanish rice, refried beans, onions, and cilantro", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
                    { id: 'm-sw4-4', name: "Freedom Fries (Crispy Shoestring)", price: 115, desc: "Signature seasoned spiral-cut shoestring French fries", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
                ]
            }
        ]
    },

    init() {
        this.selectCraving('Chinese Cuisine');
    },

    selectCraving(cravingName) {
        this.selectedCraving = cravingName;
        document.querySelectorAll('#craving-choices-list .craving-card').forEach(card => {
            const isMatch = card.dataset.craving === cravingName;
            const check = card.querySelector('.craving-radio-check');
            if (isMatch) {
                card.className = "craving-card p-3 rounded-xl border border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/30 transition cursor-pointer flex items-center justify-between group shadow-sm";
                if (check) {
                    check.className = "craving-radio-check w-5 h-5 rounded-full bg-amber-500 border border-amber-500 flex items-center justify-center text-hirna-950 text-xs font-black transition";
                    check.innerHTML = `<svg class="w-3 h-3 text-hirna-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>`;
                }
            } else {
                card.className = "craving-card p-3 rounded-xl border border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/40 transition cursor-pointer flex items-center justify-between group shadow-xs";
                if (check) {
                    check.className = "craving-radio-check w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-white text-[10px] transition";
                    check.innerHTML = "";
                }
            }
        });
    },

    nextFromCraving() {
        if (!this.selectedCraving) {
            if (typeof App !== 'undefined') App.showToast("Please select what you are craving.", "warning");
            return;
        }

        const titleEl = document.getElementById('food-stores-craving-title');
        if (titleEl) titleEl.innerText = `Nearby ${this.selectedCraving}`;

        this.renderStoresList();
        this.goToFoodStep('stores');
        this.plotStoreMarkersOnMap();
    },

    renderStoresList() {
        const listEl = document.getElementById('food-stores-list');
        if (!listEl) return;

        const rawStores = this.storesData[this.selectedCraving] || [];
        const anchor = (typeof DeviceLocationManager !== 'undefined')
            ? DeviceLocationManager.getActiveAnchor()
            : { type: 'home', label: 'Home Address', name: 'Home Location, Mandaluyong City', lat: 14.5822, lng: 121.0545, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' };

        // Calculate dynamic distance and delivery estimates from active anchor (Home Address or Current Location)
        rawStores.forEach(store => {
            const distKm = BookingModule.calculateDistance(anchor.lat, anchor.lng, store.lat, store.lng);
            store.computedDist = distKm;
            store.computedDistStr = `${distKm.toFixed(1)} km`;
            const minEta = Math.max(10, Math.round(12 + distKm * 3.5));
            const maxEta = minEta + 10;
            store.computedEtaStr = `${minEta}-${maxEta} mins`;
            store.computedFee = Math.max(49, 49 + Math.round(Math.max(0, distKm - 2) * 10));
        });

        // Sort nearest stores first
        const stores = [...rawStores].sort((a, b) => a.computedDist - b.computedDist);

        const badgeEl = document.getElementById('food-stores-count-badge');
        if (badgeEl) badgeEl.innerText = `${stores.length} Stores Nearby`;

        const hintEl = document.getElementById('food-stores-origin-hint');
        if (hintEl) {
            if (anchor.type === 'current') {
                const accLabel = anchor.accuracy ? ` • ±${anchor.accuracy}m GPS` : ' • GPS Live';
                hintEl.innerHTML = `<span class="text-blue-600 font-bold">Origin: Current Location</span> <span class="text-[10px] text-blue-700 font-mono font-bold">(${accLabel.replace(' • ', '')})</span> • Sorted by nearest`;
            } else {
                const shortHome = (anchor.name || "Home Location").split(',')[0].trim();
                hintEl.innerHTML = `<span class="text-emerald-700 font-bold">Origin: Home Address</span> (${shortHome}) • Sorted by nearest`;
            }
        }

        listEl.innerHTML = stores.map(store => `
            <div id="store-card-${store.id}" onclick="FoodDeliveryModule.selectStore('${store.id}')" class="p-3 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 rounded-xl transition cursor-pointer shadow-xs group">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                        <div class="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                            ${store.icon}
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <h4 class="text-xs font-black text-slate-800 group-hover:text-amber-950">${store.name}</h4>
                                <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">${store.rating} Rating</span>
                            </div>
                            <p class="text-[10px] text-slate-500 mt-0.5 line-clamp-1">${store.cuisineDesc}</p>
                            <div class="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                                <span class="font-medium text-slate-600">ETA: ${store.computedEtaStr}</span>
                                <span>•</span>
                                <span class="font-medium text-slate-600">${store.computedDistStr}</span>
                                <span>•</span>
                                <span class="font-semibold text-emerald-600">₱${store.computedFee} Base Delivery</span>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="py-1 px-2.5 rounded-lg bg-amber-500 group-hover:bg-amber-400 text-hirna-950 text-[11px] font-black transition flex items-center space-x-1 shadow-xs flex-shrink-0 cursor-pointer">
                        <span>Menu</span>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>
        `).join('');
    },

    plotStoreMarkersOnMap() {
        this.clearStoreMarkers();
        if (!BookingModule.map || typeof L === 'undefined') return;

        const stores = this.storesData[this.selectedCraving] || [];
        if (stores.length === 0) return;

        const bounds = [];
        const anchor = (typeof DeviceLocationManager !== 'undefined')
            ? DeviceLocationManager.getActiveAnchor()
            : null;

        // Plot User's Origin Anchor (Current Location or Home Address)
        if (anchor && typeof anchor.lat === 'number' && typeof anchor.lng === 'number') {
            const isGps = anchor.type === 'current';
            const accText = anchor.accuracy ? ` (±${anchor.accuracy}m)` : '';
            const anchorPinHtml = `
                <div class="flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -100%);">
                    <div class="w-9 h-9 rounded-full ${isGps ? 'bg-blue-600' : 'bg-emerald-600'} text-white border-2 border-white flex items-center justify-center font-black text-sm shadow-xl">
                        ${isGps ? 'GPS' : 'Home'}
                    </div>
                    <div class="px-2 py-0.5 rounded-md bg-slate-900/95 text-white text-[9px] font-black whitespace-nowrap shadow-md -mt-1 border ${isGps ? 'border-blue-400' : 'border-emerald-400'}">
                        ${isGps ? `Your Location${accText}` : 'Home Address'}
                    </div>
                </div>
            `;
            const anchorIcon = L.divIcon({
                className: 'custom-food-origin-pin',
                html: anchorPinHtml,
                iconSize: [0, 0]
            });
            const anchorMarker = L.marker([anchor.lat, anchor.lng], { icon: anchorIcon }).addTo(BookingModule.map);
            anchorMarker.bindPopup(`
                <div class="p-1 space-y-1 text-slate-800">
                    <div class="font-black text-xs ${isGps ? 'text-blue-700' : 'text-emerald-700'}">${anchor.label}</div>
                    <div class="text-[10px] text-slate-600">${anchor.name}</div>
                    ${isGps ? `<div class="text-[9px] text-blue-600 font-mono font-bold">Accuracy: ±${anchor.accuracy || 10}m (GNSS Satellite Lock)</div>` : ''}
                    <div class="text-[9px] text-slate-400">Stores nearby are calculated from this reference point.</div>
                </div>
            `);
            this.storeMarkers.push(anchorMarker);
            bounds.push([anchor.lat, anchor.lng]);

            // If GPS, also plot accuracy confidence circle on map
            if (isGps && anchor.accuracy) {
                const accCircle = L.circle([anchor.lat, anchor.lng], {
                    radius: Math.max(15, anchor.accuracy),
                    color: '#2563eb',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    dashArray: '4, 4'
                }).addTo(BookingModule.map);
                this.storeMarkers.push(accCircle);
            }
        }

        stores.forEach(store => {
            const distLabel = store.computedDistStr || store.distance;
            const etaLabel = store.computedEtaStr || store.eta;
            const pinHtml = `
                <div class="store-map-pin flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -100%);">
                    <div class="w-9 h-9 rounded-2xl bg-amber-500 text-white border-2 border-white flex items-center justify-center font-black text-base shadow-xl group-hover:scale-110 transition">
                        ${store.icon}
                    </div>
                    <div class="px-2 py-0.5 rounded-md bg-slate-900/95 text-white text-[9px] font-black whitespace-nowrap shadow-md -mt-1 border border-amber-400">
                        ${store.name}
                    </div>
                </div>
            `;
            const icon = L.divIcon({
                className: 'custom-food-store-pin',
                html: pinHtml,
                iconSize: [0, 0]
            });
            const marker = L.marker([store.lat, store.lng], { icon }).addTo(BookingModule.map);
            marker.bindPopup(`
                <div class="p-1 space-y-1 text-slate-800">
                    <div class="font-black text-xs text-amber-900 flex items-center justify-between">
                        <span>${store.name}</span>
                        <span class="text-amber-600 font-bold">${store.rating} Rating</span>
                    </div>
                    <div class="text-[10px] text-slate-500">${store.address}</div>
                    <div class="text-[10px] text-slate-600 font-medium">Est. Delivery: ${etaLabel} • ${distLabel}</div>
                    <button type="button" onclick="FoodDeliveryModule.selectStore('${store.id}')" class="mt-1.5 w-full py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-hirna-950 font-black text-xs shadow-xs transition cursor-pointer">
                        View Menu & Order
                    </button>
                </div>
            `);
            this.storeMarkers.push(marker);
            bounds.push([store.lat, store.lng]);
        });

        if (bounds.length > 0) {
            try {
                BookingModule.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            } catch(e) {}
        }
    },

    clearStoreMarkers() {
        if (this.storeMarkers && this.storeMarkers.length > 0) {
            this.storeMarkers.forEach(m => {
                try {
                    if (BookingModule.map && BookingModule.map.hasLayer(m)) {
                        BookingModule.map.removeLayer(m);
                    }
                } catch(e) {}
            });
            this.storeMarkers = [];
        }
    },

    clearMapArtifacts() {
        this.clearStoreMarkers();
        if (this.foodRouteLine) {
            try {
                if (BookingModule.map && BookingModule.map.hasLayer(this.foodRouteLine)) {
                    BookingModule.map.removeLayer(this.foodRouteLine);
                }
            } catch(e) {}
            this.foodRouteLine = null;
        }
        if (this.foodStoreMarker) {
            try {
                if (BookingModule.map && BookingModule.map.hasLayer(this.foodStoreMarker)) {
                    BookingModule.map.removeLayer(this.foodStoreMarker);
                }
            } catch(e) {}
            this.foodStoreMarker = null;
        }
        if (this.foodDropoffMarker) {
            try {
                if (BookingModule.map && BookingModule.map.hasLayer(this.foodDropoffMarker)) {
                    BookingModule.map.removeLayer(this.foodDropoffMarker);
                }
            } catch(e) {}
            this.foodDropoffMarker = null;
        }
    },

    selectStore(storeId) {
        const stores = this.storesData[this.selectedCraving] || [];
        const store = stores.find(s => s.id === storeId);
        if (!store) return;

        // If user is switching to a different store and cart already has items, prompt or clear
        if (this.selectedStore && this.selectedStore.id !== store.id && this.cart.length > 0) {
            if (!confirm(`Your cart contains items from ${this.selectedStore.name}. Create a new order from ${store.name}?`)) {
                return;
            }
            this.cart = [];
        }

        this.selectedStore = store;
        this.goToFoodStep('menu');
        this.renderMenu();

        // Focus map on this selected store
        if (BookingModule.map) {
            this.clearStoreMarkers();
            const storePin = L.divIcon({
                className: 'custom-pin',
                html: `<div class="w-9 h-9 rounded-2xl bg-amber-500 text-hirna-950 border-2 border-white flex items-center justify-center font-black text-base shadow-xl"></div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36]
            });
            if (this.foodStoreMarker && BookingModule.map.hasLayer(this.foodStoreMarker)) {
                BookingModule.map.removeLayer(this.foodStoreMarker);
            }
            this.foodStoreMarker = L.marker([store.lat, store.lng], { icon: storePin }).addTo(BookingModule.map);
            this.foodStoreMarker.bindPopup(`<b>${store.name}</b><br><span class="text-xs text-slate-500">${store.address}</span>`).openPopup();
            BookingModule.map.setView([store.lat, store.lng], 15);
        }
    },

    renderMenu() {
        if (!this.selectedStore) return;
        const store = this.selectedStore;

        const nameEl = document.getElementById('food-menu-store-name');
        const ratingEl = document.getElementById('food-menu-store-rating');
        const addrEl = document.getElementById('food-menu-store-address');
        const etaEl = document.getElementById('food-menu-store-eta');
        const distEl = document.getElementById('food-menu-store-distance');

        if (nameEl) nameEl.innerText = store.name;
        if (ratingEl) ratingEl.innerText = `${store.rating} Rating (${store.reviews})`;
        if (addrEl) addrEl.innerText = store.address;
        if (etaEl) etaEl.innerText = `ETA: ${store.computedEtaStr || store.eta}`;
        if (distEl) distEl.innerText = `${store.computedDistStr || store.distance}`;

        const menuList = document.getElementById('food-menu-items-list');
        if (menuList) {
            menuList.innerHTML = (store.menu || []).map(item => `
                <div onclick="FoodDeliveryModule.openQuantityModal('${item.id}')" class="p-3 bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-amber-400 rounded-xl transition cursor-pointer flex items-center justify-between group shadow-xs">
                    <div class="flex items-start space-x-3 pr-2 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition">
                            ${item.icon || ''}
                        </div>
                        <div class="min-w-0">
                            <h5 class="text-xs font-black text-slate-800 group-hover:text-amber-950 truncate">${item.name}</h5>
                            <p class="text-[10px] text-slate-500 mt-0.5 line-clamp-2">${item.desc}</p>
                            <span class="text-xs font-black text-amber-600 font-mono mt-1 block">₱${item.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <button type="button" class="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-hirna-950 text-xs font-black shadow-xs transition flex items-center space-x-1 flex-shrink-0 cursor-pointer active:scale-95">
                        <span>+</span>
                        <span>Add</span>
                    </button>
                </div>
            `).join('');
        }

        this.updateCartBadge();
    },

    addToCart(itemId, qty = 1) {
        if (!this.selectedStore) return;
        const item = (this.selectedStore.menu || []).find(m => m.id === itemId);
        if (!item) return;
        const existing = this.cart.find(x => x.id === item.id);
        if (existing) {
            existing.qty += qty;
        } else {
            this.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: qty,
                notes: '',
                icon: item.icon
            });
        }
        this.updateCartBadge();
    },

    openQuantityModal(itemId) {
        if (!this.selectedStore) return;
        const item = (this.selectedStore.menu || []).find(m => m.id === itemId);
        if (!item) return;

        this.modalItem = item;
        this.modalQty = 1;

        const iconEl = document.getElementById('food-modal-icon');
        const titleEl = document.getElementById('food-modal-title');
        const descEl = document.getElementById('food-modal-desc');
        const priceEl = document.getElementById('food-modal-price');
        const qtyEl = document.getElementById('food-modal-qty');
        const subtotalEl = document.getElementById('food-modal-subtotal');
        const notesEl = document.getElementById('food-modal-notes');

        if (iconEl) iconEl.innerText = item.icon || '';
        if (titleEl) titleEl.innerText = item.name;
        if (descEl) descEl.innerText = item.desc;
        if (priceEl) priceEl.innerText = `₱${item.price.toFixed(2)} each`;
        if (qtyEl) qtyEl.value = '1';
        if (subtotalEl) subtotalEl.innerText = `₱${item.price.toFixed(2)}`;
        if (notesEl) notesEl.value = '';

        const modal = document.getElementById('food-quantity-modal');
        if (modal) modal.classList.remove('hidden');
    },

    closeQuantityModal() {
        const modal = document.getElementById('food-quantity-modal');
        if (modal) modal.classList.add('hidden');
        this.modalItem = null;
        this.modalQty = 1;
    },

    updateModalQty(delta) {
        if (!this.modalItem) return;
        this.modalQty = Math.max(1, this.modalQty + delta);
        const qtyEl = document.getElementById('food-modal-qty');
        if (qtyEl) qtyEl.value = this.modalQty;
        const subtotalEl = document.getElementById('food-modal-subtotal');
        if (subtotalEl) subtotalEl.innerText = `₱${(this.modalItem.price * this.modalQty).toFixed(2)}`;
    },

    handleModalQtyInput(val) {
        if (!this.modalItem) return;
        const n = parseInt(val, 10);
        this.modalQty = (!isNaN(n) && n >= 1) ? n : 1;
        const subtotalEl = document.getElementById('food-modal-subtotal');
        if (subtotalEl) subtotalEl.innerText = `₱${(this.modalItem.price * this.modalQty).toFixed(2)}`;
    },

    confirmAddToCart() {
        if (!this.modalItem) return;
        const notes = document.getElementById('food-modal-notes')?.value.trim() || '';

        const existing = this.cart.find(x => x.id === this.modalItem.id && (x.notes || '') === notes);
        if (existing) {
            existing.qty += this.modalQty;
        } else {
            this.cart.push({
                id: this.modalItem.id,
                name: this.modalItem.name,
                price: this.modalItem.price,
                qty: this.modalQty,
                notes: notes,
                icon: this.modalItem.icon
            });
        }

        const addedQty = this.modalQty;
        const addedName = this.modalItem.name;

        this.closeQuantityModal();
        this.updateCartBadge();

        if (typeof App !== 'undefined') {
            App.showToast(`Added ${addedQty}x ${addedName} to cart!`, "success");
        }
    },

    updateCartBadge() {
        const count = this.cart.reduce((s, i) => s + i.qty, 0);
        const subtotal = this.cart.reduce((s, i) => s + (i.price * i.qty), 0);

        const btnLabel = document.getElementById('food-menu-cart-btn-label');
        if (btnLabel) btnLabel.innerText = `Cart (${count})`;

        const bar = document.getElementById('food-cart-bar');
        const barCount = document.getElementById('food-cart-bar-count');
        const barTotal = document.getElementById('food-cart-bar-total');

        if (bar) {
            if (count > 0 && this.currentStep === 'menu') {
                bar.classList.remove('hidden');
                if (barCount) barCount.innerText = `${count} item${count > 1 ? 's' : ''} in cart`;
                if (barTotal) barTotal.innerText = `₱${subtotal.toFixed(2)}`;
            } else {
                bar.classList.add('hidden');
            }
        }
    },

    goToFoodStep(stepName) {
        ['craving', 'stores', 'menu', 'cart', 'checkout'].forEach(s => {
            const el = document.getElementById('food-step-' + s);
            if (el) el.classList.toggle('hidden', s !== stepName);
        });

        this.currentStep = stepName;

        if (stepName === 'cart') {
            this.renderCart();
        } else if (stepName === 'checkout') {
            this.renderCheckout();
        } else if (stepName === 'menu') {
            this.updateCartBadge();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderCart() {
        const storeNameEl = document.getElementById('food-cart-store-name');
        if (storeNameEl) storeNameEl.innerText = this.selectedStore ? this.selectedStore.name : 'Selected Store';

        const listEl = document.getElementById('food-cart-items-list');
        const subtotalEl = document.getElementById('food-cart-subtotal');
        const totalEl = document.getElementById('food-cart-total');

        if (!listEl) return;

        if (this.cart.length === 0) {
            listEl.innerHTML = `
                <div class="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div class="text-xs font-bold text-slate-400">Empty Cart</div>
                    <div class="font-bold text-slate-700">Your cart is empty</div>
                    <p class="text-[11px] text-slate-400">Head back to the menu to add delicious meals!</p>
                </div>
            `;
            if (subtotalEl) subtotalEl.innerText = "₱0.00";
            if (totalEl) totalEl.innerText = "₱0.00";
            return;
        }

        const subtotal = this.cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const packagingFee = 15.00;
        const cartTotal = subtotal + packagingFee;

        listEl.innerHTML = this.cart.map((item, idx) => `
            <div class="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div class="flex items-start justify-between">
                    <div class="min-w-0 pr-2">
                        <div class="text-xs font-black text-slate-800 truncate">${item.name}</div>
                        ${item.notes ? `<div class="text-[10px] text-amber-700 italic">Note: ${item.notes}</div>` : ''}
                        <div class="text-[11px] font-mono font-bold text-amber-600">₱${item.price.toFixed(2)} each</div>
                    </div>
                    <button type="button" onclick="FoodDeliveryModule.removeCartItem(${idx})" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Remove item">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
                <div class="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div class="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                        <button type="button" onclick="FoodDeliveryModule.updateCartItemQty(${idx}, -1)" class="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition cursor-pointer select-none">−</button>
                        <input type="number" min="1" max="99" value="${item.qty}" onchange="FoodDeliveryModule.setCartItemQty(${idx}, this.value)" class="w-10 text-center text-xs font-mono font-bold bg-transparent border-0 focus:outline-hidden text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                        <button type="button" onclick="FoodDeliveryModule.updateCartItemQty(${idx}, 1)" class="w-6 h-6 rounded bg-amber-500 hover:bg-amber-400 text-hirna-950 font-bold text-xs flex items-center justify-center transition cursor-pointer select-none">+</button>
                    </div>
                    <div class="text-xs font-black text-slate-900 font-mono">
                        ₱${(item.price * item.qty).toFixed(2)}
                    </div>
                </div>
            </div>
        `).join('');

        if (subtotalEl) subtotalEl.innerText = `₱${subtotal.toFixed(2)}`;
        if (totalEl) totalEl.innerText = `₱${cartTotal.toFixed(2)}`;
    },

    updateCartItemQty(idx, delta) {
        if (!this.cart[idx]) return;
        this.cart[idx].qty += delta;
        if (this.cart[idx].qty <= 0) {
            this.cart.splice(idx, 1);
        }
        this.renderCart();
        this.updateCartBadge();
    },

    setCartItemQty(idx, val) {
        if (!this.cart[idx]) return;
        const n = parseInt(val, 10);
        if (isNaN(n) || n <= 0) {
            this.removeCartItem(idx);
            return;
        }
        this.cart[idx].qty = n;
        this.renderCart();
        this.updateCartBadge();
    },

    removeCartItem(idx) {
        this.cart.splice(idx, 1);
        this.renderCart();
        this.updateCartBadge();
        if (typeof App !== 'undefined') App.showToast("Item removed from cart.", "info");
    },

    clearCart() {
        if (this.cart.length === 0) return;
        if (!confirm("Are you sure you want to clear your cart?")) return;
        this.cart = [];
        this.renderCart();
        this.updateCartBadge();
        if (typeof App !== 'undefined') App.showToast("Cart cleared.", "info");
    },

    proceedToCheckout() {
        if (this.cart.length === 0) {
            if (typeof App !== 'undefined') App.showToast("Your cart is empty. Please add items before proceeding.", "warning");
            return;
        }
        this.goToFoodStep('checkout');
    },

    renderCheckout() {
        const storeBadge = document.getElementById('food-checkout-store-badge');
        if (storeBadge) storeBadge.innerText = this.selectedStore ? this.selectedStore.name : 'Selected Store';

        const subtotal = this.cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const itemPriceEl = document.getElementById('food-checkout-item-price');
        if (itemPriceEl) itemPriceEl.innerText = `₱${subtotal.toFixed(2)}`;

        // If dropoff is already filled, recalculate
        if (this.dropoffCoords) {
            this.setFoodDropoff(this.dropoffCoords[0], this.dropoffCoords[1], this.dropoffName);
        } else {
            const routeInfoEl = document.getElementById('food-checkout-route-info');
            const deliveryPriceEl = document.getElementById('food-checkout-delivery-price');
            const totalEl = document.getElementById('food-checkout-total-price');

            if (routeInfoEl) routeInfoEl.innerText = "Select delivery dropoff address below to plot route & calculate delivery fare";
            if (deliveryPriceEl) deliveryPriceEl.innerText = "₱0.00";
            if (totalEl) totalEl.innerText = `₱${(subtotal + 15).toFixed(2)}`;
        }
    },

    setFoodDropoff(lat, lng, name) {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (isNaN(lat) || isNaN(lng)) return;

        this.dropoffCoords = [lat, lng];
        this.dropoffName = name || 'Dropoff Location';

        const input = document.getElementById('food-dropoff-input');
        if (input) input.value = this.dropoffName;
        if (BookingModule.updateClearBtnVisibility) {
            BookingModule.updateClearBtnVisibility('food-dropoff-input');
        }

        if (!this.selectedStore) return;

        const distKm = BookingModule.calculateDistance(this.selectedStore.lat, this.selectedStore.lng, lat, lng);
        const deliveryFee = Math.max(49, 49 + Math.round(distKm * 12));
        this.deliveryPrice = deliveryFee;

        const subtotal = this.cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const packagingFee = 15.00;
        const totalAmount = subtotal + deliveryFee + packagingFee;
        const etaMin = Math.round(distKm * 3.5 + 12);

        const routeInfoEl = document.getElementById('food-checkout-route-info');
        const deliveryPriceEl = document.getElementById('food-checkout-delivery-price');
        const totalEl = document.getElementById('food-checkout-total-price');

        if (routeInfoEl) {
            routeInfoEl.innerText = `Distance: ${distKm.toFixed(1)} km from ${this.selectedStore.name} • Est. ${etaMin} mins courier travel`;
        }
        if (deliveryPriceEl) deliveryPriceEl.innerText = `₱${deliveryFee.toFixed(2)}`;
        if (totalEl) totalEl.innerText = `₱${totalAmount.toFixed(2)}`;

        this.drawFoodRoute(lat, lng, this.dropoffName);
    },

    clearFoodDropoff() {
        this.dropoffCoords = null;
        this.dropoffName = '';
        this.deliveryPrice = 0;

        if (this.foodDropoffMarker && BookingModule.map && BookingModule.map.hasLayer(this.foodDropoffMarker)) {
            BookingModule.map.removeLayer(this.foodDropoffMarker);
            this.foodDropoffMarker = null;
        }
        if (this.foodRouteLine && BookingModule.map && BookingModule.map.hasLayer(this.foodRouteLine)) {
            BookingModule.map.removeLayer(this.foodRouteLine);
            this.foodRouteLine = null;
        }

        const subtotal = this.cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const routeInfoEl = document.getElementById('food-checkout-route-info');
        const deliveryPriceEl = document.getElementById('food-checkout-delivery-price');
        const totalEl = document.getElementById('food-checkout-total-price');

        if (routeInfoEl) routeInfoEl.innerText = "Select delivery dropoff address below to plot route & calculate delivery fare";
        if (deliveryPriceEl) deliveryPriceEl.innerText = "₱0.00";
        if (totalEl) totalEl.innerText = `₱${(subtotal + 15).toFixed(2)}`;
    },

    drawFoodRoute(dropLat, dropLng, dropName) {
        if (!BookingModule.map || typeof L === 'undefined' || !this.selectedStore) return;

        // 1. Remove previous layers
        if (this.foodRouteLine && BookingModule.map.hasLayer(this.foodRouteLine)) {
            BookingModule.map.removeLayer(this.foodRouteLine);
            this.foodRouteLine = null;
        }
        if (this.foodStoreMarker && BookingModule.map.hasLayer(this.foodStoreMarker)) {
            BookingModule.map.removeLayer(this.foodStoreMarker);
            this.foodStoreMarker = null;
        }
        if (this.foodDropoffMarker && BookingModule.map.hasLayer(this.foodDropoffMarker)) {
            BookingModule.map.removeLayer(this.foodDropoffMarker);
            this.foodDropoffMarker = null;
        }

        // 2. Place Store Marker
        const storePin = L.divIcon({
            className: 'custom-pin',
            html: `<div class="w-8 h-8 rounded-full bg-amber-500 text-hirna-950 flex items-center justify-center font-bold text-base shadow-lg border-2 border-white"></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
        this.foodStoreMarker = L.marker([this.selectedStore.lat, this.selectedStore.lng], { icon: storePin }).addTo(BookingModule.map);
        this.foodStoreMarker.bindPopup(`<b>${this.selectedStore.name}</b><br><span class="text-xs text-slate-500">Order Origin (Store)</span>`).openPopup();

        // 3. Place Dropoff Marker
        const dropPin = L.divIcon({
            className: 'custom-pin',
            html: `<div class="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow-lg border-2 border-white"></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
        this.foodDropoffMarker = L.marker([dropLat, dropLng], { icon: dropPin }).addTo(BookingModule.map);
        this.foodDropoffMarker.bindPopup(`<b>Delivery Dropoff:</b><br>${dropName}`);

        // 4. Draw route line (OSRM driving route)
        const url = `https://router.project-osrm.org/route/v1/driving/${this.selectedStore.lng},${this.selectedStore.lat};${dropLng},${dropLat}?overview=full&geometries=geojson`;
        fetch(url)
            .then(r => r.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    if (this.foodRouteLine && BookingModule.map.hasLayer(this.foodRouteLine)) {
                        BookingModule.map.removeLayer(this.foodRouteLine);
                    }
                    this.foodRouteLine = L.polyline(coords, {
                        color: '#f59e0b',
                        weight: 5,
                        opacity: 0.9,
                        dashArray: '8, 8',
                        lineJoin: 'round'
                    }).addTo(BookingModule.map);
                    BookingModule.map.fitBounds(this.foodRouteLine.getBounds(), { padding: [60, 60] });
                } else {
                    this.drawFallbackRoute(dropLat, dropLng);
                }
            })
            .catch(() => this.drawFallbackRoute(dropLat, dropLng));
    },

    drawFallbackRoute(dropLat, dropLng) {
        if (!BookingModule.map || typeof L === 'undefined' || !this.selectedStore) return;
        const coords = [
            [this.selectedStore.lat, this.selectedStore.lng],
            [dropLat, dropLng]
        ];
        if (this.foodRouteLine && BookingModule.map.hasLayer(this.foodRouteLine)) {
            BookingModule.map.removeLayer(this.foodRouteLine);
        }
        this.foodRouteLine = L.polyline(coords, {
            color: '#f59e0b',
            weight: 4,
            opacity: 0.8,
            dashArray: '6, 6'
        }).addTo(BookingModule.map);
        BookingModule.map.fitBounds(this.foodRouteLine.getBounds(), { padding: [60, 60] });
    },

    confirmOrder() {
        return this.confirmFoodOrder();
    },

    confirmFoodOrder() {
        if (!this.selectedStore) {
            if (typeof App !== 'undefined') App.showToast("Please select a store first.", "warning");
            return;
        }
        if (this.cart.length === 0) {
            if (typeof App !== 'undefined') App.showToast("Your cart is empty. Please add items before placing order.", "warning");
            return;
        }
        if (!this.dropoffCoords || !this.dropoffName) {
            if (typeof App !== 'undefined') App.showToast("Please specify a delivery dropoff address.", "warning");
            document.getElementById('food-dropoff-input')?.focus();
            return;
        }

        const bName = document.getElementById('food-booker-name')?.value.trim();
        const bPhone = document.getElementById('food-booker-phone')?.value.trim();

        if (!bName) {
            if (typeof App !== 'undefined') App.showToast("Please enter the Booker's name.", "warning");
            document.getElementById('food-booker-name')?.focus();
            return;
        }
        if (!bPhone) {
            if (typeof App !== 'undefined') App.showToast("Please enter the Booker's contact number.", "warning");
            document.getElementById('food-booker-phone')?.focus();
            return;
        }

        // Save contact to Booker History for future autofill
        ContactHistoryManager.addBooker(bName, bPhone);

        // Save dropoff address to recent places
        SavedAddressManager.addRecent({
            name: this.dropoffName,
            lat: this.dropoffCoords[0],
            lng: this.dropoffCoords[1],
            icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
        });

        const paymentMethod = document.querySelector('input[name="food-payment-method"]:checked')?.value || "Cash on Delivery (COD)";
        const notes = document.getElementById('food-delivery-notes')?.value.trim() || '';

        const distKm = BookingModule.calculateDistance(this.selectedStore.lat, this.selectedStore.lng, this.dropoffCoords[0], this.dropoffCoords[1]);
        const deliveryFee = this.deliveryPrice || Math.max(49, 49 + Math.round(distKm * 12));
        const subtotal = this.cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const totalFare = subtotal + deliveryFee + 15.00;
        const bookingCode = `HIRNA-FOOD-${Date.now().toString().slice(-6)}`;

        // Assign a dedicated motorcycle courier (scooter or manual 125cc-175cc)
        const allDrivers = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData('drivers')) || [];
        const motoDrivers = allDrivers.filter(d => 
            d.vehicle_type === 'scooter' || d.vehicle_type === 'manual' || 
            (d.vehicle_model && (d.vehicle_model.includes('NMAX') || d.vehicle_model.includes('Click') || d.vehicle_model.includes('Wave') || d.vehicle_model.includes('Aerox') || d.vehicle_model.includes('Sniper') || d.vehicle_model.includes('ADV')))
        );
        const driver = motoDrivers.length > 0 
            ? motoDrivers[Math.floor(Math.random() * motoDrivers.length)]
            : { name: 'Jomar Reyes', vehicle_plate: 'MC-4412', vehicle_model: 'Honda Click 125i (Pearl White)', vehicle_class: 'Scooter (125cc)' };

        const newFoodBooking = {
            id: `b-${Date.now()}`,
            booking_code: bookingCode,
            service_type: 'food',
            passenger_name: bName,
            passenger_phone: bPhone,
            driver_name: driver.name,
            vehicle_plate: driver.vehicle_plate,
            vehicle_model: driver.vehicle_model || 'Hirna Food Delivery Courier',
            vehicle_class: 'Food Courier Express',
            pickup: `${this.selectedStore.name} (${this.selectedStore.address})`,
            pickup_coords: [this.selectedStore.lat, this.selectedStore.lng],
            dropoff: this.dropoffName,
            dropoff_coords: this.dropoffCoords,
            distance_km: parseFloat(distKm.toFixed(2)),
            duration_min: Math.round(distKm * 3.5 + 12),
            base_fare: 49,
            distance_fare: Math.max(0, deliveryFee - 49),
            time_fare: 0,
            surge_multiplier: 1.0,
            surge_reason: 'Normal Food Demand',
            total_fare: totalFare,
            payment_method: paymentMethod,
            payment_status: "pending",
            status: "dispatched",
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            safety_score: 99
        };

        if (typeof SupabaseBridge !== 'undefined') {
            SupabaseBridge.insert('bookings', newFoodBooking);
        }

        // Start real-time trip simulation on the map with active HUD
        BookingModule.startTripSimulation(newFoodBooking);

        // Reset food module
        this.cart = [];
        this.dropoffCoords = null;
        this.dropoffName = '';
        const dInput = document.getElementById('food-dropoff-input');
        if (dInput) dInput.value = '';
        this.goToFoodStep('craving');
        BookingModule.renderHistory();
    },

    onLocationChanged() {
        if (this.currentStep === 'stores') {
            this.renderStoresList();
            this.plotStoreMarkersOnMap();
        } else if (this.currentStep === 'menu') {
            this.renderMenu();
        }
    },

    syncLayout() {
        this.goToFoodStep(this.currentStep || 'craving');
    }
};

const BookingModule = {
    map: null,
    pickupMarker: null,
    dropoffMarker: null,
    routeLine: null,
    currentQuote: null,
    activeService: 'transport', // 'transport', 'parcel', 'food', 'mart'
    currentStep: 1, // 1 or 2
    serviceSteps: { transport: 1, parcel: 1, mart: 1 },

    // Form states (start blank)
    pickupCoords: null,
    dropoffCoords: null,
    pickupName: '',
    dropoffName: '',

    // Interactive map selection state (disabled by default)
    mapClickTargetInputId: null, // Set only when "Click on a location" is active
    pendingGPSInputId: null, // Set when waiting for GPS permission confirmation
    osmSearchCache: {}, // In-memory cache for OpenStreetMap Nominatim searches
    osmReverseCache: {}, // In-memory cache for reverse geocoded landmarks
    parcelPaymentTiming: 'pickup', // 'pickup' or 'dropoff'
    parcelPaymentMethod: 'GCash',
    bookerName: '',
    bookerPhone: '',
    recipientName: '',
    recipientPhone: '',

    // Standard passenger specific state (start blank)
    passengerName: '',
    passengerPhone: '',
    stdPaymentMethod: 'GCash',

    getIconSvg(icon) {
        if (!icon) return `<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
        if (typeof icon === 'string' && icon.startsWith('<')) return icon;

        const defaultSvg = `<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;

        const map = {
            'star': `<svg class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
            'home': `<svg class="w-3.5 h-3.5 text-gold-700" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
            'time': `<svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            'pin': defaultSvg,
            'dropoff': `<svg class="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>`,
            'target': `<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>`,
            'mall': `<svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`,
            'residential': `<svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
            'airport': `<svg class="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`,
            'bus': `<svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`,
            'landmark': `<svg class="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>`,
            'park': `<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`,
            'school': `<svg class="w-3.5 h-3.5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,
            'hospital': `<svg class="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
            'road': `<svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>`,
            'food': `<svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
        };
        return map[icon] || defaultSvg;
    },

    serviceOptions: {
        transport: [
            { id: "Motorcycle (1-Passenger)", title: "Hirna Moto", desc: "1-Passenger Motorcycle", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-lg"></div>`, default: true },
            { id: "Sedan (4-Seater)", title: "Hirna Taxi", desc: "4-Seater Sedan", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg></div>` },
            { id: "MPV (6-Seater)", title: "Hirna MPV", desc: "6-Seater Innova", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg></div>` }
        ],
        parcel: [
            { id: "Document Pouch (<1kg)", title: "Express Document", desc: "Small Pouch <1kg", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>`, default: true },
            { id: "Medium Box (<10kg)", title: "Medium Package", desc: "Box up to 10kg", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>` },
            { id: "Cargo / Large Crate", title: "Heavy Freight", desc: "Crate up to 30kg", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg></div>` }
        ],
        food: [
            { id: "Standard Food Delivery", title: "Hirna Food", desc: "Restaurant Meals", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></div>`, default: true },
            { id: "Express Priority Food", title: "Priority Meal", desc: "Direct Express Dash", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>` }
        ],
        mart: [
            { id: "Mart Express Concierge", title: "Hirna Mart", desc: "Grocery & Essentials", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>`, default: true },
            { id: "Bulk Grocery Runner", title: "Pantry Restock", desc: "Bulk Shopping Van", icon: `<div class="w-7 h-7 mx-auto mb-1 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg></div>` }
        ]
    },

    // Comprehensive Philippine Landmark & Mall Presets for Autocomplete
    presets: [
        // SM Malls - Greater Manila, Bulacan & Key Provinces
        { name: "SM City San Jose del Monte", city: "San Jose del Monte, Bulacan", lat: 14.7857, lng: 121.0758, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM Fairview, Quezon City", city: "Quezon City", lat: 14.7344, lng: 121.0583, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM Megamall, Ortigas, Pasig", city: "Mandaluyong / Pasig", lat: 14.5843, lng: 121.0567, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM Mall of Asia, Pasay", city: "Pasay City", lat: 14.5353, lng: 120.9829, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM North EDSA, Quezon City", city: "Quezon City", lat: 14.6565, lng: 121.0287, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Grand Central, Caloocan", city: "Caloocan City", lat: 14.6547, lng: 120.9839, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Marilao, Bulacan", city: "Marilao, Bulacan", lat: 14.7621, lng: 120.9614, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City San Mateo, Rizal", city: "San Mateo, Rizal", lat: 14.6946, lng: 121.1215, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Taytay, Rizal", city: "Taytay, Rizal", lat: 14.5619, lng: 121.1342, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Bacoor, Cavite", city: "Bacoor, Cavite", lat: 14.4593, lng: 120.9419, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Dasmariñas, Cavite", city: "Dasmariñas, Cavite", lat: 14.3015, lng: 120.9575, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Santa Rosa, Laguna", city: "Santa Rosa, Laguna", lat: 14.3135, lng: 121.0978, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Clark, Pampanga", city: "Angeles City, Pampanga", lat: 15.1685, lng: 120.5794, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Baguio, Benguet", city: "Baguio City", lat: 16.4087, lng: 120.5997, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Davao, Ecoland", city: "Davao City", lat: 7.0504, lng: 125.5947, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM Lanang Premier, Davao", city: "Davao City", lat: 7.0988, lng: 125.6322, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM Seaside City Cebu", city: "Cebu City", lat: 10.2818, lng: 123.8812, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Cebu, North Reclamation", city: "Cebu City", lat: 10.3117, lng: 123.9184, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM CDO Downtown Premier", city: "Cagayan de Oro", lat: 8.4842, lng: 124.6517, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM Aura Premier, BGC, Taguig", city: "Taguig", lat: 14.5469, lng: 121.0543, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM City Manila, Ermita", city: "Manila", lat: 14.5902, lng: 120.9832, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM Southmall, Las Piñas", city: "Las Piñas", lat: 14.4343, lng: 121.0108, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM San Lazaro, Sta. Cruz", city: "Manila", lat: 14.6190, lng: 120.9866, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "SM Marikina, Marcos Highway", city: "Marikina City", lat: 14.6267, lng: 121.0847, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },

        // Commercial Centers & Bulacan / Metro Hubs
        { name: "Starmall San Jose Del Monte", city: "San Jose del Monte, Bulacan", lat: 14.7937, lng: 121.0792, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "Tungkong Mangga (Tungko), SJDM", city: "San Jose del Monte, Bulacan", lat: 14.7865, lng: 121.0745, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Ayala Malls Circuit, Makati", city: "Makati City", lat: 14.5758, lng: 121.0183, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Bonifacio High Street, BGC", city: "Taguig", lat: 14.5517, lng: 121.0509, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Greenbelt 5, Ayala Center, Makati", city: "Makati City", lat: 14.5524, lng: 121.0205, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Glorietta, Ayala Center, Makati", city: "Makati City", lat: 14.5508, lng: 121.0261, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Trinoma Mall, North Avenue, QC", city: "Quezon City", lat: 14.6534, lng: 121.0336, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Eastwood Mall, Libis, QC", city: "Quezon City", lat: 14.6105, lng: 121.0805, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Venice Grand Canal Mall, McKinley Hill", city: "Taguig", lat: 14.5350, lng: 121.0514, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Robinsons Galleria, Ortigas", city: "Quezon City", lat: 14.5901, lng: 121.0594, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },

        // Airports & Terminals
        { name: "NAIA Terminal 3, Pasay", city: "Pasay City", lat: 14.5202, lng: 121.0156, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "NAIA Terminal 1, Pasay", city: "Parañaque", lat: 14.5097, lng: 121.0003, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "NAIA Terminal 2, Pasay", city: "Pasay City", lat: 14.5123, lng: 121.0045, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Francisco Bangoy International Airport, Davao", city: "Davao City", lat: 7.1253, lng: 125.6456, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "PITX - Parañaque Integrated Terminal Exchange", city: "Parañaque", lat: 14.5106, lng: 120.9912, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "Araneta Center Bus Station, Cubao", city: "Quezon City", lat: 14.6219, lng: 121.0528, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },

        // Civic & Academic Hubs
        { name: "Quezon Memorial Circle, QC", city: "Quezon City", lat: 14.6507, lng: 121.0494, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "Davao City Hall, San Pedro St", city: "Davao City", lat: 7.0644, lng: 125.6092, icon: \'<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>\' },
        { name: "People's Park, Davao City", city: "Davao City", lat: 7.0683, lng: 125.6083, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "Rizal Park, Luneta, Manila", city: "Manila", lat: 14.5831, lng: 120.9794, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "UP Diliman, Quezon City", city: "Quezon City", lat: 14.6538, lng: 121.0685, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "Ateneo de Manila University, QC", city: "Quezon City", lat: 14.6394, lng: 121.0779, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "UST - University of Santo Tomas, Manila", city: "Manila", lat: 14.6095, lng: 120.9899, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "De La Salle University, Taft Ave, Manila", city: "Manila", lat: 14.5647, lng: 120.9932, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
        { name: "St. Luke's Medical Center, Global City", city: "Taguig", lat: 14.5540, lng: 121.0487, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }
    ],

    init() {
        this.initMap();
        if (typeof DeviceLocationManager !== 'undefined') {
            DeviceLocationManager.init();
        }

        // Autocomplete for standard pickup and dropoff
        this.setupAutocomplete('pickup-input', 'pickup-suggestions', (place) => {
            const placeName = place.name || place.fullName || place.main || 'Pickup Location';
            this.setPickup(place.lat, place.lng, placeName);
        });
        this.setupAutocomplete('dropoff-input', 'dropoff-suggestions', (place) => {
            const placeName = place.name || place.fullName || place.main || 'Dropoff Location';
            this.setDropoff(place.lat, place.lng, placeName);
        });

        // Autocomplete for parcel booker's address and recipient dropoff
        this.setupAutocomplete('parcel-booker-address', 'parcel-booker-address-suggestions', (place) => {
            const placeName = place.name || place.fullName || place.main || 'Booker Address';
            this.setPickup(place.lat, place.lng, placeName);
            const stdPickup = document.getElementById('pickup-input');
            if (stdPickup) stdPickup.value = placeName;
        });
        this.setupAutocomplete('parcel-dropoff-input', 'parcel-dropoff-suggestions', (place) => {
            const placeName = place.name || place.fullName || place.main || 'Recipient Address';
            this.setDropoff(place.lat, place.lng, placeName);
            const stdDropoff = document.getElementById('dropoff-input');
            if (stdDropoff) stdDropoff.value = placeName;
        });

        // Autocomplete for food delivery dropoff location
        this.setupAutocomplete('food-dropoff-input', 'food-dropoff-suggestions', (place) => {
            const placeName = place.name || place.fullName || place.main || 'Dropoff Location';
            FoodDeliveryModule.setFoodDropoff(place.lat, place.lng, placeName);
        });

        this.renderServiceOptions();
        this.bindEvents();
        // Initialize and bind clear buttons for all input and address fields
        const clearableInputIds = [
            'pickup-input',
            'dropoff-input',
            'parcel-booker-address',
            'parcel-dropoff-input',
            'home-address-input-field',
            'food-dropoff-input',
            'std-passenger-name',
            'std-passenger-phone',
            'parcel-booker-name',
            'parcel-booker-phone',
            'parcel-recipient-name',
            'parcel-recipient-phone',
            'food-booker-name',
            'food-booker-phone',
            'food-delivery-notes',
            'food-modal-notes',
            'login-email'
        ];
        clearableInputIds.forEach(id => {
            this.updateClearBtnVisibility(id);
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updateClearBtnVisibility(id));
            }
        });

        // Suppress Google Chrome native autocomplete aggressively on all inputs and textareas
        try {
            document.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]):not([type="range"]), textarea').forEach(el => {
                el.setAttribute('autocomplete', 'chrome-off');
                el.setAttribute('data-lpignore', 'true');
                el.setAttribute('data-form-type', 'other');
                el.setAttribute('spellcheck', 'false');
            });
        } catch(e) {}

        // Initialize HUD scroll observer for taskbar-pinned floating behavior
        this.initHudScrollObserver();

        // Setup contact history autocomplete for booker and recipient inputs
        this.setupContactAutocomplete('std-passenger-name', 'std-passenger-phone', 'booker');
        this.setupContactAutocomplete('parcel-booker-name', 'parcel-booker-phone', 'booker');
        this.setupContactAutocomplete('parcel-recipient-name', 'parcel-recipient-phone', 'recipient');
        this.setupContactAutocomplete('food-booker-name', 'food-booker-phone', 'booker');
        FoodDeliveryModule.init();

        this.serviceSteps = {
            transport: 1,
            parcel: 1,
            mart: 1
        };

        // Two-way synchronization across booker contact inputs when typing
        ['std-passenger-name', 'parcel-booker-name', 'food-booker-name'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    const val = el.value;
                    this.bookerName = val;
                    this.passengerName = val;
                    ['std-passenger-name', 'parcel-booker-name', 'food-booker-name'].forEach(targetId => {
                        if (targetId !== id) {
                            const target = document.getElementById(targetId);
                            if (target) {
                                target.value = val;
                                this.updateClearBtnVisibility(targetId);
                            }
                        }
                    });
                });
            }
        });

        ['std-passenger-phone', 'parcel-booker-phone', 'food-booker-phone'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    const val = el.value;
                    this.bookerPhone = val;
                    this.passengerPhone = val;
                    ['std-passenger-phone', 'parcel-booker-phone', 'food-booker-phone'].forEach(targetId => {
                        if (targetId !== id) {
                            const target = document.getElementById(targetId);
                            if (target) {
                                target.value = val;
                                this.updateClearBtnVisibility(targetId);
                            }
                        }
                    });
                });
            }
        });

        this.checkBothAddressesFilled();

        // Start with clean empty boxes as requested (no pre-filled addresses)
    },

    initMap() {
        const container = document.getElementById('booking-map');
        if (!container) return;

        if (this.map) {
            try { this.map.remove(); } catch(e) {}
            this.map = null;
        }

        try {
            if (typeof L !== 'undefined') {
                this.map = L.map('booking-map').setView([14.5547, 121.0244], 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(this.map);

                // Render live user location marker if device location is already active
                if (typeof DeviceLocationManager !== 'undefined' && DeviceLocationManager.isEnabled && DeviceLocationManager.coords) {
                    DeviceLocationManager.updateMapLocationMarker(
                        DeviceLocationManager.coords.lat,
                        DeviceLocationManager.coords.lng,
                        DeviceLocationManager.coords.accuracy,
                        false
                    );
                }

                // Auto-track current location during active trip simulation:
                // Auto-tracking will be automatically disabled once the user drags, swipes, or touches the map
                this.map.on('dragstart', () => this.disableAutoTrack());
                this.map.on('touchstart', () => this.disableAutoTrack());
                this.map.on('mousedown', () => {
                    if (!this.mapClickTargetInputId) this.disableAutoTrack();
                });
                this.map.on('zoomstart', (e) => {
                    if (e.originalEvent) this.disableAutoTrack();
                });

                // Point-and-click on map is DISABLED by default.
                // It only activates when the user toggles "Click on a location" beside an address field.
                this.map.on('click', (e) => {
                    if (!this.mapClickTargetInputId) {
                        return; // Map clicks are ignored when not in selection mode
                    }

                    const targetInputId = this.mapClickTargetInputId;
                    const targetInput = document.getElementById(targetInputId);
                    const isPickup = targetInputId === 'pickup-input' || targetInputId === 'parcel-booker-address';

                    // 1. Quick local check if clicked within ~350m of a known preset
                    let initialName = `Resolving landmark... (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`;
                    let nearestPreset = null;
                    let minDist = 0.35; // ~350 meters
                    for (const p of this.presets) {
                        const d = this.calculateDistance(e.latlng.lat, e.latlng.lng, p.lat, p.lng);
                        if (d < minDist) {
                            minDist = d;
                            nearestPreset = p;
                        }
                    }

                    if (nearestPreset) {
                        initialName = nearestPreset.name;
                    }

                    // Place pin on map immediately with temporary or detected name
                    if (targetInput) {
                        targetInput.value = initialName;
                        this.updateClearBtnVisibility(targetInputId);
                    }

                    if (targetInputId === 'food-dropoff-input') {
                        FoodDeliveryModule.setFoodDropoff(e.latlng.lat, e.latlng.lng, initialName);
                        this.deactivateMapClickMode();
                        if (nearestPreset) {
                            SavedAddressManager.addRecent({ name: nearestPreset.name, lat: nearestPreset.lat, lng: nearestPreset.lng, icon: nearestPreset.icon || "" });
                            if (typeof App !== 'undefined') {
                                App.showToast(`Landmark selected: "${nearestPreset.name}"`, "success");
                            }
                        } else {
                            this.reverseGeocodeLandmark(e.latlng.lat, e.latlng.lng, (resolvedLandmark) => {
                                if (targetInput) {
                                    targetInput.value = resolvedLandmark;
                                    this.updateClearBtnVisibility(targetInputId);
                                }
                                FoodDeliveryModule.setFoodDropoff(e.latlng.lat, e.latlng.lng, resolvedLandmark);
                                SavedAddressManager.addRecent({ name: resolvedLandmark, lat: e.latlng.lat, lng: e.latlng.lng, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' });
                                if (typeof App !== 'undefined') {
                                    App.showToast(`Landmark identified: "${resolvedLandmark}"`, "success");
                                }
                            });
                        }
                        return;
                    }

                    if (isPickup) {
                        this.setPickup(e.latlng.lat, e.latlng.lng, initialName);
                        if (targetInputId === 'parcel-booker-address') {
                            const pStd = document.getElementById('pickup-input');
                            if (pStd) pStd.value = initialName;
                        }
                    } else {
                        this.setDropoff(e.latlng.lat, e.latlng.lng, initialName);
                        if (targetInputId === 'parcel-dropoff-input') {
                            const dStd = document.getElementById('dropoff-input');
                            if (dStd) dStd.value = initialName;
                        }
                    }

                    this.checkBothAddressesFilled();
                    this.deactivateMapClickMode();

                    // If exact preset matched, finalize immediately
                    if (nearestPreset) {
                        SavedAddressManager.addRecent({ name: nearestPreset.name, lat: nearestPreset.lat, lng: nearestPreset.lng, icon: nearestPreset.icon || "" });
                        if (typeof App !== 'undefined') {
                            App.showToast(`Landmark selected: "${nearestPreset.name}"`, "success");
                        }
                    } else {
                        // Query OpenStreetMap Nominatim reverse geocoding to identify the clicked landmark/street/barangay
                        this.reverseGeocodeLandmark(e.latlng.lat, e.latlng.lng, (resolvedLandmark) => {
                            if (targetInput) {
                                targetInput.value = resolvedLandmark;
                                this.updateClearBtnVisibility(targetInputId);
                            }

                            if (isPickup) {
                                this.pickupName = resolvedLandmark;
                                if (this.pickupMarker) {
                                    this.pickupMarker.bindPopup(`<b>Pickup Point:</b><br>${resolvedLandmark}`).openPopup();
                                }
                                if (targetInputId === 'parcel-booker-address') {
                                    const pStd = document.getElementById('pickup-input');
                                    if (pStd) pStd.value = resolvedLandmark;
                                }
                            } else {
                                this.dropoffName = resolvedLandmark;
                                if (this.dropoffMarker) {
                                    this.dropoffMarker.bindPopup(`<b>Destination Point:</b><br>${resolvedLandmark}`).openPopup();
                                }
                                if (targetInputId === 'parcel-dropoff-input') {
                                    const dStd = document.getElementById('dropoff-input');
                                    if (dStd) dStd.value = resolvedLandmark;
                                }
                            }

                            SavedAddressManager.addRecent({ name: resolvedLandmark, lat: e.latlng.lat, lng: e.latlng.lng, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' });
                            this.checkBothAddressesFilled();

                            if (typeof App !== 'undefined') {
                                App.showToast(`Landmark identified: "${resolvedLandmark}"`, "success");
                            }
                        });
                    }
                });

                setTimeout(() => {
                    if (this.map) this.map.invalidateSize();
                }, 250);
            }
        } catch (err) {
            console.error("Leaflet map initialization error:", err);
        }
    },

    /**
     * Reusable Address Autocomplete Engine:
     * - When empty: suggests Use your current location, Add/View Home address, Saved Places, and Recently Used Places
     * - When typing: suggests matched places, saved locations, and allows custom text
     */
    setupAutocomplete(inputId, dropdownId, onSelectCallback) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        if (!input || !dropdown) return;

        let activeTab = 'suggestions'; // 'suggestions' or 'saved'
        let osmDebounceTimer = null;
        let activeOsmController = null;

        const getOsmIcon = (item) => {
            const cls = item.class || '';
            const type = item.type || '';
            const addrType = item.addresstype || '';

            if (cls === 'highway' || type === 'road' || addrType === 'road') return 'road';
            if (cls === 'boundary' || addrType === 'suburb' || addrType === 'quarter' || addrType === 'village' || addrType === 'neighbourhood' || addrType === 'borough') return 'residential';
            if (cls === 'shop' || type === 'mall' || type === 'department_store' || type === 'supermarket') return 'mall';
            if (cls === 'amenity' && (type === 'school' || type === 'university' || type === 'college')) return 'school';
            if (cls === 'amenity' && (type === 'hospital' || type === 'clinic' || type === 'pharmacy')) return 'hospital';
            if (cls === 'aeroway' || type === 'aerodrome' || type === 'terminal') return 'airport';
            if (cls === 'tourism' || cls === 'leisure' || type === 'park') return 'park';
            if (cls === 'amenity' && (type === 'restaurant' || type === 'fast_food' || type === 'cafe')) return 'food';
            return 'pin';
        };

        const getPhotonIcon = (p) => {
            const key = p.osm_key || '';
            const val = p.osm_value || '';
            if (key === 'highway' || val === 'road' || val === 'residential') return 'road';
            if (key === 'boundary' || val === 'administrative' || p.district || p.locality) return 'residential';
            if (key === 'shop' || val === 'mall' || val === 'supermarket' || val === 'department_store') return 'mall';
            if (key === 'amenity' && (val === 'school' || val === 'university' || val === 'college')) return 'school';
            if (key === 'amenity' && (val === 'hospital' || val === 'clinic' || val === 'pharmacy')) return 'hospital';
            if (key === 'aeroway' || val === 'aerodrome') return 'airport';
            if (key === 'tourism' || key === 'leisure' || val === 'park') return 'park';
            if (key === 'amenity' && (val === 'restaurant' || val === 'fast_food' || val === 'cafe')) return 'food';
            return 'pin';
        };

        const formatOsmItem = (item) => {
            const addr = item.address || {};
            const main = item.name || addr.amenity || addr.building || addr.shop || addr.road || addr.quarter || addr.suburb || (item.display_name ? item.display_name.split(',')[0].trim() : 'Place');
            
            const subParts = [];
            if (addr.quarter && addr.quarter !== main) subParts.push(addr.quarter);
            if (addr.suburb && addr.suburb !== main && !subParts.includes(addr.suburb)) subParts.push(addr.suburb);
            const city = addr.city || addr.town || addr.municipality;
            if (city && city !== main && !subParts.includes(city)) subParts.push(city);
            const state = addr.region || addr.state;
            if (state && !subParts.includes(state) && !subParts.includes(city)) subParts.push(state);

            const sub = subParts.slice(0, 2).join(', ') || 'Philippines';
            const fullName = `${main}, ${sub}`;
            return {
                name: fullName,
                fullName,
                main,
                sub,
                city: sub,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                icon: getOsmIcon(item)
            };
        };

        const formatPhotonItem = (feat) => {
            const p = feat.properties || {};
            const coords = feat.geometry ? feat.geometry.coordinates : [120.9842, 14.5995];
            const lng = parseFloat(coords[0]);
            const lat = parseFloat(coords[1]);

            const main = p.name || p.street || (p.district ? `Brgy. ${p.district}` : (p.city || 'Place'));
            const subParts = [];
            if (p.street && p.street !== main) subParts.push(p.street);
            if (p.district && p.district !== main && !subParts.includes(p.district)) subParts.push(`Brgy. ${p.district}`);
            if (p.locality && p.locality !== main && !subParts.includes(p.locality)) subParts.push(p.locality);
            const localityCity = p.city || p.county;
            if (localityCity && localityCity !== main && !subParts.includes(localityCity)) subParts.push(localityCity);
            if (p.state && !subParts.includes(p.state) && !subParts.includes(localityCity)) subParts.push(p.state);

            const sub = subParts.slice(0, 3).join(', ') || p.country || 'Philippines';
            const fullName = `${main}, ${sub}`;

            return {
                name: fullName,
                fullName,
                main,
                sub,
                city: p.city || p.state || 'Philippines',
                lat: lat,
                lng: lng,
                icon: getPhotonIcon(p)
            };
        };

        const renderSuggestions = (query, tab = activeTab) => {
            activeTab = tab;
            const q = (query || '').trim().toLowerCase();
            const isSingleLocationInput = (inputId === 'food-dropoff-input' || inputId === 'parcel-booker-address' || inputId === 'parcel-dropoff-input');
            const savedRoutes = isSingleLocationInput ? [] : SavedAddressManager.getSavedRoutes();
            const savedAddrs = SavedAddressManager.getSaved();
            const home = SavedAddressManager.getHome();
            const recent = SavedAddressManager.getRecent();

            // For single-location inputs (Food dropoff, Parcel sender, Parcel dropoff),
            // show ONLY single locations (Home + Saved favorite places) and remove Transport 2-location routes!
            const singleSavedPlaces = (home ? [{ ...home, label: "Home Address", icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', isHome: true }] : []).concat(savedAddrs);
            const totalSaved = isSingleLocationInput ? singleSavedPlaces.length : (savedRoutes.length + savedAddrs.length);

            let html = `
                <!-- Sticky Header with Tabs -->
                <div class="flex items-center border-b border-slate-200 bg-slate-50/95 p-1.5 space-x-1 sticky top-0 z-20 backdrop-blur-sm rounded-t-xl">
                    <button type="button" class="tab-btn-suggestions flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1 cursor-pointer ${activeTab === 'suggestions' ? 'bg-hirna-700 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200/70 hover:text-slate-800'}">
                        <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span>Suggestions</span>
                    </button>
                    <button type="button" class="tab-btn-saved-places flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${activeTab === 'saved' ? 'bg-amber-500 text-hirna-950 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200/70 hover:text-slate-800'}">
                        <svg class="w-3.5 h-3.5 text-amber-950 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <span>Saved Places</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'saved' ? 'bg-hirna-950 text-gold-300' : 'bg-slate-200 text-slate-700'}">${totalSaved}</span>
                    </button>
                </div>
            `;

            if (activeTab === 'saved') {
                // Render Saved Places Tab
                html += `<div class="p-2 space-y-2">`;
                if (totalSaved === 0) {
                    html += `
                        <div class="py-6 px-3 text-center text-xs text-slate-500 space-y-1.5">
                            <div class="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-1">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            </div>
                            <div class="font-bold text-slate-800">No Saved Places Yet</div>
                            <p class="text-[11px] text-slate-500 max-w-xs mx-auto">
                                ${isSingleLocationInput 
                                    ? 'Save your favorite single places (Home, Work, Landmark) to quickly fill them with 1 tap!' 
                                    : 'Enter both pickup and dropoff locations, then tap <strong>"Save Both Locations"</strong> to save your favorite trip here for 1-tap booking!'}
                            </p>
                        </div>
                    `;
                } else if (isSingleLocationInput) {
                    // Single Location Only Mode (for Food Dropoff and Parcel Delivery)
                    html += `
                        <div class="px-1 py-0.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Your Saved Places (Single Location)</span>
                            <span class="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">1-Tap Fill</span>
                        </div>
                    `;
                    if (!home) {
                        html += `
                            <div class="autocomplete-add-home-opt p-2.5 rounded-xl bg-gold-50/80 hover:bg-gold-100 cursor-pointer flex items-center justify-between transition text-hirna-950 border border-gold-300 shadow-xs mb-2">
                                <div class="flex items-center space-x-2.5 flex-1 min-w-0">
                                    <div class="w-7 h-7 rounded-lg bg-gold-500 text-hirna-950 flex items-center justify-center shadow-sm flex-shrink-0">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs font-bold text-hirna-950">Add home address</div>
                                        <div class="text-[10px] text-gold-800 truncate">Tap to input and save your primary address</div>
                                    </div>
                                </div>
                                <span class="px-2.5 py-1 rounded-lg bg-white text-[10px] font-black text-hirna-800 border border-gold-300 shadow-sm flex-shrink-0 hover:bg-gold-50">+ Add</span>
                            </div>
                        `;
                    }
                    singleSavedPlaces.forEach((place, sIdx) => {
                        html += `
                            <div class="autocomplete-saved-place-opt p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/70 cursor-pointer transition flex items-center justify-between group shadow-sm bg-white" data-single-idx="${sIdx}">
                                <div class="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                                    <div class="w-8 h-8 rounded-lg bg-amber-100 group-hover:bg-amber-400 text-amber-900 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm transition">
                                        ${place.icon || ""}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs font-bold text-slate-800 group-hover:text-amber-950 truncate">${place.label || place.name}</div>
                                        <div class="text-[10px] text-slate-500 truncate">${place.name}</div>
                                    </div>
                                </div>
                                ${place.isHome ? `
                                    <span class="text-[9px] bg-gold-100 text-gold-900 font-bold px-2 py-0.5 rounded-md flex-shrink-0">Home</span>
                                ` : `
                                    <button type="button" class="btn-delete-saved-addr p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0 cursor-pointer" title="Delete this saved place" data-saved-name="${place.name}">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                `}
                            </div>
                        `;
                    });
                } else {
                    // Standard Transport view: 2-location saved routes + favorite single places
                    if (savedRoutes.length > 0) {
                        html += `
                            <div class="px-1 py-0.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Your Saved Trips & Routes</span>
                                <span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">1-Tap Dual Fill</span>
                            </div>
                        `;
                        savedRoutes.forEach(route => {
                            html += `
                                <div class="autocomplete-route-opt p-2.5 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/50 to-white hover:border-amber-400 hover:bg-amber-50/80 cursor-pointer transition group shadow-sm flex items-start justify-between" data-route-id="${route.id}">
                                    <div class="flex-1 min-w-0 pr-2">
                                        <div class="flex items-center space-x-1.5 mb-1">
                                            <span class="text-xs font-black text-slate-800 group-hover:text-amber-900 truncate">${route.label || 'Saved Trip'}</span>
                                            <span class="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded flex-shrink-0">1-Tap Fill</span>
                                        </div>
                                        <div class="space-y-0.5 text-[10px] text-slate-600">
                                            <div class="flex items-center space-x-1 truncate"><span class="text-emerald-600 font-bold flex items-center flex-shrink-0"><svg class="w-3 h-3 mr-0.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>Pickup:</span> <span class="truncate text-slate-700 font-medium">${route.pickup.name}</span></div>
                                            <div class="flex items-center space-x-1 truncate"><span class="text-rose-600 font-bold flex items-center flex-shrink-0"><svg class="w-3 h-3 mr-0.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>Dropoff:</span> <span class="truncate text-slate-700 font-medium">${route.dropoff.name}</span></div>
                                        </div>
                                    </div>
                                    <button type="button" class="btn-delete-saved-route p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0 cursor-pointer" title="Delete this saved route" data-route-id="${route.id}">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            `;
                        });
                    }

                    if (savedAddrs.length > 0) {
                        html += `
                            <div class="px-1 pt-2 pb-0.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider ${savedRoutes.length > 0 ? 'border-t border-slate-100' : ''}">
                                <span>Favorite Places</span>
                                <span class="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">1-Tap Fill</span>
                            </div>
                        `;
                        savedAddrs.forEach((place, sIdx) => {
                            html += `
                                <div class="autocomplete-saved-place-opt p-2 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/70 cursor-pointer transition flex items-center justify-between group shadow-sm bg-white" data-saved-idx="${sIdx}">
                                    <div class="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                                        <div class="w-7 h-7 rounded-lg bg-amber-100 group-hover:bg-amber-400 text-amber-900 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm transition">
                                            ${place.icon || ""}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="text-xs font-bold text-slate-800 group-hover:text-amber-950 truncate">${place.label || place.name}</div>
                                            <div class="text-[10px] text-slate-500 truncate">${place.name}</div>
                                        </div>
                                    </div>
                                    <button type="button" class="btn-delete-saved-addr p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0 cursor-pointer" title="Delete this saved place" data-saved-name="${place.name}">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            `;
                        });
                    }
                }
                html += `</div>`;
                dropdown.innerHTML = html;

                // Bind tab buttons
                dropdown.querySelector('.tab-btn-suggestions')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    renderSuggestions(input.value, 'suggestions');
                });
                dropdown.querySelector('.tab-btn-saved-places')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    renderSuggestions(input.value, 'saved');
                });

                // Bind Add Home in Saved Places tab
                dropdown.querySelector('.autocomplete-add-home-opt')?.addEventListener('click', () => {
                    dropdown.classList.add('hidden');
                    this.openHomeAddressModal(inputId);
                });

                // Bind route selections (1-Tap Dual Fill for Transport only)
                dropdown.querySelectorAll('.autocomplete-route-opt').forEach(card => {
                    card.addEventListener('click', (e) => {
                        if (e.target.closest('.btn-delete-saved-route')) return;
                        const routeId = card.dataset.routeId;
                        const route = savedRoutes.find(r => r.id === routeId);
                        if (route) {
                            dropdown.classList.add('hidden');
                            this.applySavedRoute(route);
                        }
                    });
                });

                // Bind single saved favorite place selections
                dropdown.querySelectorAll('.autocomplete-saved-place-opt').forEach(el => {
                    el.addEventListener('click', (e) => {
                        if (e.target.closest('.btn-delete-saved-addr')) return;
                        let place = null;
                        if (isSingleLocationInput) {
                            const idx = parseInt(el.dataset.singleIdx);
                            place = singleSavedPlaces[idx];
                        } else {
                            const idx = parseInt(el.dataset.savedIdx);
                            place = savedAddrs[idx];
                        }
                        if (place) {
                            input.value = place.name;
                            this.updateClearBtnVisibility(inputId);
                            dropdown.classList.add('hidden');
                            SavedAddressManager.addRecent(place);
                            onSelectCallback(place);
                            this.checkBothAddressesFilled();
                        }
                    });
                });

                // Bind delete route buttons
                dropdown.querySelectorAll('.btn-delete-saved-route').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const routeId = btn.dataset.routeId;
                        const route = savedRoutes.find(r => r.id === routeId);
                        this.promptDeleteSavedRoute(routeId, route ? (route.label || route.title) : "Saved Trip", () => {
                            renderSuggestions(input.value, 'saved');
                        });
                    });
                });

                // Bind delete saved address buttons
                dropdown.querySelectorAll('.btn-delete-saved-addr').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const addrName = btn.dataset.savedName;
                        this.promptDeleteSavedAddress(addrName, () => {
                            renderSuggestions(input.value, 'saved');
                        });
                    });
                });

                dropdown.classList.remove('hidden');
                return;
            }

            // activeTab === 'suggestions'
            // When box is empty or focused with no text:
            if (!q) {
                const hasLiveGps = (typeof DeviceLocationManager !== 'undefined' && DeviceLocationManager.isEnabled && DeviceLocationManager.coords);
                const gpsSubtitle = hasLiveGps
                    ? `${DeviceLocationManager.coords.resolvedName || 'GPS Location Locked'} (±${Math.round(DeviceLocationManager.coords.accuracy)}m)`
                    : 'Accurate pin from device sensor';

                html += `<div class="p-2 space-y-1">`;
                html += `
                    <!-- Use your current location -->
                    <div class="autocomplete-gps-opt p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 cursor-pointer flex items-center space-x-2.5 transition text-emerald-900 border border-emerald-200/80">
                        <div class="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>
                        </div>
                        <div class="flex-1 overflow-hidden">
                            <div class="text-xs font-black flex items-center justify-between">
                                <span>Use your current location</span>
                                ${hasLiveGps ? '<span class="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">GPS Locked</span>' : ''}
                            </div>
                            <div class="text-[10px] text-emerald-700 truncate">${gpsSubtitle}</div>
                        </div>
                    </div>
                `;

                // Home Option
                if (!home) {
                    html += `
                        <div class="autocomplete-add-home-opt p-2.5 rounded-xl bg-gold-50/80 hover:bg-gold-100 cursor-pointer flex items-center justify-between transition text-hirna-950 border border-gold-300">
                            <div class="flex items-center space-x-2.5 flex-1 min-w-0">
                                <div class="w-7 h-7 rounded-lg bg-gold-500 text-hirna-950 flex items-center justify-center shadow-sm flex-shrink-0">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-xs font-bold text-hirna-950">Add home address</div>
                                    <div class="text-[10px] text-gold-800 truncate">Tap to input and save your primary address</div>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-lg bg-white text-[10px] font-black text-hirna-800 border border-gold-300 shadow-sm flex-shrink-0 hover:bg-gold-50">+ Add</span>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="autocomplete-home-item p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between transition group border border-slate-100 hover:border-slate-200">
                            <div class="autocomplete-home-select-btn flex items-center space-x-2.5 flex-1 min-w-0 cursor-pointer pr-2">
                                <div class="w-7 h-7 rounded-lg bg-gold-100 group-hover:bg-gold-400 text-gold-800 flex items-center justify-center shadow-sm flex-shrink-0">
                                    <svg class="w-4 h-4 text-gold-700 group-hover:text-hirna-950" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                                        <span>Home Address</span>
                                        <span class="text-[9px] bg-gold-100 text-gold-800 font-bold px-1.5 py-0.5 rounded">Saved</span>
                                    </div>
                                    <div class="text-[10px] text-slate-500 truncate" title="${home.name}">${home.name}</div>
                                </div>
                            </div>
                            <button type="button" class="autocomplete-home-view-btn px-2.5 py-1 bg-white hover:bg-gold-500 hover:text-hirna-950 text-slate-700 border border-slate-200 hover:border-gold-400 rounded-lg text-[10px] font-bold shadow-sm transition flex-shrink-0 cursor-pointer">
                                View
                            </button>
                        </div>
                    `;
                }

                // Recently Used Places Section
                if (recent.length > 0) {
                    html += `
                        <div class="pt-2 pb-1 px-2 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                                <svg class="w-3 h-3 text-slate-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span>Recently Used Places</span>
                            </span>
                            <span class="text-[9px] text-slate-400 font-mono">${recent.length}</span>
                        </div>
                    `;
                    recent.forEach((item, idx) => {
                        html += `
                            <div class="autocomplete-recent-opt p-2 rounded-lg hover:bg-slate-100 cursor-pointer flex items-center justify-between transition group" data-recent-idx="${idx}">
                                <div class="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                                    <div class="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </div>
                                    <div class="flex-1 overflow-hidden">
                                        <div class="text-xs font-medium text-slate-800 truncate">${item.name}</div>
                                        <div class="text-[10px] text-slate-400 truncate">${item.city || 'Metro Manila'}</div>
                                    </div>
                                </div>
                                <button type="button" class="btn-delete-recent-place p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0 cursor-pointer" title="Remove from recent places" data-recent-name="${item.name}">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        `;
                    });
                }

                html += `</div>`;
                dropdown.innerHTML = html;

                // Bind tab buttons
                dropdown.querySelector('.tab-btn-suggestions')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    renderSuggestions(input.value, 'suggestions');
                });
                dropdown.querySelector('.tab-btn-saved-places')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    renderSuggestions(input.value, 'saved');
                });

                // Bind GPS
                dropdown.querySelector('.autocomplete-gps-opt')?.addEventListener('click', () => {
                    this.fillGPSLocation(inputId);
                    dropdown.classList.add('hidden');
                });

                // Bind Add Home
                dropdown.querySelector('.autocomplete-add-home-opt')?.addEventListener('click', () => {
                    dropdown.classList.add('hidden');
                    this.openHomeAddressModal(inputId);
                });

                // Bind Select Home
                dropdown.querySelector('.autocomplete-home-select-btn')?.addEventListener('click', () => {
                    if (home) {
                        input.value = home.name;
                        this.updateClearBtnVisibility(inputId);
                        dropdown.classList.add('hidden');
                        SavedAddressManager.addRecent(home);
                        onSelectCallback(home);
                        this.checkBothAddressesFilled();
                    }
                });

                // Bind View Home
                dropdown.querySelector('.autocomplete-home-view-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.add('hidden');
                    this.viewHomeAddress();
                });

                // Bind Recent Click
                dropdown.querySelectorAll('.autocomplete-recent-opt').forEach(el => {
                    el.addEventListener('click', (e) => {
                        if (e.target.closest('.btn-delete-recent-place')) return;
                        const idx = parseInt(el.dataset.recentIdx);
                        const target = recent[idx];
                        if (target) {
                            input.value = target.name;
                            this.updateClearBtnVisibility(inputId);
                            dropdown.classList.add('hidden');
                            SavedAddressManager.addRecent(target);
                            onSelectCallback(target);
                            this.checkBothAddressesFilled();
                        }
                    });
                });

                // Bind Delete Recent Place
                dropdown.querySelectorAll('.btn-delete-recent-place').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const placeName = btn.dataset.recentName;
                        this.promptDeleteRecentPlace(placeName, () => {
                            renderSuggestions(input.value, 'suggestions');
                        });
                    });
                });

                dropdown.classList.remove('hidden');
                return;
            }

            // When user is actively typing (q.length > 0):
            const presetMatches = this.presets.filter(p => p.name.toLowerCase().includes(q) || (p.city && p.city.toLowerCase().includes(q)));
            
            html += `<div class="p-2 space-y-1">`;
            html += `
                <div class="autocomplete-custom-btn p-2 rounded-xl bg-gold-50 hover:bg-gold-100 cursor-pointer flex items-center space-x-2.5 transition text-hirna-950 border border-gold-300">
                    <div class="w-7 h-7 rounded-lg bg-gold-500 text-hirna-950 flex items-center justify-center shadow font-black">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="text-xs font-black truncate">Use Address: "${query}"</div>
                        <div class="text-[10px] text-gold-800">Pin and book this custom address</div>
                    </div>
                </div>
            `;

            if (presetMatches.length > 0) {
                html += `
                    <div class="pt-1 px-1">
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Matching Landmarks & Places</span>
                    </div>
                `;
                presetMatches.slice(0, 6).forEach((item, idx) => {
                    html += `
                        <div class="autocomplete-item p-2 rounded-xl hover:bg-slate-100 cursor-pointer flex items-center space-x-2.5 transition text-left group" data-idx="${idx}">
                            <div class="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-gold-400 text-slate-700 group-hover:text-hirna-950 flex items-center justify-center shadow-sm flex-shrink-0">
                                ${this.getIconSvg(item.icon)}
                            </div>
                            <div class="overflow-hidden flex-1">
                                <div class="text-xs font-bold text-slate-800 group-hover:text-hirna-900 truncate">${item.name}</div>
                                <div class="text-[10px] text-slate-400 group-hover:text-slate-600 truncate">${item.city || 'Philippines'}</div>
                            </div>
                        </div>
                    `;
                });
            }

            // Real-time OpenStreetMap Section for Barangays, Streets & Specific Places
            if (q.length >= 2) {
                html += `
                    <div id="${dropdownId}-osm-section" class="pt-2 border-t border-slate-100 space-y-1">
                        <div class="px-1 flex items-center justify-between">
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                                <svg class="w-3 h-3 text-hirna-600 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span>Barangays, Streets & Landmarks</span>
                            </span>
                            <span id="${dropdownId}-osm-status" class="text-[9px] text-hirna-600 font-medium"></span>
                        </div>
                        <div id="${dropdownId}-osm-results" class="space-y-0.5"></div>
                    </div>
                `;
            }

            html += `</div>`;
            dropdown.innerHTML = html;

            // Bind tab buttons
            dropdown.querySelector('.tab-btn-suggestions')?.addEventListener('click', (e) => {
                e.stopPropagation();
                renderSuggestions(input.value, 'suggestions');
            });
            dropdown.querySelector('.tab-btn-saved-places')?.addEventListener('click', (e) => {
                e.stopPropagation();
                renderSuggestions(input.value, 'saved');
            });

            dropdown.querySelector('.autocomplete-custom-btn')?.addEventListener('click', () => {
                input.value = query;
                this.updateClearBtnVisibility(inputId);
                dropdown.classList.add('hidden');
                const center = this.map ? this.map.getCenter() : { lat: 14.5547, lng: 121.0244 };
                const customPlace = { lat: center.lat, lng: center.lng, name: query, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' };
                SavedAddressManager.addRecent(customPlace);
                onSelectCallback(customPlace);
                this.checkBothAddressesFilled();
            });

            dropdown.querySelectorAll('.autocomplete-item').forEach(elem => {
                elem.addEventListener('click', () => {
                    const idx = parseInt(elem.dataset.idx);
                    const selected = presetMatches[idx];
                    input.value = selected.name;
                    this.updateClearBtnVisibility(inputId);
                    dropdown.classList.add('hidden');
                    SavedAddressManager.addRecent(selected);
                    onSelectCallback(selected);
                    this.checkBothAddressesFilled();
                    if (this.map) {
                        this.map.setView([selected.lat, selected.lng], 15);
                    }
                });
            });

            // OpenStreetMap dynamic search for barangays, streets, and specific places
            if (q.length >= 2) {
                const osmStatus = document.getElementById(`${dropdownId}-osm-status`);
                const osmResultsContainer = document.getElementById(`${dropdownId}-osm-results`);

                const renderOsmItems = (items) => {
                    if (!osmResultsContainer) return;
                    if (input.value.trim().toLowerCase() !== q) return;

                    // Filter out items already matched by presetMatches
                    const filtered = (items || []).filter(item => {
                        if (!item || !item.name) return false;
                        const itemMain = (item.main || '').toLowerCase().trim();
                        return !presetMatches.some(p => {
                            const pLower = p.name.toLowerCase().trim();
                            return pLower === itemMain || pLower.startsWith(itemMain + ',');
                        });
                    });

                    if (filtered.length === 0) {
                        if (osmStatus) osmStatus.textContent = presetMatches.length > 0 ? '' : 'No additional places found';
                        return;
                    }

                    if (osmStatus) osmStatus.textContent = `${filtered.length} found`;

                    osmResultsContainer.innerHTML = filtered.map((item, oIdx) => `
                        <div class="autocomplete-osm-item p-2 rounded-xl hover:bg-slate-100 cursor-pointer flex items-center space-x-2.5 transition text-left group" data-osm-idx="${oIdx}">
                            <div class="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-gold-400 text-slate-700 group-hover:text-hirna-950 flex items-center justify-center shadow-sm flex-shrink-0">
                                ${this.getIconSvg(item.icon)}
                            </div>
                            <div class="overflow-hidden flex-1">
                                <div class="text-xs font-bold text-slate-800 group-hover:text-hirna-900 truncate">${item.main}</div>
                                <div class="text-[10px] text-slate-400 group-hover:text-slate-600 truncate">${item.sub}</div>
                            </div>
                        </div>
                    `).join('');

                    // Bind click on OSM items
                    osmResultsContainer.querySelectorAll('.autocomplete-osm-item').forEach(el => {
                        el.addEventListener('click', () => {
                            const oIdx = parseInt(el.dataset.osmIdx);
                            const selected = filtered[oIdx];
                            if (!selected) return;
                            const placeName = selected.name || selected.fullName || selected.main;
                            input.value = placeName;
                            this.updateClearBtnVisibility(inputId);
                            dropdown.classList.add('hidden');
                            SavedAddressManager.addRecent(selected);
                            onSelectCallback(selected);
                            this.checkBothAddressesFilled();
                            if (this.map && selected.lat && selected.lng) {
                                this.map.setView([selected.lat, selected.lng], 15);
                            }
                        });
                    });
                };

                // Check cache first
                if (this.osmSearchCache && this.osmSearchCache[q]) {
                    renderOsmItems(this.osmSearchCache[q]);
                } else {
                    if (osmStatus) {
                        osmStatus.innerHTML = '<span class="inline-block w-1.5 h-1.5 rounded-full bg-hirna-500 animate-ping mr-1"></span>searching...';
                    }
                    if (osmDebounceTimer) clearTimeout(osmDebounceTimer);
                    osmDebounceTimer = setTimeout(() => {
                        if (activeOsmController) {
                            try { activeOsmController.abort(); } catch(e) {}
                        }
                        activeOsmController = new AbortController();

                        const fallbackNominatim = () => {
                            const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=ph&limit=8&addressdetails=1`;
                            fetch(searchUrl, {
                                signal: activeOsmController ? activeOsmController.signal : undefined,
                                headers: { 'Accept-Language': 'en' }
                            })
                            .then(res => res.json())
                            .then(data => {
                                const list = Array.isArray(data) ? data.map(formatOsmItem) : [];
                                if (!this.osmSearchCache) this.osmSearchCache = {};
                                this.osmSearchCache[q] = list;
                                renderOsmItems(list);
                            })
                            .catch(err => {
                                if (err.name !== 'AbortError') {
                                    console.warn("Nominatim fallback error:", err);
                                    if (osmStatus) osmStatus.textContent = '';
                                }
                            });
                        };

                        // Fast fuzzy search via Photon (Komoot / OpenStreetMap)
                        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=14.5995&lon=120.9842&limit=8`;
                        fetch(photonUrl, { signal: activeOsmController.signal })
                            .then(res => res.json())
                            .then(data => {
                                const features = (data && data.features) ? data.features : [];
                                if (features.length > 0) {
                                    const list = features.map(formatPhotonItem);
                                    if (!this.osmSearchCache) this.osmSearchCache = {};
                                    this.osmSearchCache[q] = list;
                                    renderOsmItems(list);
                                } else {
                                    fallbackNominatim();
                                }
                            })
                            .catch(err => {
                                if (err.name !== 'AbortError') {
                                    fallbackNominatim();
                                }
                            });
                    }, 300);
                }
            }

            dropdown.classList.remove('hidden');
        };

        input.addEventListener('input', (e) => {
            this.updateClearBtnVisibility(inputId);
            renderSuggestions(e.target.value);
            this.checkBothAddressesFilled();
        });
        input.addEventListener('focus', (e) => {
            this.updateClearBtnVisibility(inputId);
            renderSuggestions(e.target.value);
        });
        input.addEventListener('click', (e) => {
            this.updateClearBtnVisibility(inputId);
            renderSuggestions(e.target.value);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    },

    checkBothAddressesFilled() {
        const isParcel = this.activeService === 'parcel';
        let pVal = '';
        let dVal = '';

        if (isParcel) {
            pVal = document.getElementById('parcel-booker-address')?.value.trim();
            dVal = document.getElementById('parcel-dropoff-input')?.value.trim();
        } else {
            pVal = document.getElementById('pickup-input')?.value.trim();
            dVal = document.getElementById('dropoff-input')?.value.trim();
        }

        const card = document.getElementById('save-addresses-card');
        if (card) {
            if (pVal && dVal) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }

        const parcelCard = document.getElementById('parcel-save-addresses-card');
        if (parcelCard) {
            if (pVal && dVal) {
                parcelCard.classList.remove('hidden');
            } else {
                parcelCard.classList.add('hidden');
            }
        }

        this.updateSaveTripButtonState();
    },

    isCurrentTripSaved() {
        const isParcel = this.activeService === 'parcel';
        const pVal = (isParcel ? document.getElementById('parcel-booker-address')?.value : document.getElementById('pickup-input')?.value)?.trim();
        const dVal = (isParcel ? document.getElementById('parcel-dropoff-input')?.value : document.getElementById('dropoff-input')?.value)?.trim();

        if (!pVal || !dVal) return null;

        const routes = SavedAddressManager.getSavedRoutes();
        const norm = s => (s || '').trim().toLowerCase();

        return routes.find(r => {
            if (!r.pickup || !r.dropoff) return false;
            const pMatch = norm(r.pickup.name) === norm(pVal);
            const dMatch = norm(r.dropoff.name) === norm(dVal);
            if (pMatch && dMatch) return true;

            const pShort = norm(pVal.split(',')[0]);
            const dShort = norm(dVal.split(',')[0]);
            const rpShort = norm((r.pickup.name || '').split(',')[0]);
            const rdShort = norm((r.dropoff.name || '').split(',')[0]);
            if (pShort && dShort && rpShort === pShort && rdShort === dShort) return true;

            return false;
        }) || null;
    },

    updateSaveTripButtonState() {
        const savedRoute = this.isCurrentTripSaved();
        const buttons = [
            document.getElementById('btn-save-both-locations'),
            document.getElementById('btn-parcel-save-both-locations')
        ];

        buttons.forEach(btn => {
            if (!btn) return;
            if (savedRoute) {
                btn.innerHTML = `
                    <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                    <span class="font-bold text-emerald-800">Already Saved</span>
                    <span class="text-[10px] text-slate-400 font-normal ml-1">(Tap to unsave)</span>
                `;
                btn.className = "w-full py-2 px-3 bg-emerald-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-emerald-800 font-bold rounded-lg border border-emerald-300 transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer group";
                btn.title = "This trip is saved in your Saved Places. Click to unsave.";
            } else {
                btn.innerHTML = `
                    <svg class="w-3.5 h-3.5 text-amber-500 group-hover:text-hirna-950 transition" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span>Save Trip to Saved Places</span>
                `;
                btn.className = "w-full py-2 px-3 bg-white hover:bg-gold-500 hover:text-hirna-950 text-slate-800 font-bold rounded-lg border border-slate-200 transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer group";
                btn.title = "Save both pickup and dropoff together as a saved trip";
            }
        });
    },

    setupContactAutocomplete(nameInputId, phoneInputId, type) {
        const nameInput = document.getElementById(nameInputId);
        const phoneInput = document.getElementById(phoneInputId);
        const nameDropdown = document.getElementById(nameInputId + '-suggestions');
        const phoneDropdown = document.getElementById(phoneInputId + '-suggestions');

        if (!nameInput || !phoneInput) return;

        const getContacts = () => {
            return type === 'booker' ? ContactHistoryManager.getBookers() : ContactHistoryManager.getRecipients();
        };

        const renderDropdown = (activeInput, dropdown) => {
            if (!dropdown) return;
            const contacts = getContacts();
            const q = (activeInput.value || '').trim().toLowerCase();
            const filtered = q
                ? contacts.filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q)))
                : contacts;

            if (filtered.length === 0) {
                dropdown.innerHTML = `
                    <div class="p-3 text-center text-[11px] text-slate-400">
                        No matching ${type === 'booker' ? 'booker/passenger' : 'recipient'} in history
                    </div>
                `;
                dropdown.classList.remove('hidden');
                return;
            }

            let html = `
                <div class="px-2.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                        <svg class="w-3 h-3 text-slate-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>${type === 'booker' ? 'Saved Passenger / Booker History' : 'Saved Recipient History'}</span>
                    </span>
                </div>
                <div class="p-1 space-y-0.5 max-h-56 overflow-y-auto">
            `;

            filtered.forEach(c => {
                const initial = (c.name || '?').charAt(0).toUpperCase();
                html += `
                    <div class="contact-history-opt p-2 rounded-lg hover:bg-gold-50 cursor-pointer flex items-center justify-between group transition" data-contact-id="${c.id}">
                        <div class="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                            <div class="w-7 h-7 rounded-lg bg-hirna-100 group-hover:bg-gold-400 text-hirna-900 group-hover:text-hirna-950 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm transition">
                                ${initial}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-xs font-bold text-slate-800 group-hover:text-hirna-950 truncate">${c.name}</div>
                                <div class="text-[10px] text-slate-500 font-mono truncate">${c.phone || 'No mobile number'}</div>
                            </div>
                        </div>
                        <button type="button" class="btn-delete-contact-item p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0 cursor-pointer" title="Remove contact from history" data-contact-id="${c.id}">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                `;
            });

            html += `</div>`;
            dropdown.innerHTML = html;

            // Bind click to autofill
            dropdown.querySelectorAll('.contact-history-opt').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-delete-contact-item')) return;
                    const contactId = card.dataset.contactId;
                    const targetContact = contacts.find(x => x.id === contactId);
                    if (targetContact) {
                        nameInput.value = targetContact.name || '';
                        phoneInput.value = targetContact.phone || '';
                        if (nameDropdown) nameDropdown.classList.add('hidden');
                        if (phoneDropdown) phoneDropdown.classList.add('hidden');
                        nameInput.dispatchEvent(new Event('input'));
                        phoneInput.dispatchEvent(new Event('input'));
                    }
                });
            });

            // Bind delete button
            dropdown.querySelectorAll('.btn-delete-contact-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const contactId = btn.dataset.contactId;
                    const targetContact = contacts.find(x => x.id === contactId);
                    if (targetContact) {
                        this.promptDeleteContact(targetContact, type, () => {
                            renderDropdown(activeInput, dropdown);
                        });
                    }
                });
            });

            dropdown.classList.remove('hidden');
        };

        // Attach listeners for name input
        if (nameDropdown) {
            nameInput.addEventListener('focus', () => renderDropdown(nameInput, nameDropdown));
            nameInput.addEventListener('input', () => renderDropdown(nameInput, nameDropdown));
            document.addEventListener('click', (e) => {
                if (!nameInput.contains(e.target) && !nameDropdown.contains(e.target)) {
                    nameDropdown.classList.add('hidden');
                }
            });
        }

        // Attach listeners for phone input
        if (phoneDropdown) {
            phoneInput.addEventListener('focus', () => renderDropdown(phoneInput, phoneDropdown));
            phoneInput.addEventListener('input', () => renderDropdown(phoneInput, phoneDropdown));
            document.addEventListener('click', (e) => {
                if (!phoneInput.contains(e.target) && !phoneDropdown.contains(e.target)) {
                    phoneDropdown.classList.add('hidden');
                }
            });
        }
    },

    applySavedRoute(route) {
        if (!route || !route.pickup || !route.dropoff) return;

        const pLat = parseFloat(route.pickup.lat);
        const pLng = parseFloat(route.pickup.lng);
        const dLat = parseFloat(route.dropoff.lat);
        const dLng = parseFloat(route.dropoff.lng);

        if (isNaN(pLat) || isNaN(pLng) || isNaN(dLat) || isNaN(dLng)) {
            console.error("Invalid coordinates in saved route", route);
            return;
        }

        const pName = route.pickup.name || 'Pickup Location';
        const dName = route.dropoff.name || 'Dropoff Location';

        // Keep all input fields synchronized across transport & parcel views
        ['pickup-input', 'parcel-booker-address'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.value = pName; this.updateClearBtnVisibility(id); }
        });
        ['dropoff-input', 'parcel-dropoff-input'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.value = dName; this.updateClearBtnVisibility(id); }
        });

        // Set pickup and dropoff with skipUpdate = true to prevent intermediate conflicting route requests
        this.setPickup(pLat, pLng, pName, true);
        this.setDropoff(dLat, dLng, dName, true);

        // Perform a single atomic route update
        this.updateRoute();

        this.checkBothAddressesFilled();
        SavedAddressManager.addRecent(route.pickup);
        SavedAddressManager.addRecent(route.dropoff);

        if (typeof App !== 'undefined') {
            App.showToast(`Applied saved route: ${route.label || (pName + ' → ' + dName)}`, "success");
        }
    },

    clearInput(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        // If it's an address field that triggers map/marker updates, delegate to clearAddressInput
        if (['pickup-input', 'dropoff-input', 'parcel-booker-address', 'parcel-dropoff-input', 'food-dropoff-input'].includes(inputId)) {
            this.clearAddressInput(inputId);
            return;
        }

        input.value = '';
        this.updateClearBtnVisibility(inputId);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    },

    clearAddressInput(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.value = '';
        this.updateClearBtnVisibility(inputId);

        if (inputId === 'food-dropoff-input') {
            FoodDeliveryModule.clearFoodDropoff();
            return;
        }

        if (inputId === 'pickup-input' || inputId === 'parcel-booker-address') {
            this.pickupCoords = null;
            this.pickupName = '';
            if (this.pickupMarker) {
                try { this.map.removeLayer(this.pickupMarker); } catch(e) {}
                this.pickupMarker = null;
            }
            if (inputId === 'parcel-booker-address') {
                const stdP = document.getElementById('pickup-input');
                if (stdP) { stdP.value = ''; this.updateClearBtnVisibility('pickup-input'); }
            } else {
                const parP = document.getElementById('parcel-booker-address');
                if (parP) { parP.value = ''; this.updateClearBtnVisibility('parcel-booker-address'); }
            }
        } else if (inputId === 'dropoff-input' || inputId === 'parcel-dropoff-input') {
            this.dropoffCoords = null;
            this.dropoffName = '';
            if (this.dropoffMarker) {
                try { this.map.removeLayer(this.dropoffMarker); } catch(e) {}
                this.dropoffMarker = null;
            }
            if (inputId === 'parcel-dropoff-input') {
                const stdD = document.getElementById('dropoff-input');
                if (stdD) { stdD.value = ''; this.updateClearBtnVisibility('dropoff-input'); }
            } else {
                const parD = document.getElementById('parcel-dropoff-input');
                if (parD) { parD.value = ''; this.updateClearBtnVisibility('parcel-dropoff-input'); }
            }
        }

        if (this.routeLine) {
            try {
                if (this.map && this.map.hasLayer(this.routeLine)) {
                    this.map.removeLayer(this.routeLine);
                }
            } catch(e) {}
            this.routeLine = null;
        }
        if (this.map) {
            try {
                this.map.eachLayer(layer => {
                    if (layer && layer._isHirnaRoute) {
                        try { this.map.removeLayer(layer); } catch(e) {}
                    }
                });
            } catch(e) {}
        }

        this.checkBothAddressesFilled();
        this.updateRoute();

        input.dispatchEvent(new Event('input'));
        input.focus();
    },

    updateClearBtnVisibility(inputId) {
        const input = document.getElementById(inputId);
        const clearBtn = document.getElementById(inputId + '-clear-btn') || 
                         document.getElementById(inputId.replace(/-input$/, '') + '-clear-btn');
        if (!input || !clearBtn) return;

        if (input.value && input.value.trim().length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    },

    saveBothLocations() {
        const existingRoute = this.isCurrentTripSaved();
        if (existingRoute) {
            this.promptUnsaveRoute(existingRoute);
            return;
        }

        const isParcel = this.activeService === 'parcel';
        const pName = (isParcel ? document.getElementById('parcel-booker-address')?.value : document.getElementById('pickup-input')?.value)?.trim() || this.pickupName;
        const dName = (isParcel ? document.getElementById('parcel-dropoff-input')?.value : document.getElementById('dropoff-input')?.value)?.trim() || this.dropoffName;
        const pCoords = this.pickupCoords || [14.5547, 121.0244];
        const dCoords = this.dropoffCoords || [14.5517, 121.0509];

        if (!pName || !dName) {
            if (typeof App !== 'undefined') App.showToast("Please enter both pickup and dropoff locations first.", "warning");
            return;
        }

        const pLat = parseFloat(Array.isArray(pCoords) ? pCoords[0] : (pCoords.lat || 14.5547));
        const pLng = parseFloat(Array.isArray(pCoords) ? pCoords[1] : (pCoords.lng || 121.0244));
        const dLat = parseFloat(Array.isArray(dCoords) ? dCoords[0] : (dCoords.lat || 14.5517));
        const dLng = parseFloat(Array.isArray(dCoords) ? dCoords[1] : (dCoords.lng || 121.0509));

        const pickupObj = {
            name: pName,
            city: 'Philippines',
            lat: pLat,
            lng: pLng,
            icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
        };
        const dropoffObj = {
            name: dName,
            city: 'Philippines',
            lat: dLat,
            lng: dLng,
            icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
        };

        const savedRoute = SavedAddressManager.saveRoute(pickupObj, dropoffObj);

        // Also save to individual favorites
        SavedAddressManager.saveAddress({ ...pickupObj, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }, pName);
        SavedAddressManager.saveAddress({ ...dropoffObj, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' }, dName);

        this.updateSaveTripButtonState();

        if (typeof App !== 'undefined') {
            App.showToast(`Saved trip "${savedRoute ? savedRoute.label : pName + ' → ' + dName}" to your Saved Places tab!`, "success");
        }
    },

    saveCurrentAddress(targetType) {
        let name = '';
        let coords = null;
        const isParcel = this.activeService === 'parcel';

        if (targetType === 'pickup') {
            name = (isParcel ? document.getElementById('parcel-booker-address')?.value : document.getElementById('pickup-input')?.value) || this.pickupName;
            coords = this.pickupCoords || [14.5547, 121.0244];
        } else {
            name = (isParcel ? document.getElementById('parcel-dropoff-input')?.value : document.getElementById('dropoff-input')?.value) || this.dropoffName;
            coords = this.dropoffCoords || [14.5517, 121.0509];
        }

        if (!name) {
            if (typeof App !== 'undefined') App.showToast("Please select an address first before saving.", "warning");
            return;
        }

        const cLat = parseFloat(Array.isArray(coords) ? coords[0] : (coords.lat || 14.5547));
        const cLng = parseFloat(Array.isArray(coords) ? coords[1] : (coords.lng || 121.0244));

        const defaultLabel = targetType === 'pickup' ? 'My Pickup Spot' : 'My Destination';
        const customLabel = prompt(`Save "${name}" to Favorites.\nEnter a label (e.g. Home, Office, Studio):`, defaultLabel);
        if (customLabel !== null) {
            SavedAddressManager.saveAddress({
                name: name,
                city: 'Philippines',
                lat: cLat,
                lng: cLng,
                icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
            }, customLabel || name);

            if (typeof App !== 'undefined') {
                App.showToast(`Address "${customLabel || name}" saved to your Favorites!`, "success");
            }
        }
    },

    // =========================================================================
    // MAP CLICK SELECTION MODE ("Click on a location" - Toggleable)
    // =========================================================================
    activateMapClickMode(targetInputId) {
        // If this input is ALREADY active, clicking the button again TOGGLES it OFF
        if (this.mapClickTargetInputId === targetInputId) {
            this.deactivateMapClickMode();
            if (typeof App !== 'undefined') {
                App.showToast("Map selection cancelled.", "info");
            }
            return;
        }

        this.mapClickTargetInputId = targetInputId;

        const isPickup = targetInputId.includes('pickup') || targetInputId.includes('booker');
        const targetLabel = isPickup ? "Pickup Location" : "Destination Dropoff";

        // Update button UI states
        document.querySelectorAll('.btn-pick-map-target').forEach(btn => {
            btn.classList.remove('bg-amber-100', 'text-amber-800', 'border-amber-400', 'ring-2', 'ring-amber-400');
            btn.classList.add('bg-slate-100', 'text-hirna-700');
        });

        const activeBtn = document.getElementById(`btn-pick-map-${targetInputId}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-slate-100', 'text-hirna-700');
            activeBtn.classList.add('bg-amber-100', 'text-amber-800', 'border', 'border-amber-400', 'ring-2', 'ring-amber-400');
        }

        // Show map header badge
        const badge = document.getElementById('map-click-active-badge');
        const badgeLabel = document.getElementById('map-click-active-label');

        if (badge) {
            badge.classList.remove('hidden');
            badge.classList.add('flex');
        }
        if (badgeLabel) badgeLabel.textContent = `Click map for ${targetLabel}`;

        // Change Leaflet cursor to crosshair
        const mapContainer = document.getElementById('booking-map');
        if (mapContainer) {
            mapContainer.style.cursor = 'crosshair';
            mapContainer.classList.add('ring-2', 'ring-amber-400');
        }

        // Scroll map into view smoothly if on mobile
        if (window.innerWidth < 1024) {
            mapContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (typeof App !== 'undefined') {
            App.showToast(`Click anywhere on the map to select ${targetLabel} (or tap button again to cancel).`, "info");
        }
    },

    deactivateMapClickMode() {
        this.mapClickTargetInputId = null;

        // Reset button UI states
        document.querySelectorAll('.btn-pick-map-target').forEach(btn => {
            btn.classList.remove('bg-amber-100', 'text-amber-800', 'border', 'border-amber-400', 'ring-2', 'ring-amber-400');
            btn.classList.add('bg-slate-100', 'text-hirna-700');
        });

        // Hide map badge
        const badge = document.getElementById('map-click-active-badge');
        if (badge) {
            badge.classList.remove('flex');
            badge.classList.add('hidden');
        }

        // Reset map cursor
        const mapContainer = document.getElementById('booking-map');
        if (mapContainer) {
            mapContainer.style.cursor = '';
            mapContainer.classList.remove('ring-2', 'ring-amber-400');
        }
    },

    /**
     * Resolves real-world landmark, building, street, or barangay from map coordinates
     */
    reverseGeocodeLandmark(lat, lng, callback) {
        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        if (this.osmReverseCache && this.osmReverseCache[cacheKey]) {
            callback(this.osmReverseCache[cacheKey]);
            return;
        }

        // 1. Check local landmark presets within ~350m
        let nearestPreset = null;
        let minDist = 0.35; // km threshold (~350m)
        for (const p of this.presets) {
            const d = this.calculateDistance(lat, lng, p.lat, p.lng);
            if (d < minDist) {
                minDist = d;
                nearestPreset = p;
            }
        }
        if (nearestPreset) {
            if (!this.osmReverseCache) this.osmReverseCache = {};
            this.osmReverseCache[cacheKey] = nearestPreset.name;
            callback(nearestPreset.name);
            return;
        }

        // 2. Query OpenStreetMap Nominatim reverse API
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        fetch(url, { headers: { 'Accept-Language': 'en' } })
            .then(res => res.json())
            .then(data => {
                if (!data || !data.address) {
                    const fallbackName = `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                    callback(fallbackName);
                    return;
                }
                const addr = data.address;
                const landmark = data.name ||
                    addr.amenity ||
                    addr.building ||
                    addr.shop ||
                    addr.tourism ||
                    addr.leisure ||
                    addr.office ||
                    addr.road ||
                    addr.quarter ||
                    addr.suburb ||
                    addr.village ||
                    addr.neighbourhood;

                const locality = addr.suburb || addr.quarter || addr.city_district || addr.city || addr.town || addr.municipality || 'Philippines';

                let cleanName = '';
                if (landmark && locality && !landmark.toLowerCase().includes(locality.toLowerCase())) {
                    cleanName = `${landmark}, ${locality}`;
                } else if (landmark) {
                    cleanName = landmark;
                } else if (data.display_name) {
                    cleanName = data.display_name.split(',').slice(0, 3).map(s => s.trim()).join(', ');
                } else {
                    cleanName = `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                }

                if (!this.osmReverseCache) this.osmReverseCache = {};
                this.osmReverseCache[cacheKey] = cleanName;
                callback(cleanName);
            })
            .catch(err => {
                console.warn("Reverse geocode network error:", err);
                callback(`Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            });
    },

    // =========================================================================
    // GPS PERMISSION & LOCATION HANDLING
    // =========================================================================
    fillGPSLocation(targetInputId) {
        // 1. If DeviceLocationManager is ALREADY enabled and has locked coordinates:
        if (typeof DeviceLocationManager !== 'undefined' && DeviceLocationManager.isEnabled && DeviceLocationManager.coords) {
            this.applyLocationToInput(DeviceLocationManager.coords, targetInputId);
            return;
        }

        // 2. If DeviceLocationManager is available, leverage its high-accuracy acquisition & filter pipeline
        if (typeof DeviceLocationManager !== 'undefined') {
            DeviceLocationManager.onNextLock = (coords) => {
                this.applyLocationToInput(coords, targetInputId);
            };
            DeviceLocationManager.requestLocation();
            if (typeof App !== 'undefined') {
                App.showToast("Acquiring high-accuracy GNSS satellite fix...", "info");
            }
            return;
        }

        // 3. Fallback direct acquisition
        this.executeGPSAcquisition(targetInputId);
    },

    requestGPSPermission(targetInputId) {
        // Direct to fillGPSLocation which handles permissions seamlessly with DeviceLocationManager
        this.fillGPSLocation(targetInputId);
    },

    denyGPSPermission() {
        const modal = document.getElementById('gps-permission-modal');
        if (modal) modal.classList.add('hidden');
        this.pendingGPSInputId = null;
        if (typeof App !== 'undefined') {
            App.showToast("GPS location permission was not granted.", "info");
        }
    },

    confirmGPSPermission() {
        const modal = document.getElementById('gps-permission-modal');
        if (modal) modal.classList.add('hidden');

        const targetInputId = this.pendingGPSInputId;
        this.pendingGPSInputId = null;
        if (!targetInputId) return;

        this.fillGPSLocation(targetInputId);
    },

    executeGPSAcquisition(targetInputId) {
        if (typeof DeviceLocationManager !== 'undefined') {
            DeviceLocationManager.onNextLock = (coords) => {
                this.applyLocationToInput(coords, targetInputId);
            };
            DeviceLocationManager.requestLocation();
            return;
        }

        const targetInput = document.getElementById(targetInputId);
        if (!targetInput) return;

        if ("geolocation" in navigator) {
            if (typeof App !== 'undefined') App.showToast("Acquiring high-accuracy GNSS satellite fix...", "info");

            const options = {
                timeout: 15000,
                enableHighAccuracy: true,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    let coords = {
                        lat: parseFloat(pos.coords.latitude.toFixed(6)),
                        lng: parseFloat(pos.coords.longitude.toFixed(6)),
                        accuracy: Math.round(pos.coords.accuracy || 10)
                    };

                    if (typeof DeviceLocationManager !== 'undefined') {
                        const processed = DeviceLocationManager.processLocationSample(pos);
                        coords.lat = processed.lat;
                        coords.lng = processed.lng;
                        coords.accuracy = processed.accuracy;
                        coords.resolvedName = DeviceLocationManager.snapToLandmark(coords.lat, coords.lng, coords.accuracy);
                        DeviceLocationManager.coords = coords;
                        DeviceLocationManager.isEnabled = true;
                        DeviceLocationManager.updateUI();
                        DeviceLocationManager.updateMapLocationMarker(coords.lat, coords.lng, coords.accuracy, true);
                    }

                    this.applyLocationToInput(coords, targetInputId);
                },
                (err) => {
                    console.warn("GPS acquisition error:", err);
                    if (typeof App !== 'undefined') {
                        App.showToast("Could not acquire accurate GPS coordinates. Please check your device location.", "warning");
                    }
                },
                options
            );
        } else {
            if (typeof App !== 'undefined') App.showToast("Geolocation is not supported by your browser.", "warning");
        }
    },

    useCurrentLocationAsPickup(targetInputId = 'pickup-input') {
        const isParcel = this.activeService === 'parcel' || targetInputId === 'parcel-booker-address';
        const inputId = isParcel ? 'parcel-booker-address' : 'pickup-input';
        this.fillGPSLocation(inputId);
    },

    applyLocationToInput(coords, targetInputId = 'pickup-input') {
        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return;

        const lat = coords.lat;
        const lng = coords.lng;
        const accuracy = coords.accuracy || 10;
        const name = coords.resolvedName || (typeof DeviceLocationManager !== 'undefined' ? DeviceLocationManager.snapToLandmark(lat, lng, accuracy) : `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

        const isPickup = targetInputId === 'pickup-input' || targetInputId === 'parcel-booker-address';
        const isDropoff = targetInputId === 'dropoff-input' || targetInputId === 'parcel-dropoff-input';
        const isFoodDropoff = targetInputId === 'food-dropoff-input';

        const inputEl = document.getElementById(targetInputId);
        if (inputEl) {
            inputEl.value = name;
            this.updateClearBtnVisibility(targetInputId);
        }

        if (isFoodDropoff) {
            if (typeof FoodDeliveryModule !== 'undefined') {
                FoodDeliveryModule.setFoodDropoff(lat, lng, name);
            }
        } else if (isPickup) {
            this.setPickup(lat, lng, name);
            if (targetInputId === 'parcel-booker-address') {
                const stdP = document.getElementById('pickup-input');
                if (stdP) { stdP.value = name; this.updateClearBtnVisibility('pickup-input'); }
            } else {
                const parP = document.getElementById('parcel-booker-address');
                if (parP) { parP.value = name; this.updateClearBtnVisibility('parcel-booker-address'); }
            }
        } else if (isDropoff) {
            this.setDropoff(lat, lng, name);
            if (targetInputId === 'parcel-dropoff-input') {
                const stdD = document.getElementById('dropoff-input');
                if (stdD) { stdD.value = name; this.updateClearBtnVisibility('dropoff-input'); }
            } else {
                const parD = document.getElementById('parcel-dropoff-input');
                if (parD) { parD.value = name; this.updateClearBtnVisibility('parcel-dropoff-input'); }
            }
        } else if (targetInputId === 'home-address-input-field') {
            // Handled in home modal
        }

        SavedAddressManager.addRecent({ name, lat, lng, icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' });
        this.checkBothAddressesFilled();

        // Update map live marker and pan to the current location
        if (typeof DeviceLocationManager !== 'undefined') {
            DeviceLocationManager.updateMapLocationMarker(lat, lng, accuracy, true);
        } else if (this.map) {
            try { this.map.panTo([lat, lng], { animate: true }); } catch(e) {}
        }

        if (typeof App !== 'undefined') {
            App.showToast(`Selected current location (±${Math.round(accuracy)}m precision)!`, "success");
        }
    },

    applyLocationAsPickup(coords, targetInputId = 'pickup-input') {
        this.applyLocationToInput(coords, targetInputId);
    },

    homeModalCallerInputId: null,

    openHomeAddressModal(callerInputId = null) {
        this.homeModalCallerInputId = callerInputId;
        const modal = document.getElementById('home-address-modal');
        const inputField = document.getElementById('home-address-input-field');
        const modalTitle = document.getElementById('home-modal-title');
        
        const existing = SavedAddressManager.getHome();
        if (inputField) {
            inputField.value = existing ? existing.name : '';
        }
        if (modalTitle) {
            modalTitle.innerText = existing ? "Edit Home Address" : "Input Home Address";
        }
        if (modal) modal.classList.remove('hidden');
        setTimeout(() => inputField?.focus(), 100);
    },

    closeHomeAddressModal() {
        const modal = document.getElementById('home-address-modal');
        if (modal) modal.classList.add('hidden');
    },

    fillHomeWithLocation() {
        const inputField = document.getElementById('home-address-input-field');
        if (typeof App !== 'undefined') App.showToast("Acquiring accurate current GPS location...", "info");

        const applyFoundAddress = (resolvedName, lat, lng) => {
            if (inputField) {
                inputField.value = resolvedName;
                inputField.focus();
                this.updateClearBtnVisibility('home-address-input-field');
            }
            this.pickupCoords = [lat, lng];
            if (typeof App !== 'undefined') {
                App.showToast(`Set home address to current location: ${resolvedName}`, "success");
            }
        };

        // Check if high-precision coordinates exist
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const acc = Math.round(pos.coords.accuracy || 10);

                    // Reverse geocode via Nominatim
                    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
                    fetch(url, { headers: { 'Accept-Language': 'en' } })
                        .then(res => res.json())
                        .then(data => {
                            let locStr = '';
                            if (data && data.address) {
                                const a = data.address;
                                const landmark = data.name || a.amenity || a.building || a.shop || a.road || a.suburb;
                                const city = a.city || a.town || a.municipality || a.city_district || 'Caloocan City';
                                const state = a.state || a.region || 'Metro Manila';
                                if (landmark) {
                                    locStr = `${landmark}, ${city}, ${state}`;
                                } else if (data.display_name) {
                                    locStr = data.display_name.split(',').slice(0, 3).map(s => s.trim()).join(', ');
                                }
                            }
                            if (!locStr) {
                                locStr = localStorage.getItem('hirna_user_gps_location') || "Caloocan City, Metro Manila, Philippines";
                            }
                            applyFoundAddress(locStr, lat, lng);
                        })
                        .catch(() => {
                            const fallback = localStorage.getItem('hirna_user_gps_location') || "Caloocan City, Metro Manila, Philippines";
                            applyFoundAddress(fallback, lat, lng);
                        });
                },
                (err) => {
                    console.warn("GPS lookup failed:", err);
                    const savedLoc = localStorage.getItem('hirna_user_gps_location') || "Caloocan City, Metro Manila, Philippines";
                    applyFoundAddress(savedLoc, 14.6548, 120.9840);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } else {
            const savedLoc = localStorage.getItem('hirna_user_gps_location') || "Caloocan City, Metro Manila, Philippines";
            applyFoundAddress(savedLoc, 14.6548, 120.9840);
        }
    },

    saveHomeAddress() {
        const inputField = document.getElementById('home-address-input-field');
        const address = inputField ? inputField.value.trim() : '';
        if (!address) {
            if (typeof App !== 'undefined') App.showToast("Please enter your home address.", "warning");
            inputField?.focus();
            return;
        }

        const presets = (this.locations || this.presets || []);
        const match = Array.isArray(presets) ? presets.find(p => p && p.name && address.toLowerCase().includes(p.name.toLowerCase())) : null;
        const coords = match ? [match.lat, match.lng] : (this.pickupCoords || [14.5547, 121.0244]);

        const homeData = {
            name: address,
            city: match ? match.city : "Philippines",
            lat: coords[0] || 14.5547,
            lng: coords[1] || 121.0244,
            icon: '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
        };

        const isEdit = SavedAddressManager.hasHome();
        SavedAddressManager.setHome(homeData);

        this.closeHomeAddressModal();

        // Show confirmation popup saying "Home Address Added" (or "Home Address Updated")
        const confirmModal = document.getElementById('home-address-confirmation-modal');
        const confirmTitle = document.getElementById('home-confirm-title');
        const confirmSubtitle = document.getElementById('home-confirm-subtitle');
        if (confirmTitle) confirmTitle.innerText = isEdit ? "Home Address Updated" : "Home Address Added";
        if (confirmSubtitle) confirmSubtitle.innerText = `"${address}" has been saved as your home address.`;
        if (confirmModal) confirmModal.classList.remove('hidden');

        if (typeof App !== 'undefined') {
            App.showToast(isEdit ? "Home Address Updated" : "Home Address Added", "success");
        }

        // If user was filling an input when clicking "Add home address", populate it
        if (this.homeModalCallerInputId) {
            const callerIn = document.getElementById(this.homeModalCallerInputId);
            if (callerIn && !callerIn.value) {
                callerIn.value = address;
                if (this.homeModalCallerInputId.includes('pickup') || this.homeModalCallerInputId.includes('booker')) {
                    this.setPickup(homeData.lat, homeData.lng, address);
                } else {
                    this.setDropoff(homeData.lat, homeData.lng, address);
                }
            }
        }

        if (typeof FoodDeliveryModule !== 'undefined' && typeof DeviceLocationManager !== 'undefined' && !DeviceLocationManager.isEnabled) {
            FoodDeliveryModule.onLocationChanged();
        }
    },

    closeHomeAddressConfirmModal() {
        const confirmModal = document.getElementById('home-address-confirmation-modal');
        if (confirmModal) confirmModal.classList.add('hidden');
    },

    promptDeleteSavedRoute(routeId, routeTitle, onDeletedCallback) {
        this.pendingDeleteRouteId = routeId;
        this.pendingDeleteType = 'route';
        this.pendingDeleteRouteCallback = onDeletedCallback;
        const titleEl = document.getElementById('delete-confirm-title');
        const descEl = document.getElementById('delete-confirm-desc');
        const nameEl = document.getElementById('delete-route-confirm-name');
        const actionBtn = document.getElementById('btn-delete-confirm-action');

        if (titleEl) titleEl.textContent = "Delete Saved Trip?";
        if (descEl) descEl.textContent = "Are you sure you want to delete this route from your Saved Places? This cannot be undone.";
        if (nameEl) nameEl.textContent = routeTitle || "Saved Trip";
        if (actionBtn) actionBtn.textContent = "Delete";

        const modal = document.getElementById('delete-route-confirmation-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else if (confirm(`Are you sure you want to delete "${routeTitle || 'this place'}" from your Saved Places?`)) {
            this.confirmDeleteSavedRoute();
        }
    },

    promptDeleteSavedAddress(name, onDeletedCallback) {
        this.pendingDeleteRouteId = name;
        this.pendingDeleteType = 'address';
        this.pendingDeleteRouteCallback = onDeletedCallback;
        const titleEl = document.getElementById('delete-confirm-title');
        const descEl = document.getElementById('delete-confirm-desc');
        const nameEl = document.getElementById('delete-route-confirm-name');
        const actionBtn = document.getElementById('btn-delete-confirm-action');

        if (titleEl) titleEl.textContent = "Delete Saved Place?";
        if (descEl) descEl.textContent = "Are you sure you want to delete this place from your Saved Places? This cannot be undone.";
        if (nameEl) nameEl.textContent = name || "Saved Place";
        if (actionBtn) actionBtn.textContent = "Delete";

        const modal = document.getElementById('delete-route-confirmation-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else if (confirm(`Are you sure you want to delete "${name || 'this place'}" from your Saved Places?`)) {
            this.confirmDeleteSavedRoute();
        }
    },

    promptDeleteRecentPlace(name, onDeletedCallback) {
        this.pendingDeleteRouteId = name;
        this.pendingDeleteType = 'recent_place';
        this.pendingDeleteRouteCallback = onDeletedCallback;
        const titleEl = document.getElementById('delete-confirm-title');
        const descEl = document.getElementById('delete-confirm-desc');
        const nameEl = document.getElementById('delete-route-confirm-name');
        const actionBtn = document.getElementById('btn-delete-confirm-action');

        if (titleEl) titleEl.textContent = "Remove Recent Place?";
        if (descEl) descEl.textContent = "Are you sure you want to remove this place from your recent history?";
        if (nameEl) nameEl.textContent = name || "Recent Place";
        if (actionBtn) actionBtn.textContent = "Remove";

        const modal = document.getElementById('delete-route-confirmation-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else if (confirm(`Are you sure you want to remove "${name}" from recent places?`)) {
            this.confirmDeleteSavedRoute();
        }
    },

    promptDeleteContact(contact, type, onDeletedCallback) {
        this.pendingDeleteRouteId = contact.id || contact.name;
        this.pendingDeleteType = type === 'booker' ? 'booker_contact' : 'recipient_contact';
        this.pendingDeleteRouteCallback = onDeletedCallback;
        const titleEl = document.getElementById('delete-confirm-title');
        const descEl = document.getElementById('delete-confirm-desc');
        const nameEl = document.getElementById('delete-route-confirm-name');
        const actionBtn = document.getElementById('btn-delete-confirm-action');

        if (titleEl) titleEl.textContent = "Remove Saved Contact?";
        if (descEl) descEl.textContent = `Are you sure you want to remove this ${type === 'booker' ? 'booker/passenger' : 'recipient'} contact from your history?`;
        if (nameEl) nameEl.textContent = `${contact.name} (${contact.phone || 'No phone'})`;
        if (actionBtn) actionBtn.textContent = "Remove";

        const modal = document.getElementById('delete-route-confirmation-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else if (confirm(`Are you sure you want to remove ${contact.name}?`)) {
            this.confirmDeleteSavedRoute();
        }
    },

    promptUnsaveRoute(route) {
        if (!route) return;
        this.pendingDeleteRouteId = route.id;
        this.pendingDeleteType = 'unsave_route';
        this.pendingDeleteRouteCallback = () => {
            this.updateSaveTripButtonState();
        };
        const titleEl = document.getElementById('delete-confirm-title');
        const descEl = document.getElementById('delete-confirm-desc');
        const nameEl = document.getElementById('delete-route-confirm-name');
        const actionBtn = document.getElementById('btn-delete-confirm-action');

        if (titleEl) titleEl.textContent = "Unsave Trip?";
        if (descEl) descEl.textContent = "Are you sure you want to remove this trip from your Saved Places?";
        if (nameEl) nameEl.textContent = route.label || `${route.pickup?.name} → ${route.dropoff?.name}`;
        if (actionBtn) actionBtn.textContent = "Unsave";

        const modal = document.getElementById('delete-route-confirmation-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else if (confirm(`Are you sure you want to unsave "${route.label}"?`)) {
            this.confirmDeleteSavedRoute();
        }
    },

    cancelDeleteSavedRoute() {
        this.pendingDeleteRouteId = null;
        this.pendingDeleteType = null;
        this.pendingDeleteRouteCallback = null;
        const modal = document.getElementById('delete-route-confirmation-modal');
        if (modal) modal.classList.add('hidden');

        // Reset modal texts to default
        const titleEl = document.getElementById('delete-confirm-title');
        const descEl = document.getElementById('delete-confirm-desc');
        const actionBtn = document.getElementById('btn-delete-confirm-action');
        if (titleEl) titleEl.textContent = "Delete Saved Place?";
        if (descEl) descEl.textContent = "Are you sure you want to delete this route from your Saved Places? This cannot be undone.";
        if (actionBtn) actionBtn.textContent = "Delete";
    },

    confirmDeleteSavedRoute() {
        const targetId = this.pendingDeleteRouteId;
        const targetType = this.pendingDeleteType;
        const callback = this.pendingDeleteRouteCallback;
        if (targetId) {
            if (targetType === 'address') {
                SavedAddressManager.deleteAddress(targetId);
                if (typeof App !== 'undefined') App.showToast("Place removed from Saved Places.", "info");
            } else if (targetType === 'recent_place') {
                SavedAddressManager.deleteRecent(targetId);
                if (typeof App !== 'undefined') App.showToast("Removed from recent places.", "info");
            } else if (targetType === 'booker_contact') {
                ContactHistoryManager.deleteBooker(targetId);
                if (typeof App !== 'undefined') App.showToast("Contact removed from history.", "info");
            } else if (targetType === 'recipient_contact') {
                ContactHistoryManager.deleteRecipient(targetId);
                if (typeof App !== 'undefined') App.showToast("Recipient removed from history.", "info");
            } else if (targetType === 'unsave_route') {
                SavedAddressManager.deleteRoute(targetId);
                if (typeof App !== 'undefined') App.showToast("Trip removed from Saved Places.", "info");
                this.updateSaveTripButtonState();
            } else {
                SavedAddressManager.deleteRoute(targetId);
                if (typeof App !== 'undefined') App.showToast("Trip removed from Saved Places.", "info");
                this.updateSaveTripButtonState();
            }
            if (typeof callback === 'function') {
                callback();
            }
        }
        this.cancelDeleteSavedRoute();
    },

    viewHomeAddress() {
        const home = SavedAddressManager.getHome();
        if (!home) {
            this.openHomeAddressModal();
            return;
        }
        const textEl = document.getElementById('view-home-address-text');
        if (textEl) textEl.innerText = home.name;

        const viewModal = document.getElementById('home-address-view-modal');
        if (viewModal) viewModal.classList.remove('hidden');
    },

    closeHomeAddressViewModal() {
        const viewModal = document.getElementById('home-address-view-modal');
        if (viewModal) viewModal.classList.add('hidden');
    },

    editHomeAddressFromView() {
        this.closeHomeAddressViewModal();
        this.openHomeAddressModal();
    },

    syncContactFieldsAcrossServices() {
        const stdName = document.getElementById('std-passenger-name');
        const stdPhone = document.getElementById('std-passenger-phone');
        const parcelName = document.getElementById('parcel-booker-name');
        const parcelPhone = document.getElementById('parcel-booker-phone');
        const foodName = document.getElementById('food-booker-name');
        const foodPhone = document.getElementById('food-booker-phone');

        // Capture current contact values from whichever input was recently filled
        const currentName = (stdName && stdName.value.trim()) || 
                            (parcelName && parcelName.value.trim()) || 
                            (foodName && foodName.value.trim()) || 
                            this.bookerName || 
                            this.passengerName || '';

        const currentPhone = (stdPhone && stdPhone.value.trim()) || 
                             (parcelPhone && parcelPhone.value.trim()) || 
                             (foodPhone && foodPhone.value.trim()) || 
                             this.bookerPhone || 
                             this.passengerPhone || '';

        if (currentName) {
            this.bookerName = currentName;
            this.passengerName = currentName;
            if (stdName && !stdName.value.trim()) { stdName.value = currentName; this.updateClearBtnVisibility('std-passenger-name'); }
            if (parcelName && !parcelName.value.trim()) { parcelName.value = currentName; this.updateClearBtnVisibility('parcel-booker-name'); }
            if (foodName && !foodName.value.trim()) { foodName.value = currentName; this.updateClearBtnVisibility('food-booker-name'); }
        }

        if (currentPhone) {
            this.bookerPhone = currentPhone;
            this.passengerPhone = currentPhone;
            if (stdPhone && !stdPhone.value.trim()) { stdPhone.value = currentPhone; this.updateClearBtnVisibility('std-passenger-phone'); }
            if (parcelPhone && !parcelPhone.value.trim()) { parcelPhone.value = currentPhone; this.updateClearBtnVisibility('parcel-booker-phone'); }
            if (foodPhone && !foodPhone.value.trim()) { foodPhone.value = currentPhone; this.updateClearBtnVisibility('food-booker-phone'); }
        }
    },

    switchService(categoryKey) {
        this.setServiceCategory(categoryKey);
    },

    setServiceCategory(categoryKey) {
        const prev = this.activeService;

        // Remember current step for previous service
        if (!this.serviceSteps) {
            this.serviceSteps = { transport: 1, parcel: 1, mart: 1 };
        }
        if (prev && prev !== 'food') {
            this.serviceSteps[prev] = this.currentStep;
        }

        this.activeService = categoryKey;

        // If moving between transport and mart, sync the step (both are standard 2-step services)
        if ((prev === 'transport' && categoryKey === 'mart') || (prev === 'mart' && categoryKey === 'transport')) {
            this.serviceSteps[categoryKey] = this.serviceSteps[prev];
        }

        // Restore saved step for the selected service vertical so section persists
        if (categoryKey !== 'food') {
            this.currentStep = this.serviceSteps[categoryKey] || 1;
        }

        if (prev === 'food' && categoryKey !== 'food') {
            FoodDeliveryModule.clearMapArtifacts();
        }

        // Keep Booker/Passenger contact details (name & phone) synchronized across service sections
        this.syncContactFieldsAcrossServices();

        // Update vertical tabs
        document.querySelectorAll('.btn-service-vertical').forEach(btn => {
            const isTarget = btn.dataset.service === categoryKey;
            btn.className = isTarget 
                ? "btn-service-vertical flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-hirna-700 text-white shadow-md transition flex items-center justify-center space-x-1.5 border border-hirna-600"
                : "btn-service-vertical flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center justify-center space-x-1.5 border border-slate-200";
        });

        this.renderServiceOptions();
        this.syncLayoutToServiceAndStep();
        if (categoryKey !== 'food') {
            this.updateRoute();
            this.checkBothAddressesFilled();
        } else {
            if (FoodDeliveryModule.currentStep === 'stores') {
                FoodDeliveryModule.plotStoreMarkersOnMap();
            }
        }
    },

    /**
     * Dynamically swaps layouts based on service (standard vs parcel vs food) and step (1 vs 2)
     */
    syncLayoutToServiceAndStep() {
        const standardStep1 = document.getElementById('standard-step-1');
        const standardStep2 = document.getElementById('standard-step-2');
        const parcelStep1 = document.getElementById('parcel-step-1');
        const parcelStep2 = document.getElementById('parcel-step-2');
        const foodContainer = document.getElementById('food-service-container');
        const stepBadge = document.getElementById('booking-step-badge');
        const panelTitle = document.getElementById('booking-panel-title');
        const panelSubtitle = document.getElementById('booking-panel-subtitle');

        const isParcel = this.activeService === 'parcel';
        const isFood = this.activeService === 'food';

        if (isFood) {
            // Hide standard and parcel steps
            if (standardStep1) standardStep1.classList.add('hidden');
            if (standardStep2) standardStep2.classList.add('hidden');
            if (parcelStep1) parcelStep1.classList.add('hidden');
            if (parcelStep2) parcelStep2.classList.add('hidden');
            if (foodContainer) foodContainer.classList.remove('hidden');

            if (stepBadge) stepBadge.innerText = "Hirna Food Delivery";
            if (panelTitle) panelTitle.innerText = "Hirna Food Delivery Concierge";
            if (panelSubtitle) panelSubtitle.innerText = "Order from top-rated restaurants & specialty stores with live courier dispatch";

            FoodDeliveryModule.syncLayout();
            return;
        }

        // When not on food, ensure food container is hidden
        if (foodContainer) foodContainer.classList.add('hidden');

        if (isParcel) {
            // Hide standard steps
            if (standardStep1) standardStep1.classList.add('hidden');
            if (standardStep2) standardStep2.classList.add('hidden');

            if (this.currentStep === 1) {
                if (parcelStep1) parcelStep1.classList.remove('hidden');
                if (parcelStep2) parcelStep2.classList.add('hidden');
                if (stepBadge) stepBadge.innerText = "Step 1 of 2: Sender Setup";
                if (panelTitle) panelTitle.innerText = "Hirna Express Parcel Dispatch";
                if (panelSubtitle) panelSubtitle.innerText = "Step 1: Enter booker's address, package tier, and sender details";
            } else {
                if (parcelStep1) parcelStep1.classList.add('hidden');
                if (parcelStep2) parcelStep2.classList.remove('hidden');
                if (stepBadge) stepBadge.innerText = "Step 2 of 2: Recipient Details";
                if (panelTitle) panelTitle.innerText = "Parcel Recipient & Delivery";
                if (panelSubtitle) panelSubtitle.innerText = "Step 2: Enter recipient dropoff address and contact details";

                // Sync sender summary in Step 2
                const senderSummary = document.getElementById('parcel-sender-summary');
                if (senderSummary) {
                    const bName = document.getElementById('parcel-booker-name')?.value || this.bookerName || 'Sender';
                    const bPhone = document.getElementById('parcel-booker-phone')?.value || this.bookerPhone || '';
                    const bAddr = document.getElementById('parcel-booker-address')?.value || this.pickupName || 'Pickup Location';
                    const schedStr = this.isParcelScheduled ? ` •  ${this.parcelScheduledTimeStr || 'Scheduled'}` : ' •  Immediate Dispatch';
                    senderSummary.innerText = `Sender: ${bName} (${bPhone}) • Address: ${bAddr}${schedStr}`;
                }
            }
        } else {
            // Standard services: Transport, Food, Mart
            if (parcelStep1) parcelStep1.classList.add('hidden');
            if (parcelStep2) parcelStep2.classList.add('hidden');

            if (this.currentStep === 1) {
                if (standardStep1) standardStep1.classList.remove('hidden');
                if (standardStep2) standardStep2.classList.add('hidden');
                if (stepBadge) stepBadge.innerText = "Step 1 of 2: Route & Service";
                
                const titles = {
                    transport: "Hirna Ride Booking & Dispatch",
                    food: "Hirna Food Delivery Concierge",
                    mart: "Hirna Mart & Grocery Express"
                };
                if (panelTitle) panelTitle.innerText = titles[this.activeService] || "Hirna Booking & Dispatch";
                if (panelSubtitle) panelSubtitle.innerText = "Enter pickup and dropoff points, package tier, and view fare estimate";
            } else {
                if (standardStep1) standardStep1.classList.add('hidden');
                if (standardStep2) standardStep2.classList.remove('hidden');
                if (stepBadge) stepBadge.innerText = "Step 2 of 2: Passenger Details";
                if (panelTitle) panelTitle.innerText = "Passenger & Payment Checkout";
                if (panelSubtitle) panelSubtitle.innerText = "Confirm your contact details and select preferred payment method";

                // Update Trip Summary chip in Standard Step 2
                const tripSummary = document.getElementById('std-trip-summary');
                if (tripSummary) {
                    const p = document.getElementById('pickup-input')?.value || "Pickup";
                    const d = document.getElementById('dropoff-input')?.value || "Dropoff";
                    const fare = this.currentQuote ? `₱${this.currentQuote.totalFare.toFixed(2)}` : "Calculating...";
                    tripSummary.innerText = `${this.activeService.toUpperCase()} • ${p} → ${d} • ${fare}`;
                }
            }
        }
    },

    goToStep(step, autoScroll = true) {
        if (step === 2) {
            // Validation for Step 1 -> Step 2
            if (this.activeService === 'parcel') {
                const bName = document.getElementById('parcel-booker-name');
                const bPhone = document.getElementById('parcel-booker-phone');
                const bAddr = document.getElementById('parcel-booker-address');

                if (!bName || !bName.value.trim()) {
                    if (typeof App !== 'undefined') App.showToast("Please enter the Booker's name.", "warning");
                    bName?.focus();
                    return;
                }
                if (!bPhone || !bPhone.value.trim()) {
                    if (typeof App !== 'undefined') App.showToast("Please enter the Booker's contact number.", "warning");
                    bPhone?.focus();
                    return;
                }
                if (!bAddr || !bAddr.value.trim()) {
                    if (typeof App !== 'undefined') App.showToast("Please enter Booker's address (pickup point).", "warning");
                    bAddr?.focus();
                    return;
                }

                // Check schedule validity if enabled
                if (this.isParcelScheduled) {
                    const schedTime = document.getElementById('parcel-schedule-time')?.value;
                    if (!this.validateAndSetParcelScheduleTime(schedTime)) {
                        if (typeof App !== 'undefined') App.showToast("Please set a delivery time within working hours (08:00 AM – 08:00 PM).", "warning");
                        document.getElementById('parcel-schedule-time')?.focus();
                        return;
                    }
                }

                this.bookerName = bName.value.trim();
                this.bookerPhone = bPhone.value.trim();
                this.pickupName = bAddr.value.trim();
            } else {
                const pInput = document.getElementById('pickup-input');
                const dInput = document.getElementById('dropoff-input');

                if (!pInput || !pInput.value.trim()) {
                    if (typeof App !== 'undefined') App.showToast("Please specify a pickup location.", "warning");
                    pInput?.focus();
                    return;
                }
                if (!dInput || !dInput.value.trim()) {
                    if (typeof App !== 'undefined') App.showToast("Please specify a destination dropoff.", "warning");
                    dInput?.focus();
                    return;
                }
            }
        }

        this.currentStep = step;
        if (!this.serviceSteps) {
            this.serviceSteps = { transport: 1, parcel: 1, mart: 1 };
        }
        if (this.activeService && this.activeService !== 'food') {
            this.serviceSteps[this.activeService] = step;
        }
        this.syncLayoutToServiceAndStep();
        if (autoScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    setParcelPaymentTiming(timing) {
        this.parcelPaymentTiming = timing;
        const pickupContainer = document.getElementById('parcel-pickup-pay-methods');
        const dropoffNote = document.getElementById('parcel-dropoff-pay-note');

        const btnPickup = document.getElementById('timing-btn-pickup');
        const btnDropoff = document.getElementById('timing-btn-dropoff');

        if (timing === 'pickup') {
            if (pickupContainer) pickupContainer.classList.remove('hidden');
            if (dropoffNote) dropoffNote.classList.add('hidden');
            if (btnPickup) btnPickup.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-hirna-700 text-white shadow border border-hirna-600 transition";
            if (btnDropoff) btnDropoff.className = "flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition";
        } else {
            if (pickupContainer) pickupContainer.classList.add('hidden');
            if (dropoffNote) dropoffNote.classList.remove('hidden');
            if (btnPickup) btnPickup.className = "flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition";
            if (btnDropoff) btnDropoff.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-hirna-700 text-white shadow border border-hirna-600 transition";
        }
    },

    isParcelScheduled: false,
    parcelScheduledTime: '',
    parcelScheduledTimeStr: '',
    WORKING_HOURS_START: 6,  // 06:00 AM
    WORKING_HOURS_END: 21,   // 09:00 PM (21:00)

    toggleParcelSchedule(enabled) {
        this.isParcelScheduled = Boolean(enabled);
        const container = document.getElementById('parcel-schedule-time-container');
        const badge = document.getElementById('parcel-schedule-badge');
        const errEl = document.getElementById('parcel-schedule-error');
        if (errEl) errEl.classList.add('hidden');

        // Update date label to Today's formatted date
        const dateLabel = document.getElementById('parcel-schedule-date-label');
        if (dateLabel) {
            const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            dateLabel.innerText = `Today, ${todayStr}`;
        }

        if (container) {
            if (this.isParcelScheduled) {
                container.classList.remove('hidden');
                if (badge) {
                    badge.innerText = "Scheduled";
                    badge.className = "text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300";
                }

                // Dynamically update min time on time input to prevent selecting past clock
                const now = new Date();
                const currH = now.getHours();
                const currM = now.getMinutes();
                const currentDec = currH + currM / 60;
                const timeInput = document.getElementById('parcel-schedule-time');
                if (timeInput) {
                    if (currentDec >= this.WORKING_HOURS_START && currentDec < this.WORKING_HOURS_END) {
                        timeInput.min = `${String(currH).padStart(2, '0')}:${String(currM).padStart(2, '0')}`;
                    } else if (currentDec < this.WORKING_HOURS_START) {
                        timeInput.min = "06:00";
                    } else {
                        timeInput.min = "21:00";
                    }
                    timeInput.max = "21:00";
                }

                // Render hourly time slot buttons with past times grayed out / disabled
                this.renderParcelScheduleSlots();

                // Default to 1 hour from now (clamped to working hours and strictly future)
                this.setParcelQuickTime(60);
            } else {
                container.classList.add('hidden');
                if (badge) {
                    badge.innerText = "Immediate";
                    badge.className = "text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700";
                }
                this.parcelScheduledTime = '';
                this.parcelScheduledTimeStr = '';
            }
        }
    },

    renderParcelScheduleSlots() {
        const grid = document.getElementById('parcel-schedule-slots-grid');
        if (!grid) return;

        const now = new Date();
        const currHour = now.getHours();
        const currMin = now.getMinutes();
        const currClockVal = currHour + currMin / 60;

        let html = '';
        for (let h = this.WORKING_HOURS_START; h <= this.WORKING_HOURS_END; h++) {
            const period = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 === 0 ? 12 : h % 12;
            const timeVal = h; // on the hour
            const timeStr = `${String(h).padStart(2, '0')}:00`;
            const label = `${displayH}:00 ${period}`;

            // Slot is considered passed if current time is beyond this slot hour
            const isPast = currClockVal > (timeVal + 0.1);

            if (isPast) {
                html += `
                    <button type="button" disabled title="Time has passed" class="py-1 px-1 rounded-md text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200 line-through cursor-not-allowed opacity-40 select-none pointer-events-none truncate">
                        ${label}
                    </button>
                `;
            } else {
                const isSelected = this.parcelScheduledTime === timeStr;
                const activeClasses = isSelected 
                    ? "bg-amber-600 text-white font-black border-amber-700 shadow-xs" 
                    : "bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-700 font-bold border-slate-200";
                html += `
                    <button type="button" onclick="BookingModule.selectScheduleSlot('${timeStr}')" class="slot-chip py-1 px-1 rounded-md text-[10px] ${activeClasses} border transition cursor-pointer text-center truncate">
                        ${label}
                    </button>
                `;
            }
        }
        grid.innerHTML = html;
    },

    selectScheduleSlot(timeStr) {
        const input = document.getElementById('parcel-schedule-time');
        if (input) input.value = timeStr;
        this.validateAndSetParcelScheduleTime(timeStr);
        this.renderParcelScheduleSlots();
    },

    setParcelQuickTime(offsetMins) {
        const now = new Date();
        const target = new Date(now.getTime() + offsetMins * 60000);
        let hours = target.getHours();
        let mins = target.getMinutes();
        let targetVal = hours + mins / 60;

        // Clamp to working hours (06:00 to 21:00)
        if (targetVal < this.WORKING_HOURS_START) {
            hours = this.WORKING_HOURS_START;
            mins = 0;
        } else if (targetVal > this.WORKING_HOURS_END) {
            hours = this.WORKING_HOURS_END;
            mins = 0;
        }

        const hh = String(hours).padStart(2, '0');
        const mm = String(mins).padStart(2, '0');
        const timeStr = `${hh}:${mm}`;

        const input = document.getElementById('parcel-schedule-time');
        if (input) input.value = timeStr;
        this.validateAndSetParcelScheduleTime(timeStr);
        this.renderParcelScheduleSlots();
    },

    validateAndSetParcelScheduleTime(timeStr) {
        const errEl = document.getElementById('parcel-schedule-error');
        const errText = document.getElementById('parcel-schedule-error-text');
        const summaryBox = document.getElementById('parcel-schedule-summary-box');

        if (!timeStr) {
            if (errEl) errEl.classList.add('hidden');
            if (summaryBox) {
                summaryBox.innerText = "Select delivery time";
                summaryBox.className = "p-2 rounded-lg bg-white border border-amber-200 text-[11px] font-bold text-amber-900 truncate";
            }
            this.parcelScheduledTime = '';
            this.parcelScheduledTimeStr = '';
            return false;
        }

        const parts = timeStr.split(':').map(Number);
        const hh = parts[0];
        const mm = parts[1] || 0;
        const timeVal = hh + mm / 60;

        // 1. Working hours validation: strictly 06:00 to 21:00
        if (timeVal < this.WORKING_HOURS_START || timeVal > this.WORKING_HOURS_END) {
            if (errEl) errEl.classList.remove('hidden');
            if (errText) errText.innerText = "Delivery time must be within working hours (06:00 AM – 09:00 PM).";
            if (summaryBox) {
                summaryBox.innerText = "Outside Working Hours (06:00 AM – 09:00 PM)";
                summaryBox.className = "p-2 rounded-lg bg-rose-50 border border-rose-300 text-[11px] font-bold text-rose-800 truncate";
            }
            this.parcelScheduledTime = '';
            this.parcelScheduledTimeStr = '';
            return false;
        }

        // 2. Gray out / reject delivery schedule time behind current clock
        const now = new Date();
        const currentClockVal = now.getHours() + now.getMinutes() / 60;
        if (timeVal < currentClockVal) {
            const period = hh >= 12 ? 'PM' : 'AM';
            const displayH = hh % 12 === 0 ? 12 : hh % 12;
            const displayM = String(mm).padStart(2, '0');
            const pastTimeFormatted = `${displayH}:${displayM} ${period}`;

            if (errEl) errEl.classList.remove('hidden');
            if (errText) errText.innerText = `Selected time (${pastTimeFormatted}) has already passed. Please select a future time today.`;
            if (summaryBox) {
                summaryBox.innerText = `Time Passed (${pastTimeFormatted})`;
                summaryBox.className = "p-2 rounded-lg bg-rose-50 border border-rose-300 text-[11px] font-bold text-rose-800 truncate";
            }
            this.parcelScheduledTime = '';
            this.parcelScheduledTimeStr = '';
            return false;
        }

        // Format into 12-hour AM/PM string
        const period = hh >= 12 ? 'PM' : 'AM';
        const displayH = hh % 12 === 0 ? 12 : hh % 12;
        const displayM = String(mm).padStart(2, '0');
        const formatted = `Today at ${displayH}:${displayM} ${period}`;

        if (errEl) errEl.classList.add('hidden');
        if (summaryBox) {
            summaryBox.innerText = `Scheduled: ${formatted}`;
            summaryBox.className = "p-2 rounded-lg bg-amber-50 border border-amber-300 text-[11px] font-bold text-amber-900 truncate";
        }

        this.parcelScheduledTime = timeStr;
        this.parcelScheduledTimeStr = formatted;
        return true;
    },

    onParcelPackageTypeChange() {
        // Preference updated
    },

    onParcelMotoPrefChange() {
        // Preference updated
    },

    renderServiceOptions() {
        const container = document.getElementById('service-options-container');
        if (!container) return;

        const options = this.serviceOptions[this.activeService] || this.serviceOptions.transport;
        container.innerHTML = options.map((opt, idx) => `
            <label class="border border-slate-200 rounded-xl p-2.5 text-center cursor-pointer hover:border-hirna-500 transition has-[:checked]:border-hirna-600 has-[:checked]:bg-hirna-50/70 has-[:checked]:ring-1 has-[:checked]:ring-hirna-500">
                <input type="radio" name="vehicle-class" value="${opt.id}" ${idx === 0 ? 'checked' : ''} class="sr-only">
                ${opt.icon}
                <div class="text-xs font-bold text-slate-800 leading-tight">${opt.title}</div>
                <div class="text-[10px] text-slate-500">${opt.desc}</div>
            </label>
        `).join('');

        // Re-bind change events on radio options
        container.querySelectorAll('input[name="vehicle-class"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateRoute());
        });
    },

    setPickup(lat, lng, name, skipUpdate = false) {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (isNaN(lat) || isNaN(lng)) return;

        name = (name && name !== 'undefined') ? name : (this.pickupName || 'Pickup Location');
        if (this.map && typeof L !== 'undefined') {
            if (this.pickupMarker) {
                try { this.map.removeLayer(this.pickupMarker); } catch(e) {}
                this.pickupMarker = null;
            }
            
            const icon = L.divIcon({
                className: 'custom-pin',
                html: '<div class="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">P</div>',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });

            this.pickupMarker = L.marker([lat, lng], { icon, draggable: true }).addTo(this.map);
            this.pickupMarker.bindPopup(`<b>Pickup Point:</b> ${name}`).openPopup();

            this.pickupMarker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                this.reverseGeocodeLandmark(pos.lat, pos.lng, (resolvedLandmark) => {
                    this.setPickup(pos.lat, pos.lng, resolvedLandmark);
                    if (typeof App !== 'undefined') App.showToast(`Pickup moved to: "${resolvedLandmark}"`, "info");
                });
            });
        }
        
        const pickupInput = document.getElementById('pickup-input');
        if (pickupInput) pickupInput.value = name;
        const parcelBookerAddr = document.getElementById('parcel-booker-address');
        if (parcelBookerAddr) parcelBookerAddr.value = name;

        this.pickupName = name;
        this.pickupCoords = [lat, lng];

        if (!skipUpdate) {
            this.updateRoute();
        }
        this.checkBothAddressesFilled();
    },

    getDropoffIcon(distText) {
        const badgeHtml = distText ? `
            <div class="absolute -top-8 whitespace-nowrap bg-slate-900/95 text-white px-2 py-0.5 rounded-lg border border-amber-400 shadow-2xl flex items-center space-x-1 text-[11px] font-black pointer-events-none z-20">
                <span class="text-amber-400 text-xs leading-none"></span>
                <span class="text-white font-mono font-bold" id="dropoff-pin-dist-badge">${distText}</span>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2" style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-top: 4px solid #fbbf24;"></div>
            </div>
        ` : '';

        return L.divIcon({
            className: 'hirna-dropoff-pin',
            html: `
                <div class="relative flex items-center justify-center select-none" style="width: 32px; height: 32px;">
                    ${badgeHtml}
                    <div class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-lg border-2 border-white">
                        D
                    </div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
    },

    getVehicleIcon(booking) {
        if (!booking) return '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM5 11l2-5h10l2 5m-14 0h14m-14 0v6h14v-6"/></svg>';
        const model = (booking.vehicle_model || '').toLowerCase();
        const vClass = (booking.vehicle_class || '').toLowerCase();
        const service = (booking.service_type || '').toLowerCase();

        // 1. Cargo Van / MPV (for cargo crates >10kg)
        if (vClass.includes('cargo') || vClass.includes('crate') || model.includes('van') || model.includes('l300') || (service === 'parcel' && vClass.includes('heavy'))) {
            return '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM5 11l2-5h10l2 5m-14 0h14m-14 0v6h14v-6"/></svg>';
        }

        // 2. Motorcycle Couriers (Scooters & Manuals 125cc-175cc for Food & Parcel <10kg)
        const isMotorcycle = service === 'food' ||
                             (service === 'parcel' && !vClass.includes('cargo') && !vClass.includes('crate')) ||
                             model.includes('motorcycle') || model.includes('scooter') || model.includes('nmax') || 
                             model.includes('click') || model.includes('wave') || model.includes('aerox') || 
                             model.includes('sniper') || model.includes('adv') || model.includes('pcx') || 
                             model.includes('barako') || vClass.includes('scooter') || vClass.includes('motorcycle') || 
                             vClass.includes('pouch') || vClass.includes('medium box');

        if (isMotorcycle) {
            const isScooter = model.includes('scooter') || model.includes('nmax') || model.includes('click') || model.includes('aerox') || model.includes('adv') || model.includes('pcx');
            return '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="6" cy="18" r="3" stroke-width="2"/><circle cx="18" cy="18" r="3" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18h6m-4-8l2 5m-2-5l-3 5m3-5V6l3 2"/></svg>';
        }

        // 3. Passenger Transport Cars (Sedan / MPV / Taxi)
        return '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM5 11l2-5h10l2 5m-14 0h14m-14 0v6h14v-6"/></svg>';
    },

    getDriverIcon(booking, distText, etaText) {
        const vehIcon = this.getVehicleIcon(booking);
        const dist = distText || 'En route';
        const eta = etaText || '';

        const markerHtml = `
            <div class="relative flex items-center justify-center select-none" style="width: 40px; height: 40px;">
                <!-- Live Remaining Distance Badge on Top of Driver Icon (Google Maps Navigation Style) -->
                <div class="absolute -top-9 whitespace-nowrap bg-slate-900/95 text-white px-2.5 py-0.5 rounded-lg border border-emerald-400 shadow-2xl flex items-center space-x-1.5 text-[10px] font-black pointer-events-none z-30">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-white font-mono font-bold" id="driver-marker-rem-dist">${dist}</span>
                    <span class="text-slate-400 text-[8px]">•</span>
                    <span class="text-emerald-300 font-bold text-[9px]" id="driver-marker-eta">${eta || 'En route'}</span>
                    <!-- Downward pointer notch -->
                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2" style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-top: 4px solid #34d399;"></div>
                </div>

                <!-- Pulsing Radar Halo -->
                <div class="absolute -inset-2.5 rounded-full bg-gold-400/40 animate-ping pointer-events-none"></div>

                <!-- Vehicle Icon Container -->
                <div class="w-10 h-10 rounded-2xl bg-hirna-950 border-2 border-gold-400 shadow-2xl flex items-center justify-center text-lg text-white font-black z-10">
                    ${vehIcon}
                </div>

                <!-- Driver Name Tag Below Icon -->
                <div class="absolute -bottom-5 whitespace-nowrap bg-hirna-950/90 text-gold-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-gold-500/30 shadow-lg pointer-events-none">
                    ${booking.driver_name || 'Driver'}
                </div>
            </div>
        `;

        return L.divIcon({
            html: markerHtml,
            className: 'hirna-live-driver-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
    },

    setDropoff(lat, lng, name, skipUpdate = false) {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (isNaN(lat) || isNaN(lng)) return;

        name = (name && name !== 'undefined') ? name : (this.dropoffName || 'Destination Point');
        const existingDist = (!skipUpdate && this.currentRouteData) ? `${this.currentRouteData.distanceKm} km` : '';

        if (this.map && typeof L !== 'undefined') {
            if (this.dropoffMarker) {
                try { this.map.removeLayer(this.dropoffMarker); } catch(e) {}
                this.dropoffMarker = null;
            }

            const icon = this.getDropoffIcon(existingDist);

            this.dropoffMarker = L.marker([lat, lng], { icon, draggable: true }).addTo(this.map);
            this.dropoffMarker.bindPopup(`<b>Destination Point:</b> ${name}`).openPopup();

            this.dropoffMarker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                this.reverseGeocodeLandmark(pos.lat, pos.lng, (resolvedLandmark) => {
                    this.setDropoff(pos.lat, pos.lng, resolvedLandmark);
                    if (typeof App !== 'undefined') App.showToast(`Dropoff moved to: "${resolvedLandmark}"`, "info");
                });
            });
        }
        
        const dropoffInput = document.getElementById('dropoff-input');
        if (dropoffInput) dropoffInput.value = name;
        const parcelDropoffInput = document.getElementById('parcel-dropoff-input');
        if (parcelDropoffInput) parcelDropoffInput.value = name;

        this.dropoffName = name;
        this.dropoffCoords = [lat, lng];

        if (!skipUpdate) {
            this.updateRoute();
        }
        this.checkBothAddressesFilled();
    },

    /**
     * Real-World Road Routing Engine (OSRM + Offline Synthetic Grid Fallback)
     * Fetches driving route aligned with actual roads, street turns, and driving distance (not displacement).
     */
    async getDrivingRoute(startCoords, endCoords) {
        startCoords = this.normalizeCoords(startCoords);
        endCoords = this.normalizeCoords(endCoords);
        if (!startCoords || !endCoords) return null;

        const cacheKey = `${startCoords[0].toFixed(5)},${startCoords[1].toFixed(5)}->${endCoords[0].toFixed(5)},${endCoords[1].toFixed(5)}`;
        if (!this._routeCache) this._routeCache = new Map();
        if (this._routeCache.has(cacheKey)) {
            return this._routeCache.get(cacheKey);
        }

        const startLng = startCoords[1];
        const startLat = startCoords[0];
        const endLng = endCoords[1];
        const endLat = endCoords[0];

        // 1. Try local proxy and public OSRM API endpoints
        const endpoints = [
            `/api/route?start=${startLat},${startLng}&end=${endLat},${endLng}&steps=true`,
            `http://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`
        ];

        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1800);

                const resp = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (resp.ok) {
                    const data = await resp.json();
                    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                        const primaryRoute = data.routes[0];
                        const geoCoords = primaryRoute.geometry.coordinates; // [lng, lat]
                        // Convert to Leaflet [lat, lng]
                        const waypoints = geoCoords.map(c => [c[1], c[0]]);
                        const distanceMeters = Math.round(primaryRoute.distance);
                        const durationSeconds = Math.round(primaryRoute.duration);

                        // Extract step street milestones with cumulative distance boundaries and maneuvers
                        const leg = primaryRoute.legs && primaryRoute.legs[0];
                        let runningDist = 0;
                        const stepMilestones = ((leg && leg.steps) || []).map(s => {
                            const startD = runningDist;
                            runningDist += (s.distance || 0);
                            return {
                                name: (s.name && s.name.trim()) ? s.name.trim() : null,
                                startDist: startD,
                                endDist: runningDist,
                                distance: s.distance || 0,
                                maneuver: s.maneuver || null
                            };
                        });

                        const result = {
                            waypoints,
                            distanceMeters,
                            durationSeconds,
                            distanceKm: parseFloat((distanceMeters / 1000).toFixed(2)),
                            durationMin: Math.max(1, Math.round(durationSeconds / 60)),
                            isRealRoad: true,
                            stepMilestones
                        };
                        this._routeCache.set(cacheKey, result);
                        return result;
                    }
                }
            } catch (e) {
                // Try next endpoint or fall back
            }
        }

        // 2. Fallback: generate realistic road-grid waypoints
        const fallbackResult = this.generateSyntheticRoadWaypoints(startCoords, endCoords);
        this._routeCache.set(cacheKey, fallbackResult);
        return fallbackResult;
    },

    generateSyntheticRoadWaypoints(start, end) {
        const lat1 = start[0];
        const lng1 = start[1];
        const lat2 = end[0];
        const lng2 = end[1];
        const dLat = lat2 - lat1;
        const dLng = lng2 - lng1;

        // Street grid arterial segments with corners and turns
        const keypoints = [
            [0.0, 0.0],
            [0.06, 0.15],
            [0.18, 0.42],
            [0.38, 0.68],
            [0.65, 0.82],
            [0.88, 0.94],
            [1.0, 1.0]
        ];

        const waypoints = [start];
        for (let i = 1; i < keypoints.length - 1; i++) {
            const [pLatFrac, pLngFrac] = keypoints[i];
            const curve = Math.sin((i / keypoints.length) * Math.PI) * 0.0003;
            const curLat = lat1 + dLat * pLatFrac + curve;
            const curLng = lng1 + dLng * pLngFrac - curve;
            waypoints.push([parseFloat(curLat.toFixed(6)), parseFloat(curLng.toFixed(6))]);
        }
        waypoints.push(end);

        // Compute actual road distance along waypoints
        let distanceMeters = 0;
        let runningDist = 0;
        const segmentNames = ["Arterial Access Way", "Main Avenue Link", "Transit Highway", "City Boulevard", "Destination Access Way"];
        const fallbackManeuvers = [
            { type: 'depart', modifier: 'straight' },
            { type: 'turn', modifier: 'slight right' },
            { type: 'turn', modifier: 'left' },
            { type: 'turn', modifier: 'right' },
            { type: 'turn', modifier: 'slight left' },
            { type: 'arrive', modifier: 'straight' }
        ];
        const stepMilestones = [];

        for (let i = 0; i < waypoints.length - 1; i++) {
            const segDist = this.computeDistanceMeters(waypoints[i], waypoints[i+1]);
            distanceMeters += segDist;
            const startD = runningDist;
            runningDist += segDist;
            stepMilestones.push({
                name: segmentNames[i % segmentNames.length],
                startDist: startD,
                endDist: runningDist,
                distance: segDist,
                maneuver: fallbackManeuvers[i % fallbackManeuvers.length]
            });
        }
        const dispMeters = this.computeDistanceMeters(start, end);
        const roadMeters = Math.max(distanceMeters, Math.round(dispMeters * 1.34));
        const distanceKm = parseFloat((roadMeters / 1000).toFixed(2));
        const durationMin = Math.max(1, Math.round(distanceKm * 3.5));

        return {
            waypoints,
            distanceMeters: roadMeters,
            durationSeconds: durationMin * 60,
            distanceKm,
            durationMin,
            isRealRoad: false,
            stepMilestones
        };
    },

    async updateRoute() {
        this._routeRequestId = (this._routeRequestId || 0) + 1;
        const currentReqId = this._routeRequestId;

        if (!this.pickupCoords || !this.dropoffCoords) {
            // No full route yet - reset route polyline cleanly
            if (this.routeLine) {
                try {
                    if (this.map && this.map.hasLayer(this.routeLine)) {
                        this.map.removeLayer(this.routeLine);
                    }
                } catch(e) {}
                this.routeLine = null;
            }
            if (this.map) {
                try {
                    this.map.eachLayer(layer => {
                        if (layer && layer._isHirnaRoute) {
                            try { this.map.removeLayer(layer); } catch(e) {}
                        }
                    });
                } catch(e) {}
            }
            this.currentRouteData = null;
            this.currentQuote = null;

            // Reset quotes cleanly
            ['quote-dist', 'parcel-quote-dist'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = `-- km`;
            });
            ['quote-time', 'parcel-quote-time'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = `-- mins`;
            });
            ['quote-base', 'parcel-quote-base'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = `₱0.00`;
            });
            ['quote-total', 'parcel-quote-total', 'step2-quote-total'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = `₱0.00`;
            });
            const pill = document.getElementById('quote-surge-badge');
            if (pill) {
                pill.innerText = `1.00x Base`;
                pill.className = "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300";
            }
            return;
        }

        const routeData = await this.getDrivingRoute(this.pickupCoords, this.dropoffCoords);
        // If a newer route request was dispatched while this was awaiting, discard stale result
        if (currentReqId !== this._routeRequestId) {
            return;
        }
        if (!routeData) return;
        this.currentRouteData = routeData;

        if (this.map && typeof L !== 'undefined') {
            // Remove previous polyline layer cleanly
            if (this.routeLine) {
                try {
                    if (this.map.hasLayer(this.routeLine)) {
                        this.map.removeLayer(this.routeLine);
                    }
                } catch(e) {}
                this.routeLine = null;
            }
            try {
                this.map.eachLayer(layer => {
                    if (layer && layer._isHirnaRoute) {
                        try { this.map.removeLayer(layer); } catch(e) {}
                    }
                });
            } catch(e) {}

            // Draw polyline following real street route curves (not straight displacement)
            this.routeLine = L.polyline(routeData.waypoints, {
                color: '#dc2626',
                weight: 5,
                opacity: 0.85
            }).addTo(this.map);
            this.routeLine._isHirnaRoute = true;

            try {
                const bounds = this.routeLine.getBounds();
                if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
                    const ne = bounds.getNorthEast();
                    const sw = bounds.getSouthWest();
                    if (ne.lat === sw.lat && ne.lng === sw.lng) {
                        this.map.setView(bounds.getCenter(), 15);
                    } else {
                        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
                    }
                }
            } catch(e) {}
        }

        // Real road driving distance & duration (not straight displacement)
        const distKm = routeData.distanceKm;
        const durMin = routeData.durationMin;

        // Update dropoff pin with the real road distance on top
        if (this.dropoffMarker && typeof this.dropoffMarker.setIcon === 'function') {
            this.dropoffMarker.setIcon(this.getDropoffIcon(`${distKm} km`));
        }

        this.calculateFareQuote(distKm, durMin);
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return parseFloat((R * c * 1.35).toFixed(1)); // 1.35 road winding factor
    },

    calculateFareQuote(distKm, durMin) {
        const vehicleClass = document.querySelector('input[name="vehicle-class"]:checked')?.value || "Motorcycle (1-Passenger)";

        // Real-Time AI Dynamic Surge Calculation (Traffic, Weather, Demand)
        const quote = AIEngines.DynamicPricing.calculateFare(vehicleClass, distKm, durMin, {
            pickupCoords: this.pickupCoords,
            dropoffCoords: this.dropoffCoords
        });
        this.currentQuote = quote;

        // Fetch live weather in background to refresh telemetry if available
        if (this.pickupCoords && AIEngines.DynamicPricing.fetchLiveWeather) {
            AIEngines.DynamicPricing.fetchLiveWeather(this.pickupCoords[0], this.pickupCoords[1]).then(() => {
                const telWeather = document.getElementById('telemetry-weather');
                if (telWeather && AIEngines.DynamicPricing.currentWeather) {
                    const w = AIEngines.DynamicPricing.currentWeather;
                    telWeather.innerText = w === 'storm' ? 'Heavy Downpour' : (w === 'rain' ? 'Passing Showers' : 'Clear Skies');
                }
            });
        }

        // Update UI Quote Elements across views
        ['quote-dist', 'parcel-quote-dist'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = `${quote.distanceKm} km`;
        });
        ['quote-time', 'parcel-quote-time'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = `${quote.durationMin} mins`;
        });
        ['quote-base', 'parcel-quote-base'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = `₱${quote.baseFare.toFixed(2)}`;
        });
        ['quote-total', 'parcel-quote-total', 'step2-quote-total'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = `₱${quote.totalFare.toFixed(2)}`;
        });

        const pill = document.getElementById('quote-surge-badge');
        if (pill) {
            pill.innerText = `${quote.surgeMultiplier.toFixed(2)}x Surge`;
            pill.className = quote.surgeMultiplier > 1.0
                ? "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-400 text-hirna-950 font-bold border border-amber-300 animate-pulse"
                : "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300";
        }

        const reasonEl = document.getElementById('quote-surge-reason');
        if (reasonEl) {
            reasonEl.innerText = quote.surgeReason;
        }

        // Live Telemetry Breakdown Display
        const telTraffic = document.getElementById('telemetry-traffic');
        if (telTraffic && quote.telemetry) telTraffic.innerText = quote.telemetry.trafficStatus;
        const telWeather = document.getElementById('telemetry-weather');
        if (telWeather && quote.telemetry) telWeather.innerText = quote.telemetry.weatherStatus;
        const telDemand = document.getElementById('telemetry-demand');
        if (telDemand && quote.telemetry) telDemand.innerText = quote.telemetry.demandStatus;
    },

    bindEvents() {
        // Automatic AI dynamic surge recalculates with route updates without manual simulation controls
    },

    handleBookingSubmit() {
        if (this._submitting) return;
        this._submitting = true;
        setTimeout(() => { this._submitting = false; }, 2000);

        if (!this.currentQuote) {
            if (typeof App !== 'undefined') App.showToast("Please calculate a route first.", "warning");
            return;
        }

        const bookingCode = `HIRNA-${Date.now().toString().slice(-6)}`;
        const vClass = this.currentQuote ? this.currentQuote.vehicleClass : "Motorcycle (1-Passenger)";
        const allDrivers = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData('drivers')) || [];
        let driver;

        if (vClass === "Motorcycle (1-Passenger)" || vClass.toLowerCase().includes("motorcycle")) {
            const motoDrivers = allDrivers.filter(d => 
                d.vehicle_type === 'scooter' || 
                d.vehicle_type === 'manual' || 
                (d.vehicle_class && (d.vehicle_class.toLowerCase().includes('scooter') || d.vehicle_class.toLowerCase().includes('manual') || d.vehicle_class.toLowerCase().includes('motorcycle')))
            );
            driver = motoDrivers.length > 0 ? motoDrivers[Math.floor(Math.random() * motoDrivers.length)] : { name: 'Danilo Cruz', vehicle_plate: 'MTR-9821', vehicle_model: 'Yamaha NMAX 155 (Midnight Blue)', phone: '+63 918 333 4455' };
        } else if (vClass === "MPV (6-Seater)" || vClass.toLowerCase().includes("mpv")) {
            driver = allDrivers.find(d => d.vehicle_class && d.vehicle_class.includes("MPV")) || allDrivers[1] || allDrivers[0];
        } else {
            driver = allDrivers.find(d => d.vehicle_class && d.vehicle_class.includes("Sedan")) || allDrivers[0] || { name: 'Ricardo Dalisay', vehicle_plate: 'TXI-5431', vehicle_model: 'Toyota Vios Hirna Taxi', phone: '+63 917 888 1234' };
        }

        const passengerName = document.getElementById('std-passenger-name')?.value.trim() || this.passengerName || "Juan Dela Cruz";
        const passengerPhone = document.getElementById('std-passenger-phone')?.value.trim() || this.passengerPhone || "+63 917 888 9999";
        const paymentMethod = document.querySelector('input[name="std-payment-method"]:checked')?.value || this.stdPaymentMethod;

        const newBooking = {
            id: `b-${Date.now()}`,
            booking_code: bookingCode,
            service_type: this.activeService,
            passenger_name: passengerName,
            passenger_phone: passengerPhone,
            driver_name: driver.name,
            driver_phone: driver.phone || '+63 920 555 1234',
            vehicle_plate: driver.vehicle_plate,
            vehicle_model: driver.vehicle_model,
            vehicle_class: this.currentQuote.vehicleClass,
            pickup: document.getElementById('pickup-input')?.value || this.pickupName,
            pickup_coords: this.pickupCoords,
            dropoff: document.getElementById('dropoff-input')?.value || this.dropoffName,
            dropoff_coords: this.dropoffCoords,
            distance_km: this.currentQuote.distanceKm,
            duration_min: this.currentQuote.durationMin,
            base_fare: this.currentQuote.baseFare,
            distance_fare: this.currentQuote.distanceFare,
            time_fare: this.currentQuote.timeFare,
            surge_multiplier: this.currentQuote.surgeMultiplier,
            surge_reason: this.currentQuote.surgeReason,
            total_fare: this.currentQuote.totalFare,
            payment_method: paymentMethod,
            payment_status: "pending",
            status: "dispatched",
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            safety_score: 99
        };

        SupabaseBridge.insert('bookings', newBooking);

        // Save passenger contact to history
        if (passengerName || passengerPhone) {
            ContactHistoryManager.addBooker(passengerName, passengerPhone);
        }

        // Reset step without scrolling away to page top
        this.goToStep(1, false);

        this.renderHistory();

        // Launch trip simulation
        this.startTripSimulation(newBooking);
    },

    handleParcelSubmit() {
        if (this._submitting) return;
        this._submitting = true;
        setTimeout(() => { this._submitting = false; }, 2000);

        const dropoffInput = document.getElementById('parcel-dropoff-input');
        const recName = document.getElementById('parcel-recipient-name');
        const recPhone = document.getElementById('parcel-recipient-phone');
        const bAddr = document.getElementById('parcel-booker-address')?.value || this.pickupName;

        if (!bAddr || !bAddr.trim()) {
            if (typeof App !== 'undefined') App.showToast("Please enter booker's address in Step 1.", "warning");
            this.goToStep(1);
            return;
        }
        if (!dropoffInput || !dropoffInput.value.trim()) {
            if (typeof App !== 'undefined') App.showToast("Please enter recipient dropoff address.", "warning");
            dropoffInput?.focus();
            return;
        }
        if (!recName || !recName.value.trim()) {
            if (typeof App !== 'undefined') App.showToast("Please enter recipient's full name.", "warning");
            recName?.focus();
            return;
        }
        if (!recPhone || !recPhone.value.trim()) {
            if (typeof App !== 'undefined') App.showToast("Please enter recipient's contact number.", "warning");
            recPhone?.focus();
            return;
        }

        if (this.isParcelScheduled) {
            const timeInput = document.getElementById('parcel-schedule-time')?.value;
            if (!this.validateAndSetParcelScheduleTime(timeInput)) {
                if (typeof App !== 'undefined') App.showToast("Please choose a valid delivery schedule within working hours (06:00 AM – 09:00 PM).", "warning");
                this.goToStep(1);
                document.getElementById('parcel-schedule-time')?.focus();
                return;
            }
        }

        this.recipientName = recName.value.trim();
        this.recipientPhone = recPhone.value.trim();
        this.dropoffName = dropoffInput.value.trim();

        const bookingCode = `HIRNA-PCL-${Date.now().toString().slice(-6)}`;

        // Determine assigned driver & vehicle
        const vClass = document.querySelector('input[name="vehicle-class"]:checked')?.value || "Document Pouch (<1kg)";
        const isCargo = vClass.includes("Cargo") || vClass.includes("Crate");

        let driver;
        const allDrivers = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData('drivers')) || [];

        if (isCargo) {
            // Assign cargo MPV/Van driver for large crates >10kg
            driver = allDrivers.find(d => d.vehicle_model && (d.vehicle_model.includes('Xpander') || d.vehicle_model.includes('Van') || d.vehicle_model.includes('L300'))) 
                  || allDrivers[1] 
                  || { name: 'Elena Roces', vehicle_plate: 'NBL-3301', vehicle_model: 'Mitsubishi Xpander Cargo MPV', vehicle_class: 'MPV / Cargo', phone: '+63 922 444 9876' };
        } else {
            // Packages <10kg: assign any 125cc-175cc motorcycle courier (scooter or manual)
            const couriers = allDrivers.filter(d => 
                (d.vehicle_type === 'scooter' || d.vehicle_type === 'manual') ||
                (d.vehicle_class && (d.vehicle_class.toLowerCase().includes('scooter') || d.vehicle_class.toLowerCase().includes('manual') || d.vehicle_class.toLowerCase().includes('motorcycle')))
            );
            if (couriers.length > 0) {
                driver = couriers[Math.floor(Math.random() * couriers.length)];
            } else {
                driver = { name: 'Danilo Cruz', vehicle_plate: 'MTR-9821', vehicle_model: 'Yamaha NMAX 155 (Midnight Blue)', vehicle_class: 'Scooter (155cc)', phone: '+63 918 333 4455' };
            }
        }

        const payMethod = this.parcelPaymentTiming === 'pickup' 
            ? (document.querySelector('input[name="parcel-pay-method"]:checked')?.value || "GCash")
            : "Cash on Delivery (Recipient)";

        const fare = this.currentQuote ? this.currentQuote.totalFare : 180.00;

        const newParcelBooking = {
            id: `pcl-${Date.now()}`,
            booking_code: bookingCode,
            service_type: "parcel",
            passenger_name: `${this.bookerName} (Sender)`,
            passenger_phone: this.bookerPhone || '+63 917 888 9999',
            sender_name: this.bookerName,
            sender_phone: this.bookerPhone,
            sender_address: bAddr,
            recipient_name: this.recipientName,
            recipient_phone: this.recipientPhone,
            recipient_address: this.dropoffName,
            payment_timing: this.parcelPaymentTiming,
            driver_name: driver.name,
            driver_phone: driver.phone || '+63 920 555 1234',
            vehicle_plate: driver.vehicle_plate,
            vehicle_model: driver.vehicle_model,
            vehicle_class: isCargo ? vClass : `${vClass} (${driver.vehicle_model || '125-175cc Motorcycle'})`,
            is_scheduled: this.isParcelScheduled,
            scheduled_time: this.isParcelScheduled ? (this.parcelScheduledTimeStr || 'Today') : null,
            delivery_timing: this.isParcelScheduled ? `Scheduled (${this.parcelScheduledTimeStr})` : 'Immediate Express',
            pickup: bAddr,
            pickup_coords: this.pickupCoords || [14.5583, 121.0189],
            dropoff: this.dropoffName,
            dropoff_coords: this.dropoffCoords || [14.5517, 121.0509],
            distance_km: this.currentQuote ? this.currentQuote.distanceKm : 6.2,
            duration_min: this.currentQuote ? this.currentQuote.durationMin : 25,
            base_fare: this.currentQuote ? this.currentQuote.baseFare : 60,
            distance_fare: this.currentQuote ? this.currentQuote.distanceFare : 75,
            time_fare: this.currentQuote ? this.currentQuote.timeFare : 25,
            surge_multiplier: this.currentQuote ? this.currentQuote.surgeMultiplier : 1.0,
            surge_reason: "Standard parcel courier tariff",
            total_fare: fare,
            payment_method: payMethod,
            payment_status: "pending",
            status: "dispatched",
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            safety_score: 100
        };

        SupabaseBridge.insert('bookings', newParcelBooking);

        // Save booker & recipient contacts to history
        if (this.bookerName || this.bookerPhone) {
            ContactHistoryManager.addBooker(this.bookerName, this.bookerPhone);
        }
        if (this.recipientName || this.recipientPhone) {
            ContactHistoryManager.addRecipient(this.recipientName, this.recipientPhone);
        }

        // Reset step without scrolling away to page top
        this.goToStep(1, false);

        this.renderHistory();

        // Launch trip simulation
        this.startTripSimulation(newParcelBooking);
    },

    renderHistory() {
        const tbody = document.getElementById('booking-history-tbody');
        if (!tbody) return;

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
                <td class="px-4 py-3 font-mono font-bold text-hirna-700 text-xs">
                    ${b.booking_code}
                    ${b.service_type === 'parcel' ? '<span class="ml-1 text-[9px] bg-amber-100 text-amber-800 px-1 rounded">PARCEL</span>' : ''}
                    ${b.is_scheduled ? `<span class="ml-1 text-[9px] bg-gold-100 text-gold-900 border border-gold-300 px-1 rounded font-bold"> ${b.scheduled_time || 'SCHEDULED'}</span>` : ''}
                </td>
                <td class="px-4 py-3 text-xs text-slate-800 font-medium">
                    ${b.pickup} <br/>
                    <span class="text-slate-400">→ ${b.dropoff}</span>
                    ${b.recipient_name ? `<br/><span class="text-[10px] text-slate-500">To: ${b.recipient_name} (${b.recipient_phone})</span>` : ''}
                </td>
                <td class="px-4 py-3 text-xs text-slate-700 font-semibold">${b.vehicle_class}</td>
                <td class="px-4 py-3 text-xs font-black text-slate-900">₱${parseFloat(b.total_fare).toFixed(2)} <br/><span class="text-[10px] text-amber-600 font-normal">(${b.surge_multiplier || 1.0}x Surge)</span></td>
                <td class="px-4 py-3 text-xs">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-hirna-100 text-hirna-900'}">
                        ● ${b.status.toUpperCase()}
                    </span>
                </td>
                <td class="px-4 py-3 text-xs text-right space-x-1 whitespace-nowrap">
                    <a href="gps.html?trip=${b.id || b.booking_code}" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition inline-block">
                        GPS Playback
                    </a>
                    <button onclick="PaymentsModule.printReceipt('${b.id}')" class="px-2.5 py-1 bg-hirna-50 hover:bg-hirna-100 text-hirna-800 font-bold rounded-lg border border-hirna-200 transition cursor-pointer">
                        Receipt
                    </button>
                </td>
            </tr>
        `).join('');
    },

    /* =========================================================================
     * TRIP SIMULATION CONTROLLER (Module 1 -> Module 2 Live Flow)
     * ========================================================================= */
    tripSimulation: {
        active: false,
        phase: null, // 'assigning' | 'en_route_pickup' | 'arrived_pickup' | 'en_route_dropoff' | 'arrived_dropoff'
        booking: null,
        driverCoords: null,
        driverMarker: null,
        routeLine: null,
        animTimer: null,
        animRafId: null,
        legStartTime: 0,
        legDurationMs: 6500,
        startCoords: null,
        targetCoords: null,
        totalDistM: 0,
        targetArrivalClock: '',
        autoTrack: true,
        currentCoords: null,
        driverOriginName: ''
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

    formatClockTime(minutesFromNow = 5) {
        const now = new Date(Date.now() + Math.max(1, minutesFromNow) * 60000);
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${strMinutes} ${ampm}`;
    },

    computeDistanceMeters(p1, p2) {
        p1 = this.normalizeCoords(p1);
        p2 = this.normalizeCoords(p2);
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

    /* =========================================================================
     * TURN INDICATORS & NAVIGATION SVGS (Google Maps Navigation Style)
     * ========================================================================= */
    getTurnIconSvg(maneuver, isArrival = false, sizeClass = 'w-5 h-5') {
        if (isArrival) {
            return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>`;
        }

        const modifier = ((maneuver && (maneuver.modifier || maneuver.type)) || 'straight').toLowerCase().replace(/[\s_]+/g, '-');

        if (modifier.includes('uturn') || modifier.includes('u-turn')) {
            return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 19V9a5 5 0 0 0-10 0v10M12 15l-4 4-4-4"/></svg>`;
        }
        if (modifier.includes('left')) {
            // Clean 90° Turn Left (diagonal arrows removed)
            return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 19v-6a4 4 0 0 0-4-4H6M10 5L6 9l4 4"/></svg>`;
        }
        if (modifier.includes('right')) {
            // Clean 90° Turn Right (diagonal arrows removed)
            return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 19v-6a4 4 0 0 1 4-4h8M14 5l4 4-4 4"/></svg>`;
        }
        if (modifier.includes('arrive')) {
            return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>`;
        }
        // Default clean vertical Straight arrow
        return `<svg class="${sizeClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
    },

    getManeuverActionLabel(maneuver) {
        if (!maneuver) return 'Straight';
        const modifier = ((maneuver.modifier || maneuver.type) || 'straight').toLowerCase().replace(/[\s_]+/g, '-');
        if (modifier.includes('uturn') || modifier.includes('u-turn')) return 'U-Turn';
        if (modifier.includes('left')) return 'Turn Left';
        if (modifier.includes('right')) return 'Turn Right';
        if (modifier.includes('arrive')) return 'Arrive';
        return 'Straight';
    },

    getDestinationIconSvg(isArrived = false, finalManeuver = null) {
        if (isArrived) {
            return `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>`;
        }
        if (finalManeuver && (finalManeuver.modifier || finalManeuver.type)) {
            return this.getTurnIconSvg(finalManeuver);
        }
        return `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>`;
    },

    updateHudTurnAndLocation(targetDist, progress, totalDist) {
        const currLocEl = document.getElementById('hud-current-location');
        const turnActionEl = document.getElementById('hud-turn-action');
        const turnDistEl = document.getElementById('hud-turn-dist');
        const turnIconEl = document.getElementById('hud-turn-icon');
        const booking = this.tripSimulation.booking || {};
        const milestones = this.tripSimulation.activeRouteData?.stepMilestones || [];

        if (milestones.length === 0) {
            const remM = Math.max(0, Math.round(totalDist - targetDist));
            if (turnActionEl) turnActionEl.innerText = progress >= 0.98 ? 'Arrive' : 'Straight';
            if (turnDistEl) turnDistEl.innerText = progress >= 0.98 ? '0m' : `in ${remM}m`;
            if (turnIconEl) turnIconEl.innerHTML = this.getTurnIconSvg({ modifier: 'straight' }, progress >= 0.98);
            return;
        }

        // Find current step index
        let curStepIdx = milestones.findIndex(s => targetDist >= s.startDist && targetDist <= s.endDist);
        if (curStepIdx === -1) {
            curStepIdx = targetDist >= totalDist ? milestones.length - 1 : 0;
        }
        const curStep = milestones[curStepIdx];

        // Update current location street name
        if (currLocEl) {
            if (progress >= 0.98) {
                currLocEl.innerText = this.tripSimulation.phase === 'en_route_pickup'
                    ? (booking.pickup || 'Pickup Point')
                    : (booking.dropoff || 'Destination');
            } else if (curStep && curStep.name) {
                currLocEl.innerText = curStep.name;
            } else if (this.tripSimulation.phase === 'en_route_pickup' && progress < 0.2 && this.tripSimulation.driverOriginName) {
                currLocEl.innerText = this.tripSimulation.driverOriginName;
            } else if (this.tripSimulation.phase === 'en_route_dropoff' && progress < 0.2) {
                currLocEl.innerText = booking.pickup || 'Pickup Point';
            }
        }

        // Upcoming maneuver: next turn occurs at the end of current step (curStep.endDist)
        const nextStep = milestones[curStepIdx + 1];
        let upcomingManeuver = null;
        let distToUpcomingManeuver = 0;

        if (nextStep && nextStep.maneuver) {
            upcomingManeuver = nextStep.maneuver;
            distToUpcomingManeuver = Math.max(0, Math.round(curStep.endDist - targetDist));
        } else if (curStep && curStep.maneuver && curStepIdx === milestones.length - 1) {
            upcomingManeuver = curStep.maneuver;
            distToUpcomingManeuver = Math.max(0, Math.round(curStep.endDist - targetDist));
        } else {
            upcomingManeuver = { modifier: 'straight' };
            distToUpcomingManeuver = Math.max(0, Math.round(totalDist - targetDist));
        }

        // DYNAMIC TURN PREVIEW THRESHOLD (Acceptable distance before turn, e.g. 350m):
        // If the upcoming turn is farther than 350m away, the vehicle is cruising straight down the current road.
        // We show the Straight arrow (↑) with the distance.
        // Once the vehicle is within 350m of the turn, the arrow switches dynamically to the upcoming turn (Turn Left ↰, Turn Right ↱, or U-Turn ↶)
        // so the driver/passenger is prepared well in advance without premature/sudden turning arrows!
        const TURN_PREVIEW_DISTANCE_METERS = 350;
        const isNearTurn = distToUpcomingManeuver <= TURN_PREVIEW_DISTANCE_METERS;
        const isArriving = progress >= 0.98 || (curStepIdx === milestones.length - 1 && distToUpcomingManeuver <= 50);

        let activeManeuver = { modifier: 'straight' };
        let actionLabel = 'Straight';

        if (isArriving) {
            activeManeuver = { type: 'arrive' };
            actionLabel = progress >= 0.98 ? 'Arrived' : 'Arrive';
        } else if (isNearTurn) {
            activeManeuver = upcomingManeuver;
            actionLabel = this.getManeuverActionLabel(upcomingManeuver);
        } else {
            activeManeuver = { modifier: 'straight' };
            actionLabel = 'Straight';
        }

        // Format distance to upcoming maneuver on the left
        let turnDistFormatted = '';
        if (progress >= 0.98) {
            turnDistFormatted = '0m';
        } else if (distToUpcomingManeuver <= 15) {
            turnDistFormatted = 'Now';
        } else if (distToUpcomingManeuver >= 1000) {
            turnDistFormatted = `in ${(distToUpcomingManeuver / 1000).toFixed(1)}km`;
        } else {
            turnDistFormatted = `in ${distToUpcomingManeuver}m`;
        }

        if (turnActionEl) {
            turnActionEl.innerText = actionLabel;
        }
        if (turnDistEl) {
            turnDistEl.innerText = turnDistFormatted;
        }
        if (turnIconEl) {
            turnIconEl.innerHTML = this.getTurnIconSvg(activeManeuver, isArriving && progress >= 0.98);
        }

        // Final maneuver for Destination row
        const lastStep = milestones[milestones.length - 1];
        const destIconEl = document.getElementById('hud-dest-icon');
        if (destIconEl && lastStep && lastStep.maneuver) {
            destIconEl.innerHTML = this.getDestinationIconSvg(progress >= 1.0, lastStep.maneuver);
        }
    },

    startTripSimulation(booking) {
        if (!booking) return;

        this.tripSimulation.active = true;
        this.tripSimulation.booking = booking;
        this.tripSimulation.phase = 'assigning';
        this.tripSimulation._settled = false;
        this.tripSimulation.autoTrack = true;

        // Pre-compute driverCoords and pre-fetch the driving route to pickup during assignment modal!
        const pickup = this.normalizeCoords(booking.pickup_coords || this.pickupCoords, [14.5583, 121.0189]);
        booking.pickup_coords = pickup;

        const angle = Math.random() * 2 * Math.PI;
        const distDeg = 0.0055 + Math.random() * 0.0045; // ~600m to 1.1km in degrees
        const driverCoords = [
            pickup[0] + Math.cos(angle) * distDeg,
            pickup[1] + Math.sin(angle) * distDeg
        ];
        this.tripSimulation.driverCoords = driverCoords;
        this.tripSimulation.currentCoords = driverCoords;
        this.updateTrackButtonUI(true);

        // Resolve driver's exact starting location right away
        this.reverseGeocodeLandmark(driverCoords[0], driverCoords[1], (resolved) => {
            this.tripSimulation.driverOriginName = resolved;
            const currLocEl = document.getElementById('hud-current-location');
            if (currLocEl && this.tripSimulation.phase === 'en_route_pickup') {
                currLocEl.innerText = resolved;
            }
        });

        // Start prefetching route immediately so it is ready when modal dismisses
        this._pendingPickupRoute = this.getDrivingRoute(driverCoords, pickup);

        // Center and scroll the booking map into view right away!
        const mapEl = document.getElementById('booking-map');
        if (mapEl) {
            mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (this.map) {
            try {
                this.map.invalidateSize();
                this.map.setView(pickup, 15);
            } catch(e) {}
        }

        // Prepare assignment modal
        const modal = document.getElementById('driver-assignment-modal');
        const radarIcon = document.getElementById('assign-radar-icon');
        const step1 = document.getElementById('assign-step-1');
        const step2 = document.getElementById('assign-step-2');
        const step3 = document.getElementById('assign-step-3');
        const preview = document.getElementById('assign-driver-preview');
        const titleEl = document.getElementById('assign-modal-title');
        const statusEl = document.getElementById('assign-modal-status');

        if (radarIcon) radarIcon.innerText = this.getVehicleIcon(booking);
        if (titleEl) titleEl.innerText = "Assigning driver nearby...";
        if (statusEl) statusEl.innerText = "Searching for available Hirna drivers within 2.0 km radius...";

        // Reset step indicators
        if (step1) {
            step1.className = "flex items-center space-x-2.5";
            step1.innerHTML = `<span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold"></span><span class="text-slate-300">Route & fare parameters verified</span>`;
        }
        if (step2) {
            step2.className = "flex items-center space-x-2.5";
            step2.innerHTML = `<span class="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center text-[10px] font-bold animate-spin">⟳</span><span class="text-white font-medium" id="assign-step-2-text">Connecting to nearest active drivers...</span>`;
        }
        if (step3) {
            step3.className = "flex items-center space-x-2.5 opacity-40";
            step3.innerHTML = `<span class="w-4 h-4 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-[10px]">3</span><span class="text-slate-400" id="assign-step-3-text">Driver telemetry lock</span>`;
        }
        if (preview) preview.classList.add('hidden');

        if (modal) modal.classList.remove('hidden');

        // Step 2 simulation
        setTimeout(() => {
            if (!this.tripSimulation.active) return;
            const s2 = document.getElementById('assign-step-2');
            if (s2) {
                s2.innerHTML = `<span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold"></span><span class="text-slate-300">Driver located (0.8 km from pickup)</span>`;
            }
            const s3 = document.getElementById('assign-step-3');
            if (s3) {
                s3.classList.remove('opacity-40');
                s3.innerHTML = `<span class="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center text-[10px] font-bold animate-spin">⟳</span><span class="text-white font-medium">Acquiring live telemetry and dispatching...</span>`;
            }
        }, 1200);

        // Step 3 & Driver reveal
        setTimeout(() => {
            if (!this.tripSimulation.active) return;
            const s3 = document.getElementById('assign-step-3');
            if (s3) {
                s3.innerHTML = `<span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold"></span><span class="text-emerald-400 font-bold">Driver confirmed & dispatched!</span>`;
            }

            const nameEl = document.getElementById('assign-driver-name');
            const carEl = document.getElementById('assign-driver-car');
            const avatarEl = document.getElementById('assign-driver-avatar');
            if (nameEl) nameEl.innerText = booking.driver_name || 'Ricardo Dalisay';
            if (carEl) carEl.innerText = `${booking.vehicle_model || 'Toyota Vios'} • ${booking.vehicle_plate || 'TXI-5431'}`;
            if (avatarEl) {
                const isMoto = (booking.vehicle_class || '').toLowerCase().includes('motorcycle') ||
                               (booking.vehicle_model || '').toLowerCase().includes('motorcycle') ||
                               (booking.vehicle_model || '').toLowerCase().includes('scooter') ||
                               (booking.vehicle_model || '').toLowerCase().includes('honda') ||
                               (booking.vehicle_model || '').toLowerCase().includes('yamaha') ||
                               booking.service_type === 'food';
                avatarEl.innerHTML = '<svg class="w-6 h-6 text-hirna-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>';
            }
            if (preview) preview.classList.remove('hidden');
        }, 2200);

        // Dismiss modal and spawn driver on map
        setTimeout(() => {
            if (!this.tripSimulation.active) return;
            if (modal) modal.classList.add('hidden');
            this.spawnDriverAndStartLegToPickup(booking);
        }, 3400);
    },

    async spawnDriverAndStartLegToPickup(booking) {
        if (!this.tripSimulation.active || this.tripSimulation.phase !== 'assigning') return;
        const pickup = this.normalizeCoords(booking.pickup_coords || this.pickupCoords, [14.5583, 121.0189]);
        booking.pickup_coords = pickup;

        // Use pre-computed driverCoords or generate nearby (~600m - 1.1km)
        let driverCoords = this.tripSimulation.driverCoords;
        if (!driverCoords) {
            const angle = Math.random() * 2 * Math.PI;
            const distDeg = 0.0055 + Math.random() * 0.0045;
            driverCoords = [
                pickup[0] + Math.cos(angle) * distDeg,
                pickup[1] + Math.sin(angle) * distDeg
            ];
            this.tripSimulation.driverCoords = driverCoords;
        }

        // Ensure Leaflet map is ready
        if (!this.map) {
            this.initMap();
        }

        // Retrieve pre-fetched or newly fetched real road driving route from driver to pickup
        const routeData = await (this._pendingPickupRoute || this.getDrivingRoute(driverCoords, pickup));
        this._pendingPickupRoute = null;
        this.tripSimulation.activeRouteData = routeData;

        const initDistText = routeData.distanceMeters >= 1000 ? `${(routeData.distanceMeters / 1000).toFixed(1)} km` : `${routeData.distanceMeters} m`;
        const initEtaMin = Math.max(1, Math.ceil(routeData.distanceMeters / 280));

        // Create driver marker with live remaining distance on top of the icon (Google Maps style)
        const driverIcon = this.getDriverIcon(booking, initDistText, `${initEtaMin} min`);

        if (this.tripSimulation.driverMarker) {
            try { this.map.removeLayer(this.tripSimulation.driverMarker); } catch(e) {}
        }
        this.tripSimulation.driverMarker = L.marker(driverCoords, { icon: driverIcon, zIndexOffset: 2500 }).addTo(this.map);

        // Ensure dropoff marker on the map shows its distance on top
        if (this.dropoffCoords) {
            const dropDist = this.currentRouteData ? `${this.currentRouteData.distanceKm} km` : (this.currentQuote ? `${this.currentQuote.distanceKm} km` : '');
            if (this.dropoffMarker) {
                this.dropoffMarker.setIcon(this.getDropoffIcon(dropDist));
            } else if (this.map) {
                this.dropoffMarker = L.marker(this.dropoffCoords, { icon: this.getDropoffIcon(dropDist), draggable: false }).addTo(this.map);
            }
        }

        // Draw dashed road polyline following actual street curves (not straight displacement)
        if (this.tripSimulation.routeLine) {
            try { this.map.removeLayer(this.tripSimulation.routeLine); } catch(e) {}
        }
        this.tripSimulation.routeLine = L.polyline(routeData.waypoints, {
            color: '#eab308',
            dashArray: '6, 8',
            weight: 5,
            opacity: 0.9
        }).addTo(this.map);

        try {
            this.map.invalidateSize();
            this.map.fitBounds(this.tripSimulation.routeLine.getBounds(), { padding: [60, 60], maxZoom: 16 });
        } catch(e) {}

        // Scroll map into view smoothly
        document.getElementById('booking-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Update Google Maps Bottom HUD with real driving road distance
        const hud = document.getElementById('active-trip-hud');
        if (hud) {
            const isParcel = booking.service_type === 'parcel';
            const nameEl = document.getElementById('hud-driver-name');
            const vehEl = document.getElementById('hud-driver-vehicle');
            const codeEl = document.getElementById('hud-trip-code');
            const avatarEl = document.getElementById('hud-driver-avatar');
            const labelEl = document.getElementById('hud-trip-status-label');
            const currLocEl = document.getElementById('hud-current-location');
            const addrEl = document.getElementById('hud-target-address');
            const arrivalBar = document.getElementById('hud-arrival-action-bar');
            const distEl = document.getElementById('hud-distance-value');
            const etaEl = document.getElementById('hud-eta-value');
            const clockEl = document.getElementById('hud-clock-arrival');

            if (nameEl) nameEl.innerText = booking.driver_name;
            if (vehEl) vehEl.innerText = `${booking.vehicle_model} • ${booking.vehicle_plate}`;
            if (codeEl) codeEl.innerText = `#${booking.booking_code}`;
            if (avatarEl) avatarEl.innerText = this.getVehicleIcon(booking);
            if (labelEl) labelEl.innerText = "Driver En Route to Pickup";
            if (currLocEl) currLocEl.innerText = this.tripSimulation.driverOriginName || "Locating exact address...";
            if (addrEl) addrEl.innerText = booking.pickup || 'Pickup Point';
            if (arrivalBar) arrivalBar.classList.add('hidden');

            if (distEl) distEl.innerText = initDistText;
            if (etaEl) etaEl.innerText = `${initEtaMin} min`;
            const targetClock = this.formatClockTime(initEtaMin);
            this.tripSimulation.targetArrivalClock = targetClock;
            if (clockEl) clockEl.innerText = targetClock;

            // Initialize turn maneuver indicator with dynamic preview threshold
            const turnActionEl = document.getElementById('hud-turn-action');
            const turnDistEl = document.getElementById('hud-turn-dist');
            const turnIconEl = document.getElementById('hud-turn-icon');

            const firstStep = (routeData.stepMilestones && routeData.stepMilestones[0]) || null;
            const nextStep = (routeData.stepMilestones && routeData.stepMilestones[1]) || null;
            const upcomingManeuver = (nextStep && nextStep.maneuver) || (firstStep && firstStep.maneuver) || { modifier: 'straight' };
            const distToFirstTurn = firstStep ? Math.max(0, Math.round(firstStep.endDist)) : 150;
            const turnInitDistText = distToFirstTurn >= 1000 ? `in ${(distToFirstTurn / 1000).toFixed(1)}km` : `in ${distToFirstTurn}m`;
            const isNearTurn = distToFirstTurn <= 350;
            const activeManeuver = isNearTurn ? upcomingManeuver : { modifier: 'straight' };
            const actionLabel = isNearTurn ? this.getManeuverActionLabel(upcomingManeuver) : 'Straight';

            if (turnActionEl) turnActionEl.innerText = actionLabel;
            if (turnDistEl) turnDistEl.innerText = turnInitDistText;
            if (turnIconEl) turnIconEl.innerHTML = this.getTurnIconSvg(activeManeuver, false);

            hud.classList.remove('hidden');
            this.checkHudDocking();
        }

        this.tripSimulation.phase = 'en_route_pickup';

        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.logAudit) {
            const b = this.tripSimulation.booking || {};
            SupabaseBridge.logAudit("Booking System", "DRIVER_DISPATCHED", b.booking_code || b.id || "N/A", b.passenger_name || b.sender_name || "juan.delacruz@example.com", {
                booking_code: b.booking_code,
                service_type: b.service_type || 'transport',
                driver_name: b.driver_name || 'Ricardo Dalisay',
                vehicle_plate: b.vehicle_plate || 'TXI-5431',
                pickup: b.pickup,
                dropoff: b.dropoff,
                total_fare: b.total_fare,
                status: "EN_ROUTE_PICKUP"
            });
        }

        // Animate driver traveling along the actual road route to pickup (11s so passenger can clearly watch)
        this.animateAlongRoute(routeData.waypoints, routeData.distanceMeters, 11000, () => this.onArrivedAtPickup());
    },

    animateAlongRoute(waypoints, totalDistMeters, durationMs, onArrival) {
        if (!waypoints || waypoints.length === 0) {
            if (typeof onArrival === 'function') onArrival();
            return;
        }

        if (this.tripSimulation.animRafId) {
            cancelAnimationFrame(this.tripSimulation.animRafId);
            this.tripSimulation.animRafId = null;
        }
        if (this.tripSimulation.animTimer) {
            clearInterval(this.tripSimulation.animTimer);
            this.tripSimulation.animTimer = null;
        }

        // Compute segment distances and cumulative road distances
        const segmentDistances = [];
        const cumDistances = [0];
        let totalCalculatedDist = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const d = this.computeDistanceMeters(waypoints[i], waypoints[i+1]);
            segmentDistances.push(d);
            totalCalculatedDist += d;
            cumDistances.push(totalCalculatedDist);
        }

        const totalDist = totalCalculatedDist > 0 ? totalCalculatedDist : (totalDistMeters || 1000);
        this.tripSimulation.totalDistM = totalDist;
        this.tripSimulation.legDurationMs = durationMs;
        this.tripSimulation.legStartTime = performance.now();

        let lastDomUpdate = 0;

        const animate = (now) => {
            if (!this.tripSimulation.active) {
                return;
            }

            const elapsed = now - this.tripSimulation.legStartTime;
            const progress = Math.min(1.0, elapsed / durationMs);
            const targetDist = progress * totalDist;

            // Find current street segment along waypoints
            let segIndex = 0;
            for (let i = 0; i < cumDistances.length - 1; i++) {
                if (targetDist <= cumDistances[i + 1]) {
                    segIndex = i;
                    break;
                }
                segIndex = i;
            }

            const p1 = waypoints[segIndex];
            const p2 = waypoints[segIndex + 1] || p1;
            const segStartDist = cumDistances[segIndex];
            const segLen = segmentDistances[segIndex] || 0.0001;
            const segProgress = Math.max(0, Math.min(1.0, (targetDist - segStartDist) / segLen));

            const curLat = p1[0] + (p2[0] - p1[0]) * segProgress;
            const curLng = p1[1] + (p2[1] - p1[1]) * segProgress;

            this.tripSimulation.currentCoords = [curLat, curLng];

            // 60/120 FPS synchronous marker position update
            if (this.tripSimulation.driverMarker) {
                try {
                    this.tripSimulation.driverMarker.setLatLng([curLat, curLng]);
                } catch(e) {}
            }

            // Silky smooth 60/120 FPS map auto-tracking (synchronously updated on the exact same frame)
            if (this.tripSimulation.autoTrack && this.map) {
                try {
                    this.map.panTo([curLat, curLng], { animate: false });
                } catch(e) {}
            }

            // Throttle heavier DOM reflows and text updates to ~80ms to avoid dropping 60fps frames
            if (now - lastDomUpdate >= 80 || progress >= 1.0) {
                lastDomUpdate = now;

                // Real remaining road distance (distance along road, NOT displacement!)
                const remM = Math.max(0, Math.round(totalDist - targetDist));
                const distText = remM >= 1000 ? `${(remM / 1000).toFixed(1)} km` : `${remM} m`;
                const etaMinutes = Math.max(1, Math.ceil(remM / 280));
                const etaText = progress >= 1.0 ? 'Arrived' : `${etaMinutes} min`;
                // Stable estimated arrival time (does not descend or count down backwards)
                const clockText = this.tripSimulation.targetArrivalClock || this.formatClockTime(etaMinutes);

                const distEl = document.getElementById('hud-distance-value');
                const etaEl = document.getElementById('hud-eta-value');
                const clockEl = document.getElementById('hud-clock-arrival');
                const barEl = document.getElementById('hud-progress-bar');
                if (distEl) distEl.innerText = distText;
                if (etaEl) etaEl.innerText = etaText;
                if (clockEl) clockEl.innerText = clockText;
                if (barEl) barEl.style.width = `${Math.min(100, Math.round(progress * 100))}%`;

                // Update Destination Remaining Distance
                const destDistEl = document.getElementById('hud-dest-dist');
                if (destDistEl) {
                    destDistEl.innerText = progress >= 1.0 ? 'Arrived' : `in ${distText}`;
                }

                // Dynamically update HUD Current Location with street name and turn maneuver indicator
                this.updateHudTurnAndLocation(targetDist, progress, totalDist);

                // Live remaining distance & ETA directly on top of the driver marker (Google Maps style)
                const driverDistBadge = document.getElementById('driver-marker-rem-dist');
                const driverEtaBadge = document.getElementById('driver-marker-eta');
                if (driverDistBadge) {
                    driverDistBadge.innerText = progress >= 1.0 ? 'Arrived' : distText;
                }
                if (driverEtaBadge) {
                    driverEtaBadge.innerText = progress >= 1.0 ? 'Now' : etaText;
                    driverEtaBadge.classList.remove('hidden');
                }
            }

            if (progress >= 1.0) {
                this.tripSimulation.animRafId = null;
                if (typeof onArrival === 'function') {
                    onArrival();
                }
                return;
            }

            this.tripSimulation.animRafId = requestAnimationFrame(animate);
        };

        this.tripSimulation.animRafId = requestAnimationFrame(animate);
    },

    animateTripLeg(startCoords, targetCoords, durationMs, onArrival) {
        startCoords = this.normalizeCoords(startCoords);
        targetCoords = this.normalizeCoords(targetCoords);
        this.getDrivingRoute(startCoords, targetCoords).then(route => {
            this.animateAlongRoute(route.waypoints, route.distanceMeters, durationMs, onArrival);
        }).catch(() => {
            this.animateAlongRoute([startCoords, targetCoords], this.computeDistanceMeters(startCoords, targetCoords), durationMs, onArrival);
        });
    },

    initHudScrollObserver() {
        if (this._hudObserverInitialized) return;
        this._hudObserverInitialized = true;

        const handleScrollOrResize = () => {
            if (this.tripSimulation && this.tripSimulation.active) {
                this.checkHudDocking();
            }
        };

        window.addEventListener('scroll', handleScrollOrResize, { passive: true });
        window.addEventListener('resize', handleScrollOrResize, { passive: true });

        const mapEl = document.getElementById('booking-map');
        if (mapEl && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver(() => {
                handleScrollOrResize();
            }, { threshold: [0, 0.25, 0.5, 0.75, 1.0] });
            observer.observe(mapEl);
        }
    },

    checkHudDocking() {
        const hud = document.getElementById('active-trip-hud');
        const mapEl = document.getElementById('booking-map');
        if (!hud || !mapEl) return;

        // If trip simulation is not active or HUD is intentionally hidden (e.g. arrival popup open), skip
        if (!this.tripSimulation || !this.tripSimulation.active || hud.classList.contains('hidden')) {
            return;
        }

        const mapContainer = mapEl.parentElement;
        const rect = mapEl.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        // The map is considered "in view" if at least 150px of it is visible within the viewport
        const isMapInView = (rect.bottom > 150 && rect.top < windowHeight - 100);

        if (isMapInView) {
            // DOCKED IN MAP: Positioned at bottom of map container
            if (mapContainer && hud.parentElement !== mapContainer) {
                mapContainer.appendChild(hud);
            }
            hud.className = "absolute bottom-3 left-3 right-3 z-[1500] bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 transition-all duration-300 overflow-hidden";
        } else {
            // OUT OF VIEW: Float fixed just above the taskbar (bottom of viewport)
            if (hud.parentElement !== document.body) {
                document.body.appendChild(hud);
            }
            hud.className = "fixed bottom-3 left-4 right-4 sm:left-auto sm:right-6 sm:w-[460px] z-[1500] bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 transition-all duration-300 overflow-hidden";
        }
    },

    recenterTripMap() {
        // If map is scrolled off-screen, bring it into view smoothly
        const mapEl = document.getElementById('booking-map');
        if (mapEl) {
            const rect = mapEl.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        if (!this.map) return;
        if (this.tripSimulation.driverMarker) {
            try {
                const pos = this.tripSimulation.driverMarker.getLatLng();
                this.map.panTo(pos, { animate: true });
            } catch(e) {}
        } else if (this.tripSimulation.startCoords && this.tripSimulation.targetCoords) {
            try {
                this.map.fitBounds([this.tripSimulation.startCoords, this.tripSimulation.targetCoords], { padding: [70, 70] });
            } catch(e) {}
        }
    },

    enableAutoTrack() {
        if (!this.tripSimulation) return;
        this.tripSimulation.autoTrack = true;
        this.updateTrackButtonUI(true);

        const mapEl = document.getElementById('booking-map');
        if (mapEl) {
            const rect = mapEl.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        const targetPos = this.tripSimulation.currentCoords || 
            (this.tripSimulation.driverMarker ? this.tripSimulation.driverMarker.getLatLng() : this.tripSimulation.driverCoords);
        if (targetPos && this.map) {
            try {
                this.map.panTo(targetPos, { animate: true });
            } catch(e) {}
        }
    },

    disableAutoTrack() {
        if (!this.tripSimulation || !this.tripSimulation.active) return;
        if (!this.tripSimulation.autoTrack) return;
        this.tripSimulation.autoTrack = false;
        this.updateTrackButtonUI(false);
    },

    toggleAutoTrack() {
        if (this.tripSimulation.autoTrack) {
            this.disableAutoTrack();
        } else {
            this.enableAutoTrack();
        }
    },

    updateTrackButtonUI(isActive) {
        const btn = document.getElementById('btn-track-location');
        const pulse = document.getElementById('hud-track-pulse');
        const label = document.getElementById('hud-track-label');
        if (!btn) return;

        if (isActive) {
            btn.className = "px-2.5 sm:px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs";
            if (pulse) {
                pulse.className = "w-2 h-2 rounded-full bg-emerald-400 animate-ping";
            }
            if (label) label.innerText = "Track current location";
        } else {
            btn.className = "px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs";
            if (pulse) {
                pulse.className = "w-2 h-2 rounded-full bg-slate-500";
            }
            if (label) label.innerText = "Track current location";
        }
    },

    skipCurrentLeg() {
        if (this.tripSimulation.animRafId) {
            cancelAnimationFrame(this.tripSimulation.animRafId);
            this.tripSimulation.animRafId = null;
        }
        if (this.tripSimulation.animTimer) {
            clearInterval(this.tripSimulation.animTimer);
            this.tripSimulation.animTimer = null;
        }

        if (this.tripSimulation.phase === 'en_route_pickup') {
            if (this.tripSimulation.booking?.service_type === 'food') {
                this.proceedToDropoff();
            } else {
                this.onArrivedAtPickup();
            }
        } else if (this.tripSimulation.phase === 'arrived_pickup') {
            this.proceedToDropoff();
        } else if (this.tripSimulation.phase === 'en_route_dropoff') {
            this.onArrivedAtDropoff();
        }
    },

    onArrivedAtPickup() {
        this.tripSimulation.phase = 'arrived_pickup';

        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.logAudit) {
            const b = this.tripSimulation.booking || {};
            SupabaseBridge.logAudit("Booking System", "DRIVER_ARRIVED_PICKUP", b.booking_code || b.id || "N/A", b.passenger_name || b.sender_name || "juan.delacruz@example.com", {
                booking_code: b.booking_code,
                pickup: b.pickup,
                driver: b.driver_name || 'Ricardo Dalisay',
                status: "ARRIVED_AT_PICKUP"
            });
        }

        if (this.tripSimulation.animRafId) {
            cancelAnimationFrame(this.tripSimulation.animRafId);
            this.tripSimulation.animRafId = null;
        }
        if (this.tripSimulation.animTimer) {
            clearInterval(this.tripSimulation.animTimer);
            this.tripSimulation.animTimer = null;
        }

        const assignModal = document.getElementById('driver-assignment-modal');
        if (assignModal) assignModal.classList.add('hidden');

        const pickup = this.normalizeCoords(this.tripSimulation.booking?.pickup_coords || this.pickupCoords);
        if (this.tripSimulation.driverMarker && pickup) {
            try { this.tripSimulation.driverMarker.setLatLng(pickup); } catch(e) {}
        }

        // Update Google Maps Bottom HUD telemetry state
        const labelEl = document.getElementById('hud-trip-status-label');
        const currLocEl = document.getElementById('hud-current-location');
        const addrEl = document.getElementById('hud-target-address');
        const distEl = document.getElementById('hud-distance-value');
        const etaEl = document.getElementById('hud-eta-value');
        const clockEl = document.getElementById('hud-clock-arrival');
        const barEl = document.getElementById('hud-progress-bar');
        const arrivalBar = document.getElementById('hud-arrival-action-bar');
        const turnActionEl = document.getElementById('hud-turn-action');
        const turnDistEl = document.getElementById('hud-turn-dist');
        const turnIconEl = document.getElementById('hud-turn-icon');

        const booking = this.tripSimulation.booking || {};
        if (currLocEl) currLocEl.innerText = booking.pickup || 'Pickup Point';
        if (addrEl) addrEl.innerText = booking.dropoff || 'Dropoff Destination';
        if (distEl) distEl.innerText = "0 m";
        if (etaEl) etaEl.innerText = "Arrived";
        if (clockEl) clockEl.innerText = this.tripSimulation.targetArrivalClock || this.formatClockTime(0);
        if (barEl) barEl.style.width = "100%";

        // Update driver marker remaining distance badge on arrival at pickup
        const driverDistBadge = document.getElementById('driver-marker-rem-dist');
        const driverEtaBadge = document.getElementById('driver-marker-eta');
        if (driverDistBadge) driverDistBadge.innerText = "Arrived";
        if (driverEtaBadge) driverEtaBadge.innerText = "Now";

        // SPECIAL FOOD DELIVERY FLOW:
        // Food delivery picks up meals, not passengers!
        // 1. Remove pickup arrival modal popup.
        // 2. Add realistic preparation delay (3.8 seconds) to reflect picking up order & packing into thermal box.
        // 3. Automatically depart and proceed to the customer's dropoff location.
        if (booking.service_type === 'food') {
            const modal = document.getElementById('pickup-arrival-modal');
            if (modal) modal.classList.add('hidden');
            if (arrivalBar) arrivalBar.classList.add('hidden');

            if (labelEl) {
                labelEl.innerHTML = `<span class="inline-flex items-center space-x-1 text-amber-300 font-bold animate-pulse"><span> Arrived at Restaurant • Picking Up & Packing Order...</span></span>`;
            }
            if (turnActionEl) turnActionEl.innerText = "Packing Order";
            if (turnDistEl) turnDistEl.innerText = "At Store";
            if (turnIconEl) turnIconEl.innerHTML = `<span class="text-sm"></span>`;

            // Keep HUD visible
            const hud = document.getElementById('active-trip-hud');
            if (hud) {
                hud.classList.remove('hidden');
                this.checkHudDocking();
            }

            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast("Rider reached the store. Collecting your meal and packing into the motorcycle box...", "info");
            }

            // Realistic store preparation delay: after 3.8s, automatically proceed to dropoff
            setTimeout(() => {
                if (this.tripSimulation && this.tripSimulation.active && this.tripSimulation.phase === 'arrived_pickup') {
                    if (typeof App !== 'undefined' && App.showToast) {
                        App.showToast("Order packed! Courier departing to your delivery address", "success");
                    }
                    this.proceedToDropoff();
                }
            }, 3800);
            return;
        }

        // Transport or Parcel Pickup Arrival Flow
        const isParcel = booking.service_type === 'parcel';
        const arrivalBtnLabel = isParcel ? "Package Handed Over • Proceed to Dropoff" : "Passenger On Board • Proceed to Dropoff";

        if (labelEl) labelEl.innerText = isParcel ? "Sender Pickup Reached" : "Pickup Location Reached";
        if (arrivalBar) arrivalBar.classList.remove('hidden');
        if (turnActionEl) turnActionEl.innerText = "Arrive";
        if (turnDistEl) turnDistEl.innerText = "Arrived";
        if (turnIconEl) turnIconEl.innerHTML = this.getTurnIconSvg(null, true);

        const hudArrivalBtnText = document.getElementById('hud-arrival-btn-text');
        if (hudArrivalBtnText) {
            hudArrivalBtnText.innerText = arrivalBtnLabel;
        }

        // Hide HUD so it doesn't overlap the pickup arrival modal
        const hud = document.getElementById('active-trip-hud');
        if (hud) hud.classList.add('hidden');

        // Populate and show pickup arrival modal
        const pDriver = document.getElementById('pickup-modal-driver');
        const pPick = document.getElementById('pickup-modal-pickup-addr');
        const pDrop = document.getElementById('pickup-modal-dropoff-addr');
        const mHeading = document.getElementById('pickup-modal-heading');
        const mDesc = document.getElementById('pickup-modal-desc');
        const mBadge = document.getElementById('pickup-modal-badge');
        const mPickLabel = document.getElementById('pickup-modal-pickup-label');
        const mDropLabel = document.getElementById('pickup-modal-dropoff-label');
        const mBtnText = document.getElementById('pickup-proceed-btn-text');
        const mIcon = document.getElementById('pickup-modal-icon');
        const modal = document.getElementById('pickup-arrival-modal');

        if (mHeading) mHeading.innerText = isParcel ? "Courier Arrived for Pickup!" : "Driver Arrived at Pickup!";
        if (mDesc) mDesc.innerText = isParcel ? "Your parcel courier has arrived at the sender location. Please hand over the parcel and confirm departure." : "Your driver is waiting outside your pickup location. Please confirm once passenger is on board to proceed to destination.";
        if (mBadge) mBadge.innerText = isParcel ? "Parcel Pickup Reached" : "Pickup Location Reached";
        if (mPickLabel) mPickLabel.innerText = isParcel ? "Sender Location" : "Pickup Point";
        if (mDropLabel) mDropLabel.innerText = isParcel ? "Recipient Destination" : "Next Stop: Dropoff Destination";
        if (mBtnText) mBtnText.innerText = arrivalBtnLabel;
        if (mIcon) {
            mIcon.innerHTML = isParcel ? '<svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>' : '<svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
        }

        if (pDriver) pDriver.innerText = `${booking.driver_name || 'Ricardo Dalisay'} (${booking.vehicle_plate || 'TXI-5431'})`;
        if (pPick) pPick.innerText = booking.pickup || 'Pickup Location';
        if (pDrop) pDrop.innerText = booking.dropoff || 'Dropoff Destination';

        if (modal) {
            modal.classList.remove('hidden');
        } else {
            // Safety fallback: if modal is missing from DOM, ensure HUD is visible so user can proceed
            if (hud) {
                hud.classList.remove('hidden');
                this.checkHudDocking();
            }
            if (arrivalBar) arrivalBar.classList.remove('hidden');
        }
    },

    closePickupArrivalModal() {
        const modal = document.getElementById('pickup-arrival-modal');
        if (modal) modal.classList.add('hidden');

        // If trip is still at arrived_pickup, reveal bottom HUD with "Proceed to Dropoff" button
        if (this.tripSimulation && this.tripSimulation.active && this.tripSimulation.phase === 'arrived_pickup') {
            const booking = this.tripSimulation.booking || {};
            const isParcel = booking.service_type === 'parcel';
            const hudArrivalBtnText = document.getElementById('hud-arrival-btn-text');
            if (hudArrivalBtnText) {
                hudArrivalBtnText.innerText = isParcel ? "Package Handed Over • Proceed to Dropoff" : "Passenger On Board • Proceed to Dropoff";
            }
            const arrivalBar = document.getElementById('hud-arrival-action-bar');
            if (arrivalBar) arrivalBar.classList.remove('hidden');
            const hud = document.getElementById('active-trip-hud');
            if (hud) {
                hud.classList.remove('hidden');
                this.checkHudDocking();
            }
        }
    },

    async proceedToDropoff() {
        const modal = document.getElementById('pickup-arrival-modal');
        if (modal) modal.classList.add('hidden');

        const arrivalBar = document.getElementById('hud-arrival-action-bar');
        if (arrivalBar) arrivalBar.classList.add('hidden');

        // Ensure HUD is visible and tracking en route to dropoff
        const hud = document.getElementById('active-trip-hud');
        if (hud) {
            hud.classList.remove('hidden');
            this.checkHudDocking();
        }

        this.tripSimulation.autoTrack = true;
        this.updateTrackButtonUI(true);

        this.tripSimulation.phase = 'en_route_dropoff';

        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.logAudit) {
            const b = this.tripSimulation.booking || {};
            SupabaseBridge.logAudit("Booking System", "PASSENGER_BOARDED_IN_TRANSIT", b.booking_code || b.id || "N/A", b.passenger_name || b.sender_name || "juan.delacruz@example.com", {
                booking_code: b.booking_code,
                pickup: b.pickup,
                dropoff: b.dropoff,
                status: "IN_TRANSIT"
            });
        }

        const booking = this.tripSimulation.booking || {};
        const pickup = this.normalizeCoords(booking.pickup_coords || this.pickupCoords, [14.5583, 121.0189]);
        const dropoff = this.normalizeCoords(booking.dropoff_coords || this.dropoffCoords, [14.5517, 121.0509]);
        booking.pickup_coords = pickup;
        booking.dropoff_coords = dropoff;

        // Fetch real road driving route from pickup to dropoff!
        const routeData = await this.getDrivingRoute(pickup, dropoff);
        this.tripSimulation.activeRouteData = routeData;

        // Ensure dropoff marker is present with real driving distance badge on top (Google Maps style)
        const dropoffDistText = `${routeData.distanceKm} km`;
        if (this.dropoffMarker) {
            this.dropoffMarker.setIcon(this.getDropoffIcon(dropoffDistText));
            this.dropoffMarker.setLatLng(dropoff);
        } else if (this.map) {
            this.dropoffMarker = L.marker(dropoff, {
                icon: this.getDropoffIcon(dropoffDistText),
                draggable: false
            }).addTo(this.map);
        }

        // Update route line to solid emerald green along actual roads (not straight displacement)
        if (this.tripSimulation.routeLine) {
            try { this.map.removeLayer(this.tripSimulation.routeLine); } catch(e) {}
        }
        try {
            this.tripSimulation.routeLine = L.polyline(routeData.waypoints, {
                color: '#10b981',
                weight: 5,
                opacity: 0.9
            }).addTo(this.map);
        } catch(e) {}

        try {
            this.map.fitBounds(this.tripSimulation.routeLine.getBounds(), { padding: [60, 60] });
        } catch(e) {}

        // Update Google Maps Bottom HUD with real road distance & target destination
        const labelEl = document.getElementById('hud-trip-status-label');
        const currLocEl = document.getElementById('hud-current-location');
        const addrEl = document.getElementById('hud-target-address');
        const barEl = document.getElementById('hud-progress-bar');
        const distEl = document.getElementById('hud-distance-value');
        const etaEl = document.getElementById('hud-eta-value');
        const clockEl = document.getElementById('hud-clock-arrival');

        if (labelEl) labelEl.innerText = "In Transit to Dropoff";
        if (currLocEl) currLocEl.innerText = booking.pickup || 'Pickup Point';
        if (addrEl) addrEl.innerText = booking.dropoff || 'Dropoff Destination';
        if (barEl) barEl.style.width = "0%";

        const initDistText = routeData.distanceMeters >= 1000 ? `${(routeData.distanceMeters / 1000).toFixed(1)} km` : `${routeData.distanceMeters} m`;
        const initEtaMin = Math.max(1, Math.ceil(routeData.distanceMeters / 280));
        if (distEl) distEl.innerText = initDistText;
        if (etaEl) etaEl.innerText = `${initEtaMin} min`;
        const dropoffClock = this.formatClockTime(initEtaMin);
        this.tripSimulation.targetArrivalClock = dropoffClock;
        if (clockEl) clockEl.innerText = dropoffClock;

        // Initialize turn maneuver indicator with dynamic preview threshold for dropoff leg
        const turnActionEl = document.getElementById('hud-turn-action');
        const turnDistEl = document.getElementById('hud-turn-dist');
        const turnIconEl = document.getElementById('hud-turn-icon');

        const firstStep = (routeData.stepMilestones && routeData.stepMilestones[0]) || null;
        const nextStep = (routeData.stepMilestones && routeData.stepMilestones[1]) || null;
        const upcomingManeuver = (nextStep && nextStep.maneuver) || (firstStep && firstStep.maneuver) || { modifier: 'straight' };
        const distToFirstTurn = firstStep ? Math.max(0, Math.round(firstStep.endDist)) : 150;
        const turnInitDistText = distToFirstTurn >= 1000 ? `in ${(distToFirstTurn / 1000).toFixed(1)}km` : `in ${distToFirstTurn}m`;
        const isNearTurn = distToFirstTurn <= 350;
        const activeManeuver = isNearTurn ? upcomingManeuver : { modifier: 'straight' };
        const actionLabel = isNearTurn ? this.getManeuverActionLabel(upcomingManeuver) : 'Straight';

        if (turnActionEl) turnActionEl.innerText = actionLabel;
        if (turnDistEl) turnDistEl.innerText = turnInitDistText;
        if (turnIconEl) turnIconEl.innerHTML = this.getTurnIconSvg(activeManeuver, false);

        // Update driver's live remaining distance badge for the dropoff leg
        const driverDistBadgeDrop = document.getElementById('driver-marker-rem-dist');
        const driverEtaBadgeDrop = document.getElementById('driver-marker-eta');
        if (driverDistBadgeDrop) driverDistBadgeDrop.innerText = initDistText;
        if (driverEtaBadgeDrop) {
            driverEtaBadgeDrop.innerText = `${initEtaMin} min`;
            driverEtaBadgeDrop.classList.remove('hidden');
        }

        // Animate trip to dropoff along actual road waypoints (14s)
        this.animateAlongRoute(routeData.waypoints, routeData.distanceMeters, 14000, () => this.onArrivedAtDropoff());
    },

    onArrivedAtDropoff() {
        if (this.tripSimulation._settled) return;
        this.tripSimulation._settled = true;

        this.tripSimulation.phase = 'arrived_dropoff';

        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.logAudit) {
            const b = this.tripSimulation.booking || {};
            SupabaseBridge.logAudit("Booking System", "TRIP_COMPLETED", b.booking_code || b.id || "N/A", b.passenger_name || b.sender_name || "juan.delacruz@example.com", {
                booking_code: b.booking_code,
                service_type: b.service_type || 'transport',
                pickup: b.pickup,
                dropoff: b.dropoff,
                driver_name: b.driver_name || 'Ricardo Dalisay',
                driver_plate: b.vehicle_plate || 'TXI-5431',
                total_fare: b.total_fare,
                payment_method: b.payment_method,
                status: "COMPLETED"
            });
        }

        const dropoff = this.normalizeCoords(this.tripSimulation.booking?.dropoff_coords || this.dropoffCoords, [14.5517, 121.0509]);
        if (this.tripSimulation.driverMarker && dropoff) {
            try { this.tripSimulation.driverMarker.setLatLng(dropoff); } catch(e) {}
        }

        // Update badges on driver and dropoff markers
        const driverDistBadge = document.getElementById('driver-marker-rem-dist');
        const driverEtaBadge = document.getElementById('driver-marker-eta');
        if (driverDistBadge) driverDistBadge.innerText = "Arrived";
        if (driverEtaBadge) driverEtaBadge.innerText = "Now";

        const dropoffBadge = document.getElementById('dropoff-pin-dist-badge');
        if (dropoffBadge) dropoffBadge.innerText = "Arrived";

        // Update HUD
        const labelEl = document.getElementById('hud-trip-status-label');
        const currLocEl = document.getElementById('hud-current-location');
        const addrEl = document.getElementById('hud-target-address');
        const distEl = document.getElementById('hud-distance-value');
        const etaEl = document.getElementById('hud-eta-value');
        const clockEl = document.getElementById('hud-clock-arrival');
        const barEl = document.getElementById('hud-progress-bar');
        const arrivalBar = document.getElementById('hud-arrival-action-bar');
        const turnActionEl = document.getElementById('hud-turn-action');
        const turnDistEl = document.getElementById('hud-turn-dist');
        const turnIconEl = document.getElementById('hud-turn-icon');

        const booking = this.tripSimulation.booking || {};
        if (labelEl) labelEl.innerText = "Destination Reached";
        if (currLocEl) currLocEl.innerText = booking.dropoff || 'Destination';
        if (addrEl) addrEl.innerText = booking.dropoff || 'Destination';
        if (distEl) distEl.innerText = "0 m";
        if (etaEl) etaEl.innerText = "Completed";
        if (clockEl) clockEl.innerText = this.tripSimulation.targetArrivalClock || this.formatClockTime(0);
        if (barEl) barEl.style.width = "100%";
        if (arrivalBar) arrivalBar.classList.add('hidden');

        if (turnActionEl) turnActionEl.innerText = "Arrive";
        if (turnDistEl) turnDistEl.innerText = "Arrived";
        if (turnIconEl) turnIconEl.innerHTML = this.getTurnIconSvg(null, true);

        // Hide HUD temporarily while showing payment confirmation modal
        setTimeout(() => {
            const hud = document.getElementById('active-trip-hud');
            if (hud) {
                hud.classList.add('hidden');
            }

            if (typeof PaymentsModule !== 'undefined' && this.tripSimulation.booking) {
                const booking = this.tripSimulation.booking;
                PaymentsModule.openPaymentModal(booking);
            }
        }, 700);
    },

    onPaymentModalDismissed() {
        // If payment modal is dismissed while trip is completed/waiting for payment, show minimized payment button in HUD
        if (this.tripSimulation && this.tripSimulation.booking && this.tripSimulation.phase === 'arrived_dropoff') {
            const payBar = document.getElementById('hud-payment-action-bar');
            if (payBar) payBar.classList.remove('hidden');

            const hud = document.getElementById('active-trip-hud');
            if (hud) {
                hud.classList.remove('hidden');
                this.checkHudDocking();
            }
        }
    },

    reopenPaymentModal() {
        if (typeof PaymentsModule !== 'undefined' && this.tripSimulation && this.tripSimulation.booking) {
            PaymentsModule.openPaymentModal(this.tripSimulation.booking);
        }
    },

    cleanupTripSimulation() {
        if (this.tripSimulation.animRafId) {
            cancelAnimationFrame(this.tripSimulation.animRafId);
            this.tripSimulation.animRafId = null;
        }
        if (this.tripSimulation.animTimer) {
            clearInterval(this.tripSimulation.animTimer);
            this.tripSimulation.animTimer = null;
        }
        if (this.tripSimulation.driverMarker && this.map) {
            try { this.map.removeLayer(this.tripSimulation.driverMarker); } catch(e) {}
            this.tripSimulation.driverMarker = null;
        }
        if (this.tripSimulation.routeLine && this.map) {
            try { this.map.removeLayer(this.tripSimulation.routeLine); } catch(e) {}
            this.tripSimulation.routeLine = null;
        }

        const hud = document.getElementById('active-trip-hud');
        if (hud) {
            hud.classList.add('hidden');
            const mapEl = document.getElementById('booking-map');
            const mapContainer = mapEl ? mapEl.parentElement : null;
            if (mapContainer && hud.parentElement !== mapContainer) {
                mapContainer.appendChild(hud);
                hud.className = "hidden absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 transition-all duration-300 overflow-hidden";
            }
        }

        document.getElementById('hud-arrival-action-bar')?.classList.add('hidden');
        document.getElementById('hud-payment-action-bar')?.classList.add('hidden');
        document.getElementById('driver-assignment-modal')?.classList.add('hidden');
        document.getElementById('pickup-arrival-modal')?.classList.add('hidden');

        this.tripSimulation.active = false;
        this.tripSimulation.phase = null;
    },

    closeReceipt() {
        if (typeof PaymentsModule !== 'undefined') {
            PaymentsModule.closeReceiptModal();
        }
    },

    closeReceiptAndGoToPayments() {
        // Backwards compatibility alias for closeReceipt
        this.closeReceipt();
    }
};
