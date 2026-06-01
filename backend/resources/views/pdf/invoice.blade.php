<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 13px; color: #222; margin: 0; padding: 0; }
        .header { background-color: #1a1a2e; color: #fff; padding: 20px 30px; }
        .header h1 { margin: 0; font-size: 22px; }
        .header p { margin: 4px 0 0; color: #99bbdd; font-size: 12px; }
        .section { padding: 20px 30px; }
        .flex { display: table; width: 100%; }
        .col { display: table-cell; vertical-align: top; width: 50%; }
        h3 { color: #1a1a2e; border-bottom: 2px solid #0066cc; padding-bottom: 6px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        thead th { background-color: #1a1a2e; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }
        tbody td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
        .totals-table { width: 50%; margin-left: auto; }
        .totals-table td { padding: 6px 10px; font-size: 13px; }
        .total-row { background-color: #1a1a2e; color: #fff; font-weight: bold; }
        .vat-box { background-color: #f0f8ff; border: 1px solid #0066cc; padding: 14px 18px; margin-top: 20px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
        .badge-verified { background-color: #d1edff; color: #0066cc; }
        .badge-pending { background-color: #fff3cd; color: #856404; }
        .footer { text-align: center; font-size: 11px; color: #666; border-top: 1px solid #eee; padding: 14px 30px; }
    </style>
</head>
<body>

<div class="header">
    <h1>{{ $settings['business_name'] }}</h1>
    <p>{{ $settings['business_address'] }}</p>
    <p>Tel: {{ $settings['business_phone'] }} | Email: {{ $settings['business_email'] }}</p>
    <p>BRN: {{ $settings['business_brn'] }} | VAT Reg No: {{ $settings['vat_registration_number'] }}</p>
</div>

<div class="section">
    <div class="flex">
        <div class="col">
            <h3>Invoice Details</h3>
            <table>
                <tr><td><strong>Invoice Number</strong></td><td>{{ $invoice->invoice_number }}</td></tr>
                <tr><td><strong>Invoice Date</strong></td><td>{{ $invoice->issued_at->format('d M Y') }}</td></tr>
                <tr><td><strong>Order Number</strong></td><td>{{ $order->order_number }}</td></tr>
                <tr><td><strong>Payment Method</strong></td><td>{{ ucwords(str_replace('_', ' ', $order->payment_method)) }}</td></tr>
                <tr><td><strong>Payment Status</strong></td><td>
                    <span class="badge badge-{{ $order->payment_status === 'verified' ? 'verified' : 'pending' }}">
                        {{ ucfirst($order->payment_status) }}
                    </span>
                </td></tr>
            </table>
        </div>
        <div class="col" style="padding-left: 30px;">
            <h3>Bill To</h3>
            <p style="margin:0;"><strong>{{ $order->customer_name }}</strong></p>
            <p style="margin:4px 0;">{{ $order->customer_email }}</p>
            <p style="margin:4px 0;">{{ $order->customer_phone }}</p>
            @if(is_array($order->shipping_address) && isset($order->shipping_address['line1']))
            <p style="margin:4px 0;">
                {{ $order->shipping_address['line1'] }}
                @if(isset($order->shipping_address['line2'])) , {{ $order->shipping_address['line2'] }} @endif<br>
                {{ $order->shipping_address['town'] ?? '' }}, {{ $order->shipping_address['district'] ?? '' }}
            </p>
            @endif
        </div>
    </div>

    <h3 style="margin-top:20px;">Items</h3>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price (Rs)</th>
                <th>Line Total (Rs)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $i => $item)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $item->name_snapshot }}</td>
                <td>{{ $item->sku_snapshot }}</td>
                <td>{{ $item->qty }}</td>
                <td>{{ number_format($item->unit_price, 2) }}</td>
                <td>{{ number_format($item->line_total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals-table">
        <tr><td>Subtotal</td><td style="text-align:right;">Rs {{ number_format($order->subtotal, 2) }}</td></tr>
        @if($order->discount > 0)
        <tr><td style="color:#c00;">Discount</td><td style="text-align:right; color:#c00;">- Rs {{ number_format($order->discount, 2) }}</td></tr>
        @endif
        <tr><td>Delivery Fee</td><td style="text-align:right;">Rs {{ number_format($order->delivery_fee, 2) }}</td></tr>
        <tr class="total-row"><td><strong>Grand Total</strong></td><td style="text-align:right;"><strong>Rs {{ number_format($order->total, 2) }}</strong></td></tr>
    </table>

    <div class="vat-box">
        <h3 style="margin-top:0; border:none; padding:0;">VAT Breakdown (Mauritius VAT Act)</h3>
        <table style="margin:0;">
            <tr>
                <td><strong>Net Amount (Excl. VAT)</strong></td>
                <td>Rs {{ number_format($invoice->vat_breakdown['net_amount'] ?? $order->net_amount, 2) }}</td>
            </tr>
            <tr>
                <td><strong>VAT ({{ $invoice->vat_breakdown['rate'] ?? 15 }}%)</strong></td>
                <td>Rs {{ number_format($invoice->vat_breakdown['vat_amount'] ?? $order->vat_amount, 2) }}</td>
            </tr>
            <tr style="font-weight:bold;">
                <td><strong>Gross Amount (Incl. VAT)</strong></td>
                <td>Rs {{ number_format($invoice->vat_breakdown['gross_amount'] ?? $order->total, 2) }}</td>
            </tr>
        </table>
    </div>
</div>

<div class="footer">
    <p>Thank you for shopping with {{ $settings['business_name'] }}!</p>
    <p>This is a computer-generated invoice. No signature required.</p>
    <p>{{ $settings['business_name'] }} | BRN: {{ $settings['business_brn'] }} | VAT Reg: {{ $settings['vat_registration_number'] }}</p>
</div>

</body>
</html>
