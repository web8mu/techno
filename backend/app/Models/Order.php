<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    public const FULFILLMENT_STATUSES = [
        'pending', 'confirmed', 'processing',
        'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled',
    ];

    public const PAYMENT_STATUSES = [
        'pending', 'verified', 'failed',
    ];

    protected $fillable = [
        'order_number', 'user_id', 'customer_name', 'customer_email', 'customer_phone',
        'shipping_address', 'delivery_method', 'payment_method',
        'subtotal', 'delivery_fee', 'discount', 'total', 'vat_amount', 'net_amount',
        'fulfillment_status', 'payment_status', 'proof_of_payment_path',
        'notes', 'coupon_id',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }
}
