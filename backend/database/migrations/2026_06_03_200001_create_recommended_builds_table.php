<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommended_builds', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('budget_tier'); // 25000/50000/75000/100000/150000/200000
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('recommended_build_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('build_id')->constrained('recommended_builds')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('slot'); // cpu/motherboard/ram/gpu/storage/psu/cooler/case
            $table->timestamps();
            $table->unique(['build_id', 'slot']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommended_build_components');
        Schema::dropIfExists('recommended_builds');
    }
};
