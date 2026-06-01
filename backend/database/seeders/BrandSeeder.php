<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Intel',    'slug' => 'intel',    'description' => 'World leader in semiconductor technology.'],
            ['name' => 'AMD',      'slug' => 'amd',      'description' => 'Advanced Micro Devices — CPUs and GPUs.'],
            ['name' => 'NVIDIA',   'slug' => 'nvidia',   'description' => 'Leader in AI and graphics technology.'],
            ['name' => 'MSI',      'slug' => 'msi',      'description' => 'Premium gaming and creator hardware.'],
            ['name' => 'ASUS',     'slug' => 'asus',     'description' => 'Innovative technology for every need.'],
            ['name' => 'Gigabyte', 'slug' => 'gigabyte', 'description' => 'Quality motherboards, GPUs and peripherals.'],
            ['name' => 'Corsair',  'slug' => 'corsair',  'description' => 'Premium PC components and peripherals.'],
            ['name' => 'GameMax',  'slug' => 'gamemax',  'description' => 'Gaming chairs, cases and peripherals.'],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(['slug' => $brand['slug']], $brand);
        }
    }
}
