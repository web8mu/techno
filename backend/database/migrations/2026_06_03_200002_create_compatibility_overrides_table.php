<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compatibility_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('component_a_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('component_b_id')->constrained('products')->cascadeOnDelete();
            $table->enum('effect', ['block', 'warn']);
            $table->string('message');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compatibility_overrides');
    }
};
