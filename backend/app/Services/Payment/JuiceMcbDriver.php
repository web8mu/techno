<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\Request;

class JuiceMcbDriver implements PaymentDriverInterface
{
    public function initiate(Order $order): array
    {
        return $this->getInstructions($order);
    }

    public function handleCallback(Request $request): Order
    {
        // Juice MCB uses manual verification; no callback endpoint
        throw new \RuntimeException('Juice MCB does not support automated callbacks.');
    }

    public function getInstructions(Order $order): array
    {
        return [
            'method' => 'juice_mcb',
            'merchant_number' => Setting::get('juice_merchant_number', ''),
            'instructions' => Setting::get('juice_instructions', ''),
            'amount' => $order->total,
            'reference' => $order->order_number,
        ];
    }
}
