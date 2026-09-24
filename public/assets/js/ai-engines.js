/**
 * ==============================================================================
 * TNVS TEAM 10: PREDICTIVE AI ENGINES (JavaScript & Client/Server Bridge)
 * Research Title: Design and Development of a Predictive AI-Driven Booking,
 * Dynamic Fare Collection, and Intelligent Transport Analytics System
 * ==============================================================================
 */

const AIEngines = {
    // --------------------------------------------------------------------------
    // 1. DYNAMIC SURGE PRICING AI ENGINE
    // --------------------------------------------------------------------------
    DynamicPricing: {
        rates: {
            // 1. Transport Verticals (Sorted Ascending by Price)
            "Motorcycle (1-Passenger)": { base: 35.00, perKm: 10.00, perMin: 1.50, category: "Transport" },
            "Sedan (4-Seater)": { base: 45.00, perKm: 15.00, perMin: 2.00, category: "Transport" },
            "MPV (6-Seater)": { base: 60.00, perKm: 20.00, perMin: 2.50, category: "Transport" },
            // 2. Parcel Verticals
            "Document Pouch (<1kg)": { base: 60.00, perKm: 10.00, perMin: 1.00, category: "Parcel" },
            "Medium Box (<10kg)": { base: 110.00, perKm: 14.00, perMin: 1.50, category: "Parcel" },
            "Cargo / Large Crate": { base: 220.00, perKm: 22.00, perMin: 2.00, category: "Parcel" },
            // 3. Food Verticals
            "Standard Food Delivery": { base: 49.00, perKm: 12.00, perMin: 1.00, category: "Food" },
            "Express Priority Food": { base: 79.00, perKm: 16.00, perMin: 1.50, category: "Food" },
            // 4. Mart Verticals
            "Mart Express Concierge": { base: 65.00, perKm: 14.00, perMin: 1.80, category: "Mart" },
            "Bulk Grocery Runner": { base: 150.00, perKm: 20.00, perMin: 2.20, category: "Mart" }
        },

        _weatherCache: {},
        currentWeather: 'clear',

        fetchLiveWeather(lat, lng) {
            if (!lat || !lng) return Promise.resolve(this.currentWeather || 'clear');
            const key = `${parseFloat(lat).toFixed(2)},${parseFloat(lng).toFixed(2)}`;
            const now = Date.now();
            if (this._weatherCache[key] && (now - this._weatherCache[key].time < 15 * 60 * 1000)) {
                return Promise.resolve(this._weatherCache[key].condition);
            }
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=precipitation,rain,showers,weather_code&timezone=Asia%2FManila`;
            return fetch(url)
                .then(r => r.json())
                .then(data => {
                    let cond = 'clear';
                    const cur = data.current || {};
                    const code = cur.weather_code || 0;
                    const precip = (cur.precipitation || 0) + (cur.rain || 0) + (cur.showers || 0);
                    if (code >= 95 || precip >= 5.0) {
                        cond = 'storm';
                    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || precip > 0.3) {
                        cond = 'rain';
                    }
                    this._weatherCache[key] = { condition: cond, time: now };
                    this.currentWeather = cond;
                    return cond;
                })
                .catch(() => this.currentWeather || 'clear');
        },

        calculateFare(vehicleClass, distanceKm, durationMin, options = {}) {
            const config = this.rates[vehicleClass] || this.rates["Motorcycle (1-Passenger)"] || this.rates["Sedan (4-Seater)"];
            const baseFare = config.base;
            const distanceFare = distanceKm * config.perKm;
            const timeFare = durationMin * config.perMin;
            const standardSubtotal = baseFare + distanceFare + timeFare;

            let multiplier = 1.0;
            let reasons = [];
            let trafficStatus = "Smooth Flow";
            let weatherStatus = "Clear Skies";
            let demandStatus = "Normal Base";

            // 1. REAL-TIME ROAD TRAFFIC / CONGESTION ANALYSIS
            const speedKmh = (distanceKm > 0 && durationMin > 0) ? (distanceKm / (durationMin / 60)) : 30;
            if (speedKmh < 15) {
                multiplier += 0.20;
                trafficStatus = `Heavy Delay (${Math.round(speedKmh)} km/h)`;
                reasons.push(`Traffic Congestion: Slow corridor flow (<15 km/h)`);
            } else if (speedKmh < 24) {
                multiplier += 0.10;
                trafficStatus = `Moderate (~${Math.round(speedKmh)} km/h)`;
                reasons.push(`Moderate Traffic Corridor (~${Math.round(speedKmh)} km/h)`);
            } else {
                trafficStatus = `Smooth (${Math.round(speedKmh)} km/h)`;
            }

            // 2. REAL-TIME WEATHER DETECTION
            const activeWeather = (typeof options === 'string') 
                ? options 
                : (options.weather || this.currentWeather || 'clear');
            if (activeWeather === 'storm') {
                multiplier += 0.30;
                weatherStatus = "Heavy Downpour / Storm";
                reasons.push("Severe Weather: Heavy precipitation & flood caution");
            } else if (activeWeather === 'rain') {
                multiplier += 0.15;
                weatherStatus = "Passing Showers / Rain";
                reasons.push("Adverse Weather: Rain detected along route");
            } else {
                weatherStatus = "Clear / Fair Weather";
            }

            // 3. REAL-TIME DEMAND & RUSH-HOUR SURGE (Based on Philippine local time)
            const now = new Date();
            const hour = now.getHours();
            const day = now.getDay();
            
            if (hour >= 7 && hour <= 9) {
                multiplier += 0.25;
                demandStatus = "Morning Peak (Rush)";
                reasons.push("Morning Commuter Peak Demand");
            } else if (hour >= 17 && hour <= 20) {
                multiplier += 0.30;
                demandStatus = "Evening Peak (Rush)";
                reasons.push("Evening Rush Hour Corridor Surge");
            } else if ((day === 5 || day === 6) && (hour >= 21 || hour <= 1)) {
                multiplier += 0.15;
                demandStatus = "Weekend Night Peak";
                reasons.push("Weekend Night Demand Surge");
            } else {
                demandStatus = "Normal Activity";
            }

            // Hotspot Proximity Check
            const pickupCoords = options.pickupCoords || (Array.isArray(options) ? options : null);
            if (pickupCoords && Array.isArray(pickupCoords) && pickupCoords.length === 2) {
                const [pLat, pLng] = pickupCoords;
                if (AIEngines.DemandPrediction && Array.isArray(AIEngines.DemandPrediction.zones)) {
                    for (const zone of AIEngines.DemandPrediction.zones) {
                        const d = (typeof BookingModule !== 'undefined' && BookingModule.calculateDistance) 
                            ? BookingModule.calculateDistance(pLat, pLng, zone.coords[0], zone.coords[1])
                            : 999;
                        if (d <= 2.5) {
                            multiplier += 0.10;
                            demandStatus = `Hotspot: ${zone.name}`;
                            reasons.push(`High Activity Hub: ${zone.name}`);
                            break;
                        }
                    }
                }
            }

            // Regulatory cap between 1.00x and 2.50x
            multiplier = Math.min(2.5, Math.max(1.0, parseFloat(multiplier.toFixed(2))));
            const totalFare = parseFloat((standardSubtotal * multiplier).toFixed(2));

            return {
                vehicleClass,
                distanceKm: parseFloat(distanceKm.toFixed(1)),
                durationMin: Math.round(durationMin),
                baseFare: parseFloat(baseFare.toFixed(2)),
                distanceFare: parseFloat(distanceFare.toFixed(2)),
                timeFare: parseFloat(timeFare.toFixed(2)),
                surgeMultiplier: multiplier,
                surgeReason: reasons.length > 0 ? reasons.join(" • ") : "Standard Rate (Optimal Road, Weather & Demand Conditions)",
                totalFare,
                telemetry: {
                    trafficStatus,
                    weatherStatus,
                    demandStatus,
                    effectiveSpeedKmh: Math.round(speedKmh)
                }
            };
        }
    },

    // --------------------------------------------------------------------------
    // 2. PREDICTIVE DEMAND & HOTSPOT FORECASTING ENGINE
    // --------------------------------------------------------------------------
    DemandPrediction: {
        zones: [
            { id: "z1", name: "Makati CBD / Ayala", coords: [14.5547, 121.0244], baseDemand: 180 },
            { id: "z2", name: "BGC / Taguig High Street", coords: [14.5517, 121.0509], baseDemand: 210 },
            { id: "z3", name: "Ortigas Center, Pasig", coords: [14.5869, 121.0614], baseDemand: 140 },
            { id: "z4", name: "Mall of Asia / Pasay", coords: [14.5353, 120.9829], baseDemand: 165 },
            { id: "z5", name: "Quezon City Circle", coords: [14.6507, 121.0494], baseDemand: 120 }
        ],

        getForecast(hourOfDay = new Date().getHours()) {
            return this.zones.map(zone => {
                // Peak morning (7-9 AM) and peak evening (5-8 PM) curve
                let timeFactor = 0.6;
                if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 20)) {
                    timeFactor = 1.45;
                } else if (hourOfDay >= 11 && hourOfDay <= 14) {
                    timeFactor = 1.0;
                }

                const predictedTrips = Math.round(zone.baseDemand * timeFactor * (0.9 + Math.random() * 0.2));
                const surgeIndex = predictedTrips > 180 ? 1.4 : (predictedTrips > 140 ? 1.2 : 1.0);

                return {
                    zoneId: zone.id,
                    zoneName: zone.name,
                    coordinates: zone.coords,
                    predictedTripsPerHour: predictedTrips,
                    recommendedDriverCount: Math.ceil(predictedTrips * 0.65),
                    surgeLevel: surgeIndex > 1.2 ? "High Demand" : (surgeIndex > 1.0 ? "Moderate" : "Normal"),
                    surgeMultiplier: surgeIndex
                };
            });
        }
    },

    // --------------------------------------------------------------------------
    // 3. GPS TELEMETRY & DRIVER SAFETY ANOMALY ENGINE
    // --------------------------------------------------------------------------
    TelemetryAnomaly: {
        analyzeTrajectory(points = []) {
            if (!points || points.length === 0) {
                return { safetyScore: 100, anomalies: [], status: "Compliant" };
            }

            let anomalies = [];
            let speedingCount = 0;
            let harshBrakingCount = 0;
            const SPEED_LIMIT = 60.0; // km/h city limit

            for (let i = 0; i < points.length; i++) {
                const pt = points[i];
                // Check speeding
                if (pt.speed > SPEED_LIMIT) {
                    speedingCount++;
                    anomalies.push({
                        type: "Speeding Violation",
                        speed: pt.speed,
                        limit: SPEED_LIMIT,
                        timestamp: pt.time,
                        location: [pt.lat, pt.lng],
                        severity: pt.speed > 80 ? "Critical" : "Warning"
                    });
                }

                // Check harsh deceleration
                if (i > 0) {
                    const prevPt = points[i - 1];
                    const speedDrop = prevPt.speed - pt.speed;
                    if (speedDrop > 25.0) {
                        harshBrakingCount++;
                        anomalies.push({
                            type: "Harsh Braking Event",
                            speedDelta: speedDrop,
                            timestamp: pt.time,
                            location: [pt.lat, pt.lng],
                            severity: "Warning"
                        });
                    }
                }
            }

            // Deduct points from 100
            let score = 100 - (speedingCount * 5) - (harshBrakingCount * 3);
            score = Math.max(50, Math.min(100, score));

            return {
                safetyScore: score,
                speedingViolations: speedingCount,
                harshBrakingEvents: harshBrakingCount,
                anomalies,
                complianceStatus: score >= 90 ? "Excellent / Compliant" : (score >= 75 ? "Satisfactory" : "Under Review")
            };
        }
    },

    // --------------------------------------------------------------------------
    // 4. INTELLIGENT REVENUE & FLEET TIME-SERIES FORECASTER
    // --------------------------------------------------------------------------
    RevenueForecast: {
        generate7DayForecast(past7DaysRevenue = [42500, 46100, 48900, 51200, 58400, 64200, 61800]) {
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const alpha = 0.4; // Exponential smoothing constant
            let smoothed = past7DaysRevenue[0];
            
            for (let i = 1; i < past7DaysRevenue.length; i++) {
                smoothed = alpha * past7DaysRevenue[i] + (1 - alpha) * smoothed;
            }

            const projectedNext7Days = days.map((day, idx) => {
                // Weekend bump factor
                const weekendMultiplier = (day === 'Fri' || day === 'Sat' || day === 'Sun') ? 1.22 : 1.05;
                const baseEstimate = smoothed * weekendMultiplier;
                const noise = (Math.random() - 0.5) * 2500;
                const forecastVal = Math.round(baseEstimate + noise);

                return {
                    day: `Next ${day}`,
                    projectedRevenue: forecastVal,
                    lowerBound: Math.round(forecastVal * 0.93),
                    upperBound: Math.round(forecastVal * 1.07),
                    estimatedTrips: Math.round(forecastVal / 240)
                };
            });

            return projectedNext7Days;
        }
    },

    // --------------------------------------------------------------------------
    // 5. NLP SENTIMENT & SUPPORT TICKET CLASSIFIER
    // --------------------------------------------------------------------------
    SentimentNLP: {
        lexicon: {
            positive: ["great", "smooth", "polite", "clean", "fast", "safe", "friendly", "comfortable", "good", "loved", "courteous", "punctual", "fair"],
            negative: ["rude", "late", "smelly", "dirty", "reckless", "overcharged", "slow", "bad", "terrible", "unsafe", "scam", "detour", "cancelled", "angry"],
            critical: ["accident", "assault", "harassed", "emergency", "danger", "illegal", "threatened", "drunk"]
        },

        analyzeFeedback(text = "") {
            if (!text || text.trim().length === 0) {
                return { sentiment: "Neutral", score: 0.0, category: "General", priority: "Low" };
            }

            const lower = text.toLowerCase();
            let posCount = 0;
            let negCount = 0;
            let critCount = 0;

            this.lexicon.positive.forEach(word => { if (lower.includes(word)) posCount++; });
            this.lexicon.negative.forEach(word => { if (lower.includes(word)) negCount++; });
            this.lexicon.critical.forEach(word => { if (lower.includes(word)) critCount++; });

            let sentiment = "Neutral";
            let score = 0.0;
            let priority = "Medium";

            if (critCount > 0) {
                sentiment = "Critical";
                score = -0.95;
                priority = "Urgent";
            } else if (negCount > posCount) {
                sentiment = "Negative";
                score = parseFloat((-0.3 - (negCount * 0.15)).toFixed(2));
                priority = "High";
            } else if (posCount > negCount) {
                sentiment = "Positive";
                score = parseFloat((0.4 + (posCount * 0.12)).toFixed(2));
                priority = "Low";
            }

            score = Math.max(-1.0, Math.min(1.0, score));

            // Category tagger
            let category = "General Customer Experience";
            if (lower.includes("price") || lower.includes("fare") || lower.includes("charge") || lower.includes("surge") || lower.includes("cash") || lower.includes("gcash")) {
                category = "Fare & Billing Dispute";
            } else if (lower.includes("drive") || lower.includes("attitude") || lower.includes("polite") || lower.includes("rude") || lower.includes("driver")) {
                category = "Driver Conduct";
            } else if (lower.includes("car") || lower.includes("smell") || lower.includes("clean") || lower.includes("ac") || lower.includes("aircon")) {
                category = "Vehicle Condition & Cleanliness";
            } else if (lower.includes("speed") || lower.includes("fast") || lower.includes("brake") || lower.includes("route") || lower.includes("safe")) {
                category = "Safety & Route Navigation";
            }

            return {
                sentiment,
                score,
                category,
                priority,
                summary: `NLP Analysis: Classified as ${sentiment} (${(score >= 0 ? '+' : '') + score}) under ${category}`
            };
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEngines;
}
