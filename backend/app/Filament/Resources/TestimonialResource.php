<?php
namespace App\Filament\Resources;

use App\Filament\Resources\TestimonialResource\Pages;
use App\Models\Testimonial;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TestimonialResource extends Resource {
    protected static ?string $model = Testimonial::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-ellipsis';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\TextInput::make('author_name')->required(),
            Forms\Components\TextInput::make('role_company'),
            Forms\Components\Textarea::make('content')->required()->rows(3),
            Forms\Components\FileUpload::make('avatar_path')->image()->disk('public')->directory('testimonials'),
            Forms\Components\Select::make('rating')->options([5=>'5 stars',4=>'4 stars',3=>'3 stars',2=>'2 stars',1=>'1 star'])->nullable(),
            Forms\Components\TextInput::make('position')->numeric()->default(0),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\ImageColumn::make('avatar_path')->disk('public')->circular(),
            Tables\Columns\TextColumn::make('author_name')->searchable(),
            Tables\Columns\TextColumn::make('role_company'),
            Tables\Columns\TextColumn::make('content')->limit(50),
            Tables\Columns\TextColumn::make('rating')->badge()->color('warning'),
            Tables\Columns\TextColumn::make('position')->sortable(),
            Tables\Columns\IconColumn::make('is_active')->boolean(),
        ])->defaultSort('position')
        ->reorderable('position')
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getRelations(): array { return []; }
    public static function getPages(): array {
        return [
            'index' => Pages\ListTestimonials::route('/'),
            'create' => Pages\CreateTestimonial::route('/create'),
            'edit' => Pages\EditTestimonial::route('/{record}/edit'),
        ];
    }
}
