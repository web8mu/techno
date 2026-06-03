<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompatibilityOverride extends Model
{
    protected $fillable = ['component_a_id', 'component_b_id', 'effect', 'message'];

    public function componentA(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'component_a_id');
    }

    public function componentB(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'component_b_id');
    }
}
