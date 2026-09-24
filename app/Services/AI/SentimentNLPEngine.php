<?php
namespace App\Services\AI;

/**
 * Natural Language Processing Sentiment & Ticket Classifier
 */
class SentimentNLPEngine
{
    private array $posWords = ['great', 'smooth', 'polite', 'clean', 'fast', 'safe', 'friendly', 'good', 'comfortable'];
    private array $negWords = ['rude', 'late', 'smelly', 'dirty', 'reckless', 'overcharged', 'slow', 'bad', 'unsafe', 'scam'];
    private array $critWords = ['accident', 'assault', 'harassed', 'emergency', 'danger', 'threatened'];

    public function classify(string $feedbackText): array
    {
        $lower = strtolower($feedbackText);
        $pos = 0; $neg = 0; $crit = 0;

        foreach ($this->posWords as $w) { if (str_contains($lower, $w)) $pos++; }
        foreach ($this->negWords as $w) { if (str_contains($lower, $w)) $neg++; }
        foreach ($this->critWords as $w) { if (str_contains($lower, $w)) $crit++; }

        $sentiment = 'Neutral';
        $score = 0.0;
        $priority = 'Medium';

        if ($crit > 0) {
            $sentiment = 'Critical';
            $score = -0.95;
            $priority = 'Urgent';
        } elseif ($neg > $pos) {
            $sentiment = 'Negative';
            $score = -0.50;
            $priority = 'High';
        } elseif ($pos > $neg) {
            $sentiment = 'Positive';
            $score = 0.85;
            $priority = 'Low';
        }

        $category = 'General Service';
        if (str_contains($lower, 'fare') || str_contains($lower, 'price') || str_contains($lower, 'charge')) {
            $category = 'Fare & Billing';
        } elseif (str_contains($lower, 'driver') || str_contains($lower, 'attitude')) {
            $category = 'Driver Conduct';
        } elseif (str_contains($lower, 'clean') || str_contains($lower, 'smell') || str_contains($lower, 'car')) {
            $category = 'Vehicle Cleanliness';
        } elseif (str_contains($lower, 'speed') || str_contains($lower, 'safety')) {
            $category = 'Safety & Navigation';
        }

        return [
            'sentiment' => $sentiment,
            'polarity_score' => $score,
            'category' => $category,
            'ticket_priority' => $priority
        ];
    }
}
