<?php

namespace App\Filament\Pages;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
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
    protected static ?string $navigationLabel = 'Shopify Import';
    protected static ?string $navigationGroup = 'Configuration';
    protected static string $view = 'filament.pages.shopify-import-page';
    protected static ?int $navigationSort = 11;

    public ?array $data = [];
    public array $previewRows = [];
    public array $importResults = [];
    public string $step = 'upload'; // upload, preview, done

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\FileUpload::make('csv_file')
                    ->label('Shopify Products CSV')
                    ->acceptedFileTypes(['text/csv', 'application/csv', 'text/plain'])
                    ->disk('local')
                    ->directory('imports')
                    ->required(),
            ])
            ->statePath('data');
    }

    public function preview(): void
    {
        $data = $this->form->getState();
        $path = storage_path('app/' . $data['csv_file']);

        if (!file_exists($path)) {
            Notification::make()->title('File not found.')->danger()->send();
            return;
        }

        $csv = Reader::createFromPath($path, 'r');
        $csv->setHeaderOffset(0);

        $this->previewRows = collect($csv->getRecords())->take(5)->values()->toArray();
        $this->step = 'preview';
    }

    public function import(): void
    {
        $data = $this->form->getState();
        $path = storage_path('app/' . $data['csv_file']);

        if (!file_exists($path)) {
            Notification::make()->title('File not found.')->danger()->send();
            return;
        }

        $csv = Reader::createFromPath($path, 'r');
        $csv->setHeaderOffset(0);

        $records = collect($csv->getRecords())->toArray();

        // Group rows by Handle (Shopify's product identifier)
        $grouped = [];
        foreach ($records as $row) {
            $handle = $row['Handle'] ?? null;
            if ($handle) {
                $grouped[$handle][] = $row;
            }
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];

        foreach ($grouped as $handle => $rows) {
            try {
                $firstRow = $rows[0];

                $title = $firstRow['Title'] ?? '';
                if (empty($title)) {
                    $skipped++;
                    continue;
                }

                // Resolve or create category
                $categoryName = $firstRow['Product Category'] ?? $firstRow['Type'] ?? 'Uncategorized';
                $category = Category::firstOrCreate(
                    ['slug' => Str::slug($categoryName)],
                    ['name' => $categoryName, 'slug' => Str::slug($categoryName)]
                );

                // Resolve or create brand
                $brandName = $firstRow['Vendor'] ?? null;
                $brand = null;
                if ($brandName) {
                    $brand = Brand::firstOrCreate(
                        ['slug' => Str::slug($brandName)],
                        ['name' => $brandName, 'slug' => Str::slug($brandName)]
                    );
                }

                $sku = $firstRow['Variant SKU'] ?? 'SKU-' . strtoupper($handle);
                $price = (float) ($firstRow['Variant Price'] ?? 0);
                $comparePrice = !empty($firstRow['Variant Compare At Price']) ? (float) $firstRow['Variant Compare At Price'] : null;
                $stock = (int) ($firstRow['Variant Inventory Qty'] ?? 0);
                $status = strtolower($firstRow['Status'] ?? 'draft') === 'active' ? 'active' : 'draft';
                $description = $firstRow['Body HTML'] ?? '';

                $productData = [
                    'name' => $title,
                    'category_id' => $category->id,
                    'brand_id' => $brand?->id,
                    'description' => $description,
                    'price' => $price,
                    'sale_price' => $comparePrice && $comparePrice > $price ? $price : null,
                    'stock' => $stock,
                    'status' => $status,
                    'meta_title' => $firstRow['SEO Title'] ?? '',
                    'meta_description' => $firstRow['SEO Description'] ?? '',
                ];

                $existing = Product::where('slug', Str::slug($title))
                    ->orWhere('sku', $sku)
                    ->first();

                if ($existing) {
                    $existing->update($productData);
                    $product = $existing;
                    $updated++;
                } else {
                    $productData['slug'] = Str::slug($title);
                    $productData['sku'] = $sku;
                    $product = Product::create($productData);
                    $created++;
                }

                // Import images
                $imagePosition = 0;
                foreach ($rows as $row) {
                    $imageSrc = $row['Image Src'] ?? null;
                    if ($imageSrc) {
                        ProductImage::updateOrCreate(
                            ['product_id' => $product->id, 'path' => $imageSrc],
                            [
                                'alt' => $row['Image Alt Text'] ?? $title,
                                'position' => $imagePosition,
                                'is_primary' => $imagePosition === 0,
                            ]
                        );
                        $imagePosition++;
                    }
                }

            } catch (\Exception $e) {
                $errors[] = "Handle '{$handle}': " . $e->getMessage();
                $skipped++;
            }
        }

        $this->importResults = compact('created', 'updated', 'skipped', 'errors');
        $this->step = 'done';

        Notification::make()
            ->title("Import complete! Created: {$created}, Updated: {$updated}, Skipped: {$skipped}")
            ->success()
            ->send();
    }

    public function resetImport(): void
    {
        $this->step = 'upload';
        $this->previewRows = [];
        $this->importResults = [];
        $this->form->fill([]);
    }
}
