<x-filament-panels::page>
    @if($step === 'upload')
        <div class="p-6 bg-white rounded-xl shadow">
            <h2 class="text-lg font-semibold mb-4">Step 1: Upload Shopify CSV</h2>
            <p class="text-gray-600 mb-4">Export your products from Shopify admin (Products > Export), then upload the CSV file here.</p>
            <form wire:submit="preview">
                {{ $this->form }}
                <div class="mt-4">
                    <x-filament::button type="submit">Preview CSV</x-filament::button>
                </div>
            </form>
        </div>

    @elseif($step === 'preview')
        <div class="p-6 bg-white rounded-xl shadow">
            <h2 class="text-lg font-semibold mb-4">Step 2: Preview (First 5 Rows)</h2>
            @if(count($previewRows) > 0)
                <div class="overflow-x-auto mb-6">
                    <table class="min-w-full text-sm border">
                        <thead class="bg-gray-100">
                            <tr>
                                @foreach(array_keys($previewRows[0]) as $col)
                                    <th class="px-3 py-2 border text-left font-medium">{{ $col }}</th>
                                @endforeach
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($previewRows as $row)
                                <tr class="odd:bg-white even:bg-gray-50">
                                    @foreach($row as $cell)
                                        <td class="px-3 py-2 border max-w-[200px] truncate">{{ $cell }}</td>
                                    @endforeach
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <p class="text-gray-600 mb-4">The import will map: Handle → slug, Title → name, Vendor → brand, Product Category → category, Variant SKU → sku, Variant Price → price, Variant Compare At Price → sale price, Variant Inventory Qty → stock, Image Src → images, SEO Title/Description → meta fields.</p>
                <div class="flex gap-3">
                    <x-filament::button wire:click="import" color="success">
                        Step 3: Run Import
                    </x-filament::button>
                    <x-filament::button wire:click="resetImport" color="gray">
                        Start Over
                    </x-filament::button>
                </div>
            @else
                <p>No rows found in CSV.</p>
            @endif
        </div>

    @elseif($step === 'done')
        <div class="p-6 bg-white rounded-xl shadow">
            <h2 class="text-lg font-semibold mb-4">Import Results</h2>
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p class="text-3xl font-bold text-green-600">{{ $importResults['created'] ?? 0 }}</p>
                    <p class="text-sm text-green-700">Created</p>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p class="text-3xl font-bold text-blue-600">{{ $importResults['updated'] ?? 0 }}</p>
                    <p class="text-sm text-blue-700">Updated</p>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p class="text-3xl font-bold text-yellow-600">{{ $importResults['skipped'] ?? 0 }}</p>
                    <p class="text-sm text-yellow-700">Skipped</p>
                </div>
            </div>

            @if(!empty($importResults['errors']))
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-red-700 mb-2">Errors</h3>
                    <ul class="text-sm text-red-600 list-disc list-inside">
                        @foreach($importResults['errors'] as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <x-filament::button wire:click="resetImport">
                Import Another File
            </x-filament::button>
        </div>
    @endif
</x-filament-panels::page>
