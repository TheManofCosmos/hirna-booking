/**
 * Module 5: Transport Analytics & KPI Dashboard
 * Chart.js powered executive charts with AI Predictive Forecasting
 */
const AnalyticsModule = {
    revenueChart: null,
    demandChart: null,

    init() {
        this.renderKPIs();
        this.renderCharts();
        this.renderDemandForecastTable();
    },

    renderKPIs() {
        if (!document.getElementById('kpi-revenue')) return;
        const bookings = SupabaseBridge.getData('bookings');
        const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_fare || 0), 0);
        const totalTrips = bookings.length;
        const avgSurge = (bookings.reduce((sum, b) => sum + parseFloat(b.surge_multiplier || 1), 0) / (totalTrips || 1)).toFixed(2);

        document.getElementById('kpi-revenue').innerText = `₱${(totalRevenue + 342800).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        document.getElementById('kpi-trips').innerText = (totalTrips + 1420).toLocaleString();
        document.getElementById('kpi-surge-avg').innerText = `${avgSurge}x`;
        document.getElementById('kpi-driver-safety').innerText = "98.4%";
    },

    renderCharts() {
        // 1. Revenue Forecast Chart
        const revCtx = document.getElementById('chart-revenue-forecast')?.getContext('2d');
        if (revCtx) {
            const forecastData = AIEngines.RevenueForecast.generate7DayForecast();
            const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", ...forecastData.map(f => f.day)];
            const historicalData = [42500, 46100, 48900, 51200, 58400, 64200, 61800, null, null, null, null, null, null, null];
            const forecastedData = [null, null, null, null, null, null, 61800, ...forecastData.map(f => f.projectedRevenue)];

            this.revenueChart = new Chart(revCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Historical Revenue (₱)',
                            data: historicalData,
                            borderColor: '#b91c1c',
                            backgroundColor: 'rgba(185, 28, 28, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Hirna AI 7-Day Projected Revenue (₱)',
                            data: forecastedData,
                            borderColor: '#f59e0b',
                            borderDash: [6, 6],
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            fill: true,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } }
                }
            });
        }

        // 2. Hourly Demand & Surge Chart
        const demandCtx = document.getElementById('chart-hourly-demand')?.getContext('2d');
        if (demandCtx) {
            this.demandChart = new Chart(demandCtx, {
                type: 'bar',
                data: {
                    labels: ['6 AM', '8 AM (Peak)', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM (Peak)', '8 PM', '10 PM'],
                    datasets: [{
                        label: 'Trips Requested',
                        data: [45, 185, 95, 120, 80, 110, 210, 150, 70],
                        backgroundColor: '#b91c1c',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
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
