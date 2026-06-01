<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationIcon = 'heroicon-o-cube';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make()->tabs([

                Forms\Components\Tabs\Tab::make('Details')->schema([
                    Forms\Components\TextInput::make('name')
                        ->required()
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn($state, Forms\Set $set, $old) => $old === Str::slug($old) ? $set('slug', Str::slug($state)) : null),
                    Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                    Forms\Components\TextInput::make('sku')->required()->unique(ignoreRecord: true),
                    Forms\Components\Select::make('category_id')->relationship('category', 'name')->required()->searchable()->preload(),
                    Forms\Components\Select::make('brand_id')->relationship('brand', 'name')->nullable()->searchable()->preload(),
                    Forms\Components\Select::make('status')->options(['active' => 'Active', 'draft' => 'Draft'])->required()->default('draft'),
                    Forms\Components\Toggle::make('is_featured')->label('Featured'),
                    Forms\Components\Toggle::make('is_best_seller')->label('Best Seller'),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('Pricing & Stock')->schema([
                    Forms\Components\TextInput::make('price')->required()->numeric()->prefix('Rs')->step(0.01),
                    Forms\Components\TextInput::make('sale_price')->numeric()->prefix('Rs')->step(0.01)->nullable(),
                    Forms\Components\TextInput::make('stock')->required()->numeric()->integer()->default(0),
                ])->columns(3),

                Forms\Components\Tabs\Tab::make('Description')->schema([
                    Forms\Components\RichEditor::make('description')->columnSpanFull(),
                ]),

                Forms\Components\Tabs\Tab::make('Specifications')->schema([
                    Forms\Components\Repeater::make('specs')
                        ->label('Spec Groups')
                        ->schema([
                            Forms\Components\TextInput::make('group')->label('Group Name')->required()->placeholder('e.g. Processor'),
                            Forms\Components\Repeater::make('items')
                                ->label('Specs')
                                ->schema([
                                    Forms\Components\TextInput::make('key')->required()->placeholder('e.g. CPU'),
                                    Forms\Components\TextInput::make('value')->required()->placeholder('e.g. Intel Core i9'),
                                ])
                                ->columns(2)
                                ->addActionLabel('Add Spec'),
                        ])
                        ->addActionLabel('Add Group')
                        ->columnSpanFull(),
                ]),

                Forms\Components\Tabs\Tab::make('Images')->schema([
                    Forms\Components\Repeater::make('images')
                        ->relationship()
                        ->schema([
                            Forms\Components\FileUpload::make('path')->required()->image()->disk('public')->directory('products'),
                            Forms\Components\TextInput::make('alt')->label('Alt Text'),
                            Forms\Components\TextInput::make('position')->numeric()->default(0),
                            Forms\Components\Toggle::make('is_primary')->label('Primary Image'),
                        ])
                        ->columns(2)
                        ->addActionLabel('Add Image'),
                ]),

                Forms\Components\Tabs\Tab::make('SEO')->schema([
                    Forms\Components\TextInput::make('meta_title')->maxLength(70),
                    Forms\Components\Textarea::make('meta_description')->rows(2)->maxLength(160),
                ])->columns(1),

            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('name')->searchable()->sortable()->limit(40),
            Tables\Columns\TextColumn::make('sku')->searchable()->copyable(),
            Tables\Columns\TextColumn::make('category.name')->sortable(),
            Tables\Columns\TextColumn::make('brand.name')->sortable()->placeholder('—'),
            Tables\Columns\TextColumn::make('price')->money('MUR')->sortable(),
            Tables\Columns\TextColumn::make('sale_price')->money('MUR')->placeholder('—'),
            Tables\Columns\TextColumn::make('stock')
                ->sortable()
                ->badge()
                ->color(fn($state) => $state === 0 ? 'danger' : ($state <= 5 ? 'warning' : 'success')),
            Tables\Columns\SelectColumn::make('status')
                ->options(['active' => 'Active', 'draft' => 'Draft']),
            Tables\Columns\IconColumn::make('is_featured')->boolean(),
            Tables\Columns\IconColumn::make('is_best_seller')->boolean(),
        ])
        ->defaultSort('created_at', 'desc')
        ->filters([
            Tables\Filters\SelectFilter::make('status')->options(['active' => 'Active', 'draft' => 'Draft']),
            Tables\Filters\SelectFilter::make('category')->relationship('category', 'name'),
            Tables\Filters\SelectFilter::make('brand')->relationship('brand', 'name'),
            Tables\Filters\Filter::make('out_of_stock')->query(fn($query) => $query->where('stock', 0))->label('Out of Stock'),
            Tables\Filters\Filter::make('low_stock')->query(fn($query) => $query->where('stock', '>', 0)->where('stock', '<=', 5))->label('Low Stock (≤5)'),
        ])
        ->actions([Tables\Actions\EditAction::make()])
        ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
