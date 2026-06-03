<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComponentAttribute extends Model
{
    protected $fillable = [
        'product_id',
        'component_type',
        'socket',
        'tdp_watts',
        'memory_type',
        'has_igpu',
        'score_gaming',
        'score_productivity',
        'chipset',
        'memory_slots',
        'max_memory_gb',
        'form_factor',
        'm2_slots',
        'sata_ports',
        'capacity_gb',
        'module_count',
        'speed_mhz',
        'length_mm',
        'recommended_psu_watts',
        'score_1080p',
        'score_1440p',
        'score_4k',
        'wattage',
        'efficiency',
        'cooler_type',
        'socket_support',
        'tdp_rating_watts',
        'height_mm',
        'radiator_mm',
        'form_factor_support',
        'max_gpu_length_mm',
        'max_cooler_height_mm',
        'radiator_support',
        'is_gamemax',
        'interface',
        'brand',
        'extra',
    ];

    protected $casts = [
        'has_igpu'             => 'boolean',
        'is_gamemax'           => 'boolean',
        'socket_support'       => 'array',
        'form_factor_support'  => 'array',
        'radiator_support'     => 'array',
        'extra'                => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
