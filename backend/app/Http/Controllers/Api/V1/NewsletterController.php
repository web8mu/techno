<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Mail\NewsletterConfirmationMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:100'],
        ]);

        $sub = NewsletterSubscriber::where('email', $request->email)->first();

        if ($sub && $sub->status === 'subscribed') {
            return response()->json(['message' => 'You are already subscribed!']);
        }

        if ($sub) {
            $sub->update(['status' => 'subscribed', 'subscribed_at' => now()]);
        } else {
            $sub = NewsletterSubscriber::create([
                'email' => $request->email,
                'name'  => $request->name,
                'status' => 'subscribed',
                'subscribed_at' => now(),
            ]);
        }

        try {
            Mail::to($sub->email)->send(new NewsletterConfirmationMail($sub));
        } catch (\Exception) {}

        return response()->json(['message' => 'Subscribed successfully! Check your email for confirmation.'], 201);
    }

    public function unsubscribe(string $token)
    {
        $sub = NewsletterSubscriber::where('unsubscribe_token', $token)->firstOrFail();
        $sub->update(['status' => 'unsubscribed']);
        return response()->json(['message' => 'You have been unsubscribed.']);
    }
}
