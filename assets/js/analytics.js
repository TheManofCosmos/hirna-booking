/**
 * Module 5: Transport Analytics & KPI Dashboard
 * Chart.js powered executive charts with AI Predictive Forecasting
 */
const AnalyticsModule = {
    revenueChart: null,
    demandChart: null,
    fleetFilter: 'all',

    defaultFleetOwners: [
        {
            id: "drv-101",
            name: "Ricardo Dalisay",
            phone: "+63 920 555 1234",
            license: "N01-19-123456",
            vehicle_model: "Toyota Vios 1.5G (Silver)",
            vehicle_plate: "NFD-8892",
            vehicle_class: "Sedan (4-Seater)",
            vehicle_type: "car",
            status: "available",
            rating: 4.92,
            safety_score: 99,
            total_trips: 520
        },
        {
            id: "drv-102",
            name: "Elena Roces",
            phone: "+63 922 444 9876",
            license: "N02-20-654321",
            vehicle_model: "Mitsubishi Xpander (White)",
            vehicle_plate: "NBL-3301",
            vehicle_class: "MPV (6-Seater)",
            vehicle_type: "car",
            status: "available",
            rating: 4.85,
            safety_score: 96,
            total_trips: 310
        },
        {
            id: "drv-103",
            name: "Arman Mendoza",
            phone: "+63 919 777 4321",
            license: "N03-21-987123",
            vehicle_model: "Honda Civic RS (Black)",
            vehicle_plate: "NDS-4099",
            vehicle_class: "Executive (4-Seater)",
            vehicle_type: "car",
            status: "available",
            rating: 4.98,
            safety_score: 100,
            total_trips: 415
        },
        {
            id: "drv-104",
            name: "Danilo Cruz",
            phone: "+63 918 333 4455",
            license: "N04-22-334455",
            vehicle_model: "Yamaha NMAX 155 (Midnight Blue)",
            vehicle_plate: "MTR-9821",
            vehicle_class: "Scooter (155cc)",
            vehicle_type: "scooter",
            status: "available",
            rating: 4.95,
            safety_score: 99,
            total_trips: 680
        },
        {
            id: "drv-105",
            name: "Jomar Reyes",
            phone: "+63 917 888 1122",
            license: "N05-23-556677",
            vehicle_model: "Honda Click 125i (Pearl White)",
            vehicle_plate: "MC-4412",
            vehicle_class: "Scooter (125cc)",
            vehicle_type: "scooter",
            status: "available",
            rating: 4.91,
            safety_score: 98,
            total_trips: 450
        },
        {
            id: "drv-106",
            name: "Arnel Bautista",
            phone: "+63 928 444 3322",
            license: "N06-20-112233",
            vehicle_model: "Honda Wave 125i (Sport Red)",
            vehicle_plate: "MC-8109",
            vehicle_class: "Manual/Underbone (125cc)",
            vehicle_type: "manual",
            status: "available",
            rating: 4.89,
            safety_score: 97,
            total_trips: 520
        },
        {
            id: "drv-107",
            name: "Mark Dizon",
            phone: "+63 915 222 7788",
            license: "N07-21-998877",
            vehicle_model: "Yamaha Aerox 155 (Racing Cyan)",
            vehicle_plate: "MC-2930",
            vehicle_class: "Scooter (155cc)",
            vehicle_type: "scooter",
            status: "available",
            rating: 4.93,
            safety_score: 99,
            total_trips: 610
        },
        {
            id: "drv-108",
            name: "Roderick Tan",
            phone: "+63 929 666 4433",
            license: "N08-22-445566",
            vehicle_model: "Yamaha Sniper 155 (Matte Black)",
            vehicle_plate: "MC-6754",
            vehicle_class: "Manual (155cc)",
            vehicle_type: "manual",
            status: "available",
            rating: 4.94,
            safety_score: 100,
            total_trips: 580
        },
        {
            id: "drv-109",
            name: "Carlo Mendoza",
            phone: "+63 916 555 9900",
            license: "N09-24-778899",
            vehicle_model: "Honda ADV 160 (Matte Solar Red)",
            vehicle_plate: "MC-5128",
            vehicle_class: "Scooter (160cc)",
            vehicle_type: "scooter",
            status: "available",
            rating: 4.97,
            safety_score: 100,
            total_trips: 720
        }
    ],

    init() {
        this.renderKPIs();
        this.renderFleetInventory();
        this.renderCharts();
        this.renderDemandForecastTable();
    },

    isMotorcycleOwner(driver) {
        if (!driver) return false;
        const vt = (driver.vehicle_type || '').toLowerCase();
        const vc = (driver.vehicle_class || '').toLowerCase();
        const vm = (driver.vehicle_model || '').toLowerCase();
        return vt === 'scooter' || vt === 'manual' || vt === 'motorcycle' ||
               vc.includes('scooter') || vc.includes('manual') || vc.includes('underbone') || vc.includes('motorcycle') ||
               vm.includes('nmax') || vm.includes('click') || vm.includes('wave') || vm.includes('aerox') || vm.includes('sniper') || vm.includes('adv');
    },

    getFleetOwners() {
        const dbDrivers = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData)
            ? (SupabaseBridge.getData('drivers') || [])
            : [];

        const mapByKey = new Map();
        this.defaultFleetOwners.forEach(d => {
            const key = d.id || d.vehicle_plate || d.name;
            mapByKey.set(key, { ...d });
        });

        dbDrivers.forEach(d => {
            if (!d || typeof d !== 'object') return;
            const key = d.id || d.vehicle_plate || d.name;
            if (key && mapByKey.has(key)) {
                mapByKey.set(key, { ...mapByKey.get(key), ...d });
            } else if (key) {
                mapByKey.set(key, { ...d });
            }
        });

        return Array.from(mapByKey.values());
    },

    setFleetFilter(filter) {
        this.fleetFilter = filter || 'all';
        this.renderFleetInventory();
    },

    renderFleetInventory() {
        const tbody = document.getElementById('fleet-inventory-tbody');
        if (!tbody) return;

        const allOwners = this.getFleetOwners();
        const carOwners = allOwners.filter(d => !this.isMotorcycleOwner(d));
        const motoOwners = allOwners.filter(d => this.isMotorcycleOwner(d));

        const totalBadge = document.getElementById('fleet-total-count-badge');
        if (totalBadge) {
            totalBadge.textContent = `${allOwners.length} Owners (${carOwners.length} Cars • ${motoOwners.length} Motorcycles)`;
        }

        const btnAll = document.getElementById('fleet-filter-all');
        const btnCar = document.getElementById('fleet-filter-car');
        const btnMoto = document.getElementById('fleet-filter-motorcycle');

        if (btnAll) btnAll.textContent = `All Fleet (${allOwners.length})`;
        if (btnCar) btnCar.textContent = `Car Owners (${carOwners.length})`;
        if (btnMoto) btnMoto.textContent = `Motorcycle Owners (${motoOwners.length})`;

        const activeClass = "px-3 py-1.5 bg-hirna-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer";
        const inactiveClass = "px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition cursor-pointer";

        if (btnAll) btnAll.className = this.fleetFilter === 'all' ? activeClass : inactiveClass;
        if (btnCar) btnCar.className = this.fleetFilter === 'car' ? activeClass : inactiveClass;
        if (btnMoto) btnMoto.className = this.fleetFilter === 'motorcycle' ? activeClass : inactiveClass;

        let displayed = allOwners;
        if (this.fleetFilter === 'car') {
            displayed = carOwners;
        } else if (this.fleetFilter === 'motorcycle') {
            displayed = motoOwners;
        }

        tbody.innerHTML = displayed.map(d => {
            const isMoto = this.isMotorcycleOwner(d);
            const vcLower = (d.vehicle_class || '').toLowerCase();
            const vtLower = (d.vehicle_type || '').toLowerCase();

            let categoryBadge = '';
            let capacityText = d.vehicle_class || 'Standard Class';

            if (isMoto) {
                const isManual = vtLower === 'manual' || vcLower.includes('manual') || vcLower.includes('underbone');
                if (isManual) {
                    categoryBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">Motorcycle • Manual</span>';
                } else {
                    categoryBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Motorcycle • Scooter</span>';
                }
                if (!capacityText.toLowerCase().includes('seater') && !capacityText.toLowerCase().includes('passenger')) {
                    capacityText = `${capacityText} • 1-Seater`;
                }
            } else {
                if (vcLower.includes('mpv') || vcLower.includes('suv')) {
                    categoryBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Car • MPV / SUV</span>';
                } else if (vcLower.includes('executive')) {
                    categoryBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Car • Executive Sedan</span>';
                } else {
                    categoryBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Car • Taxi Sedan</span>';
                }
            }

            const rating = d.rating != null ? Number(d.rating).toFixed(2) : '4.90';
            const safety = d.safety_score != null ? d.safety_score : 99;
            const trips = d.total_trips != null ? Number(d.total_trips).toLocaleString() : '300';
            const isAvail = !d.status || d.status === 'available' || d.status === 'active';
            const statusHtml = isAvail
                ? '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">● Active</span>'
                : `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">● ${d.status}</span>`;

            return `
                <tr class="hover:bg-slate-50 transition">
                    <td class="px-4 py-3">
                        <div class="font-bold text-slate-900">${d.name || 'Fleet Driver'}</div>
                        <div class="text-[10px] text-slate-500 font-mono">${d.phone || '+63 917 000 0000'} • Lic: ${d.license || 'N01-20-000000'}</div>
                    </td>
                    <td class="px-4 py-3 font-semibold text-slate-800">${d.vehicle_model || 'Hirna Fleet Vehicle'}</td>
                    <td class="px-4 py-3"><span class="plate-badge">${d.vehicle_plate || 'HIR-0000'}</span></td>
                    <td class="px-4 py-3">${categoryBadge}</td>
                    <td class="px-4 py-3 text-slate-600 font-mono">${capacityText}</td>
                    <td class="px-4 py-3">
                        <span class="font-bold text-amber-600">${rating} ★</span>
                        <span class="text-slate-400 mx-1">•</span>
                        <span class="font-mono font-semibold text-emerald-700">${safety}% Safety</span>
                        <span class="block text-[10px] text-slate-400">${trips} trips completed</span>
                    </td>
                    <td class="px-4 py-3">${statusHtml}</td>
                </tr>
            `;
        }).join('');
    },

    renderKPIs() {
        if (!document.getElementById('kpi-revenue')) return;

        const allOwners = this.getFleetOwners();
        const carOwners = allOwners.filter(d => !this.isMotorcycleOwner(d));
        const motoOwners = allOwners.filter(d => this.isMotorcycleOwner(d));
        const totalUnits = allOwners.length || 1;
        const activeUnits = allOwners.filter(d => !d.status || d.status === 'available' || d.status === 'active').length;
        const readinessPct = Math.round((activeUnits / totalUnits) * 100);

        const carUnitPct = ((carOwners.length / totalUnits) * 100).toFixed(1);
        const motoUnitPct = ((motoOwners.length / totalUnits) * 100).toFixed(1);

        // Card 1: Active Fleet Composition
        const unitsEl = document.getElementById('kpi-fleet-units');
        if (unitsEl) unitsEl.innerText = `${activeUnits} Active Units`;
        const readyEl = document.getElementById('kpi-fleet-readiness');
        if (readyEl) readyEl.innerText = `● ${readinessPct}% Online`;
        const carBar = document.getElementById('kpi-fleet-car-bar');
        if (carBar) carBar.style.width = `${carUnitPct}%`;
        const motoBar = document.getElementById('kpi-fleet-moto-bar');
        if (motoBar) motoBar.style.width = `${motoUnitPct}%`;
        const carCountEl = document.getElementById('kpi-fleet-car-count');
        if (carCountEl) carCountEl.innerText = `${carOwners.length} Cars (${Math.round(Number(carUnitPct))}%)`;
        const motoCountEl = document.getElementById('kpi-fleet-moto-count');
        if (motoCountEl) motoCountEl.innerText = `${motoOwners.length} Motorcycles (${Math.round(Number(motoUnitPct))}%)`;

        // Card 2: Total Fleet Trips & Car vs Motorcycle Split
        const bookings = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData)
            ? (SupabaseBridge.getData('bookings') || []).filter(b => !b.is_archived)
            : [];

        const baseCarTrips = carOwners.reduce((sum, d) => sum + (Number(d.total_trips) || 0), 0);
        const baseMotoTrips = motoOwners.reduce((sum, d) => sum + (Number(d.total_trips) || 0), 0);

        let liveCarTrips = 0;
        let liveMotoTrips = 0;
        let liveCarRev = 0;
        let liveMotoRev = 0;

        bookings.forEach(b => {
            const fare = parseFloat(b.total_fare || 0);
            const vc = (b.vehicle_class || '').toLowerCase();
            const st = (b.service_type || '').toLowerCase();
            const isMotoBooking = st === 'express' || vc.includes('scooter') || vc.includes('manual') || vc.includes('moto') || vc.includes('underbone');
            if (isMotoBooking) {
                liveMotoTrips++;
                liveMotoRev += fare;
            } else {
                liveCarTrips++;
                liveCarRev += fare;
            }
        });

        const totalCarTrips = baseCarTrips + liveCarTrips;
        const totalMotoTrips = baseMotoTrips + liveMotoTrips;
        const totalFleetTrips = (totalCarTrips + totalMotoTrips) || 1;
        const carTripPct = ((totalCarTrips / totalFleetTrips) * 100).toFixed(1);
        const motoTripPct = ((totalMotoTrips / totalFleetTrips) * 100).toFixed(1);

        document.getElementById('kpi-trips').innerText = totalFleetTrips.toLocaleString();
        const tripsCarBar = document.getElementById('kpi-trips-car-bar');
        if (tripsCarBar) tripsCarBar.style.width = `${carTripPct}%`;
        const tripsMotoBar = document.getElementById('kpi-trips-moto-bar');
        if (tripsMotoBar) tripsMotoBar.style.width = `${motoTripPct}%`;
        const tripsCarSplit = document.getElementById('kpi-trips-car-split');
        if (tripsCarSplit) tripsCarSplit.innerText = `Cars: ${totalCarTrips.toLocaleString()} (${Math.round(Number(carTripPct))}%)`;
        const tripsMotoSplit = document.getElementById('kpi-trips-moto-split');
        if (tripsMotoSplit) tripsMotoSplit.innerText = `Moto: ${totalMotoTrips.toLocaleString()} (${Math.round(Number(motoTripPct))}%)`;

        // Card 3: Fleet Rating & Safety Score
        const avgRating = (allOwners.reduce((s, d) => s + (Number(d.rating) || 4.9), 0) / totalUnits).toFixed(2);
        const avgSafety = (allOwners.reduce((s, d) => s + (Number(d.safety_score) || 98), 0) / totalUnits).toFixed(1);

        const ratingEl = document.getElementById('kpi-fleet-rating');
        if (ratingEl) ratingEl.innerText = `${avgRating} ★`;
        const safetyEl = document.getElementById('kpi-driver-safety');
        if (safetyEl) safetyEl.innerText = `${avgSafety}% Safety`;
        const safetyBar = document.getElementById('kpi-safety-bar');
        if (safetyBar) safetyBar.style.width = `${Math.min(100, Number(avgSafety))}%`;

        const topRatedOwner = [...allOwners].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))[0];
        const topTripsOwner = [...allOwners].sort((a, b) => (Number(b.total_trips) || 0) - (Number(a.total_trips) || 0))[0];
        const topPerformerEl = document.getElementById('kpi-top-performer');
        if (topPerformerEl && topRatedOwner && topTripsOwner) {
            const shortName = n => {
                const parts = String(n || '').trim().split(' ');
                return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
            };
            topPerformerEl.innerText = `Top: ${shortName(topRatedOwner.name)} (${Number(topRatedOwner.rating).toFixed(2)} ★) • ${shortName(topTripsOwner.name)} (${topTripsOwner.total_trips})`;
        }

        // Card 4: Fleet Gross Revenue & AI Surge
        const baseCarRevenue = baseCarTrips * 185;
        const baseMotoRevenue = baseMotoTrips * 78;
        const totalCarRevenue = baseCarRevenue + liveCarRev;
        const totalMotoRevenue = baseMotoRevenue + liveMotoRev;
        const totalRevenue = totalCarRevenue + totalMotoRevenue;
        const avgFarePerTrip = totalRevenue / totalFleetTrips;

        const revCarPct = ((totalCarRevenue / (totalRevenue || 1)) * 100).toFixed(1);
        const revMotoPct = ((totalMotoRevenue / (totalRevenue || 1)) * 100).toFixed(1);

        let avgSurge = '1.22';
        if (bookings.length > 0) {
            avgSurge = (bookings.reduce((sum, b) => sum + parseFloat(b.surge_multiplier || 1.2), 0) / bookings.length).toFixed(2);
        } else if (typeof AIEngines !== 'undefined' && AIEngines.DemandPrediction && AIEngines.DemandPrediction.getForecast) {
            const zones = AIEngines.DemandPrediction.getForecast() || [];
            if (zones.length > 0) {
                avgSurge = (zones.reduce((sum, z) => sum + parseFloat(z.surgeMultiplier || 1.2), 0) / zones.length).toFixed(2);
            }
        }

        document.getElementById('kpi-revenue').innerText = `₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('kpi-surge-avg').innerText = `${avgSurge}x AI Surge`;
        const revCarBar = document.getElementById('kpi-rev-car-bar');
        if (revCarBar) revCarBar.style.width = `${revCarPct}%`;
        const revMotoBar = document.getElementById('kpi-rev-moto-bar');
        if (revMotoBar) revMotoBar.style.width = `${revMotoPct}%`;
        const avgFareEl = document.getElementById('kpi-avg-fare');
        if (avgFareEl) avgFareEl.innerText = `Avg: ₱${avgFarePerTrip.toFixed(2)} / trip`;
        const liveBadgeEl = document.getElementById('kpi-live-bookings-badge');
        if (liveBadgeEl) {
            liveBadgeEl.innerText = bookings.length > 0 ? `+${bookings.length} Live Bookings` : '↑ Live Synced';
        }
    },

    renderCharts() {
        const now = new Date();
        const currentHour = now.getHours();

        // 1. 7-Day Demand & Traffic Forecast Chart - Synchronized with current date & next 7 days
        const revCtx = document.getElementById('chart-revenue-forecast')?.getContext('2d');
        if (revCtx) {
            if (this.revenueChart) {
                try { this.revenueChart.destroy(); } catch(e) {}
                this.revenueChart = null;
            }

            const forecastResult = AIEngines.RevenueForecast.generate7DayForecast(null, now);
            const historical = forecastResult.historical;
            const forecast = forecastResult.forecast;

            const allLabels = [...historical.map(h => h.label), ...forecast.map(f => f.day)];
            const histTrips = [...historical.map(h => h.trips), ...new Array(forecast.length).fill(null)];
            
            // Connect trips forecast seamlessly starting from today's historical anchor point
            const todayTripAnchor = historical[historical.length - 1].trips;
            const predTrips = [...new Array(historical.length - 1).fill(null), todayTripAnchor, ...forecast.map(f => f.projectedTrips)];

            // Traffic Delay Percentage Curve
            const histTraffic = [...historical.map(h => h.trafficDelayPct), ...new Array(forecast.length).fill(null)];
            const todayTrafficAnchor = historical[historical.length - 1].trafficDelayPct;
            const predTraffic = [...new Array(historical.length - 1).fill(null), todayTrafficAnchor, ...forecast.map(f => f.trafficDelayPct)];

            this.revenueChart = new Chart(revCtx, {
                type: 'line',
                data: {
                    labels: allLabels,
                    datasets: [
                        {
                            label: 'Historical Demand (Trips)',
                            data: histTrips,
                            borderColor: '#b91c1c',
                            backgroundColor: 'rgba(185, 28, 28, 0.08)',
                            fill: true,
                            tension: 0.35,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: 'AI Predicted Demand (Trips/Day)',
                            data: predTrips,
                            borderColor: '#ea580c',
                            borderDash: [6, 6],
                            backgroundColor: 'rgba(234, 88, 12, 0.12)',
                            fill: true,
                            tension: 0.35,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Corridor Traffic Delay (% Slowdown)',
                            data: predTraffic,
                            borderColor: '#eab308',
                            borderDash: [3, 3],
                            backgroundColor: 'transparent',
                            fill: false,
                            tension: 0.35,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const val = context.parsed.y;
                                    if (val === null) return '';
                                    if (context.dataset.yAxisID === 'y1') {
                                        return ` ${context.dataset.label}: +${val}% delay`;
                                    }
                                    return ` ${context.dataset.label}: ${Number(val).toLocaleString()} trips`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            position: 'left',
                            title: { display: true, text: 'Daily Trips (Booking Demand)' },
                            ticks: {
                                callback: val => `${Number(val).toLocaleString()} trips`
                            }
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            title: { display: true, text: 'Traffic Delay %' },
                            ticks: {
                                callback: val => `+${val}%`
                            }
                        }
                    }
                }
            });

            // Update projected 7-day summary metrics if elements exist
            const projectedTripsSum = forecast.reduce((acc, f) => acc + f.projectedTrips, 0);
            const projEl = document.getElementById('dash-7day-projected-revenue');
            if (projEl) {
                projEl.innerText = `${projectedTripsSum.toLocaleString()} trips`;
            }
        }

        // 2. Hourly Demand & Surge Chart - Synchronized with current clock & peak rush hours
        const demandCtx = document.getElementById('chart-hourly-demand')?.getContext('2d');
        if (demandCtx) {
            if (this.demandChart) {
                try { this.demandChart.destroy(); } catch(e) {}
                this.demandChart = null;
            }

            const hoursDef = [
                { h: 6, label: '6 AM' },
                { h: 8, label: '8 AM (Peak)' },
                { h: 10, label: '10 AM' },
                { h: 12, label: '12 PM (Lunch)' },
                { h: 14, label: '2 PM' },
                { h: 16, label: '4 PM' },
                { h: 18, label: '6 PM (Peak)' },
                { h: 20, label: '8 PM (Rush)' },
                { h: 22, label: '10 PM' }
            ];

            const baseDemand = [45, 185, 95, 130, 80, 115, 215, 155, 70];
            const bgColors = hoursDef.map(slot => {
                // Highlight the active current hour segment with amber/gold
                if (Math.abs(slot.h - currentHour) <= 1) {
                    return '#f59e0b'; // Live hour active highlight
                }
                return '#b91c1c'; // Standard brand color
            });

            this.demandChart = new Chart(demandCtx, {
                type: 'bar',
                data: {
                    labels: hoursDef.map(s => {
                        return (Math.abs(s.h - currentHour) <= 1) ? `● ${s.label} [NOW]` : s.label;
                    }),
                    datasets: [{
                        label: 'Trips Requested / Forecast',
                        data: baseDemand,
                        backgroundColor: bgColors,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => ` Demand Volume: ${ctx.parsed.y} bookings/hr`
                            }
                        }
                    }
                }
            });
        }
    },

    renderDemandForecastTable() {
        const tbody = document.getElementById('demand-forecast-tbody');
        if (!tbody) return;

        const zones = AIEngines.DemandPrediction.getForecast();
        tbody.innerHTML = zones.map(z => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="px-4 py-3 font-semibold text-slate-800 text-xs">${z.zoneName}</td>
                <td class="px-4 py-3 text-xs font-mono font-bold text-blue-600">${z.predictedTripsPerHour} req/hr</td>
                <td class="px-4 py-3 text-xs font-semibold text-slate-700">${z.recommendedDriverCount} drivers</td>
                <td class="px-4 py-3 text-xs">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold ${z.surgeMultiplier > 1.2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                        ${z.surgeLevel} (${z.surgeMultiplier}x)
                    </span>
                </td>
            </tr>
        `).join('');
    }
};
