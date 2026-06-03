<?php

namespace App\Filament\Resources\RecommendedBuildResource\Pages;

use App\Filament\Resources\RecommendedBuildResource;
use Filament\Resources\Pages\CreateRecord;

class CreateRecommendedBuild extends CreateRecord
{
    protected static string $resource = RecommendedBuildResource::class;

    protected function afterCreate(): void
    {
        $this->syncSlotComponents();
    }

    private function syncSlotComponents(): void
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
