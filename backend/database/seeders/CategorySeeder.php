<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Laptops',         'slug' => 'laptops',         'meta_title' => 'Laptops - Techno Tronics',        'meta_description' => 'Browse our range of premium laptops.'],
            ['name' => 'Desktops',        'slug' => 'desktops',        'meta_title' => 'Desktop PCs - Techno Tronics',    'meta_description' => 'High-performance desktop computers.'],
            ['name' => 'Components',      'slug' => 'components',      'meta_title' => 'PC Components - Techno Tronics',  'meta_description' => 'CPUs, GPUs, RAM, SSDs and more.'],
            ['name' => 'Gaming Hardware', 'slug' => 'gaming-hardware', 'meta_title' => 'Gaming Hardware - Techno Tronics','meta_description' => 'Monitors, keyboards, mice, headsets.'],
            ['name' => 'Accessories',     'slug' => 'accessories',     'meta_title' => 'Accessories - Techno Tronics',    'meta_description' => 'Hubs, mouse pads, desk accessories.'],
            ['name' => 'Gadgets',         'slug' => 'gadgets',         'meta_title' => 'Gadgets - Techno Tronics',        'meta_description' => 'Smart gadgets and tech accessories.'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
