@extends('emails.layout')
@section('title', 'New Contact Message')
@section('content')
<h2>New Contact Message 📬</h2>
<div class="info-box">
  <strong>From:</strong> {{ $message->name }} ({{ $message->email }})<br>
  @if($message->phone)<strong>Phone:</strong> {{ $message->phone }}<br>@endif
  <strong>Subject:</strong> {{ $message->subject }}<br>
  <strong>Received:</strong> {{ $message->created_at->format('d M Y, H:i') }}
</div>
<h2>Message</h2>
<p>{{ $message->message }}</p>
<p><a href="{{ config('app.url') }}/admin/contact-messages" style="color:#2563eb">View in Admin →</a></p>
@endsection
