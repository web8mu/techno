<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RecommendedBuild extends Model
{
    protected $fillable = ['name', 'budget_tier', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'recommended_build_components', 'build_id', 'product_id')
            ->withPivot('slot')
            ->withTimestamps();
    }
}
