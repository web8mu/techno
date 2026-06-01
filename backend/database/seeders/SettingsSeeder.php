<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'business_name'           => 'Techno Tronics Ltd',
            'business_address'        => 'Royal Road, Quatre Bornes, Mauritius',
            'business_phone'          => '+230 5800 0000',
            'business_email'          => 'info@technotronics.mu',
            'business_brn'            => 'C12345678',
            'vat_registration_number' => 'VAT12345678',
            'vat_rate'                => '15',
            'flat_delivery_fee'       => '250',
            'free_delivery_threshold' => '5000',
            'juice_merchant_number'   => '5800 0001',
            'juice_instructions'      => 'Send payment to Juice number 5800 0001. Use your order number as reference.',
            'bank_name'               => 'MCB Bank',
            'bank_account_name'       => 'Techno Tronics Ltd',
            'bank_account_number'     => '000123456789',
            'bank_branch'             => 'Quatre Bornes',
            'bank_swift'              => 'MCBLMUMU',
            'bank_instructions'       => 'Transfer to MCB account 000123456789. Use your order number as reference.',
            'ga4_id'                  => '',
            'meta_pixel_id'           => '',
            'default_theme'           => 'light',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
