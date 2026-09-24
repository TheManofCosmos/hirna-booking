<?php
namespace App\Services\AI;

/**
 * GPS Telemetry Anomaly & Safety Scoring AI Service
 */
class TelemetryAnomalyEngine
{
    private float $speedLimitKmh = 60.0;

    public function analyze(array $coordinates): array
    {
        $anomalies = [];
        $speeding = 0;
        $harshBraking = 0;

        for ($i = 0; $i < count($coordinates); $i++) {
            $pt = $coordinates[$i];
            if ($pt['speed'] > $this->speedLimitKmh) {
                $speeding++;
                $anomalies[] = [
                    'type' => 'Speeding Infraction',
                    'recorded_speed' => $pt['speed'],
                    'speed_limit' => $this->speedLimitKmh,
                    'timestamp' => $pt['time'] ?? 'N/A'
                ];
            }

            if ($i > 0) {
                $prev = $coordinates[$i - 1];
                $drop = $prev['speed'] - $pt['speed'];
                if ($drop > 25.0) {
                    $harshBraking++;
                    $anomalies[] = [
                        'type' => 'Harsh Braking Event',
                        'speed_delta' => round($drop, 1),
                        'timestamp' => $pt['time'] ?? 'N/A'
                    ];
                }
            }
        }

        $score = max(50, min(100, 100 - ($speeding * 5) - ($harshBraking * 3)));

        return [
            'safety_score' => $score,
            'speeding_count' => $speeding,
            'harsh_braking_count' => $harshBraking,
            'anomalies' => $anomalies,
            'compliance_status' => $score >= 90 ? 'Compliant' : 'Warning'
        ];
    }
}
