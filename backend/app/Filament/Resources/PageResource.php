<?php
namespace App\Filament\Resources;

use App\Filament\Resources\PageResource\Pages;
use App\Models\Page;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PageResource extends Resource {
    protected static ?string $model = Page::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 7;
    protected static ?string $navigationLabel = 'CMS Pages';

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Section::make('Page Info')->schema([
                Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('title')->required(),
                Forms\Components\Toggle::make('is_active')->default(true),
            ])->columns(3),
            Forms\Components\Section::make('Hero')->schema([
                Forms\Components\TextInput::make('hero_title'),
                Forms\Components\TextInput::make('hero_subtitle'),
                Forms\Components\FileUpload::make('hero_image_path')->image()->disk('public')->directory('pages'),
            ])->columns(3),
            Forms\Components\Section::make('Content Blocks')->schema([
                Forms\Components\Repeater::make('content')
                    ->schema([
                        Forms\Components\TextInput::make('type')->default('text')->required(),
                        Forms\Components\TextInput::make('heading')->nullable(),
                        Forms\Components\RichEditor::make('body'),
                    ])
                    ->addActionLabel('Add Content Block')
                    ->columnSpanFull(),
            ]),
            Forms\Components\Section::make('SEO')->schema([
                Forms\Components\TextInput::make('meta_title')->maxLength(70),
                Forms\Components\Textarea::make('meta_description')->rows(2)->maxLength(160),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('slug')->searchable(),
            Tables\Columns\TextColumn::make('title')->searchable(),
            Tables\Columns\IconColumn::make('is_active')->boolean(),
            Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable(),
        ])
        ->actions([Tables\Actions\EditAction::make()]);
    }

    public static function getRelations(): array { return []; }
    public static function getPages(): array {
        return [
            'index' => Pages\ListPages::route('/'),
            'create' => Pages\CreatePage::route('/create'),
            'edit' => Pages\EditPage::route('/{record}/edit'),
        ];
    }
}
