<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Mail\NewOrderNotificationMail;
use App\Mail\OrderConfirmationMail;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Services\Payment\PaymentDriverFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function placeOrder(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string|max:50',
            'delivery_method' => 'required|in:pickup,delivery',
            'payment_method' => 'required|in:juice_mcb,bank_transfer,cash',
            'address' => 'required_if:delivery_method,delivery|array',
            'address.line1' => 'required_if:delivery_method,delivery|string',
            'address.town' => 'required_if:delivery_method,delivery|string',
            'address.district' => 'required_if:delivery_method,delivery|string',
            'notes' => 'nullable|string',
            'coupon_code' => 'nullable|string',
            'session_token' => 'nullable|string',
        ]);

        // Resolve cart
        $user = $request->user();
        $cart = null;

        if ($user) {
            $cart = Cart::where('user_id', $user->id)->first();
        }

        if (!$cart && $request->filled('session_token')) {
            $cart = Cart::where('session_token', $request->session_token)->first();
        }

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty',
                'errors' => ['cart' => ['Your cart is empty']],
            ], 422);
        }

        $cart->load('items.product');

        // Validate coupon
        $coupon = null;
        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
        }

        // Settings
        $vatRate = (float) Setting::get('vat_rate', 15) / 100;
        $flatFee = (float) Setting::get('flat_delivery_fee', 250);
        $freeThreshold = (float) Setting::get('free_delivery_threshold', 5000);

        try {
            $order = DB::transaction(function () use ($request, $cart, $coupon, $user, $vatRate, $flatFee, $freeThreshold) {
                // Lock products for update
                $productIds = $cart->items->pluck('product_id')->toArray();
                $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

                $subtotal = 0;
                $orderItemsData = [];

                foreach ($cart->items as $item) {
                    $product = $products->get($item->product_id);

                    if (!$product || $product->status !== 'active') {
                        throw new \Exception("Product '{$item->product->name}' is no longer available.");
                    }

                    if ($product->stock > 0 && $item->qty > $product->stock) {
                        throw new \Exception("Insufficient stock for '{$product->name}'. Available: {$product->stock}");
                    }

                    $unitPrice = (float) ($product->sale_price ?? $product->price);
                    $lineTotal = round($unitPrice * $item->qty, 2);
                    $subtotal += $lineTotal;

                    $orderItemsData[] = [
                        'product_id' => $product->id,
                        'name_snapshot' => $product->name,
                        'sku_snapshot' => $product->sku,
                        'qty' => $item->qty,
                        'unit_price' => $unitPrice,
                        'line_total' => $lineTotal,
                    ];

                    // Decrement stock
                    if ($product->stock > 0) {
                        $product->decrement('stock', $item->qty);
                    }
                }

                // Discount
                $discount = 0;
                $couponId = null;
                if ($coupon && $coupon->isValid($subtotal)) {
                    $discount = $coupon->computeDiscount($subtotal);
                    $couponId = $coupon->id;
                    $coupon->increment('times_used');
                }

                // Delivery fee
                $deliveryMethod = $request->delivery_method;
                $deliveryFee = ($deliveryMethod === 'delivery' && ($subtotal - $discount) < $freeThreshold) ? $flatFee : 0;

                $total = round($subtotal - $discount + $deliveryFee, 2);
                $vatAmount = round($total - ($total / (1 + $vatRate)), 2);
                $netAmount = round($total - $vatAmount, 2);

                // Shipping address
                $shippingAddress = $deliveryMethod === 'delivery' ? $request->address : ['method' => 'pickup'];

                // Create order
                $orderNumber = 'TT-' . strtoupper(Str::random(8));
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $user?->id,
                    'customer_name' => $request->customer_name,
                    'customer_email' => $request->customer_email,
                    'customer_phone' => $request->customer_phone,
                    'shipping_address' => $shippingAddress,
                    'delivery_method' => $deliveryMethod,
                    'payment_method' => $request->payment_method,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $deliveryFee,
                    'discount' => $discount,
                    'total' => $total,
                    'vat_amount' => $vatAmount,
                    'net_amount' => $netAmount,
                    'fulfillment_status' => 'pending',
                    'payment_status' => 'pending',
                    'notes' => $request->notes,
                    'coupon_id' => $couponId,
                ]);

                // Create order items
                $order->items()->createMany($orderItemsData);

                // Create invoice
                $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
                Invoice::create([
                    'order_id' => $order->id,
                    'invoice_number' => $invoiceNumber,
                    'issued_at' => now(),
                    'vat_breakdown' => [
                        'rate' => Setting::get('vat_rate', 15),
                        'net_amount' => $netAmount,
                        'vat_amount' => $vatAmount,
                        'gross_amount' => $total,
                    ],
                ]);

                // Clear cart
                $cart->items()->delete();
                $cart->delete();

                return $order;
            });

            // Send emails (after transaction)
            try {
                Mail::to($order->customer_email)->send(new OrderConfirmationMail($order->load(['items', 'invoice'])));
                $staffEmail = Setting::get('business_email', '');
                if ($staffEmail) {
                    Mail::to($staffEmail)->send(new NewOrderNotificationMail($order));
                }
            } catch (\Exception $e) {
                // Log but don't fail the checkout
                \Log::error('Failed to send order emails: ' . $e->getMessage());
            }

            // Get payment instructions
            $paymentInstructions = PaymentDriverFactory::make($order->payment_method)->getInstructions($order);

            return response()->json([
                'data' => [
                    'order_number' => $order->order_number,
                    'total' => $order->total,
                    'payment_instructions' => $paymentInstructions,
                ],
                'message' => 'Order placed successfully',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['checkout' => [$e->getMessage()]],
            ], 422);
        }
    }
}
