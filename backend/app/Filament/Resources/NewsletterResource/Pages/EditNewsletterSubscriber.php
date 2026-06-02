<?php
namespace App\Filament\Resources\NewsletterResource\Pages;
use App\Filament\Resources\NewsletterResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditNewsletterSubscriber extends EditRecord {
    protected static string $resource = NewsletterResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
