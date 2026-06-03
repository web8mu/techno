<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);
        $category = Category::first() ?? Category::create(['name' => 'Components', 'slug' => 'components']);
        $brand    = Brand::first()    ?? Brand::create(['name' => 'Generic', 'slug' => 'generic']);

        return [
            'name'        => $name,
            'slug'        => Str::slug($name) . '-' . $this->faker->unique()->randomNumber(4),
            'sku'         => strtoupper(Str::random(8)),
            'category_id' => $category->id,
            'brand_id'    => $brand->id,
            'description' => $this->faker->sentence(),
            'price'       => $this->faker->randomFloat(2, 5000, 50000),
            'sale_price'  => null,
            'stock'       => 10,
            'status'      => 'active',
            'is_featured' => false,
            'is_best_seller' => false,
        ];
    }
}
