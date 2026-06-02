<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class DashboardController extends Controller
{
    // GET /me
    public function profile(Request $request) {
        return response()->json(['data' => $request->user()->load('addresses')]);
    }

    // GET /me/orders
    public function orders(Request $request)
    {
        $orders = Order::with(['items'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);
        return response()->json(['data' => $orders]);
    }

    // GET /me/orders/{orderNumber}
    public function order(Request $request, string $orderNumber)
    {
        $order = Order::with(['items', 'invoice'])
            ->where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();
        return response()->json(['data' => $order]);
    }

    // GET /me/orders/{orderNumber}/invoice
    public function downloadInvoice(Request $request, string $orderNumber)
    {
        $order = Order::with(['items', 'invoice'])
            ->where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();
        $pdf = (new InvoiceService())->generatePdf($order);
        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"invoice-{$orderNumber}.pdf\"",
        ]);
    }

    // POST /me/orders/{orderNumber}/reorder
    public function reorder(Request $request, string $orderNumber)
    {
        $order = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $cart = \App\Models\Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $added = [];
        $skipped = [];

        foreach ($order->items as $item) {
            $product = $item->product;
            if (!$product || $product->status !== 'active' || $product->stock <= 0) {
                $skipped[] = $item->name_snapshot;
                continue;
            }
            $existing = $cart->items()->where('product_id', $product->id)->first();
            $newQty = min(($existing?->qty ?? 0) + $item->qty, $product->stock);
            if ($existing) {
                $existing->update(['qty' => $newQty, 'unit_price' => $product->sale_price ?? $product->price]);
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'qty' => min($item->qty, $product->stock),
                    'unit_price' => $product->sale_price ?? $product->price,
                ]);
            }
            $added[] = $item->name_snapshot;
        }

        return response()->json([
            'data' => ['added' => $added, 'skipped' => $skipped],
            'message' => count($added) . ' item(s) added to cart' . (count($skipped) ? ', ' . count($skipped) . ' skipped.' : '.'),
        ]);
    }

    // GET /me/addresses
    public function addresses(Request $request)
    {
        return response()->json(['data' => $request->user()->addresses]);
    }

    // POST /me/addresses
    public function storeAddress(Request $request)
    {
        $data = $request->validate([
            'recipient' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'town' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string'],
            'is_default' => ['boolean'],
        ]);
        if (!empty($data['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }
        $address = $request->user()->addresses()->create($data);
        return response()->json(['data' => $address], 201);
    }

    // PUT /me/addresses/{address}
    public function updateAddress(Request $request, \App\Models\Address $address)
    {
        abort_if($address->user_id !== $request->user()->id, 403);
        $data = $request->validate([
            'recipient' => ['string', 'max:100'],
            'phone' => ['string', 'max:30'],
            'line1' => ['string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'town' => ['string', 'max:100'],
            'district' => ['string'],
            'is_default' => ['boolean'],
        ]);
        if (!empty($data['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }
        $address->update($data);
        return response()->json(['data' => $address]);
    }

    // DELETE /me/addresses/{address}
    public function deleteAddress(Request $request, \App\Models\Address $address)
    {
        abort_if($address->user_id !== $request->user()->id, 403);
        $address->delete();
        return response()->json(['message' => 'Address deleted']);
    }

    // PATCH /me
    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $request->user()->id],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
        ]);
        $request->user()->update($data);
        return response()->json(['data' => $request->user()->fresh()]);
    }

    // POST /me/password
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);
        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }
        $request->user()->update(['password' => Hash::make($request->password)]);
        return response()->json(['message' => 'Password updated successfully']);
    }
}
