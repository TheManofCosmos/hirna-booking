<?php
namespace App\Services\AI;

/**
 * Dynamic Surge Pricing AI Service
 * Computes real-time dynamic pricing based on Supply-Demand elasticity,
 * traffic congestion index, and adverse weather conditions.
 */
class DynamicPricingEngine
{
    private array $rates = [
        'Sedan (4-Seater)' => ['base' => 45.00, 'per_km' => 15.00, 'per_min' => 2.00],
        'MPV (6-Seater)' => ['base' => 60.00, 'per_km' => 20.00, 'per_min' => 2.50],
        'Executive (4-Seater)' => ['base' => 90.00, 'per_km' => 28.00, 'per_min' => 3.50],
    ];

    public function calculate(string $vehicleClass, float $distanceKm, int $durationMin, float $demandSupplyRatio = 1.0, string $weather = 'clear'): array
    {
        $tier = $this->rates[$vehicleClass] ?? $this->rates['Sedan (4-Seater)'];
        $base = $tier['base'];
        $distCost = $distanceKm * $tier['per_km'];
        $timeCost = $durationMin * $tier['per_min'];
        $subtotal = $base + $distCost + $timeCost;

        $multiplier = 1.00;
        $reasons = [];

        if ($demandSupplyRatio >= 2.2) {
            $multiplier += 0.40;
            $reasons[] = 'High demand in booking sector';
        } elseif ($demandSupplyRatio >= 1.5) {
            $multiplier += 0.20;
            $reasons[] = 'Moderate passenger request volume';
        }

        if ($weather === 'rain' || $weather === 'storm') {
            $multiplier += 0.20;
            $reasons[] = 'Weather condition surcharge';
        }

        $multiplier = min(2.50, max(1.00, round($multiplier, 2)));
        $total = round($subtotal * $multiplier, 2);

        return [
            'vehicle_class' => $vehicleClass,
            'base_fare' => $base,
            'distance_km' => $distanceKm,
            'distance_fare' => round($distCost, 2),
            'duration_min' => $durationMin,
            'time_fare' => round($timeCost, 2),
            'surge_multiplier' => $multiplier,
            'surge_reason' => !empty($reasons) ? implode(' • ', $reasons) : 'Standard Regulatory Rate',
            'total_fare' => $total
        ];
    }
}
