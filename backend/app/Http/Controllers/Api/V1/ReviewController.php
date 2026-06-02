<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // GET /products/{slug}/reviews
    public function index(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        $reviews = Review::with('user:id,name')
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->orderByDesc('created_at')
            ->paginate(10);

        $stats = [
            'average' => round(Review::where('product_id', $product->id)->where('status','approved')->avg('rating') ?? 0, 1),
            'count' => Review::where('product_id', $product->id)->where('status','approved')->count(),
            'distribution' => Review::where('product_id', $product->id)->where('status','approved')
                ->selectRaw('rating, count(*) as count')
                ->groupBy('rating')
                ->pluck('count', 'rating'),
        ];

        return response()->json(['data' => $reviews, 'stats' => $stats]);
    }

    // POST /products/{slug}/reviews
    public function store(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        // Check duplicate
        if (Review::where('user_id', $user->id)->where('product_id', $product->id)->exists()) {
            return response()->json(['message' => 'You have already reviewed this product'], 422);
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title'  => ['nullable', 'string', 'max:100'],
            'body'   => ['nullable', 'string', 'max:2000'],
        ]);

        // Verified purchase: has a delivered/confirmed/processing order with this product
        $isVerified = OrderItem::whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->whereIn('fulfillment_status', ['confirmed','processing','ready_for_pickup','out_for_delivery','delivered']);
            })
            ->where('product_id', $product->id)
            ->exists();

        $review = Review::create(array_merge($data, [
            'product_id' => $product->id,
            'user_id' => $user->id,
            'status' => 'pending',
            'is_verified_purchase' => $isVerified,
        ]));

        return response()->json(['data' => $review, 'message' => 'Review submitted and pending approval'], 201);
    }
}
