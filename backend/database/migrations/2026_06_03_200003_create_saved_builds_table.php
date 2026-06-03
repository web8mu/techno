<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_builds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_token')->nullable()->index();
            $table->string('name')->default('My Build');
            $table->json('components'); // [{slot, product_id, product_name, price_snapshot}]
            $table->decimal('total_price', 10, 2);
            $table->json('performance_summary')->nullable();
            $table->string('share_token')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_builds');
    }
};
