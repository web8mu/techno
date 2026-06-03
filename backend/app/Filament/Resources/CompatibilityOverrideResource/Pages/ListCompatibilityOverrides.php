<?php

namespace App\Filament\Resources\CompatibilityOverrideResource\Pages;

use App\Filament\Resources\CompatibilityOverrideResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCompatibilityOverrides extends ListRecords
{
    protected static string $resource = CompatibilityOverrideResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
