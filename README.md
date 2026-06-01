# Techno Tronics Ltd — E-Commerce Platform

Monorepo for the Techno Tronics e-commerce platform. Two apps:

- `/backend` — Laravel 12 + Filament v3 (REST API + Admin Panel)
- `/storefront` — Next.js 14 App Router + TypeScript + TailwindCSS

---

## Local Development Setup

### Prerequisites
- PHP 8.3+, Composer 2+
- Node.js 20+, npm
- MySQL 8+

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DB_DATABASE, DB_USERNAME, DB_PASSWORD, FRONTEND_URL=http://localhost:3000
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve   # http://localhost:8000
```

**Admin panel:** http://localhost:8000/admin  
Login: `admin@technotronics.mu` / `password`

### Storefront

```bash
cd storefront
cp .env.local.example .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev   # http://localhost:3000
```

---

## Hostinger Cloud Startup Deployment

### Backend (PHP/LiteSpeed)
1. Upload `/backend` to Hostinger via Git or FTP
2. Set document root → `/backend/public`
3. Create MySQL database in hPanel; update `.env`
4. SSH in and run:
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan key:generate
   php artisan migrate --seed
   php artisan storage:link
   php artisan config:cache && php artisan route:cache
   ```
5. `.env` production values:
   ```
   APP_URL=https://api.technotronics.mu
   FRONTEND_URL=https://technotronics.mu
   SESSION_DOMAIN=.technotronics.mu
   SANCTUM_STATEFUL_DOMAINS=technotronics.mu
   SESSION_DRIVER=cookie
   ```

### Storefront (Node.js Web App)
1. Connect GitHub repo in Hostinger hPanel → Node.js Web App
2. Root directory: `storefront`
3. Build command: `npm run build`
4. Start command: `npm start`
5. Environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.technotronics.mu
   NEXT_PUBLIC_APP_URL=https://technotronics.mu
   ```

### Sanctum Cross-Subdomain Auth
Both apps run under `technotronics.mu`. Sanctum uses stateful cookies shared across subdomains:
- `SESSION_DOMAIN=.technotronics.mu` (leading dot required)
- `SANCTUM_STATEFUL_DOMAINS=technotronics.mu`
- CORS `FRONTEND_URL=https://technotronics.mu`
- `supports_credentials: true` in `config/cors.php`

For local dev, the storefront at `localhost:3000` talks to the API at `localhost:8000` — no subdomain needed; Sanctum's stateful domain list includes `localhost:3000` by default.

---

## Seed Credentials

| Role     | Email                       | Password   |
|----------|-----------------------------|------------|
| Admin    | admin@technotronics.mu      | password   |
| Customer | customer@example.com        | password   |

30 products across 6 categories, 8 brands. Settings pre-loaded with Mauritius business details, 15% VAT, Rs 5,000 free-delivery threshold, Rs 250 flat delivery fee.

---

## Phase 1 — What's Built

- ✅ Full database schema (migrations + seeders)
- ✅ Laravel REST API: catalog, cart, auth (Sanctum), checkout, orders, sitemap
- ✅ Filament v3 admin: Products, Categories, Brands, Orders, Settings, Shopify CSV Importer
- ✅ Payment driver architecture: JuiceByMCB, Bank Transfer, Cash (driver pattern ready for online gateways)
- ✅ Stock decrement with DB transactions + pessimistic locking (oversell protected)
- ✅ VAT-compliant invoice PDF (DomPDF)
- ✅ Transactional emails via Zoho SMTP: order confirmation, payment verified, fulfillment update, new-order staff notification
- ✅ Cart persistence: guest (session token cookie) + authenticated user, merge on login
- ✅ Checkout: server-side total recomputation, delivery fee rule, VAT breakdown
- ✅ Manual payment flow: JuiceByMCB / Bank Transfer / Cash + proof-of-payment upload
- ✅ Storefront: Homepage, Shop (filters/sort/search/pagination), Product detail, Cart, Checkout, Order Confirmation, Auth pages, Gaming World placeholder
- ✅ Baseline SEO: per-page meta, OG tags, JSON-LD Product + Organization schema, sitemap.xml, robots.txt, llms.txt
- ✅ GA4 + Meta Pixel tracking: view_item, add_to_cart, begin_checkout, purchase
- ✅ Dark / Light mode with stored preference
- ✅ Shopify CSV importer with preview → import → results UI

---

## Phase 2/3 Hooks Left in Place

### Phase 2 (ready to build)
- `addresses` table + `Address` model fully migrated — address book UI deferred
- `coupons` table fully migrated, scaffolded in cart — full coupon management UI deferred
- `orders.fulfillment_status` full state machine values in place
- `categories.parent_id` supports mega-menu hierarchy — mega menu deferred
- GA4 + Meta Pixel IDs editable in admin Settings — just populate at launch
- Newsletter system: table + signup deferred (Zoho SMTP already configured)
- Customer dashboard (order history, reorder, profile edit) — routes not yet created
- About / Services / Contact CMS pages — deferred
- Homepage hero slider admin — static banner now; Filament-managed slider deferred
- Testimonials — deferred
- Reviews & ratings — deferred

### Phase 3 (Gaming World)
- `/gaming-world` route exists as "Coming Soon" placeholder
- No configurator or compatibility engine built
- `PaymentDriverInterface` (`App\Contracts\PaymentDriverInterface`) is ready — implement a new driver class and register it in `PaymentDriverFactory::make()` to add MIPS or any other online gateway without touching checkout flow
