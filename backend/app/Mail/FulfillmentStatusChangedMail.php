<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FulfillmentStatusChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order, public string $newStatus) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order #{$this->order->order_number} Status Update - Techno Tronics",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.fulfillment-status-changed',
        );
    }
}
