<?php
namespace Database\Seeders;
use App\Models\Faq;
use App\Models\HeroSlide;
use App\Models\Page;
use App\Models\Review;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;

class Phase2Seeder extends Seeder {
    public function run(): void {
        // Hero Slides
        $slides = [
            ['title'=>'Premium Electronics & Gaming','subtitle'=>'Mauritius\'s No.1 destination for laptops, gaming rigs, and components.','button_text'=>'Shop Now','button_url'=>'/shop','background_image_path'=>'https://placehold.co/1920x700/0f172a/3b82f6?text=Techno+Tronics','mobile_image_path'=>'https://placehold.co/768x500/0f172a/3b82f6?text=Techno+Tronics','position'=>0,'is_active'=>true],
            ['title'=>'Build Your Dream PC','subtitle'=>'Top components from Intel, AMD, NVIDIA — expert advice included.','button_text'=>'Browse Components','button_url'=>'/shop?category=components','background_image_path'=>'https://placehold.co/1920x700/1e293b/60a5fa?text=Build+Your+PC','mobile_image_path'=>'https://placehold.co/768x500/1e293b/60a5fa?text=Build+Your+PC','position'=>1,'is_active'=>true],
            ['title'=>'Gaming Season Is Here','subtitle'=>'Monitors, chairs, keyboards, mice — level up your setup.','button_text'=>'Shop Gaming','button_url'=>'/shop?category=gaming-hardware','background_image_path'=>'https://placehold.co/1920x700/172554/818cf8?text=Gaming+Season','mobile_image_path'=>'https://placehold.co/768x500/172554/818cf8?text=Gaming+Season','position'=>2,'is_active'=>true],
        ];
        foreach ($slides as $s) HeroSlide::updateOrCreate(['title'=>$s['title']],$s);

        // Testimonials
        $testimonials = [
            ['author_name'=>'Priya Ramburn','role_company'=>'Software Engineer, Port Louis','content'=>'Bought my MSI laptop here and the service was exceptional. They helped me choose the right specs for my work and the price was unbeatable in Mauritius.','rating'=>5,'is_active'=>true,'position'=>0],
            ['author_name'=>'Kevin Ah-Keng','role_company'=>'Gaming Enthusiast','content'=>'Finally a proper gaming hardware store in Mauritius! Got my RTX GPU and gaming chair in one go. Fast delivery to Curepipe.','rating'=>5,'is_active'=>true,'position'=>1],
            ['author_name'=>'Anisha Sookdawoor','role_company'=>'Graphic Designer, Vacoas','content'=>'The team knows their products inside out. They recommended the perfect monitor for colour-accurate design work. Very happy.','rating'=>5,'is_active'=>true,'position'=>2],
            ['author_name'=>'Dylan Mooroogen','role_company'=>'IT Manager','content'=>'Ordered components for 5 office PCs. Smooth checkout, quick delivery, and the invoice had all VAT details I needed for accounting.','rating'=>4,'is_active'=>true,'position'=>3],
            ['author_name'=>'Salma Toufeeq','role_company'=>'Student, University of Mauritius','content'=>'Great ASUS VivoBook deal — quality product at a fair price. The JuiceByMCB payment made it very convenient.','rating'=>5,'is_active'=>true,'position'=>4],
            ['author_name'=>'Marc Figaro','role_company'=>'Content Creator','content'=>'The Corsair RAM I ordered came next day. Prices are competitive and the website is easy to use. Will definitely order again.','rating'=>4,'is_active'=>true,'position'=>5],
        ];
        foreach ($testimonials as $t) Testimonial::updateOrCreate(['author_name'=>$t['author_name']],$t);

        // Services
        $services = [
            ['title'=>'Laptop Repairs','description'=>'Screen replacement, keyboard repair, battery replacement, motherboard diagnostics and repair for all laptop brands.','icon'=>'computer-desktop','position'=>0,'is_active'=>true],
            ['title'=>'Desktop PC Repairs','description'=>'Full diagnostic and repair service for desktop computers, including component replacement and performance upgrades.','icon'=>'cpu-chip','position'=>1,'is_active'=>true],
            ['title'=>'Gaming PC Builds','description'=>'Custom gaming PC assembly with your choice of components. We test every build before delivery.','icon'=>'bolt','position'=>2,'is_active'=>true],
            ['title'=>'Hardware Diagnostics','description'=>'Comprehensive hardware testing to identify failing components before they cause data loss or downtime.','icon'=>'magnifying-glass','position'=>3,'is_active'=>true],
            ['title'=>'SSD & RAM Upgrades','description'=>'Speed up your existing computer with an SSD upgrade or additional RAM. Most upgrades completed same-day.','icon'=>'arrow-trending-up','position'=>4,'is_active'=>true],
            ['title'=>'Software Troubleshooting','description'=>'OS reinstallation, driver fixes, slow PC cleanup, and software configuration for Windows and macOS.','icon'=>'wrench-screwdriver','position'=>5,'is_active'=>true],
            ['title'=>'Virus & Malware Removal','description'=>'Professional removal of viruses, ransomware, and malware. Data recovery assistance where possible.','icon'=>'shield-check','position'=>6,'is_active'=>true],
            ['title'=>'Network Setup','description'=>'Home and office network setup, WiFi optimisation, and network security configuration.','icon'=>'wifi','position'=>7,'is_active'=>true],
            ['title'=>'Custom PC Consultation','description'=>'Not sure what to buy? Our experts will help you spec the perfect machine for your budget and use case.','icon'=>'chat-bubble-left-right','position'=>8,'is_active'=>true],
            ['title'=>'Data Recovery','description'=>'Professional data recovery from failed hard drives, SSDs, and corrupted storage media.','icon'=>'circle-stack','position'=>9,'is_active'=>true],
        ];
        foreach ($services as $s) Service::updateOrCreate(['title'=>$s['title']],$s);

        // FAQs
        $faqs = [
            ['question'=>'Do you deliver island-wide in Mauritius?','answer'=>'Yes! We deliver to all regions of Mauritius. Orders over Rs 5,000 qualify for free delivery. Standard delivery fee is Rs 250 for orders below that threshold.','position'=>0,'is_active'=>true],
            ['question'=>'What payment methods do you accept?','answer'=>'We accept JuiceByMCB mobile payments, bank transfer (MCB), and cash on collection from our showroom in Quatre Bornes. All prices are VAT-inclusive.','position'=>1,'is_active'=>true],
            ['question'=>'Are your products covered by warranty?','answer'=>'Yes, all products come with the manufacturer\'s warranty. Warranty duration varies by product and brand — check the product specifications for details.','position'=>2,'is_active'=>true],
            ['question'=>'Can I return or exchange a product?','answer'=>'We offer a 7-day return policy for unopened products in original packaging. Faulty products are covered by warranty. Contact us within 7 days of delivery to initiate a return.','position'=>3,'is_active'=>true],
            ['question'=>'Do you build custom gaming PCs?','answer'=>'Absolutely! Our technicians can assemble a custom PC from your chosen components. Visit our showroom or contact us to discuss your requirements and budget.','position'=>4,'is_active'=>true],
            ['question'=>'How do I track my order?','answer'=>'Once logged in, you can view your order status in your account dashboard under "My Orders". You will also receive email notifications when your order status changes.','position'=>5,'is_active'=>true],
        ];
        foreach ($faqs as $f) Faq::updateOrCreate(['question'=>$f['question']],$f);

        // About Page
        Page::updateOrCreate(['slug'=>'about'],[
            'title'=>'About Techno Tronics',
            'hero_title'=>'Mauritius\'s Premier Electronics & Gaming Destination',
            'hero_subtitle'=>'Quality products, expert advice, and genuine service since day one.',
            'content'=>[
                ['type'=>'story','heading'=>'Our Story','body'=>'<p>Techno Tronics Ltd was founded with a simple mission: to bring premium electronics and genuine tech expertise to the people of Mauritius. What started as a passion for technology grew into the island\'s most trusted destination for laptops, gaming hardware, and PC components.</p>'],
                ['type'=>'mission','heading'=>'Our Mission','body'=>'<p>To provide Mauritians with access to the world\'s best electronics brands at fair prices, backed by honest advice and outstanding after-sales support.</p>'],
                ['type'=>'vision','heading'=>'Our Vision','body'=>'<p>To be the technology partner of choice for every home, gamer, student, and business in Mauritius — growing alongside our customers as technology evolves.</p>'],
                ['type'=>'why','heading'=>'Why Choose Us?','body'=>'<ul><li>Genuine products with manufacturer warranty</li><li>Expert staff who use the products they sell</li><li>VAT-compliant invoicing for businesses</li><li>Same-day delivery in Port Louis</li><li>In-store repair and upgrade services</li></ul>'],
            ],
            'meta_title'=>'About Techno Tronics — Premium Electronics in Mauritius',
            'meta_description'=>'Learn about Techno Tronics Ltd, Mauritius\'s leading electronics and gaming hardware retailer based in Quatre Bornes.',
            'is_active'=>true,
        ]);

        // Contact & Social Settings
        $contactSettings = [
            'contact_address'      => 'Royal Road, Quatre Bornes, Mauritius',
            'contact_lat'          => '-20.2647',
            'contact_lng'          => '57.4756',
            'opening_hours'        => "Monday–Friday: 9:00 AM – 6:00 PM\nSaturday: 9:00 AM – 4:00 PM\nSunday: Closed",
            'social_facebook'      => 'https://facebook.com/technotronicsmu',
            'social_instagram'     => 'https://instagram.com/technotronicsmu',
            'social_twitter'       => '',
            'social_youtube'       => '',
            'show_featured_categories' => '1',
            'show_latest_products'     => '1',
            'show_best_sellers'        => '1',
            'show_brands'              => '1',
            'show_testimonials'        => '1',
            'show_services_overview'   => '1',
            'show_gaming_banner'       => '1',
            'show_newsletter'          => '1',
            'gaming_banner_title'      => 'Gaming World — Coming Soon',
            'gaming_banner_subtitle'   => 'The ultimate gaming configurator is being built. Be the first to know when it launches.',
            'gaming_banner_cta'        => 'Notify Me',
        ];
        foreach ($contactSettings as $k => $v) Setting::set($k, $v);

        // 3 Approved Reviews (need real user and product IDs)
        $customer = User::where('role','customer')->first();
        if ($customer) {
            $products = Product::whereIn('slug',['msi-titan-gt77-gaming-laptop','asus-rog-zephyrus-g15','corsair-vengeance-32gb-ddr5'])->get()->keyBy('slug');
            $reviewsData = [
                ['slug'=>'msi-titan-gt77-gaming-laptop','rating'=>5,'title'=>'Absolute beast of a laptop','body'=>'The MSI Titan GT77 is a desktop replacement in every sense. The 4K display and RTX 4090 handle everything I throw at it. Bought from Techno Tronics and it arrived next day, perfectly packaged.','status'=>'approved','is_verified_purchase'=>false],
                ['slug'=>'asus-rog-zephyrus-g15','rating'=>5,'title'=>'Best laptop for the price','body'=>'The Zephyrus G15 is incredible value. Battery life is great for work, and when I plug in for gaming it absolutely flies. The OLED panel is stunning. Highly recommend Techno Tronics for their service.','status'=>'approved','is_verified_purchase'=>false],
                ['slug'=>'corsair-vengeance-32gb-ddr5','rating'=>4,'title'=>'Solid DDR5 kit','body'=>'Good DDR5 kit, XMP profile worked first time. Noticed a slight improvement in performance over my old DDR4. Delivery was fast and well packaged.','status'=>'approved','is_verified_purchase'=>false],
            ];
            foreach ($reviewsData as $r) {
                if (isset($products[$r['slug']])) {
                    Review::updateOrCreate(
                        ['user_id'=>$customer->id,'product_id'=>$products[$r['slug']]->id],
                        ['rating'=>$r['rating'],'title'=>$r['title'],'body'=>$r['body'],'status'=>$r['status'],'is_verified_purchase'=>$r['is_verified_purchase']]
                    );
                }
            }
        }
    }
}
