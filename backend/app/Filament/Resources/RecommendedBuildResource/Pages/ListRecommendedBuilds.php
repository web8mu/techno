<?php

namespace App\Filament\Resources\RecommendedBuildResource\Pages;

use App\Filament\Resources\RecommendedBuildResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRecommendedBuilds extends ListRecords
{
    protected static string $resource = RecommendedBuildResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
