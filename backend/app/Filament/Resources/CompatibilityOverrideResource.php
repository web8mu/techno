<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CompatibilityOverrideResource\Pages;
use App\Models\CompatibilityOverride;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CompatibilityOverrideResource extends Resource
{
    protected static ?string $model = CompatibilityOverride::class;
    protected static ?string $navigationIcon = 'heroicon-o-exclamation-triangle';
    protected static ?string $navigationGroup = 'Gaming World';
    protected static ?string $navigationLabel = 'Compatibility Overrides';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('component_a_id')
                ->label('Component A')
                ->options(fn() => Product::whereHas('componentAttribute')->pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\Select::make('component_b_id')
                ->label('Component B')
                ->options(fn() => Product::whereHas('componentAttribute')->pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\Select::make('effect')
                ->options(['block' => 'Block (hard error)', 'warn' => 'Warn (soft warning)'])
                ->required(),
            Forms\Components\TextInput::make('message')
                ->required()
                ->maxLength(255)
                ->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('componentA.name')->label('Component A')->searchable()->limit(40),
            Tables\Columns\TextColumn::make('componentB.name')->label('Component B')->searchable()->limit(40),
            Tables\Columns\BadgeColumn::make('effect')
                ->colors(['danger' => 'block', 'warning' => 'warn']),
            Tables\Columns\TextColumn::make('message')->limit(60),
            Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
        ])
        ->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListCompatibilityOverrides::route('/'),
            'create' => Pages\CreateCompatibilityOverride::route('/create'),
            'edit'   => Pages\EditCompatibilityOverride::route('/{record}/edit'),
        ];
    }
}
