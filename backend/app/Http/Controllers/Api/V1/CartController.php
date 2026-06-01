<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class CartController extends Controller
{
    /**
     * Resolve the current cart, supporting both authenticated users (via Sanctum token)
     * and guests (via X-Session-Token header or auto-generated UUID).
     */
    private function resolveCart(Request $request): Cart
    {
        // Try to resolve authenticated user from Bearer token manually
        // (cart routes don't enforce auth:sanctum so we do it optionally)
        $user = $this->resolveOptionalUser($request);

        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        $token = $request->header('X-Session-Token') ?: $request->input('session_token');
        if (!$token) {
            $token = Str::uuid()->toString();
        }
        return Cart::firstOrCreate(['session_token' => $token]);
    }

    private function resolveOptionalUser(Request $request): ?\App\Models\User
    {
        $bearerToken = $request->bearerToken();
        if (!$bearerToken) {
            return null;
        }
        $accessToken = PersonalAccessToken::findToken($bearerToken);
        return $accessToken?->tokenable;
    }

    private function cartResponse(Cart $cart): array
    {
        $cart->load('items.product.primaryImage');
        $subtotal = $cart->items->sum(fn($item) => $item->qty * $item->unit_price);
        $freeThreshold = (float) Setting::get('free_delivery_threshold', 5000);
        $flatFee = (float) Setting::get('flat_delivery_fee', 250);
        $deliveryFee = $subtotal >= $freeThreshold ? 0 : $flatFee;
        $vatRate = (float) Setting::get('vat_rate', 15);
        $total = $subtotal + $deliveryFee;
        $vatAmount = round($total - ($total / (1 + $vatRate / 100)), 2);

        return [
            'session_token' => $cart->session_token,
            'items' => $cart->items,
            'item_count' => $cart->items->sum('qty'),
            'subtotal' => round($subtotal, 2),
            'delivery_fee' => round($deliveryFee, 2),
            'discount' => 0,
            'total' => round($total, 2),
            'vat_amount' => $vatAmount,
            'vat_rate' => $vatRate,
            'coupon' => null,
        ];
    }

    public function show(Request $request)
    {
        $cart = $this->resolveCart($request);
        return response()->json(['data' => $this->cartResponse($cart)]);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'qty'        => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock <= 0) {
            return response()->json(['message' => 'Product is out of stock'], 422);
        }

        $cart = $this->resolveCart($request);
        $item = $cart->items()->where('product_id', $product->id)->first();

        $newQty = ($item ? $item->qty : 0) + $request->qty;
        if ($newQty > $product->stock) {
            return response()->json(['message' => "Only {$product->stock} in stock"], 422);
        }

        if ($item) {
            $item->update(['qty' => $newQty]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'qty' => $request->qty,
                'unit_price' => $product->sale_price ?? $product->price,
            ]);
        }

        return response()->json(['data' => $this->cartResponse($cart)]);
    }

    public function updateItem(Request $request, CartItem $cartItem)
    {
        $request->validate(['qty' => ['required', 'integer', 'min:1']]);

        if ($request->qty > $cartItem->product->stock) {
            return response()->json(['message' => "Only {$cartItem->product->stock} in stock"], 422);
        }

        $cartItem->update(['qty' => $request->qty]);
        return response()->json(['data' => $this->cartResponse($cartItem->cart)]);
    }

    public function removeItem(CartItem $cartItem)
    {
        $cart = $cartItem->cart;
        $cartItem->delete();
        return response()->json(['data' => $this->cartResponse($cart)]);
    }

    public function clear(Request $request)
    {
        $cart = $this->resolveCart($request);
        $cart->items()->delete();
        return response()->json(['data' => $this->cartResponse($cart)]);
    }

    public function applyCoupon(Request $request)
    {
        // Phase 1 stub - coupons scaffolded but not enforced in checkout
        return response()->json(['message' => 'Coupon applied'], 200);
    }

    public function removeCoupon(Request $request)
    {
        return response()->json(['message' => 'Coupon removed'], 200);
    }

    public function mergeGuestCart(Request $request)
    {
        $request->validate(['session_token' => ['required', 'string']]);

        $guestCart = Cart::where('session_token', $request->session_token)->first();
        if (!$guestCart || !$request->user()) {
            return response()->json(['message' => 'Merged'], 200);
        }

        $userCart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        foreach ($guestCart->items as $guestItem) {
            $existing = $userCart->items()->where('product_id', $guestItem->product_id)->first();
            $product = $guestItem->product;
            if (!$product) continue;

            if ($existing) {
                $newQty = min($existing->qty + $guestItem->qty, $product->stock);
                $existing->update(['qty' => $newQty]);
            } else {
                $userCart->items()->create([
                    'product_id' => $guestItem->product_id,
                    'qty' => min($guestItem->qty, $product->stock),
                    'unit_price' => $product->sale_price ?? $product->price,
                ]);
            }
        }

        $guestCart->items()->delete();
        $guestCart->delete();

        return response()->json(['data' => $this->cartResponse($userCart)]);
    }
}
