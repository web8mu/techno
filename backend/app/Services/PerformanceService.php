<?php
namespace App\Services;

use App\Models\Product;

class PerformanceService
{
    const GPU_1080P_THRESHOLD = 55;
    const GPU_1440P_THRESHOLD = 60;
    const GPU_4K_THRESHOLD    = 60;
    const CPU_1080P_GATE      = 50;
    const CPU_1440P_GATE      = 60;
    const CPU_4K_GATE         = 70;
    const STREAMING_CPU_SCORE = 65;
    const STREAMING_MIN_RAM   = 16;
    const WORKSTATION_CPU_SCORE = 75;
    const WORKSTATION_MIN_RAM   = 32;

    /**
     * @param array $components ['slot' => Product]
     */
    public function summarize(array $components): array
    {
        $cpu  = $components['cpu'] ?? null;
        $gpu  = $components['gpu'] ?? null;
        $ram  = $components['ram'] ?? null;
        $stor = $components['storage'] ?? null;

        $cpuA = $cpu?->componentAttribute;
        $gpuA = $gpu?->componentAttribute;
        $ramA = $ram?->componentAttribute;
        $storA = $stor?->componentAttribute;

        $tiers = [];
        $overallScore = 0;
        $resolution = 'Entry Gaming';

        if ($gpuA && $cpuA) {
            if ($gpuA->score_4k >= self::GPU_4K_THRESHOLD && $cpuA->score_gaming >= self::CPU_4K_GATE) {
                $resolution = '4K Gaming';
                $overallScore = (int) (($gpuA->score_4k + $cpuA->score_gaming) / 2);
            } elseif ($gpuA->score_1440p >= self::GPU_1440P_THRESHOLD && $cpuA->score_gaming >= self::CPU_1440P_GATE) {
                $resolution = '1440p Gaming';
                $overallScore = (int) (($gpuA->score_1440p + $cpuA->score_gaming) / 2);
            } elseif ($gpuA->score_1080p >= self::GPU_1080P_THRESHOLD && $cpuA->score_gaming >= self::CPU_1080P_GATE) {
                $resolution = '1080p Gaming';
                $overallScore = (int) (($gpuA->score_1080p + $cpuA->score_gaming) / 2);
            } else {
                $overallScore = (int) (($gpuA->score_1080p + $cpuA->score_gaming) / 2);
            }
            $tiers[] = $resolution;
        } elseif ($cpuA?->has_igpu && $cpuA) {
            $tiers[] = 'Entry Gaming (iGPU)';
            $overallScore = $cpuA->score_gaming ?? 20;
        }

        $ramGb = $ramA?->capacity_gb ?? 0;

        // Streaming Ready
        if ($cpuA && $cpuA->score_productivity >= self::STREAMING_CPU_SCORE && $ramGb >= self::STREAMING_MIN_RAM) {
            $tiers[] = 'Streaming Ready';
        }

        // Workstation Ready
        $hasNvme = $storA && $storA->interface === 'NVMe_M2';
        if ($cpuA && $cpuA->score_productivity >= self::WORKSTATION_CPU_SCORE && $ramGb >= self::WORKSTATION_MIN_RAM && $hasNvme) {
            $tiers[] = 'Workstation Ready';
        }

        return [
            'resolution' => $resolution,
            'tiers' => $tiers,
            'overall_score' => min(100, $overallScore),
            'ram_gb' => $ramGb,
        ];
    }
}
