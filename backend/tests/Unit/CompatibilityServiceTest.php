<?php

namespace Tests\Unit;

use App\Models\ComponentAttribute;
use App\Models\Product;
use App\Services\CompatibilityService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CompatibilityServiceTest extends TestCase
{
    use RefreshDatabase;

    private CompatibilityService $svc;

    protected function setUp(): void
    {
        parent::setUp();
        $this->svc = new CompatibilityService();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function makeProduct(string $type, array $attrs = []): Product
    {
        $product = Product::factory()->create([
            'status' => 'active',
            'stock'  => 10,
            'price'  => 10000,
        ]);
        ComponentAttribute::create(array_merge(
            ['product_id' => $product->id, 'component_type' => $type],
            $attrs
        ));
        return $product->load('componentAttribute');
    }

    private function cpu(array $a = []): Product
    {
        // Default has_igpu=true so incidental Rule 9 doesn't fire in non-Rule-9 tests.
        return $this->makeProduct('cpu', array_merge([
            'socket' => 'AM5', 'memory_type' => 'DDR5',
            'tdp_watts' => 65, 'has_igpu' => true,
            'score_gaming' => 70, 'score_productivity' => 65,
        ], $a));
    }

    private function motherboard(array $a = []): Product
    {
        return $this->makeProduct('motherboard', array_merge([
            'socket' => 'AM5', 'memory_type' => 'DDR5',
            'form_factor' => 'ATX', 'memory_slots' => 4,
            'max_memory_gb' => 128, 'm2_slots' => 2, 'sata_ports' => 4,
        ], $a));
    }

    private function ram(array $a = []): Product
    {
        return $this->makeProduct('ram', array_merge([
            'memory_type' => 'DDR5', 'capacity_gb' => 32,
            'module_count' => 2, 'speed_mhz' => 5600,
        ], $a));
    }

    private function gpu(array $a = []): Product
    {
        return $this->makeProduct('gpu', array_merge([
            'length_mm' => 280, 'tdp_watts' => 200,
            'recommended_psu_watts' => 650,
            'score_1080p' => 85, 'score_1440p' => 75, 'score_4k' => 50,
        ], $a));
    }

    private function psu(array $a = []): Product
    {
        return $this->makeProduct('psu', array_merge([
            'wattage' => 750, 'efficiency' => '80+ Gold',
        ], $a));
    }

    private function cooler(array $a = []): Product
    {
        return $this->makeProduct('cooler', array_merge([
            'cooler_type' => 'air',
            'socket_support' => ['AM5', 'AM4', 'LGA1700'],
            'tdp_rating_watts' => 250,
            'height_mm' => 155,
            'radiator_mm' => null,
        ], $a));
    }

    private function pcCase(array $a = []): Product
    {
        return $this->makeProduct('case', array_merge([
            'form_factor_support' => ['ATX', 'mATX', 'ITX'],
            'max_gpu_length_mm' => 380,
            'max_cooler_height_mm' => 170,
            'radiator_support' => [120, 240, 360],
        ], $a));
    }

    private function storage(array $a = []): Product
    {
        return $this->makeProduct('storage', array_merge([
            'interface' => 'NVMe_M2', 'capacity_gb' => 1000,
        ], $a));
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    /** Rule 1: CPU socket must match Motherboard socket */
    public function test_rule1_socket_mismatch_is_error(): void
    {
        $components = [
            'cpu'         => $this->cpu(['socket' => 'AM5']),
            'motherboard' => $this->motherboard(['socket' => 'LGA1700']),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('socket', strtolower($result['errors'][0]));
    }

    public function test_rule1_socket_match_passes(): void
    {
        $components = [
            'cpu'         => $this->cpu(['socket' => 'AM5']),
            'motherboard' => $this->motherboard(['socket' => 'AM5']),
        ];
        $this->assertTrue($this->svc->check($components)['ok']);
    }

    /** Rule 2: RAM memory type must match Motherboard and CPU */
    public function test_rule2_ram_type_mismatch_motherboard_is_error(): void
    {
        $components = [
            'motherboard' => $this->motherboard(['memory_type' => 'DDR5']),
            'ram'         => $this->ram(['memory_type' => 'DDR4']),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('DDR4', $result['errors'][0]);
    }

    public function test_rule2_ram_type_mismatch_cpu_is_error(): void
    {
        $components = [
            'cpu' => $this->cpu(['memory_type' => 'DDR5']),
            'ram' => $this->ram(['memory_type' => 'DDR4']),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('not supported by this CPU', $result['errors'][0]);
    }

    /** Rule 3: Motherboard form factor must be in Case's supported list */
    public function test_rule3_form_factor_not_in_case_is_error(): void
    {
        $components = [
            'motherboard' => $this->motherboard(['form_factor' => 'ATX']),
            'case'        => $this->pcCase(['form_factor_support' => ['mATX', 'ITX']]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('form factor', strtolower($result['errors'][0]));
    }

    public function test_rule3_form_factor_match_passes(): void
    {
        $components = [
            'motherboard' => $this->motherboard(['form_factor' => 'ATX']),
            'case'        => $this->pcCase(['form_factor_support' => ['ATX', 'mATX']]),
        ];
        $this->assertTrue($this->svc->check($components)['ok']);
    }

    /** Rule 4: PSU wattage must cover estimated draw × 1.3 and GPU minimum */
    public function test_rule4_psu_underpowered_for_system_draw_is_error(): void
    {
        // CPU=125W + GPU=300W + 75W base = 500W × 1.3 = 650W required; PSU=550W
        $components = [
            'cpu' => $this->cpu(['tdp_watts' => 125]),
            'gpu' => $this->gpu(['tdp_watts' => 300, 'recommended_psu_watts' => 500]),
            'psu' => $this->psu(['wattage' => 550]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('underpowered', strtolower($result['errors'][0]));
    }

    public function test_rule4_psu_below_gpu_minimum_is_error(): void
    {
        // System draw 65+200+75=340 × 1.3 = 442W → PSU 650W covers it, but GPU min=850W
        $components = [
            'cpu' => $this->cpu(['tdp_watts' => 65]),
            'gpu' => $this->gpu(['tdp_watts' => 200, 'recommended_psu_watts' => 850]),
            'psu' => $this->psu(['wattage' => 650]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString("recommended minimum", $result['errors'][0]);
    }

    public function test_rule4_psu_adequate_passes(): void
    {
        // 65+200+75=340 × 1.3 = 442W; GPU min=650W; PSU=750W — all fine
        $components = [
            'cpu' => $this->cpu(['tdp_watts' => 65]),
            'gpu' => $this->gpu(['tdp_watts' => 200, 'recommended_psu_watts' => 650]),
            'psu' => $this->psu(['wattage' => 750]),
        ];
        $this->assertTrue($this->svc->check($components)['ok']);
    }

    /** Rule 5: GPU length must fit in Case */
    public function test_rule5_gpu_too_long_is_error(): void
    {
        $components = [
            'gpu'  => $this->gpu(['length_mm' => 340]),
            'case' => $this->pcCase(['max_gpu_length_mm' => 300]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('too long', strtolower($result['errors'][0]));
    }

    public function test_rule5_gpu_fits_passes(): void
    {
        $components = [
            'gpu'  => $this->gpu(['length_mm' => 280]),
            'case' => $this->pcCase(['max_gpu_length_mm' => 380]),
        ];
        $this->assertTrue($this->svc->check($components)['ok']);
    }

    /** Rule 6a: Cooler must support CPU socket */
    public function test_rule6a_cooler_socket_mismatch_is_error(): void
    {
        $components = [
            'cpu'    => $this->cpu(['socket' => 'AM5']),
            'cooler' => $this->cooler(['socket_support' => ['LGA1700', 'AM4']]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('AM5', $result['errors'][0]);
    }

    /** Rule 6b: Air cooler height must fit in case */
    public function test_rule6b_air_cooler_too_tall_is_error(): void
    {
        $components = [
            'cooler' => $this->cooler(['cooler_type' => 'air', 'height_mm' => 175]),
            'case'   => $this->pcCase(['max_cooler_height_mm' => 160]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('height', strtolower($result['errors'][0]));
    }

    /** Rule 6c: AIO radiator size must be supported by case */
    public function test_rule6c_aio_radiator_not_supported_is_error(): void
    {
        $components = [
            'cooler' => $this->cooler(['cooler_type' => 'aio', 'radiator_mm' => 360, 'height_mm' => null]),
            'case'   => $this->pcCase(['radiator_support' => [120, 240]]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('radiator', strtolower($result['errors'][0]));
    }

    /** Rule 6d: Cooler TDP below CPU TDP is a warning (not error) */
    public function test_rule6d_cooler_tdp_below_cpu_is_warning(): void
    {
        $components = [
            'cpu'    => $this->cpu(['tdp_watts' => 170, 'socket' => 'AM5']),
            'cooler' => $this->cooler(['tdp_rating_watts' => 120, 'socket_support' => ['AM5']]),
        ];
        $result = $this->svc->check($components);

        $this->assertTrue($result['ok']); // warning, not error
        $this->assertNotEmpty($result['warnings']);
        $this->assertStringContainsString('TDP', $result['warnings'][0]);
    }

    /** Rule 7: RAM module count must not exceed motherboard slots */
    public function test_rule7_ram_too_many_modules_is_error(): void
    {
        $components = [
            'motherboard' => $this->motherboard(['memory_slots' => 2]),
            'ram'         => $this->ram(['module_count' => 4]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('modules', $result['errors'][0]);
    }

    public function test_rule7_ram_capacity_exceeds_max_is_error(): void
    {
        $components = [
            'motherboard' => $this->motherboard(['max_memory_gb' => 32]),
            'ram'         => $this->ram(['capacity_gb' => 64, 'module_count' => 2]),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('capacity', strtolower($result['errors'][0]));
    }

    /** Rule 8: Storage interface must be available on motherboard */
    public function test_rule8_nvme_storage_no_m2_slot_is_error(): void
    {
        $components = [
            'motherboard' => $this->motherboard(['m2_slots' => 0]),
            'storage'     => $this->storage(['interface' => 'NVMe_M2']),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('M.2', $result['errors'][0]);
    }

    public function test_rule8_sata_storage_no_sata_ports_is_error(): void
    {
        $components = [
            'motherboard' => $this->motherboard(['sata_ports' => 0]),
            'storage'     => $this->storage(['interface' => 'SATA']),
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('SATA', $result['errors'][0]);
    }

    /** Rule 9: No display path — CPU without iGPU and no GPU */
    public function test_rule9_no_display_path_is_error(): void
    {
        $components = [
            'cpu' => $this->cpu(['has_igpu' => false]),
            // no gpu key at all
        ];
        $result = $this->svc->check($components);

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('graphics', strtolower($result['errors'][0]));
    }

    public function test_rule9_igpu_present_passes(): void
    {
        $components = [
            'cpu' => $this->cpu(['has_igpu' => true]),
        ];
        $this->assertTrue($this->svc->check($components)['ok']);
    }

    public function test_rule9_discrete_gpu_present_passes(): void
    {
        $components = [
            'cpu' => $this->cpu(['has_igpu' => false]),
            'gpu' => $this->gpu(),
        ];
        $this->assertTrue($this->svc->check($components)['ok']);
    }

    /** Rule 9 suppressed during candidate check (partial build) */
    public function test_rule9_suppressed_in_check_candidate(): void
    {
        $candidateCpu = $this->cpu(['has_igpu' => false]);
        // No GPU in current selection — should still be compatible as candidate
        $result = $this->svc->checkCandidate($candidateCpu, 'cpu', []);

        $this->assertTrue($result['compatible'],
            'CPU should be compatible as candidate even when no GPU is selected yet');
    }

    /** Full valid build produces no errors */
    public function test_valid_complete_build_has_no_errors(): void
    {
        $components = [
            'cpu'         => $this->cpu(['socket' => 'AM5', 'memory_type' => 'DDR5', 'tdp_watts' => 65, 'has_igpu' => false]),
            'motherboard' => $this->motherboard(['socket' => 'AM5', 'memory_type' => 'DDR5', 'form_factor' => 'ATX']),
            'ram'         => $this->ram(['memory_type' => 'DDR5', 'capacity_gb' => 32, 'module_count' => 2]),
            'gpu'         => $this->gpu(['length_mm' => 280, 'tdp_watts' => 200, 'recommended_psu_watts' => 650]),
            'storage'     => $this->storage(['interface' => 'NVMe_M2']),
            'psu'         => $this->psu(['wattage' => 750]),
            'cooler'      => $this->cooler(['cooler_type' => 'air', 'height_mm' => 155, 'socket_support' => ['AM5'], 'tdp_rating_watts' => 250]),
            'case'        => $this->pcCase(['form_factor_support' => ['ATX'], 'max_gpu_length_mm' => 380, 'max_cooler_height_mm' => 170, 'radiator_support' => [120, 240, 360]]),
        ];

        $result = $this->svc->check($components);

        $this->assertTrue($result['ok'], 'Valid build should have no errors. Errors: ' . implode('; ', $result['errors']));
        $this->assertEmpty($result['errors']);
    }
}
