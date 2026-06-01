<?php

namespace App\Filament\Pages;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Str;
use League\Csv\Reader;

class ShopifyImportPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-up-tray';
    protected static string $view = 'filament.pages.shopify-import';
    protected static ?string $navigationLabel = 'Shopify Import';
    protected static ?string $title = 'Import from Shopify CSV';
    protected static ?string $navigationGroup = 'Configuration';

    public ?array $data = [];
    public array $preview = [];
    public array $results = [];
    public bool $imported = false;

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\FileUpload::make('csv_file')
                ->label('Shopify Product Export CSV')
                ->required()
                ->acceptedFileTypes(['text/csv', 'text/plain', 'application/csv'])
                ->disk('local')
                ->directory('shopify-imports'),
        ])->statePath('data');
    }

    public function preview(): void
    {
        $data = $this->form->getState();
        if (empty($data['csv_file'])) return;

        $path = storage_path('app/private/' . $data['csv_file']);
        if (!file_exists($path)) $path = storage_path('app/' . $data['csv_file']);
        if (!file_exists($path)) { Notification::make()->title('File not found')->danger()->send(); return; }

        $csv = Reader::createFromPath($path, 'r');
        $csv->setHeaderOffset(0);
        $this->preview = array_slice(iterator_to_array($csv->getRecords()), 0, 5);
        Notification::make()->title('Preview loaded — showing first 5 rows')->info()->send();
    }

    public function import(): void
    {
        $data = $this->form->getState();
        if (empty($data['csv_file'])) return;

        $path = storage_path('app/private/' . $data['csv_file']);
        if (!file_exists($path)) $path = storage_path('app/' . $data['csv_file']);
        if (!file_exists($path)) { Notification::make()->title('File not found')->danger()->send(); return; }

        $csv = Reader::createFromPath($path, 'r');
        $csv->setHeaderOffset(0);
        $rows = iterator_to_array($csv->getRecords());

        // Group by Handle
        $grouped = [];
        foreach ($rows as $row) {
            $handle = $row['Handle'] ?? '';
            if (!$handle) continue;
            $grouped[$handle][] = $row;
        }

        $created = 0; $updated = 0; $skipped = 0; $errors = [];

        foreach ($grouped as $handle => $productRows) {
            try {
                $main = $productRows[0];
                $title = $main['Title'] ?? $handle;
                $vendor = $main['Vendor'] ?? '';
                $type = $main['Product Category'] ?? $main['Type'] ?? '';
                $bodyHtml = $main['Body (HTML)'] ?? '';
                $seoTitle = $main['SEO Title'] ?? '';
                $seoDesc = $main['SEO Description'] ?? '';
                $status = strtolower($main['Status'] ?? 'active') === 'active' ? 'active' : 'draft';

                // Resolve brand
                $brand = null;
                if ($vendor) {
                    $brand = Brand::firstOrCreate(
                        ['slug' => Str::slug($vendor)],
                        ['name' => $vendor]
                    );
                }

                // Resolve category
                $category = null;
                if ($type) {
                    $category = Category::firstOrCreate(
                        ['slug' => Str::slug($type)],
                        ['name' => $type]
                    );
                }

                // Find variant row with SKU
                $variantRow = collect($productRows)->first(fn($r) => !empty($r['Variant SKU'] ?? '')) ?? $main;
                $sku = $variantRow['Variant SKU'] ?? $handle;
                $price = (float) ($variantRow['Variant Price'] ?? 0);
                $compareAt = (float) ($variantRow['Variant Compare At Price'] ?? 0);
                $stock = (int) ($variantRow['Variant Inventory Qty'] ?? 0);

                $finalPrice = $compareAt > $price ? $compareAt : $price;
                $salePrice = $compareAt > $price ? $price : null;

                $product = Product::updateOrCreate(
                    ['sku' => $sku],
                    [
                        'name' => $title,
                        'slug' => Str::slug($handle),
                        'category_id' => $category?->id,
                        'brand_id' => $brand?->id,
                        'description' => $bodyHtml,
                        'price' => $finalPrice,
                        'sale_price' => $salePrice,
                        'stock' => max(0, $stock),
                        'status' => $status,
                        'meta_title' => $seoTitle ?: $title,
                        'meta_description' => $seoDesc,
                        'specs' => [],
                    ]
                );

                // Handle images
                $images = collect($productRows)
                    ->pluck('Image Src')
                    ->filter()
                    ->unique()
                    ->values();

                if ($images->isNotEmpty() && $product->wasRecentlyCreated) {
                    $product->images()->delete();
                    foreach ($images as $i => $src) {
                        $product->images()->create([
                            'path' => $src,
                            'alt' => $title,
                            'position' => $i,
                            'is_primary' => $i === 0,
                        ]);
                    }
                }

                $product->wasRecentlyCreated ? $created++ : $updated++;
            } catch (\Exception $e) {
                $errors[] = "Handle {$handle}: " . $e->getMessage();
                $skipped++;
            }
        }

        $this->results = compact('created', 'updated', 'skipped', 'errors');
        $this->imported = true;
        Notification::make()->title("Import complete: {$created} created, {$updated} updated, {$skipped} skipped")->success()->send();
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('preview')->label('Preview')->action('preview'),
            Action::make('import')->label('Import')->color('success')->action('import'),
        ];
    }
}
