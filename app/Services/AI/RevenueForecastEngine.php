<?php
namespace App\Services\AI;

/**
 * Intelligent Revenue & Time-Series Forecaster AI Service
 */
class RevenueForecastEngine
{
    public function forecastNext7Days(array $historical = [42500, 46100, 48900, 51200, 58400, 64200, 61800]): array
    {
        $alpha = 0.35;
        $smoothed = $historical[0];
        foreach ($historical as $val) {
            $smoothed = ($alpha * $val) + ((1 - $alpha) * $smoothed);
        }

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $forecast = [];

        foreach ($days as $day) {
            $multiplier = ($day === 'Friday' || $day === 'Saturday' || $day === 'Sunday') ? 1.20 : 1.05;
            $est = round($smoothed * $multiplier, 2);
            $forecast[] = [
                'day' => $day,
                'projected_revenue' => $est,
                'lower_confidence' => round($est * 0.92, 2),
                'upper_confidence' => round($est * 1.08, 2),
                'expected_trips' => (int) round($est / 240)
            ];
        }

        return $forecast;
    }
}
