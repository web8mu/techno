<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    public const DISTRICTS = [
        'Port Louis',
        'Pamplemousses',
        'Rivière du Rempart',
        'Flacq',
        'Grand Port',
        'Savanne',
        'Rivière Noire',
        'Plaines Wilhems',
        'Moka',
        'Black River',
    ];

    protected $fillable = [
        'user_id', 'recipient', 'phone', 'line1', 'line2',
        'town', 'district', 'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
