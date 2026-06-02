<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormMail;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\HeroSlide;
use App\Models\Page;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CmsController extends Controller
{
    public function homepageData()
    {
        return response()->json(['data' => [
            'hero_slides' => HeroSlide::where('is_active', true)->orderBy('position')->get(),
            'testimonials' => Testimonial::where('is_active', true)->orderBy('position')->get(),
            'sections' => [
                'show_featured_categories' => Setting::get('show_featured_categories', '1'),
                'show_latest_products'     => Setting::get('show_latest_products', '1'),
                'show_best_sellers'        => Setting::get('show_best_sellers', '1'),
                'show_brands'              => Setting::get('show_brands', '1'),
                'show_testimonials'        => Setting::get('show_testimonials', '1'),
                'show_services_overview'   => Setting::get('show_services_overview', '1'),
                'show_gaming_banner'       => Setting::get('show_gaming_banner', '1'),
                'show_newsletter'          => Setting::get('show_newsletter', '1'),
                'gaming_banner_title'      => Setting::get('gaming_banner_title', 'Gaming World — Coming Soon'),
                'gaming_banner_subtitle'   => Setting::get('gaming_banner_subtitle', 'The ultimate gaming configurator is being built.'),
                'gaming_banner_cta'        => Setting::get('gaming_banner_cta', 'Get Notified'),
                'gaming_banner_image'      => Setting::get('gaming_banner_image', ''),
            ],
        ]]);
    }

    public function page(string $slug)
    {
        $page = Page::where('slug', $slug)->where('is_active', true)->firstOrFail();
        return response()->json(['data' => $page]);
    }

    public function services()
    {
        return response()->json(['data' => Service::where('is_active', true)->orderBy('position')->get()]);
    }

    public function faqs()
    {
        return response()->json(['data' => Faq::where('is_active', true)->orderBy('position')->get()]);
    }

    public function contact(Request $request)
    {
        $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'email'   => ['required', 'email'],
            'phone'   => ['nullable', 'string', 'max:30'],
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:3000'],
        ]);

        $msg = ContactMessage::create($request->only('name','email','phone','subject','message'));

        try {
            $staffEmail = Setting::get('business_email', 'info@technotronics.mu');
            Mail::to($staffEmail)->send(new ContactFormMail($msg));
        } catch (\Exception) {}

        return response()->json(['message' => 'Message sent! We will get back to you within 24 hours.'], 201);
    }
}
