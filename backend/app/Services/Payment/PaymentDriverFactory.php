<?php

namespace App\Services\Payment;

class PaymentDriverFactory
{
    public static function make(string $method): PaymentDriverInterface
    {
        return match ($method) {
            'juice_mcb' => new JuiceMcbDriver(),
            'bank_transfer' => new BankTransferDriver(),
            'cash' => new CashDriver(),
            default => throw new \InvalidArgumentException("Unsupported payment method: {$method}"),
        };
    }
}
