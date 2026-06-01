<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'order_id', 'invoice_number', 'issued_at', 'vat_breakdown',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'vat_breakdown' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
