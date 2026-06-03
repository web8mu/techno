<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SavedBuild extends Model
{
    protected $fillable = [
        'user_id',
        'guest_token',
        'name',
        'components',
        'total_price',
        'performance_summary',
        'share_token',
    ];

    protected $casts = [
        'components'          => 'array',
        'performance_summary' => 'array',
        'total_price'         => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (SavedBuild $build) {
            if (empty($build->share_token)) {
                $build->share_token = Str::random(12);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
