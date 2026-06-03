<?php
namespace App\Services;

use App\Models\CompatibilityOverride;
use App\Models\Product;

class CompatibilityService
{
    const SLOTS = ['cpu','motherboard','ram','gpu','storage','psu','cooler','case'];

    /**
     * Check compatibility for a set of selected components.
     * @param array $components ['slot' => Product]
     * @return array ['errors' => [...], 'warnings' => [...], 'ok' => bool]
     */
    public function check(array $components): array
    {
        $errors = [];
        $warnings = [];

        $cpu  = $components['cpu'] ?? null;
        $mb   = $components['motherboard'] ?? null;
        $ram  = $components['ram'] ?? null;
        $gpu  = $components['gpu'] ?? null;
        $psu  = $components['psu'] ?? null;
        $cool = $components['cooler'] ?? null;
        $case = $components['case'] ?? null;
        $stor = $components['storage'] ?? null;

        $cpuA  = $cpu?->componentAttribute;
        $mbA   = $mb?->componentAttribute;
        $ramA  = $ram?->componentAttribute;
        $gpuA  = $gpu?->componentAttribute;
        $psuA  = $psu?->componentAttribute;
        $coolA = $cool?->componentAttribute;
        $caseA = $case?->componentAttribute;
        $storA = $stor?->componentAttribute;

        // Rule 1: CPU socket == Motherboard socket
        if ($cpu && $mb && $cpuA && $mbA) {
            if ($cpuA->socket !== $mbA->socket) {
                $errors[] = "CPU socket ({$cpuA->socket}) does not match motherboard socket ({$mbA->socket}).";
            }
        }

        // Rule 2: RAM memory_type == Motherboard and CPU supported
        if ($ram && $mb && $ramA && $mbA) {
            if ($ramA->memory_type !== $mbA->memory_type) {
                $errors[] = "RAM type ({$ramA->memory_type}) is not supported by this motherboard ({$mbA->memory_type}).";
            }
        }
        if ($ram && $cpu && $ramA && $cpuA) {
            if ($ramA->memory_type !== $cpuA->memory_type) {
                $errors[] = "RAM type ({$ramA->memory_type}) is not supported by this CPU ({$cpuA->memory_type}).";
            }
        }

        // Rule 3: Motherboard form_factor in Case form_factor_support
        if ($mb && $case && $mbA && $caseA) {
            $supported = $caseA->form_factor_support ?? [];
            if (!in_array($mbA->form_factor, $supported)) {
                $errors[] = "Motherboard form factor ({$mbA->form_factor}) is not supported by this case (" . implode(', ', $supported) . ").";
            }
        }

        // Rule 4: PSU wattage >= estimated system draw
        if ($psu && $psuA) {
            $estimatedDraw = 75; // base
            if ($cpuA) $estimatedDraw += $cpuA->tdp_watts ?? 0;
            if ($gpuA) $estimatedDraw += $gpuA->tdp_watts ?? 0;
            $required = (int) ceil($estimatedDraw * 1.3);
            if ($psuA->wattage < $required) {
                $errors[] = "PSU ({$psuA->wattage}W) is underpowered. Estimated system draw: {$estimatedDraw}W × 1.3 headroom = {$required}W required.";
            } elseif ($psuA->wattage < $required * 1.1) {
                $warnings[] = "PSU ({$psuA->wattage}W) is within 10% of the estimated requirement ({$required}W). Consider a higher wattage for headroom.";
            }
            // GPU recommended_psu_watts
            if ($gpu && $gpuA && $gpuA->recommended_psu_watts) {
                if ($psuA->wattage < $gpuA->recommended_psu_watts) {
                    $errors[] = "PSU ({$psuA->wattage}W) is below the GPU's recommended minimum ({$gpuA->recommended_psu_watts}W).";
                }
            }
        }

        // Rule 5: GPU length <= Case max_gpu_length_mm
        if ($gpu && $case && $gpuA && $caseA) {
            if ($gpuA->length_mm && $caseA->max_gpu_length_mm && $gpuA->length_mm > $caseA->max_gpu_length_mm) {
                $errors[] = "GPU ({$gpuA->length_mm}mm) is too long for this case (max {$caseA->max_gpu_length_mm}mm).";
            }
        }

        // Rule 6: Cooler checks
        if ($cool && $coolA) {
            // CPU socket in cooler socket_support
            if ($cpu && $cpuA) {
                $supported = $coolA->socket_support ?? [];
                if (!in_array($cpuA->socket, $supported)) {
                    $errors[] = "Cooler does not support CPU socket ({$cpuA->socket}). Supported: " . implode(', ', $supported) . ".";
                }
            }
            // TDP rating vs CPU TDP
            if ($cpu && $cpuA && $coolA->tdp_rating_watts && $cpuA->tdp_watts) {
                if ($coolA->tdp_rating_watts < $cpuA->tdp_watts) {
                    $warnings[] = "Cooler TDP rating ({$coolA->tdp_rating_watts}W) is below CPU TDP ({$cpuA->tdp_watts}W). May throttle under load.";
                }
            }
            // Case clearances
            if ($case && $caseA) {
                if ($coolA->cooler_type === 'air') {
                    if ($coolA->height_mm && $caseA->max_cooler_height_mm && $coolA->height_mm > $caseA->max_cooler_height_mm) {
                        $errors[] = "Air cooler height ({$coolA->height_mm}mm) exceeds case clearance ({$caseA->max_cooler_height_mm}mm).";
                    }
                } elseif ($coolA->cooler_type === 'aio') {
                    $supportedRads = $caseA->radiator_support ?? [];
                    if ($coolA->radiator_mm && !in_array($coolA->radiator_mm, $supportedRads)) {
                        $errors[] = "AIO radiator ({$coolA->radiator_mm}mm) is not supported by this case (" . implode(', ', $supportedRads) . ").";
                    }
                }
            }
        }

        // Rule 7: RAM slots/capacity
        if ($ram && $mb && $ramA && $mbA) {
            if ($ramA->module_count && $mbA->memory_slots && $ramA->module_count > $mbA->memory_slots) {
                $errors[] = "RAM kit has {$ramA->module_count} modules but motherboard only has {$mbA->memory_slots} slots.";
            }
            if ($ramA->capacity_gb && $mbA->max_memory_gb && $ramA->capacity_gb > $mbA->max_memory_gb) {
                $errors[] = "RAM capacity ({$ramA->capacity_gb}GB) exceeds motherboard maximum ({$mbA->max_memory_gb}GB).";
            }
        }

        // Rule 8: Storage interface
        if ($stor && $mb && $storA && $mbA) {
            if ($storA->interface === 'NVMe_M2' && (!$mbA->m2_slots || $mbA->m2_slots < 1)) {
                $errors[] = "Motherboard has no M.2 slots for NVMe storage.";
            }
            if ($storA->interface === 'SATA' && (!$mbA->sata_ports || $mbA->sata_ports < 1)) {
                $errors[] = "Motherboard has no SATA ports for this storage drive.";
            }
        }

        // Rule 9: No display path — only enforce when both CPU and GPU slots have been
        // explicitly decided (GPU slot present in $components, even if null means "intentionally skipped").
        // Suppressed during partial builds / candidate checks via $skipMissingComponentRules.
        if (!($this->skipMissingComponentRules ?? false)) {
            if ($cpu && $cpuA && !$cpuA->has_igpu && !$gpu) {
                $errors[] = "No graphics output: CPU has no integrated GPU and no discrete GPU is selected.";
            }
        }

        // Rule 10: Compatibility overrides
        $productIds = array_filter(array_map(fn($p) => $p?->id, $components));
        if (count($productIds) >= 2) {
            $overrides = CompatibilityOverride::whereIn('component_a_id', $productIds)
                ->whereIn('component_b_id', $productIds)
                ->get();
            foreach ($overrides as $override) {
                if ($override->effect === 'block') {
                    $errors[] = $override->message;
                } else {
                    $warnings[] = $override->message;
                }
            }
        }

        return [
            'ok' => count($errors) === 0,
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }

    /**
     * Check a single candidate component for compatibility with current selection.
     * Returns ['compatible' => bool, 'reason' => string|null]
     */
    public function checkCandidate(Product $candidate, string $slot, array $currentComponents): array
    {
        $testComponents = $currentComponents;
        $testComponents[$slot] = $candidate;
        // Suppress Rule 9 (no-display) during slot picking — build is partial.
        $this->skipMissingComponentRules = true;
        $result = $this->check($testComponents);
        $this->skipMissingComponentRules = false;
        return [
            'compatible' => $result['ok'],
            'reason' => $result['ok'] ? null : ($result['errors'][0] ?? null),
            'warnings' => $result['warnings'],
        ];
    }

    private bool $skipMissingComponentRules = false;
}
