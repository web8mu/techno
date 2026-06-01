@extends('emails.layout')

@section('title', 'Payment Verified - ' . $order->order_number)

@section('content')
<h2 style="color:#1a1a2e; margin-top:0;">Payment Verified!</h2>
<p>Hi {{ $order->customer_name }},</p>
<p>Great news! We have verified your payment of <strong>Rs {{ number_format($order->total, 2) }}</strong> for order <strong>#{{ $order->order_number }}</strong>.</p>
<p>Your order is now being processed and we will update you when it is ready.</p>
<table class="table">
    <tr><td><strong>Order Number</strong></td><td>{{ $order->order_number }}</td></tr>
    <tr><td><strong>Amount Paid</strong></td><td>Rs {{ number_format($order->total, 2) }}</td></tr>
    <tr><td><strong>Payment Status</strong></td><td><span class="badge badge-verified">Verified</span></td></tr>
    <tr><td><strong>Fulfillment Status</strong></td><td>{{ ucwords(str_replace('_', ' ', $order->fulfillment_status)) }}</td></tr>
</table>
<p>Thank you for shopping with Techno Tronics!</p>
@endsection
