<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RecommendedBuildResource\Pages;
use App\Models\Product;
use App\Models\RecommendedBuild;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RecommendedBuildResource extends Resource
{
    protected static ?string $model = RecommendedBuild::class;
    protected static ?string $navigationIcon = 'heroicon-o-computer-desktop';
    protected static ?string $navigationGroup = 'Gaming World';
    protected static ?string $navigationLabel = 'Recommended Builds';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        $slotOptions = fn(string $type) => Product::whereHas(
            'componentAttribute',
            fn($q) => $q->where('component_type', $type)
        )->pluck('name', 'id');

        return $form->schema([
            Forms\Components\TextInput::make('name')->required()->columnSpanFull(),
            Forms\Components\Select::make('budget_tier')
                ->options([
                    25000  => 'Rs 25,000',
                    50000  => 'Rs 50,000',
                    75000  => 'Rs 75,000',
                    100000 => 'Rs 100,000',
                    150000 => 'Rs 150,000',
                    200000 => 'Rs 200,000',
                ])->required(),
            Forms\Components\Toggle::make('is_active')->label('Active')->default(true),

            Forms\Components\Section::make('Components')->schema([
                Forms\Components\Select::make('slot_cpu')
                    ->label('CPU')
                    ->options(fn() => $slotOptions('cpu'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\Select::make('slot_motherboard')
                    ->label('Motherboard')
                    ->options(fn() => $slotOptions('motherboard'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\Select::make('slot_ram')
                    ->label('RAM')
                    ->options(fn() => $slotOptions('ram'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\Select::make('slot_gpu')
                    ->label('GPU')
                    ->options(fn() => $slotOptions('gpu'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\Select::make('slot_storage')
                    ->label('Storage')
                    ->options(fn() => $slotOptions('storage'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\Select::make('slot_psu')
                    ->label('PSU')
                    ->options(fn() => $slotOptions('psu'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\Select::make('slot_cooler')
                    ->label('Cooler')
                    ->options(fn() => $slotOptions('cooler'))
                    ->searchable()
                    ->nullable(),
                Forms\Components\Select::make('slot_case')
                    ->label('Case')
                    ->options(fn() => $slotOptions('case'))
                    ->searchable()
                    ->nullable(),
            ])->columns(2)->columnSpanFull(),
        ])->columns(2);
    }

    public static function mutateFormDataBeforeCreate(array $data): array
    {
        return self::extractSlots($data);
    }

    public static function mutateFormDataBeforeUpdate(array $data): array
    {
        return self::extractSlots($data);
    }

    private static function extractSlots(array $data): array
    {
        // Slot selects are handled via afterSave hooks in pages
        return $data;
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
            Tables\Columns\TextColumn::make('budget_tier')
                ->money('MUR')
                ->label('Budget Tier')
                ->sortable(),
            Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
            Tables\Columns\TextColumn::make('products_count')
                ->counts('products')
                ->label('Components'),
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
            'index'  => Pages\ListRecommendedBuilds::route('/'),
            'create' => Pages\CreateRecommendedBuild::route('/create'),
            'edit'   => Pages\EditRecommendedBuild::route('/{record}/edit'),
        ];
    }
}
