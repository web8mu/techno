<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\CompatibilityOverride;
use App\Models\ComponentAttribute;
use App\Models\Product;
use App\Models\RecommendedBuild;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GamingWorldSeeder extends Seeder
{
    // Existing category IDs
    const CAT_COMPONENTS    = 3; // Components
    const CAT_GAMING        = 4; // Gaming Hardware

    public function run(): void
    {
        $this->seedCpus();
        $this->seedMotherboards();
        $this->seedRam();
        $this->seedGpus();
        $this->seedStorage();
        $this->seedPsus();
        $this->seedCoolers();
        $this->seedCases();
        $this->seedRecommendedBuilds();
        $this->seedCompatibilityOverrides();
    }

    // -------------------------------------------------------------------------
    // CPUs
    // -------------------------------------------------------------------------
    private function seedCpus(): void
    {
        $amdBrand    = Brand::where('slug', 'amd')->value('id');
        $intelBrand  = Brand::where('slug', 'intel')->value('id');

        $cpus = [
            [
                'product' => ['name' => 'AMD Ryzen 5 7600', 'sku' => 'CPU-AMD-R5-7600', 'price' => 18500.00, 'brand_id' => $amdBrand],
                'attr'    => ['component_type' => 'cpu', 'socket' => 'AM5', 'tdp_watts' => 65, 'memory_type' => 'DDR5', 'has_igpu' => false, 'score_gaming' => 70, 'score_productivity' => 65, 'brand' => 'AMD'],
            ],
            [
                'product' => ['name' => 'AMD Ryzen 7 7700X', 'sku' => 'CPU-AMD-R7-7700X', 'price' => 28500.00, 'brand_id' => $amdBrand],
                'attr'    => ['component_type' => 'cpu', 'socket' => 'AM5', 'tdp_watts' => 105, 'memory_type' => 'DDR5', 'has_igpu' => false, 'score_gaming' => 82, 'score_productivity' => 78, 'brand' => 'AMD'],
            ],
            [
                'product' => ['name' => 'AMD Ryzen 9 7950X', 'sku' => 'CPU-AMD-R9-7950X', 'price' => 62000.00, 'brand_id' => $amdBrand],
                'attr'    => ['component_type' => 'cpu', 'socket' => 'AM5', 'tdp_watts' => 170, 'memory_type' => 'DDR5', 'has_igpu' => false, 'score_gaming' => 88, 'score_productivity' => 95, 'brand' => 'AMD'],
            ],
            [
                'product' => ['name' => 'Intel Core i5-13600K', 'sku' => 'CPU-INTEL-I5-13600K', 'price' => 21000.00, 'brand_id' => $intelBrand],
                'attr'    => ['component_type' => 'cpu', 'socket' => 'LGA1700', 'tdp_watts' => 125, 'memory_type' => 'DDR5', 'has_igpu' => false, 'score_gaming' => 78, 'score_productivity' => 72, 'brand' => 'Intel'],
            ],
            [
                'product' => ['name' => 'Intel Core i7-13700K', 'sku' => 'CPU-INTEL-I7-13700K', 'price' => 35000.00, 'brand_id' => $intelBrand],
                'attr'    => ['component_type' => 'cpu', 'socket' => 'LGA1700', 'tdp_watts' => 125, 'memory_type' => 'DDR5', 'has_igpu' => false, 'score_gaming' => 85, 'score_productivity' => 82, 'brand' => 'Intel'],
            ],
            [
                'product' => ['name' => 'Intel Core i9-13900K', 'sku' => 'CPU-INTEL-I9-13900K', 'price' => 52000.00, 'brand_id' => $intelBrand],
                'attr'    => ['component_type' => 'cpu', 'socket' => 'LGA1700', 'tdp_watts' => 125, 'memory_type' => 'DDR5', 'has_igpu' => false, 'score_gaming' => 90, 'score_productivity' => 92, 'brand' => 'Intel'],
            ],
        ];

        foreach ($cpus as $data) {
            $this->upsertComponent($data['product'], $data['attr']);
        }
    }

    // -------------------------------------------------------------------------
    // Motherboards
    // -------------------------------------------------------------------------
    private function seedMotherboards(): void
    {
        $asus      = Brand::where('slug', 'asus')->value('id');
        $msi       = Brand::where('slug', 'msi')->value('id');
        $gigabyte  = Brand::where('slug', 'gigabyte')->value('id');

        $boards = [
            [
                'product' => ['name' => 'ASUS ROG Strix X670E-F Gaming WiFi', 'sku' => 'MB-ASUS-X670E-ROG', 'price' => 55000.00, 'brand_id' => $asus],
                'attr'    => ['component_type' => 'motherboard', 'socket' => 'AM5', 'memory_type' => 'DDR5', 'chipset' => 'X670E', 'memory_slots' => 4, 'max_memory_gb' => 128, 'form_factor' => 'ATX', 'm2_slots' => 2, 'sata_ports' => 4, 'brand' => 'ASUS'],
            ],
            [
                'product' => ['name' => 'MSI MAG B650 TOMAHAWK WiFi', 'sku' => 'MB-MSI-B650-TOMAHAWK', 'price' => 28000.00, 'brand_id' => $msi],
                'attr'    => ['component_type' => 'motherboard', 'socket' => 'AM5', 'memory_type' => 'DDR5', 'chipset' => 'B650', 'memory_slots' => 4, 'max_memory_gb' => 128, 'form_factor' => 'ATX', 'm2_slots' => 2, 'sata_ports' => 4, 'brand' => 'MSI'],
            ],
            [
                'product' => ['name' => 'ASUS Prime Z790-P DDR5', 'sku' => 'MB-ASUS-Z790-P-DDR5', 'price' => 32000.00, 'brand_id' => $asus],
                'attr'    => ['component_type' => 'motherboard', 'socket' => 'LGA1700', 'memory_type' => 'DDR5', 'chipset' => 'Z790', 'memory_slots' => 4, 'max_memory_gb' => 128, 'form_factor' => 'ATX', 'm2_slots' => 3, 'sata_ports' => 4, 'brand' => 'ASUS'],
            ],
            [
                'product' => ['name' => 'Gigabyte B760M DS3H DDR4', 'sku' => 'MB-GIGABYTE-B760M-DS3H', 'price' => 12500.00, 'brand_id' => $gigabyte],
                'attr'    => ['component_type' => 'motherboard', 'socket' => 'LGA1700', 'memory_type' => 'DDR4', 'chipset' => 'B760', 'memory_slots' => 2, 'max_memory_gb' => 64, 'form_factor' => 'mATX', 'm2_slots' => 1, 'sata_ports' => 4, 'brand' => 'Gigabyte'],
            ],
        ];

        foreach ($boards as $data) {
            $this->upsertComponent($data['product'], $data['attr']);
        }
    }

    // -------------------------------------------------------------------------
    // RAM
    // -------------------------------------------------------------------------
    private function seedRam(): void
    {
        $corsair = Brand::where('slug', 'corsair')->value('id');
        // G.Skill — use a generic brand or create
        $gskillBrandId = $this->ensureBrand('G.Skill', 'gskill');

        $rams = [
            [
                'product' => ['name' => 'Corsair Vengeance DDR5-5600 32GB (2x16GB)', 'sku' => 'RAM-CORSAIR-DDR5-32GB', 'price' => 12000.00, 'brand_id' => $corsair],
                'attr'    => ['component_type' => 'ram', 'memory_type' => 'DDR5', 'capacity_gb' => 32, 'module_count' => 2, 'speed_mhz' => 5600, 'brand' => 'Corsair'],
            ],
            [
                'product' => ['name' => 'Corsair Vengeance DDR5-5600 16GB (2x8GB)', 'sku' => 'RAM-CORSAIR-DDR5-16GB', 'price' => 6500.00, 'brand_id' => $corsair],
                'attr'    => ['component_type' => 'ram', 'memory_type' => 'DDR5', 'capacity_gb' => 16, 'module_count' => 2, 'speed_mhz' => 5600, 'brand' => 'Corsair'],
            ],
            [
                'product' => ['name' => 'G.Skill Ripjaws V DDR4-3600 16GB (2x8GB)', 'sku' => 'RAM-GSKILL-DDR4-16GB', 'price' => 3500.00, 'brand_id' => $gskillBrandId],
                'attr'    => ['component_type' => 'ram', 'memory_type' => 'DDR4', 'capacity_gb' => 16, 'module_count' => 2, 'speed_mhz' => 3600, 'brand' => 'G.Skill'],
            ],
            [
                'product' => ['name' => 'G.Skill Ripjaws V DDR4-3200 32GB (2x16GB)', 'sku' => 'RAM-GSKILL-DDR4-32GB', 'price' => 6000.00, 'brand_id' => $gskillBrandId],
                'attr'    => ['component_type' => 'ram', 'memory_type' => 'DDR4', 'capacity_gb' => 32, 'module_count' => 2, 'speed_mhz' => 3200, 'brand' => 'G.Skill'],
            ],
        ];

        foreach ($rams as $data) {
            $this->upsertComponent($data['product'], $data['attr']);
        }
    }

    // -------------------------------------------------------------------------
    // GPUs
    // -------------------------------------------------------------------------
    private function seedGpus(): void
    {
        $nvidia = Brand::where('slug', 'nvidia')->value('id');
        $amd    = Brand::where('slug', 'amd')->value('id');

        $gpus = [
            [
                'product' => ['name' => 'NVIDIA GeForce RTX 4090 24GB', 'sku' => 'GPU-NVIDIA-RTX4090', 'price' => 195000.00, 'brand_id' => $nvidia],
                'attr'    => ['component_type' => 'gpu', 'length_mm' => 336, 'recommended_psu_watts' => 850, 'tdp_watts' => 450, 'score_1080p' => 99, 'score_1440p' => 99, 'score_4k' => 95, 'brand' => 'NVIDIA'],
            ],
            [
                'product' => ['name' => 'NVIDIA GeForce RTX 4070 Ti Super 16GB', 'sku' => 'GPU-NVIDIA-RTX4070TISUPER', 'price' => 88000.00, 'brand_id' => $nvidia],
                'attr'    => ['component_type' => 'gpu', 'length_mm' => 285, 'recommended_psu_watts' => 700, 'tdp_watts' => 285, 'score_1080p' => 92, 'score_1440p' => 90, 'score_4k' => 72, 'brand' => 'NVIDIA'],
            ],
            [
                'product' => ['name' => 'NVIDIA GeForce RTX 4060 Ti 8GB', 'sku' => 'GPU-NVIDIA-RTX4060TI', 'price' => 47000.00, 'brand_id' => $nvidia],
                'attr'    => ['component_type' => 'gpu', 'length_mm' => 242, 'recommended_psu_watts' => 550, 'tdp_watts' => 165, 'score_1080p' => 82, 'score_1440p' => 68, 'score_4k' => 40, 'brand' => 'NVIDIA'],
            ],
            [
                'product' => ['name' => 'AMD Radeon RX 7700 XT 12GB', 'sku' => 'GPU-AMD-RX7700XT', 'price' => 42000.00, 'brand_id' => $amd],
                'attr'    => ['component_type' => 'gpu', 'length_mm' => 267, 'recommended_psu_watts' => 600, 'tdp_watts' => 245, 'score_1080p' => 78, 'score_1440p' => 70, 'score_4k' => 48, 'brand' => 'AMD'],
            ],
            [
                'product' => ['name' => 'NVIDIA GeForce RTX 4060 8GB', 'sku' => 'GPU-NVIDIA-RTX4060', 'price' => 32000.00, 'brand_id' => $nvidia],
                'attr'    => ['component_type' => 'gpu', 'length_mm' => 240, 'recommended_psu_watts' => 550, 'tdp_watts' => 115, 'score_1080p' => 72, 'score_1440p' => 55, 'score_4k' => 30, 'brand' => 'NVIDIA'],
            ],
        ];

        foreach ($gpus as $data) {
            $this->upsertComponent($data['product'], $data['attr']);
        }
    }

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------
    private function seedStorage(): void
    {
        $samsung  = $this->ensureBrand('Samsung', 'samsung');
        $wd       = $this->ensureBrand('Western Digital', 'western-digital');
        $seagate  = $this->ensureBrand('Seagate', 'seagate');

        $drives = [
            [
                'product' => ['name' => 'Samsung 990 Pro 1TB NVMe SSD', 'sku' => 'SSD-SAMSUNG-990PRO-1TB', 'price' => 9500.00, 'brand_id' => $samsung],
                'attr'    => ['component_type' => 'storage', 'interface' => 'NVMe_M2', 'capacity_gb' => 1000, 'brand' => 'Samsung'],
            ],
            [
                'product' => ['name' => 'WD Black SN850X 2TB NVMe SSD', 'sku' => 'SSD-WD-SN850X-2TB', 'price' => 16500.00, 'brand_id' => $wd],
                'attr'    => ['component_type' => 'storage', 'interface' => 'NVMe_M2', 'capacity_gb' => 2000, 'brand' => 'Western Digital'],
            ],
            [
                'product' => ['name' => 'Seagate Barracuda 2TB SATA HDD', 'sku' => 'HDD-SEAGATE-BARRACUDA-2TB', 'price' => 3200.00, 'brand_id' => $seagate],
                'attr'    => ['component_type' => 'storage', 'interface' => 'SATA', 'capacity_gb' => 2000, 'brand' => 'Seagate'],
            ],
        ];

        foreach ($drives as $data) {
            $this->upsertComponent($data['product'], $data['attr']);
        }
    }

    // -------------------------------------------------------------------------
    // PSUs
    // -------------------------------------------------------------------------
    private function seedPsus(): void
    {
        $corsair = Brand::where('slug', 'corsair')->value('id');
        $seasonic = $this->ensureBrand('Seasonic', 'seasonic');
        $coolermaster = $this->ensureBrand('Cooler Master', 'cooler-master');

        $psus = [
            [
                'product' => ['name' => 'Corsair RM1000x 1000W 80+ Gold Modular', 'sku' => 'PSU-CORSAIR-RM1000X', 'price' => 18500.00, 'brand_id' => $corsair],
                'attr'    => ['component_type' => 'psu', 'wattage' => 1000, 'efficiency' => '80+ Gold', 'brand' => 'Corsair'],
            ],
            [
                'product' => ['name' => 'Seasonic Focus GX-750 750W 80+ Gold', 'sku' => 'PSU-SEASONIC-GX750', 'price' => 12000.00, 'brand_id' => $seasonic],
                'attr'    => ['component_type' => 'psu', 'wattage' => 750, 'efficiency' => '80+ Gold', 'brand' => 'Seasonic'],
            ],
            [
                'product' => ['name' => 'Cooler Master MWE 550W 80+ Bronze', 'sku' => 'PSU-CM-MWE550', 'price' => 5500.00, 'brand_id' => $coolermaster],
                'attr'    => ['component_type' => 'psu', 'wattage' => 550, 'efficiency' => '80+ Bronze', 'brand' => 'Cooler Master'],
            ],
        ];

        foreach ($psus as $data) {
            $this->upsertComponent($data['product'], $data['attr']);
        }
    }

    // -------------------------------------------------------------------------
    // Coolers
    // -------------------------------------------------------------------------
    private function seedCoolers(): void
    {
        $noctua     = $this->ensureBrand('Noctua', 'noctua');
        $bequiet    = $this->ensureBrand('be quiet!', 'be-quiet');
        $corsair    = Brand::where('slug', 'corsair')->value('id');

        $coolers = [
            [
                'product' => ['name' => 'Noctua NH-D15 Dual Tower Air Cooler', 'sku' => 'COOL-NOCTUA-NHD15', 'price' => 9500.00, 'brand_id' => $noctua],
                'attr'    => ['component_type' => 'cooler', 'cooler_type' => 'air', 'socket_support' => ['AM5', 'LGA1700', 'AM4'], 'tdp_rating_watts' => 250, 'height_mm' => 165, 'brand' => 'Noctua'],
            ],
            [
                'product' => ['name' => 'be quiet! Dark Rock Pro 4 Air Cooler', 'sku' => 'COOL-BEQUIET-DRP4', 'price' => 8000.00, 'brand_id' => $bequiet],
                'attr'    => ['component_type' => 'cooler', 'cooler_type' => 'air', 'socket_support' => ['AM5', 'LGA1700', 'AM4'], 'tdp_rating_watts' => 250, 'height_mm' => 162, 'brand' => 'be quiet!'],
            ],
            [
                'product' => ['name' => 'Corsair H150i Elite Capellix 360mm AIO', 'sku' => 'COOL-CORSAIR-H150I', 'price' => 16500.00, 'brand_id' => $corsair],
                'attr'    => ['component_type' => 'cooler', 'cooler_type' => 'aio', 'socket_support' => ['AM5', 'LGA1700', 'AM4'], 'tdp_rating_watts' => 350, 'radiator_mm' => 360, 'brand' => 'Corsair'],
            ],
        ];

        foreach ($coolers as $data) {
            $this->upsertComponent($data['product'], $data['attr']);
        }
    }

    // -------------------------------------------------------------------------
    // Cases
    // -------------------------------------------------------------------------
    private function seedCases(): void
    {
        $gamemax = Brand::where('slug', 'gamemax')->value('id');
        $fractal = $this->ensureBrand('Fractal Design', 'fractal-design');

        $cases = [
            [
                'product' => ['name' => 'GameMax Hype ATX Mid Tower', 'sku' => 'CASE-GAMEMAX-HYPE', 'price' => 7500.00, 'brand_id' => $gamemax],
                'attr'    => ['component_type' => 'case', 'form_factor_support' => ['ATX', 'mATX', 'ITX'], 'max_gpu_length_mm' => 380, 'max_cooler_height_mm' => 170, 'radiator_support' => [120, 240, 360], 'is_gamemax' => true, 'brand' => 'GameMax'],
            ],
            [
                'product' => ['name' => 'GameMax Falcon ATX Mid Tower', 'sku' => 'CASE-GAMEMAX-FALCON', 'price' => 6500.00, 'brand_id' => $gamemax],
                'attr'    => ['component_type' => 'case', 'form_factor_support' => ['ATX', 'mATX', 'ITX'], 'max_gpu_length_mm' => 370, 'max_cooler_height_mm' => 165, 'radiator_support' => [120, 240], 'is_gamemax' => true, 'brand' => 'GameMax'],
            ],
            [
                'product' => ['name' => 'GameMax Abyss mATX Mini Tower', 'sku' => 'CASE-GAMEMAX-ABYSS', 'price' => 5500.00, 'brand_id' => $gamemax],
                'attr'    => ['component_type' => 'case', 'form_factor_support' => ['mATX', 'ITX'], 'max_gpu_length_mm' => 340, 'max_cooler_height_mm' => 160, 'radiator_support' => [120, 240], 'is_gamemax' => true, 'brand' => 'GameMax'],
            ],
            [
                'product' => ['name' => 'Fractal Design Pop Air ATX Mid Tower', 'sku' => 'CASE-FRACTAL-POPAIR', 'price' => 9000.00, 'brand_id' => $fractal],
                'attr'    => ['component_type' => 'case', 'form_factor_support' => ['ATX', 'mATX', 'ITX'], 'max_gpu_length_mm' => 355, 'max_cooler_height_mm' => 170, 'radiator_support' => [120, 240], 'is_gamemax' => false, 'brand' => 'Fractal Design'],
            ],
        ];

        foreach ($cases as $data) {
            $this->upsertComponent($data['product'], $data['attr']);
        }
    }

    // -------------------------------------------------------------------------
    // Recommended Builds
    // -------------------------------------------------------------------------
    private function seedRecommendedBuilds(): void
    {
        $builds = [
            // Rs 120,000 — Entry level
            [
                'name' => 'Entry Starter Build',
                'budget_tier' => 120000,
                'components' => [
                    'cpu'         => 'CPU-AMD-R5-7600',
                    'motherboard' => 'MB-MSI-B650-TOMAHAWK',
                    'ram'         => 'RAM-CORSAIR-DDR5-16GB',
                    'gpu'         => 'GPU-NVIDIA-RTX4060',
                    'storage'     => 'SSD-SAMSUNG-990PRO-1TB',
                    'psu'         => 'PSU-CM-MWE550',
                    'cooler'      => 'COOL-BEQUIET-DRP4',
                    'case'        => 'CASE-GAMEMAX-FALCON',
                ],
            ],
            // Rs 150,000 — Mid-range 1080p
            [
                'name' => '1080p Gaming Build',
                'budget_tier' => 150000,
                'components' => [
                    'cpu'         => 'CPU-AMD-R5-7600',
                    'motherboard' => 'MB-MSI-B650-TOMAHAWK',
                    'ram'         => 'RAM-CORSAIR-DDR5-32GB',
                    'gpu'         => 'GPU-NVIDIA-RTX4060TI',
                    'storage'     => 'SSD-SAMSUNG-990PRO-1TB',
                    'psu'         => 'PSU-SEASONIC-GX750',
                    'cooler'      => 'COOL-NOCTUA-NHD15',
                    'case'        => 'CASE-GAMEMAX-HYPE',
                ],
            ],
            // Rs 155,000 — 1440p capable
            [
                'name' => '1440p Gaming Build',
                'budget_tier' => 155000,
                'components' => [
                    'cpu'         => 'CPU-AMD-R7-7700X',
                    'motherboard' => 'MB-MSI-B650-TOMAHAWK',
                    'ram'         => 'RAM-CORSAIR-DDR5-32GB',
                    'gpu'         => 'GPU-AMD-RX7700XT',
                    'storage'     => 'SSD-SAMSUNG-990PRO-1TB',
                    'psu'         => 'PSU-SEASONIC-GX750',
                    'cooler'      => 'COOL-NOCTUA-NHD15',
                    'case'        => 'CASE-GAMEMAX-HYPE',
                ],
            ],
            // Rs 225,000 — High-end 1440p/entry 4K
            [
                'name' => 'High-Performance Build',
                'budget_tier' => 225000,
                'components' => [
                    'cpu'         => 'CPU-INTEL-I7-13700K',
                    'motherboard' => 'MB-ASUS-Z790-P-DDR5',
                    'ram'         => 'RAM-CORSAIR-DDR5-32GB',
                    'gpu'         => 'GPU-NVIDIA-RTX4070TISUPER',
                    'storage'     => 'SSD-WD-SN850X-2TB',
                    'psu'         => 'PSU-SEASONIC-GX750',
                    'cooler'      => 'COOL-CORSAIR-H150I',
                    'case'        => 'CASE-GAMEMAX-HYPE',
                ],
            ],
            // Rs 360,000 — Enthusiast 4K
            [
                'name' => 'Enthusiast 4K Build',
                'budget_tier' => 360000,
                'components' => [
                    'cpu'         => 'CPU-INTEL-I9-13900K',
                    'motherboard' => 'MB-ASUS-Z790-P-DDR5',
                    'ram'         => 'RAM-CORSAIR-DDR5-32GB',
                    'gpu'         => 'GPU-NVIDIA-RTX4090',
                    'storage'     => 'SSD-WD-SN850X-2TB',
                    'psu'         => 'PSU-CORSAIR-RM1000X',
                    'cooler'      => 'COOL-CORSAIR-H150I',
                    'case'        => 'CASE-GAMEMAX-HYPE',
                ],
            ],
            // Rs 400,000 — Workstation/Streamer
            [
                'name' => 'Ultimate Creator Build',
                'budget_tier' => 400000,
                'components' => [
                    'cpu'         => 'CPU-AMD-R9-7950X',
                    'motherboard' => 'MB-ASUS-X670E-ROG',
                    'ram'         => 'RAM-CORSAIR-DDR5-32GB',
                    'gpu'         => 'GPU-NVIDIA-RTX4090',
                    'storage'     => 'SSD-WD-SN850X-2TB',
                    'psu'         => 'PSU-CORSAIR-RM1000X',
                    'cooler'      => 'COOL-CORSAIR-H150I',
                    'case'        => 'CASE-FRACTAL-POPAIR',
                ],
            ],
        ];

        foreach ($builds as $buildData) {
            $build = RecommendedBuild::updateOrCreate(
                ['name' => $buildData['name']],
                ['budget_tier' => $buildData['budget_tier'], 'is_active' => true]
            );

            $sync = [];
            foreach ($buildData['components'] as $slot => $sku) {
                $product = Product::where('sku', $sku)->first();
                if ($product) {
                    $sync[$product->id] = ['slot' => $slot];
                } else {
                    $this->command?->warn("Product not found for SKU: {$sku}");
                }
            }
            $build->products()->sync($sync);
        }
    }

    // -------------------------------------------------------------------------
    // Compatibility Overrides
    // -------------------------------------------------------------------------
    private function seedCompatibilityOverrides(): void
    {
        // Example 1: DDR4 RAM + DDR5 Motherboard block
        $ddr4Ram = Product::where('sku', 'RAM-GSKILL-DDR4-16GB')->first();
        $ddr5Mb  = Product::where('sku', 'MB-ASUS-X670E-ROG')->first();

        if ($ddr4Ram && $ddr5Mb) {
            CompatibilityOverride::updateOrCreate(
                ['component_a_id' => $ddr4Ram->id, 'component_b_id' => $ddr5Mb->id],
                ['effect' => 'block', 'message' => 'DDR4 RAM is not compatible with this DDR5-only motherboard.']
            );
        }

        // Example 2: Warn when using Ryzen 9 7950X with budget PSU
        $r9 = Product::where('sku', 'CPU-AMD-R9-7950X')->first();
        $psu550 = Product::where('sku', 'PSU-CM-MWE550')->first();

        if ($r9 && $psu550) {
            CompatibilityOverride::updateOrCreate(
                ['component_a_id' => $r9->id, 'component_b_id' => $psu550->id],
                ['effect' => 'warn', 'message' => 'The Ryzen 9 7950X has a 170W TDP. A 550W PSU may be insufficient under heavy multi-core load with a discrete GPU.']
            );
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    private function upsertComponent(array $productData, array $attrData): Product
    {
        $product = Product::updateOrCreate(
            ['sku' => $productData['sku']],
            array_merge([
                'slug'        => Str::slug($productData['name']),
                'category_id' => self::CAT_COMPONENTS,
                'status'      => 'active',
                'stock'       => 50,
                'sale_price'  => null,
                'description' => $productData['name'],
            ], $productData)
        );

        // Fix slug conflicts
        if (Product::where('slug', $product->slug)->where('id', '!=', $product->id)->exists()) {
            $product->update(['slug' => $product->slug . '-' . $product->id]);
        }

        ComponentAttribute::updateOrCreate(
            ['product_id' => $product->id],
            $attrData
        );

        return $product;
    }

    private function ensureBrand(string $name, string $slug): int
    {
        return Brand::firstOrCreate(
            ['slug' => $slug],
            ['name' => $name]
        )->id;
    }
}
