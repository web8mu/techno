<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Mail\FulfillmentStatusChangedMail;
use App\Mail\PaymentVerifiedMail;
use App\Models\Order;
use App\Services\InvoiceService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Sales';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Customer')->schema([
                Forms\Components\TextInput::make('customer_name')->disabled(),
                Forms\Components\TextInput::make('customer_email')->disabled(),
                Forms\Components\TextInput::make('customer_phone')->disabled(),
            ])->columns(3),

            Forms\Components\Section::make('Order Details')->schema([
                Forms\Components\TextInput::make('order_number')->disabled(),
                Forms\Components\TextInput::make('delivery_method')->disabled(),
                Forms\Components\TextInput::make('payment_method')->disabled(),
                Forms\Components\Select::make('payment_status')
                    ->options(['pending' => 'Pending', 'verified' => 'Verified', 'failed' => 'Failed']),
                Forms\Components\Select::make('fulfillment_status')
                    ->options([
                        'pending' => 'Pending', 'confirmed' => 'Confirmed', 'processing' => 'Processing',
                        'ready_for_pickup' => 'Ready for Pickup', 'out_for_delivery' => 'Out for Delivery',
                        'delivered' => 'Delivered', 'cancelled' => 'Cancelled',
                    ]),
            ])->columns(3),

            Forms\Components\Section::make('Totals')->schema([
                Forms\Components\TextInput::make('subtotal')->prefix('Rs')->disabled(),
                Forms\Components\TextInput::make('delivery_fee')->prefix('Rs')->disabled(),
                Forms\Components\TextInput::make('vat_amount')->prefix('Rs')->disabled(),
                Forms\Components\TextInput::make('total')->prefix('Rs')->disabled(),
            ])->columns(4),

            Forms\Components\Section::make('Notes')->schema([
                Forms\Components\Textarea::make('notes')->disabled()->rows(2),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('order_number')->searchable()->copyable()->weight('bold'),
            Tables\Columns\TextColumn::make('customer_name')->searchable()->sortable(),
            Tables\Columns\TextColumn::make('customer_email')->searchable()->toggleable(isToggledHiddenByDefault: true),
            Tables\Columns\TextColumn::make('total')->money('MUR')->sortable(),
            Tables\Columns\TextColumn::make('payment_method')
                ->badge()
                ->formatStateUsing(fn($state) => match($state) {
                    'juice_mcb' => 'JuiceByMCB', 'bank_transfer' => 'Bank Transfer', 'cash' => 'Cash', default => $state
                })
                ->color(fn($state) => match($state) { 'juice_mcb' => 'warning', 'bank_transfer' => 'info', 'cash' => 'gray', default => 'gray' }),
            Tables\Columns\TextColumn::make('payment_status')
                ->badge()
                ->color(fn($state) => match($state) { 'verified' => 'success', 'failed' => 'danger', default => 'warning' }),
            Tables\Columns\TextColumn::make('fulfillment_status')
                ->badge()
                ->color(fn($state) => match($state) {
                    'delivered' => 'success', 'cancelled' => 'danger',
                    'pending' => 'gray', 'confirmed' => 'info',
                    default => 'warning'
                }),
            Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
        ])
        ->defaultSort('created_at', 'desc')
        ->filters([
            Tables\Filters\SelectFilter::make('payment_status')->options(['pending' => 'Pending', 'verified' => 'Verified', 'failed' => 'Failed']),
            Tables\Filters\SelectFilter::make('fulfillment_status')->options([
                'pending' => 'Pending', 'confirmed' => 'Confirmed', 'processing' => 'Processing',
                'ready_for_pickup' => 'Ready for Pickup', 'out_for_delivery' => 'Out for Delivery',
                'delivered' => 'Delivered', 'cancelled' => 'Cancelled',
            ]),
            Tables\Filters\SelectFilter::make('payment_method')->options(['juice_mcb' => 'JuiceByMCB', 'bank_transfer' => 'Bank Transfer', 'cash' => 'Cash']),
        ])
        ->actions([
            Tables\Actions\Action::make('verify_payment')
                ->label('Verify Payment')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn(Order $record) => $record->payment_status === 'pending')
                ->requiresConfirmation()
                ->action(function (Order $order) {
                    $order->update(['payment_status' => 'verified', 'fulfillment_status' => 'confirmed']);
                    try { Mail::to($order->customer_email)->send(new PaymentVerifiedMail($order)); } catch (\Exception) {}
                    Notification::make()->title('Payment verified')->success()->send();
                }),

            Tables\Actions\Action::make('update_fulfillment')
                ->label('Update Status')
                ->icon('heroicon-o-arrow-path')
                ->form([
                    Forms\Components\Select::make('fulfillment_status')
                        ->label('New Status')
                        ->options([
                            'pending' => 'Pending', 'confirmed' => 'Confirmed', 'processing' => 'Processing',
                            'ready_for_pickup' => 'Ready for Pickup', 'out_for_delivery' => 'Out for Delivery',
                            'delivered' => 'Delivered', 'cancelled' => 'Cancelled',
                        ])
                        ->required(),
                ])
                ->action(function (Order $order, array $data) {
                    $old = $order->fulfillment_status;
                    $order->update(['fulfillment_status' => $data['fulfillment_status']]);
                    if ($data['fulfillment_status'] === 'cancelled') {
                        foreach ($order->items as $item) {
                            if ($item->product) $item->product->increment('stock', $item->qty);
                        }
                    }
                    try { Mail::to($order->customer_email)->send(new FulfillmentStatusChangedMail($order, $data['fulfillment_status'])); } catch (\Exception) {}
                    Notification::make()->title('Status updated')->success()->send();
                }),

            Tables\Actions\Action::make('download_invoice')
                ->label('Invoice PDF')
                ->icon('heroicon-o-document-arrow-down')
                ->action(function (Order $order) {
                    $service = new InvoiceService();
                    return response()->streamDownload(
                        fn() => print($service->generatePdf($order)),
                        "invoice-{$order->order_number}.pdf"
                    );
                }),

            Tables\Actions\Action::make('view_proof')
                ->label('Proof')
                ->icon('heroicon-o-photo')
                ->visible(fn(Order $order) => !empty($order->proof_of_payment_path))
                ->url(fn(Order $order) => route('filament.admin.resources.orders.view-proof', $order))
                ->openUrlInNewTab(),

            Tables\Actions\EditAction::make(),
        ]);
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
