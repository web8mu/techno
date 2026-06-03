<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BuildRequestResource\Pages;
use App\Models\BuildRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BuildRequestResource extends Resource
{
    protected static ?string $model = BuildRequest::class;
    protected static ?string $navigationIcon = 'heroicon-o-wrench-screwdriver';
    protected static ?string $navigationGroup = 'Gaming World';
    protected static ?string $navigationLabel = 'Build Requests';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->disabled(),
            Forms\Components\TextInput::make('email')->disabled(),
            Forms\Components\TextInput::make('phone')->disabled(),
            Forms\Components\Select::make('status')
                ->options([
                    'new'       => 'New',
                    'contacted' => 'Contacted',
                    'quoted'    => 'Quoted',
                    'closed'    => 'Closed',
                ])->required(),
            Forms\Components\Textarea::make('message')->disabled()->rows(4)->columnSpanFull(),
            Forms\Components\KeyValue::make('build_snapshot')->disabled()->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('id')->sortable()->label('#'),
            Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
            Tables\Columns\TextColumn::make('email')->searchable(),
            Tables\Columns\TextColumn::make('phone')->placeholder('—'),
            Tables\Columns\BadgeColumn::make('status')
                ->colors([
                    'danger'  => 'new',
                    'warning' => 'contacted',
                    'primary' => 'quoted',
                    'success' => 'closed',
                ]),
            Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->label('Received'),
        ])
        ->defaultSort('created_at', 'desc')
        ->filters([
            Tables\Filters\SelectFilter::make('status')
                ->options([
                    'new'       => 'New',
                    'contacted' => 'Contacted',
                    'quoted'    => 'Quoted',
                    'closed'    => 'Closed',
                ]),
        ])
        ->actions([
            Tables\Actions\Action::make('contacted')
                ->label('Mark Contacted')
                ->icon('heroicon-o-phone')
                ->visible(fn(BuildRequest $r) => $r->status === 'new')
                ->action(fn(BuildRequest $r) => $r->update(['status' => 'contacted'])),
            Tables\Actions\Action::make('quoted')
                ->label('Mark Quoted')
                ->icon('heroicon-o-document-text')
                ->visible(fn(BuildRequest $r) => $r->status === 'contacted')
                ->action(fn(BuildRequest $r) => $r->update(['status' => 'quoted'])),
            Tables\Actions\Action::make('closed')
                ->label('Mark Closed')
                ->icon('heroicon-o-check-circle')
                ->visible(fn(BuildRequest $r) => in_array($r->status, ['contacted', 'quoted']))
                ->action(fn(BuildRequest $r) => $r->update(['status' => 'closed'])),
            Tables\Actions\ViewAction::make(),
            Tables\Actions\EditAction::make(),
        ]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListBuildRequests::route('/'),
            'view'   => Pages\ViewBuildRequest::route('/{record}'),
            'edit'   => Pages\EditBuildRequest::route('/{record}/edit'),
        ];
    }
}
