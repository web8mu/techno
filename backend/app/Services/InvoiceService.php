<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceService
{
    public function generateForOrder(Order $order): Invoice
    {
        $vatRate = (float) Setting::get('vat_rate', 15) / 100;

        $vatBreakdown = [
            'rate' => Setting::get('vat_rate', 15),
            'net_amount' => round($order->net_amount, 2),
            'vat_amount' => round($order->vat_amount, 2),
            'gross_amount' => round($order->total, 2),
        ];

        $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);

        return Invoice::updateOrCreate(
            ['order_id' => $order->id],
            [
                'invoice_number' => $invoiceNumber,
                'issued_at' => now(),
                'vat_breakdown' => $vatBreakdown,
            ]
        );
    }

    public function generatePdf(Order $order): string
    {
        $invoice = $order->invoice ?? $this->generateForOrder($order);

        $settings = [
            'business_name' => Setting::get('business_name', ''),
            'business_address' => Setting::get('business_address', ''),
            'business_phone' => Setting::get('business_phone', ''),
            'business_email' => Setting::get('business_email', ''),
            'business_brn' => Setting::get('business_brn', ''),
            'vat_registration_number' => Setting::get('vat_registration_number', ''),
        ];

        $pdf = Pdf::loadView('pdf.invoice', compact('order', 'invoice', 'settings'));

        return $pdf->output();
    }
}
