<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function products(Request $request)
    {
        $query = Product::with(['category', 'brand', 'primaryImage'])
            ->where('status', 'active');

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(fn($q) => $q->where('name', 'like', $s)
                ->orWhere('sku', 'like', $s)
                ->orWhere('description', 'like', $s));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }
        if ($request->filled('min_price')) {
            $query->where(fn($q) => $q->where('sale_price', '>=', $request->min_price)
                ->orWhere(fn($q2) => $q2->whereNull('sale_price')->where('price', '>=', $request->min_price)));
        }
        if ($request->filled('max_price')) {
            $query->where(fn($q) => $q->where('sale_price', '<=', $request->max_price)
                ->orWhere(fn($q2) => $q2->whereNull('sale_price')->where('price', '<=', $request->max_price)));
        }
        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        if ($request->boolean('best_seller')) {
            $query->where('is_best_seller', true);
        }

        $sort = $request->get('sort', 'newest');
        match ($sort) {
            'best_selling' => $query->orderByDesc('is_best_seller')->orderByDesc('created_at'),
            'price_asc'    => $query->orderByRaw('COALESCE(sale_price, price) ASC'),
            'price_desc'   => $query->orderByRaw('COALESCE(sale_price, price) DESC'),
            default        => $query->orderByDesc('created_at'),
        };

        $products = $query->paginate(15);

        return response()->json(['data' => $products]);
    }

    public function product($slug)
    {
        $product = Product::with(['category', 'brand', 'images'])
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $related = Product::with(['primaryImage'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->limit(4)
            ->get();

        return response()->json(['data' => array_merge($product->toArray(), ['related' => $related])]);
    }

    public function categories()
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->withCount('products')
            ->get();
        return response()->json(['data' => $categories]);
    }

    public function brands()
    {
        $brands = Brand::withCount('products')->get();
        return response()->json(['data' => $brands]);
    }

    public function publicSettings()
    {
        $keys = [
            'business_name', 'business_address', 'business_phone', 'business_email',
            'vat_rate', 'flat_delivery_fee', 'free_delivery_threshold',
            'juice_merchant_number', 'juice_instructions',
            'bank_name', 'bank_account_name', 'bank_account_number', 'bank_branch', 'bank_instructions',
            'ga4_id', 'meta_pixel_id', 'default_theme',
        ];
        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = Setting::get($key);
        }
        return response()->json(['data' => $settings]);
    }
}
