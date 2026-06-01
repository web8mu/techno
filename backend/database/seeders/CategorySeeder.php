<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Laptops',          'slug' => 'laptops'],
            ['name' => 'Desktops',         'slug' => 'desktops'],
            ['name' => 'Components',       'slug' => 'components'],
            ['name' => 'Gaming Hardware',  'slug' => 'gaming-hardware'],
            ['name' => 'Accessories',      'slug' => 'accessories'],
            ['name' => 'Gadgets',          'slug' => 'gadgets'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
