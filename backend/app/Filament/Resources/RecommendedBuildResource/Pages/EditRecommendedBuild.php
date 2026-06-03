<?php

namespace App\Filament\Resources\RecommendedBuildResource\Pages;

use App\Filament\Resources\RecommendedBuildResource;
use Filament\Resources\Pages\EditRecord;

class EditRecommendedBuild extends EditRecord
{
    protected static string $resource = RecommendedBuildResource::class;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        // Pre-populate slot selects from pivot table
        foreach ($this->record->products as $product) {
            $slot = $product->pivot->slot;
            $data["slot_{$slot}"] = $product->id;
        }
        return $data;
    }

    protected function afterSave(): void
    {
        $record = $this->record;
        $data = $this->data;
        $slots = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'cooler', 'case'];
        $sync = [];
        foreach ($slots as $slot) {
            $productId = $data["slot_{$slot}"] ?? null;
            if ($productId) {
                $sync[$productId] = ['slot' => $slot];
            }
        }
        $record->products()->sync($sync);
    }
}
