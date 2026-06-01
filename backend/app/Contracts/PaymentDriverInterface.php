<?php

namespace App\Contracts;

use App\Models\Order;
use Illuminate\Http\Request;

interface PaymentDriverInterface
{
    public function getInstructions(Order $order): array;

    public function handleCallback(Request $request): array;
}
