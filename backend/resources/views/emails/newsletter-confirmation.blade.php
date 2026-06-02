@extends('emails.layout')
@section('title', 'Newsletter Subscription Confirmed')
@section('content')
<h2>Welcome to the Techno Tronics newsletter! 🎉</h2>
<p>Hi {{ $subscriber->name ?? 'there' }}, you're now subscribed to our newsletter. We'll keep you updated on the latest products, deals, and tech news from Mauritius's premier electronics retailer.</p>
<div class="info-box">
  <strong>Email:</strong> {{ $subscriber->email }}<br>
  <strong>Subscribed:</strong> {{ $subscriber->subscribed_at?->format('d M Y') }}
</div>
<p>Don't want to receive emails anymore? <a href="{{ config('app.frontend_url') }}/newsletter/unsubscribe/{{ $subscriber->unsubscribe_token }}" style="color:#2563eb">Unsubscribe here</a>.</p>
@endsection
