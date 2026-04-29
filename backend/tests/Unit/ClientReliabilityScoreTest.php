<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\ClientReliabilityScore;
use Illuminate\Support\Facades\Config;

class ClientReliabilityScoreTest extends TestCase
{
    public function test_calculate_score_reduces_with_penalties()
    {
        // Set deterministic penalties for the test
        Config::set('pfe.reliability_scoring', [
            'cancelled_penalty' => 5,
            'late_return_penalty' => 10,
            'payment_delay_penalty' => 15,
            'damage_penalty' => 20,
            'blocked_threshold' => 30,
            'high_risk_threshold' => 50,
            'medium_risk_threshold' => 80,
        ]);

        // Create a partial mock of the model to avoid DB save
        $scoreModel = $this->getMockBuilder(ClientReliabilityScore::class)
            ->onlyMethods(['save'])
            ->getMock();

        // Configure attributes to simulate bad behavior
        $scoreModel->cancelled_reservations = 2; // 2 * 5 = 10
        $scoreModel->late_returns = 1;          // 1 * 10 = 10
        $scoreModel->payment_delays = 0;        // 0 * 15 = 0
        $scoreModel->damage_incidents = 1;      // 1 * 20 = 20

        // Prevent actual saving
        $scoreModel->method('save')->willReturn(true);

        $calculated = $scoreModel->calculateScore();

        // Expected: 100 - (10 + 10 + 0 + 20) = 60
        $this->assertEquals(60, $calculated);

        // Risk level: 60 < 80 => 'medium'
        $this->assertEquals('medium', $scoreModel->risk_level);
        $this->assertFalse($scoreModel->isBlocked());
        $this->assertFalse($scoreModel->isHighRisk());
    }
}
