/**
 * Module 5: Transport Analytics & KPI Dashboard
 * Chart.js powered executive charts with AI Predictive Forecasting
 */
const AnalyticsModule = {
    revenueChart: null,
    demandChart: null,
    fleetFilter: 'all',
    dispatchFilter: 'all',
    forecastDays: [],
    selectedDayIndex: 7, // Default to Tomorrow (Next Day Forecast)

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

    // Baseline recent dispatches covering all 9 fleet drivers across diverse passenger/user accounts
    defaultRecentDispatches: [
        {
            id: "bk-101",
            booking_code: "TNVS-2026-0091",
            driver_id: "drv-101",
            driver_name: "Ricardo Dalisay",
            vehicle_model: "Toyota Vios 1.5G (Silver)",
            vehicle_plate: "NFD-8892",
            vehicle_class: "Sedan (4-Seater)",
            vehicle_type: "car",
            passenger_name: "Juan Dela Cruz",
            user_email: "juan.delacruz@example.com",
            service_type: "transport",
            pickup: "Ayala Malls Circuit, Makati",
            dropoff: "BGC High Street, Taguig",
            total_fare: 237.60,
            surge_multiplier: 1.35,
            status: "Completed",
            time_label: "2 mins ago"
        },
        {
            id: "bk-104",
            booking_code: "MOTO-2026-0114",
            driver_id: "drv-104",
            driver_name: "Danilo Cruz",
            vehicle_model: "Yamaha NMAX 155 (Midnight Blue)",
            vehicle_plate: "MTR-9821",
            vehicle_class: "Scooter (155cc)",
            vehicle_type: "scooter",
            passenger_name: "Kevin Lim",
            user_email: "kevin.lim@gmail.com",
            service_type: "transport",
            pickup: "Greenbelt 5, Makati CBD",
            dropoff: "Uptown Mall BGC, Taguig",
            total_fare: 128.50,
            surge_multiplier: 1.30,
            status: "In Transit",
            time_label: "4 mins ago"
        },
        {
            id: "bk-102",
            booking_code: "TNVS-2026-0092",
            driver_id: "drv-102",
            driver_name: "Elena Roces",
            vehicle_model: "Mitsubishi Xpander (White)",
            vehicle_plate: "NBL-3301",
            vehicle_class: "MPV (6-Seater)",
            vehicle_type: "car",
            passenger_name: "Maria Santos",
            user_email: "maria.santos@yahoo.com",
            service_type: "transport",
            pickup: "SM Megamall, Ortigas Center",
            dropoff: "SM Mall of Asia, Pasay",
            total_fare: 520.80,
            surge_multiplier: 1.25,
            status: "Completed",
            time_label: "7 mins ago"
        },
        {
            id: "bk-105",
            booking_code: "PRCL-2026-0041",
            driver_id: "drv-105",
            driver_name: "Jomar Reyes",
            vehicle_model: "Honda Click 125i (Pearl White)",
            vehicle_plate: "MC-4412",
            vehicle_class: "Scooter (125cc)",
            vehicle_type: "scooter",
            passenger_name: "Angela Reyes",
            user_email: "angela.reyes@outlook.com",
            service_type: "parcel",
            pickup: "PBCom Tower, Makati CBD",
            dropoff: "Greenhills Promenade, San Juan",
            total_fare: 185.00,
            surge_multiplier: 1.20,
            status: "In Transit",
            time_label: "11 mins ago"
        },
        {
            id: "bk-103",
            booking_code: "EXEC-2026-0095",
            driver_id: "drv-103",
            driver_name: "Arman Mendoza",
            vehicle_model: "Honda Civic RS (Black)",
            vehicle_plate: "NDS-4099",
            vehicle_class: "Executive (4-Seater)",
            vehicle_type: "car",
            passenger_name: "Paolo Villanueva",
            user_email: "paolo.villanueva@corp.ph",
            service_type: "transport",
            pickup: "NAIA Terminal 3 Arrival Bay",
            dropoff: "Shangri-La at the Fort, BGC",
            total_fare: 465.00,
            surge_multiplier: 1.25,
            status: "Completed",
            time_label: "15 mins ago"
        },
        {
            id: "bk-106",
            booking_code: "FOOD-2026-0063",
            driver_id: "drv-106",
            driver_name: "Arnel Bautista",
            vehicle_model: "Honda Wave 125i (Sport Red)",
            vehicle_plate: "MC-8109",
            vehicle_class: "Manual/Underbone (125cc)",
            vehicle_type: "manual",
            passenger_name: "Camille Tan",
            user_email: "camille.tan@gmail.com",
            service_type: "food",
            pickup: "mendokoro Ramenba, BGC",
            dropoff: "McKinley Hill Cyberpark, Taguig",
            total_fare: 112.00,
            surge_multiplier: 1.15,
            status: "Completed",
            time_label: "19 mins ago"
        },
        {
            id: "bk-107",
            booking_code: "MOTO-2026-0118",
            driver_id: "drv-107",
            driver_name: "Mark Dizon",
            vehicle_model: "Yamaha Aerox 155 (Racing Cyan)",
            vehicle_plate: "MC-2930",
            vehicle_class: "Scooter (155cc)",
            vehicle_type: "scooter",
            passenger_name: "Miguelito Ramos",
            user_email: "miguel.ramos@up.edu.ph",
            service_type: "transport",
            pickup: "SM North EDSA, Quezon City",
            dropoff: "Araneta City Cubao, QC",
            total_fare: 134.00,
            surge_multiplier: 1.20,
            status: "Completed",
            time_label: "24 mins ago"
        },
        {
            id: "bk-108",
            booking_code: "PRCL-2026-0048",
            driver_id: "drv-108",
            driver_name: "Roderick Tan",
            vehicle_model: "Yamaha Sniper 155 (Matte Black)",
            vehicle_plate: "MC-6754",
            vehicle_class: "Manual (155cc)",
            vehicle_type: "manual",
            passenger_name: "Patricia Gomez",
            user_email: "patricia.gomez@enterprise.ph",
            service_type: "parcel",
            pickup: "Robinsons Galleria, Ortigas",
            dropoff: "Eastwood City Cyberpark, QC",
            total_fare: 164.50,
            surge_multiplier: 1.22,
            status: "Completed",
            time_label: "29 mins ago"
        },
        {
            id: "bk-109",
            booking_code: "MART-2026-0032",
            driver_id: "drv-109",
            driver_name: "Carlo Mendoza",
            vehicle_model: "Honda ADV 160 (Matte Solar Red)",
            vehicle_plate: "MC-5128",
            vehicle_class: "Scooter (160cc)",
            vehicle_type: "scooter",
            passenger_name: "Rafael Chua",
            user_email: "rafael.chua@gmail.com",
            service_type: "mart",
            pickup: "Landers Superstore, Arcovia Pasig",
            dropoff: "Capitol Commons, Pasig City",
            total_fare: 148.00,
            surge_multiplier: 1.18,
            status: "Completed",
            time_label: "34 mins ago"
        }
    ],

    init() {
        this.renderKPIs();
        this.renderFleetInventory();
        this.renderCharts();
        this.renderDemandForecastTable();
        this.renderRecentDispatches();
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

    selectForecastDay(index) {
        if (!this.forecastDays || index < 0 || index >= this.forecastDays.length) return;
        this.selectedDayIndex = index;
        this.renderDaySelector();
        this.renderSelectedDayInspector();
        this.renderHourlyChartForSelectedDay();
        this.renderDemandForecastTable();

        // Update point highlight on the 7-day chart if rendered
        if (this.revenueChart && this.revenueChart.data && this.revenueChart.data.datasets) {
            const dsHist = this.revenueChart.data.datasets[0];
            const dsPred = this.revenueChart.data.datasets[1];
            if (dsHist) {
                dsHist.pointRadius = this.forecastDays.map((_, i) => i === this.selectedDayIndex ? 8 : 4);
                dsHist.pointBorderWidth = this.forecastDays.map((_, i) => i === this.selectedDayIndex ? 3 : 1.5);
            }
            if (dsPred) {
                dsPred.pointRadius = this.forecastDays.map((_, i) => i === this.selectedDayIndex ? 8 : 4);
                dsPred.pointBorderWidth = this.forecastDays.map((_, i) => i === this.selectedDayIndex ? 3 : 1.5);
            }
            this.revenueChart.update('none');
        }
    },

    renderDaySelector() {
        const container = document.getElementById('forecast-day-selector');
        if (!container || !this.forecastDays.length) return;

        container.innerHTML = this.forecastDays.map((dayObj, idx) => {
            const isSelected = idx === this.selectedDayIndex;
            const isToday = !!dayObj.isToday;
            const isTomorrow = !!dayObj.isTomorrow;
            const isPred = !dayObj.isHistorical;

            let baseClasses = "flex-shrink-0 px-3 py-1.5 rounded-xl border text-left transition cursor-pointer select-none ";
            if (isSelected) {
                baseClasses += isPred
                    ? "bg-orange-600 text-white border-orange-600 shadow-sm ring-2 ring-orange-200"
                    : "bg-hirna-800 text-white border-hirna-800 shadow-sm ring-2 ring-hirna-200";
            } else if (isTomorrow) {
                baseClasses += "bg-orange-50/90 hover:bg-orange-100 text-orange-900 border-orange-300";
            } else if (isToday) {
                baseClasses += "bg-hirna-50 hover:bg-hirna-100 text-hirna-900 border-hirna-300";
            } else if (isPred) {
                baseClasses += "bg-white hover:bg-amber-50/60 text-slate-700 border-slate-200";
            } else {
                baseClasses += "bg-slate-50/80 hover:bg-slate-100 text-slate-600 border-slate-200/80";
            }

            let tagHtml = '';
            if (isTomorrow) {
                tagHtml = `<span class="text-[9px] font-black uppercase tracking-wider ${isSelected ? 'text-orange-100' : 'text-orange-600'} block">Next Day</span>`;
            } else if (isToday) {
                tagHtml = `<span class="text-[9px] font-black uppercase tracking-wider ${isSelected ? 'text-hirna-100' : 'text-hirna-700'} block">Today (Live)</span>`;
            } else if (isPred) {
                tagHtml = `<span class="text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-orange-100' : 'text-amber-600'} block">Day +${dayObj.horizonDays}</span>`;
            } else {
                tagHtml = `<span class="text-[9px] font-semibold uppercase tracking-wider ${isSelected ? 'text-slate-200' : 'text-slate-400'} block">Past</span>`;
            }

            const dateNum = dayObj.date ? dayObj.date.getDate() : '';
            const shortDay = `${dayObj.dayName} ${dateNum}`;

            return `
                <button type="button" data-day-idx="${idx}" onclick="AnalyticsModule.selectForecastDay(${idx})" class="${baseClasses}">
                    ${tagHtml}
                    <div class="text-xs font-black leading-tight whitespace-nowrap">${shortDay}</div>
                    <div class="text-[10px] font-mono ${isSelected ? 'text-white/90' : 'text-slate-500'} whitespace-nowrap">${dayObj.trips} trips</div>
                </button>
            `;
        }).join('');
    },

    renderSelectedDayInspector() {
        if (!this.forecastDays.length) return;
        const dayObj = this.forecastDays[this.selectedDayIndex] || this.forecastDays[7] || this.forecastDays[0];
        if (!dayObj) return;

        const confEl = document.getElementById('selected-day-confidence');
        if (confEl) {
            confEl.innerText = dayObj.isHistorical
                ? (dayObj.isToday ? 'Live Telemetry Anchor (100%)' : 'Recorded Historical Day (100%)')
                : `${dayObj.confidencePct || 95}% Forecast Confidence`;
        }

        const badgeEl = document.getElementById('selected-day-badge');
        if (badgeEl) {
            if (dayObj.isTomorrow) {
                badgeEl.innerText = 'NEXT DAY FORECAST';
                badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-600 text-white';
            } else if (dayObj.isToday) {
                badgeEl.innerText = 'TODAY (LIVE)';
                badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-black uppercase bg-hirna-700 text-white';
            } else if (!dayObj.isHistorical) {
                badgeEl.innerText = `DAY +${dayObj.horizonDays} FORECAST`;
                badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-600 text-white';
            } else {
                badgeEl.innerText = 'HISTORICAL RECORD';
                badgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-600 text-white';
            }
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateStr = dayObj.date ? `${monthNames[dayObj.date.getMonth()]} ${dayObj.date.getDate()}, ${dayObj.date.getFullYear()}` : '';
        const titleEl = document.getElementById('selected-day-title');
        if (titleEl) {
            titleEl.innerText = `${dayObj.fullDayName || dayObj.dayName} • ${dateStr}`;
        }

        const driverEl = document.getElementById('selected-day-driver');
        if (driverEl) driverEl.innerText = dayObj.primaryDriver || 'Standard Fleet Demand';

        const tripsEl = document.getElementById('selected-day-trips');
        if (tripsEl) tripsEl.innerText = `${Number(dayObj.trips).toLocaleString()} trips`;

        const splitEl = document.getElementById('selected-day-split');
        if (splitEl) splitEl.innerText = `${dayObj.carTrips || 0} Cars • ${dayObj.motoTrips || 0} Motorcycles`;

        const revEl = document.getElementById('selected-day-revenue');
        if (revEl) revEl.innerText = `₱${Number(dayObj.revenue || 0).toLocaleString('en-US')}`;

        const rangeEl = document.getElementById('selected-day-range');
        if (rangeEl) {
            rangeEl.innerText = dayObj.isHistorical
                ? `Actual Recorded Volume`
                : `95% Band: ${dayObj.lowerBound}–${dayObj.upperBound} trips`;
        }

        const trafficEl = document.getElementById('selected-day-traffic');
        if (trafficEl) trafficEl.innerText = `+${dayObj.trafficDelayPct}% Delay`;

        const surgeEl = document.getElementById('selected-day-surge');
        if (surgeEl) surgeEl.innerText = `${Number(dayObj.surgeRatio || 1.2).toFixed(2)}x Expected Surge`;

        const weatherEl = document.getElementById('selected-day-weather');
        if (weatherEl) weatherEl.innerText = dayObj.weatherSummary || 'Clear & Fair';

        const peakEl = document.getElementById('selected-day-peak');
        if (peakEl) peakEl.innerText = dayObj.peakWindow || '7:30–9:30 AM & 5–8 PM';
    },

    renderHourlyChartForSelectedDay() {
        const demandCtx = document.getElementById('chart-hourly-demand')?.getContext('2d');
        if (!demandCtx || !this.forecastDays.length) return;

        const dayObj = this.forecastDays[this.selectedDayIndex] || this.forecastDays[7] || this.forecastDays[0];
        if (!dayObj) return;

        const currentHour = new Date().getHours();
        const hourlySlots = Array.isArray(dayObj.hourlyProfile) ? dayObj.hourlyProfile : [];

        // Update Hourly Chart header badges
        const badgeEl = document.getElementById('hourly-chart-day-badge');
        if (badgeEl) {
            badgeEl.innerText = dayObj.isTomorrow
                ? `Tomorrow (${dayObj.dayName})`
                : (dayObj.isToday ? `Today (${dayObj.dayName})` : dayObj.shortLabel);
            badgeEl.className = dayObj.isHistorical
                ? 'px-2 py-0.5 bg-hirna-100 text-hirna-800 border border-hirna-200 rounded-md text-[10px] font-bold'
                : 'px-2 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 rounded-md text-[10px] font-bold';
        }

        const subEl = document.getElementById('hourly-chart-subtitle');
        if (subEl) {
            subEl.innerText = `${dayObj.fullDayName} (${dayObj.trips} total trips): ${dayObj.carTrips} Car rides & ${dayObj.motoTrips} Motorcycle trips`;
        }

        const peakSumEl = document.getElementById('hourly-chart-peak-summary');
        if (peakSumEl) {
            peakSumEl.innerText = `Peak: ${dayObj.peakWindow || '7–9 AM & 5–8 PM'}`;
        }

        if (this.demandChart) {
            try { this.demandChart.destroy(); } catch (e) {}
            this.demandChart = null;
        }

        const labels = hourlySlots.map(s => {
            if (dayObj.isToday && Math.abs(s.h - currentHour) <= 1) {
                return `● ${s.label} [NOW]`;
            }
            return s.label;
        });

        const bgColors = hourlySlots.map(s => {
            if (dayObj.isToday && Math.abs(s.h - currentHour) <= 1) {
                return '#10b981'; // Live current hour emerald highlight
            }
            if (s.isPeak) {
                return '#f59e0b'; // Peak commute rush window highlight
            }
            return dayObj.isHistorical ? '#b91c1c' : '#ea580c';
        });

        this.demandChart = new Chart(demandCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `${dayObj.fullDayName} Hourly Demand`,
                    data: hourlySlots.map(s => s.total),
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
                            label: ctx => {
                                const slot = hourlySlots[ctx.dataIndex];
                                if (!slot) return ` Demand: ${ctx.parsed.y} trips/hr`;
                                return [
                                    ` Total Demand: ${slot.total} trips/hr`,
                                    ` • Car Owners: ${slot.car} trips`,
                                    ` • Motorcycle Owners: ${slot.moto} trips`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: val => `${val}`
                        }
                    }
                }
            }
        });
    },

    renderCharts() {
        const now = new Date();

        const forecastResult = AIEngines.RevenueForecast.generate7DayForecast(null, now);
        const historical = forecastResult.historical;
        const forecast = forecastResult.forecast;
        this.forecastDays = [...historical, ...forecast];

        if (this.selectedDayIndex == null || this.selectedDayIndex < 0 || this.selectedDayIndex >= this.forecastDays.length) {
            this.selectedDayIndex = historical.length; // Default to Tomorrow (index 7)
        }

        this.renderDaySelector();
        this.renderSelectedDayInspector();

        // Scroll selector so Today & Tomorrow are visible nicely on load
        setTimeout(() => {
            const container = document.getElementById('forecast-day-selector');
            const activeBtn = container?.querySelector(`[data-day-idx="${this.selectedDayIndex}"]`);
            if (container && activeBtn) {
                const scrollLeft = activeBtn.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (activeBtn.clientWidth / 2);
                container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
            }
        }, 50);

        // 1. 7-Day Demand & Traffic Forecast Chart - Synchronized with current date & next 7 days
        const revCtx = document.getElementById('chart-revenue-forecast')?.getContext('2d');
        if (revCtx) {
            if (this.revenueChart) {
                try { this.revenueChart.destroy(); } catch(e) {}
                this.revenueChart = null;
            }

            const allLabels = this.forecastDays.map(d => d.label);
            const histTrips = [...historical.map(h => h.trips), ...new Array(forecast.length).fill(null)];
            
            // Connect trips forecast seamlessly starting from today's historical anchor point
            const todayTripAnchor = historical[historical.length - 1].trips;
            const predTrips = [...new Array(historical.length - 1).fill(null), todayTripAnchor, ...forecast.map(f => f.projectedTrips)];

            // Traffic Delay Percentage Curve across all 14 days
            const allTraffic = this.forecastDays.map(d => d.trafficDelayPct);

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
                            pointRadius: this.forecastDays.map((_, i) => i === this.selectedDayIndex ? 8 : 4),
                            pointHoverRadius: 8,
                            pointBorderWidth: this.forecastDays.map((_, i) => i === this.selectedDayIndex ? 3 : 1.5),
                            yAxisID: 'y'
                        },
                        {
                            label: 'AI Predicted Demand (Holt-Winters Trips/Day)',
                            data: predTrips,
                            borderColor: '#ea580c',
                            borderDash: [6, 6],
                            backgroundColor: 'rgba(234, 88, 12, 0.12)',
                            fill: true,
                            tension: 0.35,
                            pointRadius: this.forecastDays.map((_, i) => i === this.selectedDayIndex ? 8 : 4),
                            pointHoverRadius: 8,
                            pointBorderWidth: this.forecastDays.map((_, i) => i === this.selectedDayIndex ? 3 : 1.5),
                            yAxisID: 'y'
                        },
                        {
                            label: 'Corridor Traffic Delay (% Slowdown)',
                            data: allTraffic,
                            borderColor: '#eab308',
                            borderDash: [3, 3],
                            backgroundColor: 'transparent',
                            fill: false,
                            tension: 0.35,
                            pointRadius: 3,
                            pointHoverRadius: 6,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    onClick: (evt, activeElements) => {
                        if (activeElements && activeElements.length > 0) {
                            const clickedIndex = activeElements[0].index;
                            this.selectForecastDay(clickedIndex);
                        }
                    },
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                afterBody: (items) => {
                                    if (!items || !items.length) return '';
                                    const idx = items[0].dataIndex;
                                    const dayObj = this.forecastDays[idx];
                                    if (!dayObj) return '';
                                    return [
                                        `Split: ${dayObj.carTrips} Cars • ${dayObj.motoTrips} Motorcycles`,
                                        `Est. Revenue: ₱${Number(dayObj.revenue).toLocaleString()} (${dayObj.surgeRatio}x surge)`,
                                        `Click point to inspect ${dayObj.fullDayName}'s hourly curve`
                                    ];
                                },
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

        // 2. Render Hourly Demand Curve & High-Demand Hotspots for the currently selected day
        this.renderHourlyChartForSelectedDay();
        this.renderDemandForecastTable();
    },

    renderDemandForecastTable() {
        const tbody = document.getElementById('demand-forecast-tbody');
        if (!tbody) return;

        const dayObj = (this.forecastDays && this.forecastDays.length)
            ? (this.forecastDays[this.selectedDayIndex] || this.forecastDays[7] || this.forecastDays[0])
            : null;

        const zones = AIEngines.DemandPrediction.getForecast({ dayObj });
        if (!zones || !zones.length) return;

        const syncBadge = document.getElementById('hotspots-sync-badge');
        if (syncBadge && dayObj) {
            const label = dayObj.isTomorrow
                ? `Synced: Tomorrow (${dayObj.dayName})`
                : (dayObj.isToday ? `Synced: Today (Live)` : `Synced: ${dayObj.shortLabel || dayObj.dayName}`);
            syncBadge.innerText = label;
            syncBadge.className = dayObj.isHistorical
                ? 'px-2 py-0.5 rounded-full text-[10px] font-black bg-hirna-50 text-hirna-800 border border-hirna-200'
                : 'px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-800 border border-orange-200';
        }

        const syncSub = document.getElementById('hotspots-sync-subtitle');
        if (syncSub && dayObj) {
            const peakLabel = zones[0]?.syncedPeakHourLabel || 'Peak Rush';
            syncSub.innerText = `${dayObj.fullDayName}: ${dayObj.trips} daily trips • Peak bar (${peakLabel}): ${zones[0]?.syncedPeakHourlyTotal || 0} req/hr • +${dayObj.trafficDelayPct}% corridor delay`;
        }

        const totalPeakReq = zones.reduce((s, z) => s + (Number(z.predictedTripsPerHour) || 0), 0);
        const totalDayTrips = zones.reduce((s, z) => s + (Number(z.dailyZoneTrips) || 0), 0);
        const avgDelay = Math.round(zones.reduce((s, z) => s + (Number(z.corridorDelayPct) || 0), 0) / zones.length);
        const avgSurge = (zones.reduce((s, z) => s + (parseFloat(z.surgeMultiplier) || 1.2), 0) / zones.length).toFixed(2);

        const totalSummaryEl = document.getElementById('hotspots-total-summary');
        if (totalSummaryEl) {
            totalSummaryEl.innerText = `Peak Sum: ${totalPeakReq} req/hr (= Hourly Peak Bar) • Day Sum: ${totalDayTrips} trips (= 7-Day Curve)`;
        }

        const surgeSummaryEl = document.getElementById('hotspots-surge-summary');
        if (surgeSummaryEl) {
            surgeSummaryEl.innerText = `Corridor Delay: +${avgDelay}% • Avg AI Surge: ${avgSurge}x`;
        }

        tbody.innerHTML = zones.map(z => {
            const mult = parseFloat(z.surgeMultiplier || 1.1);
            let badgeStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            if (mult >= 1.38) {
                badgeStyle = 'bg-rose-100 text-rose-800 border border-rose-200';
            } else if (mult >= 1.24) {
                badgeStyle = 'bg-amber-100 text-amber-800 border border-amber-200';
            } else if (mult >= 1.15) {
                badgeStyle = 'bg-blue-100 text-blue-800 border border-blue-200';
            }

            const liveTag = z.liveZoneBookings > 0
                ? `<span class="ml-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">+${z.liveZoneBookings} live</span>`
                : '';

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="py-2.5 pr-2">
                        <div class="font-bold text-slate-800 text-xs flex items-center flex-wrap">
                            <span>${z.zoneName}</span>
                            ${liveTag}
                        </div>
                        <div class="text-[10px] text-slate-500 font-medium">
                            ${z.corridor || 'Metro Corridor'} • <span class="text-amber-700 font-mono font-bold">+${z.corridorDelayPct}% delay</span>
                        </div>
                    </td>
                    <td class="py-2.5 px-2">
                        <div class="text-xs font-mono font-black text-blue-700">${z.predictedTripsPerHour} req/hr <span class="text-[10px] font-semibold text-slate-400">peak</span></div>
                        <div class="text-[10px] font-mono text-slate-600 font-semibold">${z.dailyZoneTrips} trips/day <span class="text-slate-400">(${z.carZoneTrips}C • ${z.motoZoneTrips}M)</span></div>
                    </td>
                    <td class="py-2.5 px-2">
                        <div class="text-xs font-bold text-slate-800">${z.recommendedDriverCount} units</div>
                        <div class="text-[10px] font-mono text-slate-500">${z.recommendedCars} Car • ${z.recommendedMotos} Moto</div>
                    </td>
                    <td class="py-2.5 pl-2 text-right">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black ${badgeStyle} inline-block whitespace-nowrap">
                            ${z.surgeLevel} (${z.surgeMultiplier}x)
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setDispatchFilter(filter) {
        this.dispatchFilter = filter || 'all';
        this.renderRecentDispatches();
    },

    getAllDriverDispatches() {
        const fleetOwners = this.getFleetOwners();
        const ownerById = new Map();
        const ownerByName = new Map();
        fleetOwners.forEach(d => {
            if (d.id) ownerById.set(String(d.id), d);
            if (d.name) ownerByName.set(String(d.name).toLowerCase(), d);
        });

        // Pull ALL non-archived bookings from all users in SupabaseBridge
        const rawBookings = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getData)
            ? (SupabaseBridge.getData('bookings') || []).filter(b => b && !b.is_archived)
            : [];

        const normalizedLive = rawBookings.map((b, idx) => {
            // Match with registered fleet driver
            let matchedDriver = null;
            if (b.driver_id && ownerById.has(String(b.driver_id))) {
                matchedDriver = ownerById.get(String(b.driver_id));
            } else if (b.driver_name && ownerByName.has(String(b.driver_name).toLowerCase())) {
                matchedDriver = ownerByName.get(String(b.driver_name).toLowerCase());
            } else {
                // Assign deterministically to a matching Car or Motorcycle fleet owner if not explicitly linked
                const vc = (b.vehicle_class || '').toLowerCase();
                const st = (b.service_type || '').toLowerCase();
                const isMoto = st === 'parcel' || st === 'food' || st === 'mart' || st === 'express' ||
                               vc.includes('scooter') || vc.includes('manual') || vc.includes('moto') || vc.includes('underbone');
                const pool = fleetOwners.filter(d => this.isMotorcycleOwner(d) === isMoto);
                matchedDriver = pool.length ? pool[idx % pool.length] : fleetOwners[idx % fleetOwners.length];
            }

            const driverName = b.driver_name || matchedDriver?.name || 'Ricardo Dalisay';
            const vehicleModel = b.vehicle_model || matchedDriver?.vehicle_model || 'Toyota Vios 1.5G';
            const vehiclePlate = b.vehicle_plate || matchedDriver?.vehicle_plate || 'NFD-8892';
            const vehicleClass = b.vehicle_class || matchedDriver?.vehicle_class || 'Sedan (4-Seater)';
            const vehicleType = b.vehicle_type || matchedDriver?.vehicle_type || 'car';
            const passengerName = b.passenger_name || b.sender_name || b.customer_name || b.user_name || 'Juan Dela Cruz';
            const userEmail = b.user_email || b.passenger_email || b.email || b.created_by || `${passengerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@hirna.ph`;

            return {
                id: b.id || b.booking_code || `live-${idx}`,
                booking_code: b.booking_code || b.id || `TNVS-2026-01${idx}`,
                driver_id: matchedDriver?.id || b.driver_id || 'drv-101',
                driver_name: driverName,
                vehicle_model: vehicleModel,
                vehicle_plate: vehiclePlate,
                vehicle_class: vehicleClass,
                vehicle_type: vehicleType,
                passenger_name: passengerName,
                user_email: userEmail,
                service_type: (b.service_type || 'transport').toLowerCase(),
                pickup: b.pickup || 'Makati CBD',
                dropoff: b.dropoff || 'BGC High Street',
                total_fare: parseFloat(b.total_fare || 185.00),
                surge_multiplier: parseFloat(b.surge_multiplier || 1.20),
                status: b.status || 'Dispatched',
                time_label: b.time_label || (b.created_at ? 'Just now' : 'Recent'),
                is_live_user_booking: true
            };
        });

        // Merge live user bookings across all users with baseline recent dispatches for all 9 drivers
        const seenCodes = new Set();
        const combined = [];

        normalizedLive.forEach(item => {
            const key = String(item.booking_code || item.id).toUpperCase();
            if (!seenCodes.has(key)) {
                seenCodes.add(key);
                combined.push(item);
            }
        });

        this.defaultRecentDispatches.forEach(item => {
            const key = String(item.booking_code || item.id).toUpperCase();
            if (!seenCodes.has(key)) {
                seenCodes.add(key);
                combined.push({ ...item });
            }
        });

        return combined;
    },

    renderRecentDispatches() {
        const container = document.getElementById('dashboard-recent-bookings');
        if (!container) return;

        const allDispatches = this.getAllDriverDispatches();
        const carDispatches = allDispatches.filter(d => !this.isMotorcycleOwner(d));
        const motoDispatches = allDispatches.filter(d => this.isMotorcycleOwner(d));

        const uniqueDrivers = new Set(allDispatches.map(d => d.driver_name)).size;
        const uniqueUsers = new Set(allDispatches.map(d => d.passenger_name)).size;

        const countBadge = document.getElementById('recent-dispatches-count-badge');
        if (countBadge) {
            countBadge.innerText = `${allDispatches.length} Trips • ${uniqueDrivers} Drivers • ${uniqueUsers} Users`;
        }

        const btnAll = document.getElementById('dispatch-filter-all');
        const btnCar = document.getElementById('dispatch-filter-car');
        const btnMoto = document.getElementById('dispatch-filter-moto');

        if (btnAll) btnAll.innerText = `All (${allDispatches.length})`;
        if (btnCar) btnCar.innerText = `Cars (${carDispatches.length})`;
        if (btnMoto) btnMoto.innerText = `Moto (${motoDispatches.length})`;

        const activeBtnClass = "px-2.5 py-1 bg-hirna-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer";
        const inactiveBtnClass = "px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition cursor-pointer";

        if (btnAll) btnAll.className = this.dispatchFilter === 'all' ? activeBtnClass : inactiveBtnClass;
        if (btnCar) btnCar.className = this.dispatchFilter === 'car' ? activeBtnClass : inactiveBtnClass;
        if (btnMoto) btnMoto.className = this.dispatchFilter === 'moto' ? activeBtnClass : inactiveBtnClass;

        let displayed = allDispatches;
        if (this.dispatchFilter === 'car') {
            displayed = carDispatches;
        } else if (this.dispatchFilter === 'moto') {
            displayed = motoDispatches;
        }

        const summaryEl = document.getElementById('recent-dispatches-summary');
        if (summaryEl) {
            summaryEl.innerText = `Showing ${displayed.length} recent trips across ${uniqueDrivers} fleet drivers & ${uniqueUsers} passenger accounts`;
        }

        container.innerHTML = displayed.map(d => {
            const isMoto = this.isMotorcycleOwner(d);
            const st = (d.service_type || 'transport').toLowerCase();

            let serviceBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 uppercase">Ride</span>';
            if (st === 'parcel' || st === 'express') {
                serviceBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 uppercase">Parcel</span>';
            } else if (st === 'food') {
                serviceBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-800 uppercase">Food</span>';
            } else if (st === 'mart') {
                serviceBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800 uppercase">Mart</span>';
            }

            const vehicleBadge = isMoto
                ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">Moto</span>'
                : '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">Car</span>';

            const statusStr = String(d.status || 'Completed');
            const isCompleted = statusStr.toLowerCase().includes('complete');
            const statusColor = isCompleted ? 'text-emerald-600' : 'text-blue-600';

            const fareFormatted = Number(d.total_fare || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const surgeFormatted = Number(d.surge_multiplier || 1.0).toFixed(2);

            return `
                <div class="p-3 bg-slate-50/90 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 transition flex items-start justify-between gap-3">
                    <div class="flex items-start space-x-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-lg ${isMoto ? 'bg-amber-100 text-amber-800' : 'bg-hirna-100 text-hirna-800'} flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                            ${isMoto ? 'M' : 'C'}
                        </div>
                        <div class="min-w-0 space-y-0.5">
                            <div class="flex items-center flex-wrap gap-1.5">
                                <span class="font-bold text-slate-900">${d.driver_name}</span>
                                ${vehicleBadge}
                                <span class="text-[10px] font-mono text-slate-500">${d.vehicle_model} • <strong class="text-slate-700">${d.vehicle_plate}</strong></span>
                            </div>
                            <div class="text-[11px] text-slate-700 font-medium truncate">
                                <span class="font-mono font-bold text-hirna-800">${d.booking_code}</span>
                                ${serviceBadge}
                                <span class="text-slate-400 mx-1">•</span>
                                <span>User: <strong class="text-slate-800">${d.passenger_name}</strong> <span class="text-[10px] text-slate-400">(${d.user_email})</span></span>
                            </div>
                            <div class="text-slate-500 text-[11px] truncate">
                                ${d.pickup} → <span class="text-slate-700 font-semibold">${d.dropoff}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right shrink-0 space-y-0.5">
                        <span class="font-mono font-black text-hirna-900 text-xs block">₱${fareFormatted}</span>
                        <span class="block text-[9px] font-mono text-amber-700 font-bold">${surgeFormatted}x surge</span>
                        <span class="block text-[10px] ${statusColor} font-bold">● ${statusStr}</span>
                        <a href="gps.html?trip=${encodeURIComponent(d.booking_code)}" class="inline-block text-[9px] font-bold text-hirna-700 hover:underline">${d.time_label || 'Track GPS →'}</a>
                    </div>
                </div>
            `;
        }).join('');
    }
};

