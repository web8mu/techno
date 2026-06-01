<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function sitemap(): Response
    {
        $baseUrl = config('app.frontend_url', 'https://technotronics.mu');
        $products = Product::where('status', 'active')->select('slug', 'updated_at')->get();
        $categories = Category::select('slug', 'updated_at')->get();
        $brands = Brand::select('slug', 'updated_at')->get();

        $xml = view('sitemap', compact('baseUrl', 'products', 'categories', 'brands'))->render();

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function robots(): Response
    {
        $baseUrl = config('app.frontend_url', 'https://technotronics.mu');
        $content = "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: {$baseUrl}/sitemap.xml\n";
        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    public function llms(): Response
    {
        $name = Setting::get('business_name', 'Techno Tronics Ltd');
        $content = "# {$name}\n> Premium electronics and gaming retailer in Mauritius.\n\n## Products\nWe sell laptops, desktops, components, gaming hardware, accessories, and gadgets.\n\n## Location\nMauritius\n\n## Contact\n" . Setting::get('business_email', 'info@technotronics.mu') . "\n";
        return response($content, 200, ['Content-Type' => 'text/plain']);
    }
}
