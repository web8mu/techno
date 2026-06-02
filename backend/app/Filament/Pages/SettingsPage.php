<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class SettingsPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static string $view = 'filament.pages.settings';
    protected static ?string $navigationLabel = 'Settings';
    protected static ?string $title = 'Business Settings';
    protected static ?string $navigationGroup = 'Configuration';

    public ?array $data = [];

    public function mount(): void
    {
        $keys = [
            'business_name', 'business_address', 'business_phone', 'business_email',
            'business_brn', 'vat_registration_number', 'vat_rate',
            'flat_delivery_fee', 'free_delivery_threshold',
            'juice_merchant_number', 'juice_instructions',
            'bank_name', 'bank_account_name', 'bank_account_number', 'bank_branch', 'bank_swift', 'bank_instructions',
            'ga4_id', 'meta_pixel_id', 'default_theme',
            'show_featured_categories', 'show_latest_products', 'show_best_sellers', 'show_brands',
            'show_testimonials', 'show_services_overview', 'show_gaming_banner', 'show_newsletter',
            'gaming_banner_title', 'gaming_banner_subtitle', 'gaming_banner_cta',
            'contact_address', 'contact_lat', 'contact_lng', 'opening_hours',
            'social_facebook', 'social_instagram', 'social_twitter', 'social_youtube',
        ];
        $data = [];
        foreach ($keys as $key) {
            $data[$key] = Setting::get($key, '');
        }
        $this->form->fill($data);
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Business Information')->schema([
                Forms\Components\TextInput::make('business_name')->required(),
                Forms\Components\TextInput::make('business_email')->email()->required(),
                Forms\Components\TextInput::make('business_phone'),
                Forms\Components\TextInput::make('business_address'),
                Forms\Components\TextInput::make('business_brn')->label('BRN'),
                Forms\Components\TextInput::make('vat_registration_number')->label('VAT Registration Number'),
            ])->columns(2),

            Forms\Components\Section::make('Pricing & Delivery')->schema([
                Forms\Components\TextInput::make('vat_rate')->label('VAT Rate (%)')->numeric()->required(),
                Forms\Components\TextInput::make('flat_delivery_fee')->label('Flat Delivery Fee (Rs)')->numeric()->required(),
                Forms\Components\TextInput::make('free_delivery_threshold')->label('Free Delivery Threshold (Rs)')->numeric()->required(),
            ])->columns(3),

            Forms\Components\Section::make('JuiceByMCB Payment')->schema([
                Forms\Components\TextInput::make('juice_merchant_number')->label('Merchant Number'),
                Forms\Components\Textarea::make('juice_instructions')->rows(2),
            ])->columns(2),

            Forms\Components\Section::make('Bank Transfer Payment')->schema([
                Forms\Components\TextInput::make('bank_name'),
                Forms\Components\TextInput::make('bank_account_name'),
                Forms\Components\TextInput::make('bank_account_number'),
                Forms\Components\TextInput::make('bank_branch'),
                Forms\Components\TextInput::make('bank_swift')->label('SWIFT Code'),
                Forms\Components\Textarea::make('bank_instructions')->rows(2),
            ])->columns(3),

            Forms\Components\Section::make('Analytics & Tracking')->schema([
                Forms\Components\TextInput::make('ga4_id')->label('GA4 Measurement ID')->placeholder('G-XXXXXXXXXX'),
                Forms\Components\TextInput::make('meta_pixel_id')->label('Meta Pixel ID'),
            ])->columns(2),

            Forms\Components\Section::make('Homepage Sections')->schema([
                Forms\Components\Toggle::make('show_featured_categories')->label('Featured Categories'),
                Forms\Components\Toggle::make('show_latest_products')->label('Latest Products'),
                Forms\Components\Toggle::make('show_best_sellers')->label('Best Sellers'),
                Forms\Components\Toggle::make('show_brands')->label('Brands Strip'),
                Forms\Components\Toggle::make('show_testimonials')->label('Testimonials'),
                Forms\Components\Toggle::make('show_services_overview')->label('Services Overview'),
                Forms\Components\Toggle::make('show_gaming_banner')->label('Gaming Banner'),
                Forms\Components\Toggle::make('show_newsletter')->label('Newsletter Signup'),
            ])->columns(4),

            Forms\Components\Section::make('Gaming World Banner')->schema([
                Forms\Components\TextInput::make('gaming_banner_title'),
                Forms\Components\TextInput::make('gaming_banner_subtitle'),
                Forms\Components\TextInput::make('gaming_banner_cta')->label('CTA Button Text'),
            ])->columns(3),

            Forms\Components\Section::make('Contact & Social')->schema([
                Forms\Components\Textarea::make('contact_address')->rows(2)->label('Full Address for Contact Page'),
                Forms\Components\TextInput::make('contact_lat')->label('Map Latitude'),
                Forms\Components\TextInput::make('contact_lng')->label('Map Longitude'),
                Forms\Components\Textarea::make('opening_hours')->rows(3)->label('Opening Hours (one per line)'),
                Forms\Components\TextInput::make('social_facebook')->label('Facebook URL'),
                Forms\Components\TextInput::make('social_instagram')->label('Instagram URL'),
                Forms\Components\TextInput::make('social_twitter')->label('Twitter/X URL'),
                Forms\Components\TextInput::make('social_youtube')->label('YouTube URL'),
            ])->columns(2),
        ])->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();
        foreach ($data as $key => $value) {
            Setting::set($key, $value ?? '');
        }
        Notification::make()->title('Settings saved successfully')->success()->send();
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')->label('Save Settings')->submit('save'),
        ];
    }
}
