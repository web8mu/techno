<?php
namespace App\Filament\Resources\NewsletterResource\Pages;
use App\Filament\Resources\NewsletterResource;
use Filament\Resources\Pages\CreateRecord;
class CreateNewsletterSubscriber extends CreateRecord {
    protected static string $resource = NewsletterResource::class;
}
