<?php
namespace App\Filament\Resources;

use App\Filament\Resources\ContactMessageResource\Pages;
use App\Models\ContactMessage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContactMessageResource extends Resource {
    protected static ?string $model = ContactMessage::class;
    protected static ?string $navigationIcon = 'heroicon-o-inbox';
    protected static ?string $navigationGroup = 'Content';
    protected static ?string $navigationLabel = 'Contact Inbox';
    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\TextInput::make('name')->disabled(),
            Forms\Components\TextInput::make('email')->disabled(),
            Forms\Components\TextInput::make('phone')->disabled(),
            Forms\Components\TextInput::make('subject')->disabled(),
            Forms\Components\Textarea::make('message')->disabled()->rows(5)->columnSpanFull(),
            Forms\Components\Toggle::make('is_read'),
        ])->columns(2);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\IconColumn::make('is_read')->boolean()->label('Read'),
            Tables\Columns\TextColumn::make('name')->searchable(),
            Tables\Columns\TextColumn::make('email')->searchable(),
            Tables\Columns\TextColumn::make('subject')->limit(50)->searchable(),
            Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->label('Received'),
        ])
        ->defaultSort('created_at','desc')
        ->filters([
            Tables\Filters\Filter::make('unread')->query(fn($q)=>$q->where('is_read',false))->label('Unread only'),
        ])
        ->actions([
            Tables\Actions\Action::make('mark_read')
                ->label('Mark Read')->icon('heroicon-o-check')
                ->visible(fn(ContactMessage $m)=>!$m->is_read)
                ->action(fn(ContactMessage $m)=>$m->update(['is_read'=>true])),
            Tables\Actions\ViewAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getRelations(): array { return []; }
    public static function getPages(): array {
        return [
            'index' => Pages\ListContactMessages::route('/'),
            'view' => Pages\ViewContactMessage::route('/{record}'),
        ];
    }
}
