<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\Request;

class BankTransferDriver implements PaymentDriverInterface
{
    public function initiate(Order $order): array
    {
        return $this->getInstructions($order);
    }

    public function handleCallback(Request $request): Order
    {
        throw new \RuntimeException('Bank Transfer does not support automated callbacks.');
    }

    public function getInstructions(Order $order): array
    {
        return [
            'method' => 'bank_transfer',
            'bank_name' => Setting::get('bank_name', ''),
            'account_name' => Setting::get('bank_account_name', ''),
            'account_number' => Setting::get('bank_account_number', ''),
            'branch' => Setting::get('bank_branch', ''),
            'swift' => Setting::get('bank_swift', ''),
            'instructions' => Setting::get('bank_instructions', ''),
            'amount' => $order->total,
            'reference' => $order->order_number,
        ];
    }
}
