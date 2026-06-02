<?php
namespace App\Filament\Resources;

use App\Filament\Resources\NewsletterResource\Pages;
use App\Models\NewsletterSubscriber;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class NewsletterResource extends Resource {
    protected static ?string $model = NewsletterSubscriber::class;
    protected static ?string $navigationIcon = 'heroicon-o-envelope';
    protected static ?string $navigationGroup = 'Content';
    protected static ?string $navigationLabel = 'Newsletter';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\TextInput::make('email')->email()->required(),
            Forms\Components\TextInput::make('name'),
            Forms\Components\Select::make('status')->options(['subscribed'=>'Subscribed','unsubscribed'=>'Unsubscribed'])->required(),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('email')->searchable()->copyable(),
            Tables\Columns\TextColumn::make('name')->searchable(),
            Tables\Columns\TextColumn::make('status')->badge()->color(fn($s)=>$s==='subscribed'?'success':'gray'),
            Tables\Columns\TextColumn::make('subscribed_at')->dateTime()->sortable(),
        ])
        ->defaultSort('subscribed_at','desc')
        ->filters([
            Tables\Filters\SelectFilter::make('status')->options(['subscribed'=>'Subscribed','unsubscribed'=>'Unsubscribed']),
        ])
        ->headerActions([
            Tables\Actions\Action::make('export_csv')
                ->label('Export CSV')
                ->icon('heroicon-o-arrow-down-tray')
                ->action(function () {
                    $rows = NewsletterSubscriber::where('status','subscribed')->get();
                    $csv = "Name,Email,Subscribed At\n";
                    foreach ($rows as $r) {
                        $csv .= "\"{$r->name}\",\"{$r->email}\",\"{$r->subscribed_at}\"\n";
                    }
                    return response()->streamDownload(fn()=>print($csv), 'newsletter-subscribers.csv', ['Content-Type'=>'text/csv']);
                }),
        ])
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getRelations(): array { return []; }
    public static function getPages(): array {
        return [
            'index' => Pages\ListNewsletterSubscribers::route('/'),
            'create' => Pages\CreateNewsletterSubscriber::route('/create'),
            'edit' => Pages\EditNewsletterSubscriber::route('/{record}/edit'),
        ];
    }
}
