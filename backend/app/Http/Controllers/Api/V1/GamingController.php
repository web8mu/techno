<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BuildRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\RecommendedBuild;
use App\Models\SavedBuild;
use App\Services\CompatibilityService;
use App\Services\PerformanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class GamingController extends Controller
{
    const SLOTS = [
        'cpu'         => ['label' => 'Processor (CPU)',    'icon' => 'cpu'],
        'motherboard' => ['label' => 'Motherboard',        'icon' => 'motherboard'],
        'ram'         => ['label' => 'Memory (RAM)',        'icon' => 'ram'],
        'gpu'         => ['label' => 'Graphics Card (GPU)', 'icon' => 'gpu'],
        'storage'     => ['label' => 'Storage',            'icon' => 'storage'],
        'psu'         => ['label' => 'Power Supply (PSU)', 'icon' => 'psu'],
        'cooler'      => ['label' => 'CPU Cooler',         'icon' => 'cooler'],
        'case'        => ['label' => 'PC Case',            'icon' => 'case'],
    ];

    private function resolveOptionalUser(Request $request): ?\App\Models\User
    {
        $bearerToken = $request->bearerToken();
        if (!$bearerToken) return null;
        $accessToken = PersonalAccessToken::findToken($bearerToken);
        return $accessToken?->tokenable;
    }

    private function loadProductsForSlot(string $slot, array $selectedComponents): \Illuminate\Database\Eloquent\Collection
    {
        return Product::with(['componentAttribute', 'primaryImage'])
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->whereHas('componentAttribute', fn($q) => $q->where('component_type', $slot))
            ->orderByRaw('EXISTS(SELECT 1 FROM component_attributes WHERE product_id = products.id AND is_gamemax = 1) DESC')
            ->orderBy('name')
            ->get();
    }

    /** GET /gaming/slots */
    public function slots(): JsonResponse
    {
        $slots = collect(self::SLOTS)->map(fn($info, $key) => [
            'slot' => $key,
            'label' => $info['label'],
            'icon' => $info['icon'],
        ])->values();

        return response()->json(['data' => $slots]);
    }

    /** GET /gaming/components?slot=cpu&selected[cpu]=1... */
    public function components(Request $request): JsonResponse
    {
        $request->validate([
            'slot' => ['required', 'in:cpu,motherboard,ram,gpu,storage,psu,cooler,case'],
        ]);

        $slot = $request->input('slot');
        $selectedIds = $request->input('selected', []);

        // Load currently selected products
        $currentComponents = [];
        foreach ($selectedIds as $slotKey => $productId) {
            if ($productId && in_array($slotKey, array_keys(self::SLOTS))) {
                $prod = Product::with('componentAttribute')->find($productId);
                if ($prod) {
                    $currentComponents[$slotKey] = $prod;
                }
            }
        }

        $compat = app(CompatibilityService::class);
        $products = $this->loadProductsForSlot($slot, $currentComponents);

        $data = $products->map(function (Product $product) use ($slot, $currentComponents, $compat) {
            $candidateResult = $compat->checkCandidate($product, $slot, $currentComponents);
            $attr = $product->componentAttribute;

            return [
                'id'                   => $product->id,
                'name'                 => $product->name,
                'slug'                 => $product->slug,
                'price'                => (float) ($product->sale_price ?? $product->price),
                'original_price'       => (float) $product->price,
                'primary_image'        => $product->primaryImage?->path,
                'component_attribute'  => $attr,
                'compatible'           => $candidateResult['compatible'],
                'compatibility_reason' => $candidateResult['reason'],
                'compatibility_warnings' => $candidateResult['warnings'],
                'is_gamemax'           => (bool) ($attr?->is_gamemax ?? false),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /** POST /gaming/recommend */
    public function recommend(Request $request): JsonResponse
    {
        $request->validate(['budget' => ['required', 'integer', 'min:1']]);

        $budget = (int) $request->input('budget');

        $build = RecommendedBuild::where('is_active', true)
            ->where('budget_tier', '<=', $budget)
            ->orderByDesc('budget_tier')
            ->first();

        if (!$build) {
            return response()->json(['message' => 'No recommended build found for this budget.'], 404);
        }

        $build->load(['products.componentAttribute', 'products.primaryImage']);

        $components = [];
        $totalPrice = 0;

        foreach ($build->products as $product) {
            $slot = $product->pivot->slot;
            $price = (float) ($product->sale_price ?? $product->price);
            $totalPrice += $price;
            $components[$slot] = [
                'slot'           => $slot,
                'product_id'     => $product->id,
                'product_name'   => $product->name,
                'price'          => $price,
                'primary_image'  => $product->primaryImage?->path,
                'component_attribute' => $product->componentAttribute,
            ];
            $components['_products'][$slot] = $product;
        }

        $perfComponents = $components['_products'] ?? [];
        unset($components['_products']);

        $perf = app(PerformanceService::class)->summarize($perfComponents);

        return response()->json([
            'data' => [
                'build_id'           => $build->id,
                'name'               => $build->name,
                'budget_tier'        => $build->budget_tier,
                'components'         => $components,
                'total_price'        => round($totalPrice, 2),
                'performance_summary' => $perf,
            ],
        ]);
    }

    /** POST /gaming/validate */
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'components'   => ['required', 'array'],
            'components.*' => ['nullable', 'integer', 'exists:products,id'],
        ]);

        [$products, $totalPrice] = $this->resolveComponents($request->input('components'));

        $compat = app(CompatibilityService::class)->check($products);
        $perf = app(PerformanceService::class)->summarize($products);

        return response()->json([
            'data' => [
                'compatibility'       => $compat,
                'total_price'         => round($totalPrice, 2),
                'performance_summary' => $perf,
            ],
        ]);
    }

    /** POST /gaming/builds */
    public function saveBuild(Request $request): JsonResponse
    {
        $request->validate([
            'components'   => ['required', 'array'],
            'components.*' => ['nullable', 'integer', 'exists:products,id'],
            'name'         => ['sometimes', 'string', 'max:100'],
            'guest_token'  => ['sometimes', 'nullable', 'string'],
        ]);

        [$products, $totalPrice] = $this->resolveComponents($request->input('components'));

        // Validate compatibility (soft — still allow saving with warnings, block on errors)
        $compat = app(CompatibilityService::class)->check($products);
        $perf = app(PerformanceService::class)->summarize($products);

        // Build components snapshot
        $componentsSnapshot = [];
        foreach ($products as $slot => $product) {
            $componentsSnapshot[] = [
                'slot'           => $slot,
                'product_id'     => $product->id,
                'product_name'   => $product->name,
                'price_snapshot' => (float) ($product->sale_price ?? $product->price),
            ];
        }

        $user = $this->resolveOptionalUser($request);

        $build = SavedBuild::create([
            'user_id'             => $user?->id,
            'guest_token'         => $user ? null : ($request->input('guest_token') ?? Str::random(16)),
            'name'                => $request->input('name', 'My Build'),
            'components'          => $componentsSnapshot,
            'total_price'         => round($totalPrice, 2),
            'performance_summary' => $perf,
            'share_token'         => Str::random(12),
        ]);

        return response()->json([
            'data' => [
                'share_token'  => $build->share_token,
                'guest_token'  => $build->guest_token,
                'compatibility' => $compat,
                'performance_summary' => $perf,
                'total_price'  => round($totalPrice, 2),
            ],
        ], 201);
    }

    /** GET /gaming/builds/{shareToken} */
    public function loadBuild(string $shareToken): JsonResponse
    {
        $build = SavedBuild::where('share_token', $shareToken)->firstOrFail();

        return response()->json(['data' => $build]);
    }

    /** GET /gaming/my-builds (auth required) */
    public function myBuilds(Request $request): JsonResponse
    {
        $builds = SavedBuild::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $builds]);
    }

    /** DELETE /gaming/my-builds/{id} (auth required) */
    public function deleteBuild(Request $request, int $id): JsonResponse
    {
        $build = SavedBuild::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $build->delete();

        return response()->json(['message' => 'Build deleted.']);
    }

    /** POST /gaming/build-request */
    public function buildRequest(Request $request): JsonResponse
    {
        $request->validate([
            'name'           => ['required', 'string', 'max:100'],
            'email'          => ['required', 'email'],
            'phone'          => ['nullable', 'string', 'max:20'],
            'components'     => ['required', 'array'],
            'components.*'   => ['nullable', 'integer', 'exists:products,id'],
            'message'        => ['nullable', 'string', 'max:2000'],
        ]);

        [$products, $totalPrice] = $this->resolveComponents($request->input('components'));
        $perf = app(PerformanceService::class)->summarize($products);

        $snapshot = [];
        foreach ($products as $slot => $product) {
            $snapshot[$slot] = [
                'product_id'   => $product->id,
                'product_name' => $product->name,
                'price'        => (float) ($product->sale_price ?? $product->price),
            ];
        }
        $snapshot['total_price'] = round($totalPrice, 2);
        $snapshot['performance_summary'] = $perf;

        $buildRequest = BuildRequest::create([
            'name'           => $request->input('name'),
            'email'          => $request->input('email'),
            'phone'          => $request->input('phone'),
            'build_snapshot' => $snapshot,
            'message'        => $request->input('message'),
            'status'         => 'new',
        ]);

        // Notify staff via email (best-effort)
        try {
            $adminEmail = \App\Models\Setting::get('admin_email', config('mail.from.address'));
            Mail::raw(
                "New build request from {$buildRequest->name} ({$buildRequest->email}).\n\n" .
                "Total: Rs " . number_format($totalPrice, 2) . "\n" .
                "Performance: " . ($perf['resolution'] ?? 'N/A') . "\n\n" .
                "Message: " . ($buildRequest->message ?? 'None') . "\n\n" .
                "Review in admin panel: Build Requests #" . $buildRequest->id,
                fn($msg) => $msg->to($adminEmail)->subject("New Build Request #{$buildRequest->id}")
            );
        } catch (\Throwable) {
            // Non-fatal
        }

        return response()->json(['message' => 'Build request submitted.', 'data' => ['id' => $buildRequest->id]], 201);
    }

    /** POST /gaming/add-to-cart */
    public function addToCart(Request $request): JsonResponse
    {
        $request->validate([
            'components'   => ['required', 'array'],
            'components.*' => ['nullable', 'integer', 'exists:products,id'],
        ]);

        [$products, $totalPrice] = $this->resolveComponents($request->input('components'));

        // Validate compatibility — reject on errors
        $compat = app(CompatibilityService::class)->check($products);
        if (!$compat['ok']) {
            return response()->json([
                'message' => 'Build has compatibility issues. Fix them before adding to cart.',
                'errors'  => $compat['errors'],
                'warnings' => $compat['warnings'],
            ], 422);
        }

        // Resolve cart
        $user = $this->resolveOptionalUser($request);
        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        } else {
            $token = $request->header('X-Session-Token') ?? $request->input('session_token') ?? Str::uuid()->toString();
            $cart = Cart::firstOrCreate(['session_token' => $token]);
        }

        foreach ($products as $product) {
            // Server-side price (never trust client)
            $price = (float) ($product->sale_price ?? $product->price);
            $existing = $cart->items()->where('product_id', $product->id)->first();
            if ($existing) {
                $existing->increment('qty');
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'qty'        => 1,
                    'unit_price' => $price,
                ]);
            }
        }

        $cart->load('items.product.primaryImage');

        return response()->json([
            'message'      => 'Build added to cart.',
            'cart_id'      => $cart->id,
            'session_token' => $cart->session_token,
            'compatibility' => $compat,
        ]);
    }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    /**
     * Resolve component IDs to Product models, returning [$products, $totalPrice]
     * @param array $componentIds ['slot' => product_id|null]
     * @return array [['slot' => Product], float]
     */
    private function resolveComponents(array $componentIds): array
    {
        $products = [];
        $totalPrice = 0.0;

        foreach ($componentIds as $slot => $productId) {
            if (!$productId || !in_array($slot, array_keys(self::SLOTS))) {
                continue;
            }
            $product = Product::with('componentAttribute')->find($productId);
            if ($product) {
                $products[$slot] = $product;
                $totalPrice += (float) ($product->sale_price ?? $product->price);
            }
        }

        return [$products, $totalPrice];
    }
}
