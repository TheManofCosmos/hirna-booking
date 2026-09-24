<?php
namespace App\Services\AI;

/**
 * Predictive Demand & Hotspot Forecast AI Service
 */
class DemandPredictionEngine
{
    private array $zones = [
        ['id' => 'z1', 'name' => 'Makati CBD / Ayala', 'lat' => 14.5547, 'lng' => 121.0244, 'base' => 180],
        ['id' => 'z2', 'name' => 'BGC / Taguig High Street', 'lat' => 14.5517, 'lng' => 121.0509, 'base' => 210],
        ['id' => 'z3', 'name' => 'Ortigas Center, Pasig', 'lat' => 14.5869, 'lng' => 121.0614, 'base' => 140],
        ['id' => 'z4', 'name' => 'Mall of Asia / Pasay', 'lat' => 14.5353, 'lng' => 120.9829, 'base' => 165],
        ['id' => 'z5', 'name' => 'Quezon City Circle', 'lat' => 14.6507, 'lng' => 121.0494, 'base' => 120],
    ];

    public function getHourlyForecast(int $hour): array
    {
        $timeFactor = 0.7;
        if (($hour >= 7 && $hour <= 9) || ($hour >= 17 && $hour <= 20)) {
            $timeFactor = 1.45;
        } elseif ($hour >= 11 && $hour <= 14) {
            $timeFactor = 1.05;
        }

        $results = [];
        foreach ($this->zones as $zone) {
            $predicted = (int) round($zone['base'] * $timeFactor);
            $results[] = [
                'zone_id' => $zone['id'],
                'zone_name' => $zone['name'],
                'coords' => [$zone['lat'], $zone['lng']],
                'predicted_demand_per_hour' => $predicted,
                'recommended_drivers' => (int) ceil($predicted * 0.65),
                'surge_alert' => $predicted > 180 ? 'High Surge Expected' : 'Normal',
            ];
        }
        return $results;
    }
}
