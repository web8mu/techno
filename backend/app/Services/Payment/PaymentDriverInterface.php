<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Http\Request;

interface PaymentDriverInterface
{
    public function initiate(Order $order): array;

    public function handleCallback(Request $request): Order;

    public function getInstructions(Order $order): array;
}
