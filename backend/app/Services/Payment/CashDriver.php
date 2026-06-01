<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Http\Request;

class CashDriver implements PaymentDriverInterface
{
    public function initiate(Order $order): array
    {
        return $this->getInstructions($order);
    }

    public function handleCallback(Request $request): Order
    {
        throw new \RuntimeException('Cash payment does not support callbacks.');
    }

    public function getInstructions(Order $order): array
    {
        return [
            'method' => 'cash',
            'instructions' => 'Please pay in cash upon pickup or delivery. Exact change is appreciated.',
            'amount' => $order->total,
            'reference' => $order->order_number,
        ];
    }
}
