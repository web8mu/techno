<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function show(Request $request, string $orderNumber)
    {
        $query = Order::with(['items', 'invoice'])->where('order_number', $orderNumber);

        // For guests: require email verification
        if (!$request->user()) {
            $request->validate(['email' => ['required', 'email']]);
            $query->where('customer_email', $request->email);
        }

        $order = $query->firstOrFail();

        return response()->json(['data' => $order]);
    }

    public function index(Request $request)
    {
        $orders = Order::with(['items'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json(['data' => $orders]);
    }

    public function uploadProof(Request $request, string $orderNumber)
    {
        $request->validate([
            'proof' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:5120'],
        ]);

        $order = Order::where('order_number', $orderNumber)
            ->where(fn($q) => $request->user()
                ? $q->where('user_id', $request->user()->id)
                : $q->where('customer_email', $request->email))
            ->firstOrFail();

        if ($order->proof_of_payment_path) {
            Storage::disk('private')->delete($order->proof_of_payment_path);
        }

        $path = $request->file('proof')->store("proofs/{$order->order_number}", 'private');
        $order->update(['proof_of_payment_path' => $path]);

        return response()->json(['message' => 'Proof uploaded successfully']);
    }

    public function serveProof(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        // Only admin or the order owner
        $user = $request->user();
        if (!$user || ($user->role !== 'admin' && $user->id !== $order->user_id)) {
            abort(403);
        }

        if (!$order->proof_of_payment_path) {
            abort(404);
        }

        return Storage::disk('private')->response($order->proof_of_payment_path);
    }
}
