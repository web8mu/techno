@extends('emails.layout')

@section('title', 'Order Confirmation - ' . $order->order_number)

@section('content')
<h2 style="color:#1a1a2e; margin-top:0;">Thank you for your order!</h2>
<p>Hi {{ $order->customer_name }},</p>
<p>We have received your order and it is being processed. Your order details are below.</p>

<table class="table">
    <tr><td><strong>Order Number</strong></td><td>{{ $order->order_number }}</td></tr>
    <tr><td><strong>Order Date</strong></td><td>{{ $order->created_at->format('d M Y, H:i') }}</td></tr>
    <tr><td><strong>Payment Method</strong></td><td>{{ ucwords(str_replace('_', ' ', $order->payment_method)) }}</td></tr>
    <tr><td><strong>Delivery Method</strong></td><td>{{ ucwords($order->delivery_method) }}</td></tr>
</table>

<h3 style="color:#1a1a2e;">Order Items</h3>
<table class="table">
    <thead>
        <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    </thead>
    <tbody>
        @foreach($order->items as $item)
        <tr>
            <td>{{ $item->name_snapshot }}</td>
            <td>{{ $item->sku_snapshot }}</td>
            <td>{{ $item->qty }}</td>
            <td>Rs {{ number_format($item->unit_price, 2) }}</td>
            <td>Rs {{ number_format($item->line_total, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr><td colspan="4" style="text-align:right;"><strong>Subtotal</strong></td><td>Rs {{ number_format($order->subtotal, 2) }}</td></tr>
        @if($order->discount > 0)
        <tr><td colspan="4" style="text-align:right; color:#c00;"><strong>Discount</strong></td><td style="color:#c00;">- Rs {{ number_format($order->discount, 2) }}</td></tr>
        @endif
        <tr><td colspan="4" style="text-align:right;"><strong>Delivery Fee</strong></td><td>Rs {{ number_format($order->delivery_fee, 2) }}</td></tr>
        <tr><td colspan="4" style="text-align:right;"><strong>VAT ({{ \App\Models\Setting::get('vat_rate', 15) }}%)</strong></td><td>Rs {{ number_format($order->vat_amount, 2) }}</td></tr>
        <tr class="total-row" style="background:#f0f0f0;"><td colspan="4" style="text-align:right;"><strong>Total</strong></td><td><strong>Rs {{ number_format($order->total, 2) }}</strong></td></tr>
    </tfoot>
</table>

<h3 style="color:#1a1a2e;">Payment Instructions</h3>
@if($order->payment_method === 'juice_mcb')
<p>Please send <strong>Rs {{ number_format($order->total, 2) }}</strong> via Juice to merchant number <strong>{{ \App\Models\Setting::get('juice_merchant_number') }}</strong>.</p>
<p>Use your order number <strong>{{ $order->order_number }}</strong> as the payment reference.</p>
@elseif($order->payment_method === 'bank_transfer')
<p>Please transfer <strong>Rs {{ number_format($order->total, 2) }}</strong> to:</p>
<table class="table">
    <tr><td><strong>Bank</strong></td><td>{{ \App\Models\Setting::get('bank_name') }}</td></tr>
    <tr><td><strong>Account Name</strong></td><td>{{ \App\Models\Setting::get('bank_account_name') }}</td></tr>
    <tr><td><strong>Account Number</strong></td><td>{{ \App\Models\Setting::get('bank_account_number') }}</td></tr>
    <tr><td><strong>Reference</strong></td><td>{{ $order->order_number }}</td></tr>
</table>
@else
<p>Please pay <strong>Rs {{ number_format($order->total, 2) }}</strong> in cash upon {{ $order->delivery_method === 'pickup' ? 'pickup' : 'delivery' }}.</p>
@endif

<p>If you have any questions, please contact us at <a href="mailto:{{ \App\Models\Setting::get('business_email') }}">{{ \App\Models\Setting::get('business_email') }}</a>.</p>
@endsection
