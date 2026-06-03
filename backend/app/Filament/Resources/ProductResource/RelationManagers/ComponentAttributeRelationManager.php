<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ComponentAttributeRelationManager extends RelationManager
{
    protected static string $relationship = 'componentAttribute';
    protected static ?string $title = 'Build Attributes';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('component_type')
                ->label('Component Type')
                ->options([
                    'cpu'         => 'CPU',
                    'motherboard' => 'Motherboard',
                    'ram'         => 'RAM',
                    'gpu'         => 'GPU',
                    'storage'     => 'Storage',
                    'psu'         => 'PSU',
                    'cooler'      => 'Cooler',
                    'case'        => 'Case',
                ])
                ->required()
                ->live()
                ->columnSpanFull(),

            Forms\Components\TextInput::make('brand')->nullable(),

            // CPU fields
            Forms\Components\TextInput::make('socket')
                ->hidden(fn(Forms\Get $get) => !in_array($get('component_type'), ['cpu', 'motherboard', 'cooler']))
                ->nullable(),
            Forms\Components\TextInput::make('tdp_watts')
                ->label('TDP (W)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => !in_array($get('component_type'), ['cpu']))
                ->nullable(),
            Forms\Components\Select::make('memory_type')
                ->options(['DDR4' => 'DDR4', 'DDR5' => 'DDR5'])
                ->hidden(fn(Forms\Get $get) => !in_array($get('component_type'), ['cpu', 'motherboard', 'ram']))
                ->nullable(),
            Forms\Components\Toggle::make('has_igpu')
                ->label('Has iGPU')
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'cpu'),
            Forms\Components\TextInput::make('score_gaming')
                ->label('Gaming Score (0-100)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'cpu')
                ->nullable(),
            Forms\Components\TextInput::make('score_productivity')
                ->label('Productivity Score (0-100)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'cpu')
                ->nullable(),

            // Motherboard fields
            Forms\Components\TextInput::make('chipset')
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'motherboard')
                ->nullable(),
            Forms\Components\TextInput::make('memory_slots')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'motherboard')
                ->nullable(),
            Forms\Components\TextInput::make('max_memory_gb')
                ->label('Max Memory (GB)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'motherboard')
                ->nullable(),
            Forms\Components\Select::make('form_factor')
                ->options(['ATX' => 'ATX', 'mATX' => 'mATX', 'ITX' => 'ITX'])
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'motherboard')
                ->nullable(),
            Forms\Components\TextInput::make('m2_slots')
                ->label('M.2 Slots')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'motherboard')
                ->nullable(),
            Forms\Components\TextInput::make('sata_ports')
                ->label('SATA Ports')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'motherboard')
                ->nullable(),

            // RAM fields
            Forms\Components\TextInput::make('capacity_gb')
                ->label('Capacity (GB)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'ram')
                ->nullable(),
            Forms\Components\TextInput::make('module_count')
                ->label('Module Count')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'ram')
                ->nullable(),
            Forms\Components\TextInput::make('speed_mhz')
                ->label('Speed (MHz)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'ram')
                ->nullable(),

            // GPU fields
            Forms\Components\TextInput::make('length_mm')
                ->label('Length (mm)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'gpu')
                ->nullable(),
            Forms\Components\TextInput::make('recommended_psu_watts')
                ->label('Recommended PSU (W)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'gpu')
                ->nullable(),
            Forms\Components\TextInput::make('score_1080p')
                ->label('1080p Score')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'gpu')
                ->nullable(),
            Forms\Components\TextInput::make('score_1440p')
                ->label('1440p Score')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'gpu')
                ->nullable(),
            Forms\Components\TextInput::make('score_4k')
                ->label('4K Score')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'gpu')
                ->nullable(),

            // Storage fields
            Forms\Components\Select::make('interface')
                ->options(['NVMe_M2' => 'NVMe M.2', 'SATA' => 'SATA'])
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'storage')
                ->nullable(),

            // PSU fields
            Forms\Components\TextInput::make('wattage')
                ->label('Wattage (W)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'psu')
                ->nullable(),
            Forms\Components\TextInput::make('efficiency')
                ->label('Efficiency Rating')
                ->placeholder('e.g. 80+ Gold')
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'psu')
                ->nullable(),

            // Cooler fields
            Forms\Components\Select::make('cooler_type')
                ->options(['air' => 'Air', 'aio' => 'AIO Liquid'])
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'cooler')
                ->nullable(),
            Forms\Components\TextInput::make('tdp_rating_watts')
                ->label('TDP Rating (W)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'cooler')
                ->nullable(),
            Forms\Components\TextInput::make('height_mm')
                ->label('Height (mm)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'cooler')
                ->nullable(),
            Forms\Components\TextInput::make('radiator_mm')
                ->label('Radiator Size (mm)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'cooler')
                ->nullable(),
            Forms\Components\TagsInput::make('socket_support')
                ->label('Supported Sockets')
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'cooler')
                ->nullable(),

            // Case fields
            Forms\Components\TagsInput::make('form_factor_support')
                ->label('Form Factors Supported')
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'case')
                ->nullable(),
            Forms\Components\TextInput::make('max_gpu_length_mm')
                ->label('Max GPU Length (mm)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'case')
                ->nullable(),
            Forms\Components\TextInput::make('max_cooler_height_mm')
                ->label('Max Cooler Height (mm)')
                ->numeric()
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'case')
                ->nullable(),
            Forms\Components\TagsInput::make('radiator_support')
                ->label('Radiator Support (mm values)')
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'case')
                ->nullable(),
            Forms\Components\Toggle::make('is_gamemax')
                ->label('GameMax Product')
                ->hidden(fn(Forms\Get $get) => $get('component_type') !== 'case'),

            Forms\Components\KeyValue::make('extra')
                ->label('Extra Attributes (JSON)')
                ->nullable()
                ->columnSpanFull(),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('component_type')
            ->columns([
                Tables\Columns\TextColumn::make('component_type')->label('Type'),
                Tables\Columns\TextColumn::make('brand')->placeholder('—'),
                Tables\Columns\TextColumn::make('socket')->placeholder('—'),
                Tables\Columns\TextColumn::make('wattage')->placeholder('—')->suffix('W'),
                Tables\Columns\IconColumn::make('is_gamemax')->boolean()->label('GameMax'),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->label('Updated'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()->label('Add Build Attributes'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }
}
