<?php
namespace App\Filament\Resources;

use App\Filament\Resources\HeroSlideResource\Pages;
use App\Models\HeroSlide;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class HeroSlideResource extends Resource {
    protected static ?string $model = HeroSlide::class;
    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationGroup = 'Homepage';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\TextInput::make('title')->required(),
            Forms\Components\TextInput::make('subtitle'),
            Forms\Components\TextInput::make('button_text'),
            Forms\Components\TextInput::make('button_url'),
            Forms\Components\FileUpload::make('background_image_path')->label('Desktop Image')->image()->disk('public')->directory('hero'),
            Forms\Components\FileUpload::make('mobile_image_path')->label('Mobile Image')->image()->disk('public')->directory('hero'),
            Forms\Components\TextInput::make('position')->numeric()->default(0),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\ImageColumn::make('background_image_path')->disk('public')->label('Image'),
            Tables\Columns\TextColumn::make('title')->searchable(),
            Tables\Columns\TextColumn::make('button_text'),
            Tables\Columns\TextColumn::make('position')->sortable(),
            Tables\Columns\IconColumn::make('is_active')->boolean(),
        ])->defaultSort('position')
        ->reorderable('position')
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getRelations(): array { return []; }
    public static function getPages(): array {
        return [
            'index' => Pages\ListHeroSlides::route('/'),
            'create' => Pages\CreateHeroSlide::route('/create'),
            'edit' => Pages\EditHeroSlide::route('/{record}/edit'),
        ];
    }
}
