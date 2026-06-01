<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Intel',    'slug' => 'intel'],
            ['name' => 'AMD',      'slug' => 'amd'],
            ['name' => 'NVIDIA',   'slug' => 'nvidia'],
            ['name' => 'MSI',      'slug' => 'msi'],
            ['name' => 'ASUS',     'slug' => 'asus'],
            ['name' => 'Gigabyte', 'slug' => 'gigabyte'],
            ['name' => 'Corsair',  'slug' => 'corsair'],
            ['name' => 'GameMax',  'slug' => 'gamemax'],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(['slug' => $brand['slug']], $brand);
        }
    }
}
