@extends('emails.layout')

@section('title', 'Order Update - ' . $order->order_number)

@section('content')
<h2 style="color:#1a1a2e; margin-top:0;">Order Status Update</h2>
<p>Hi {{ $order->customer_name }},</p>
<p>Your order <strong>#{{ $order->order_number }}</strong> status has been updated.</p>
<table class="table">
    <tr><td><strong>Order Number</strong></td><td>{{ $order->order_number }}</td></tr>
    <tr><td><strong>New Status</strong></td><td><strong>{{ ucwords(str_replace('_', ' ', $newStatus)) }}</strong></td></tr>
    <tr><td><strong>Updated At</strong></td><td>{{ now()->format('d M Y, H:i') }}</td></tr>
</table>
@if($newStatus === 'out_for_delivery')
<p>Your order is on its way! Please ensure someone is available to receive it.</p>
@elseif($newStatus === 'ready_for_pickup')
<p>Your order is ready for pickup at our store in Quatre Bornes. Please bring your order number.</p>
@elseif($newStatus === 'delivered')
<p>Your order has been delivered. We hope you enjoy your purchase!</p>
@endif
<p>If you have any questions, please contact us.</p>
@endsection
