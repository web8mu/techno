@extends('emails.layout')

@section('title', 'New Order - ' . $order->order_number)

@section('content')
<h2 style="color:#1a1a2e; margin-top:0;">New Order Received!</h2>
<p>A new order has been placed on Techno Tronics.</p>
<table class="table">
    <tr><td><strong>Order Number</strong></td><td>{{ $order->order_number }}</td></tr>
    <tr><td><strong>Customer</strong></td><td>{{ $order->customer_name }} ({{ $order->customer_email }})</td></tr>
    <tr><td><strong>Phone</strong></td><td>{{ $order->customer_phone }}</td></tr>
    <tr><td><strong>Total</strong></td><td>Rs {{ number_format($order->total, 2) }}</td></tr>
    <tr><td><strong>Payment Method</strong></td><td>{{ ucwords(str_replace('_', ' ', $order->payment_method)) }}</td></tr>
    <tr><td><strong>Delivery Method</strong></td><td>{{ ucwords($order->delivery_method) }}</td></tr>
</table>
<h3>Items</h3>
<table class="table">
    <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
    <tbody>
        @foreach($order->items as $item)
        <tr>
            <td>{{ $item->name_snapshot }} ({{ $item->sku_snapshot }})</td>
            <td>{{ $item->qty }}</td>
            <td>Rs {{ number_format($item->unit_price, 2) }}</td>
            <td>Rs {{ number_format($item->line_total, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
<p><a href="{{ config('app.url') }}/admin" class="btn">View in Admin Panel</a></p>
@endsection
