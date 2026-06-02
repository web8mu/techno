<?php
namespace App\Filament\Resources;

use App\Filament\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ReviewResource extends Resource {
    protected static ?string $model = Review::class;
    protected static ?string $navigationIcon = 'heroicon-o-star';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Select::make('status')
                ->options(['pending'=>'Pending','approved'=>'Approved','rejected'=>'Rejected'])
                ->required(),
            Forms\Components\TextInput::make('rating')->numeric()->disabled(),
            Forms\Components\TextInput::make('title')->disabled(),
            Forms\Components\Textarea::make('body')->disabled()->rows(3),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('product.name')->label('Product')->searchable()->limit(30),
            Tables\Columns\TextColumn::make('user.name')->label('Customer')->searchable(),
            Tables\Columns\TextColumn::make('rating')->badge()->color(fn($s)=>$s>=4?'success':($s>=3?'warning':'danger')),
            Tables\Columns\TextColumn::make('title')->limit(40),
            Tables\Columns\TextColumn::make('status')->badge()->color(fn($s)=>match($s){'approved'=>'success','rejected'=>'danger',default=>'warning'}),
            Tables\Columns\IconColumn::make('is_verified_purchase')->boolean()->label('Verified'),
            Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
        ])
        ->defaultSort('created_at','desc')
        ->filters([
            Tables\Filters\SelectFilter::make('status')->options(['pending'=>'Pending','approved'=>'Approved','rejected'=>'Rejected']),
        ])
        ->actions([
            Tables\Actions\Action::make('approve')
                ->icon('heroicon-o-check-circle')->color('success')
                ->visible(fn(Review $r)=>$r->status!=='approved')
                ->action(fn(Review $r)=>$r->update(['status'=>'approved'])),
            Tables\Actions\Action::make('reject')
                ->icon('heroicon-o-x-circle')->color('danger')
                ->visible(fn(Review $r)=>$r->status!=='rejected')
                ->action(fn(Review $r)=>$r->update(['status'=>'rejected'])),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getRelations(): array { return []; }
    public static function getPages(): array {
        return ['index' => Pages\ListReviews::route('/')];
    }
}
