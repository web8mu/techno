<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('component_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('component_type'); // cpu/motherboard/ram/gpu/storage/psu/cooler/case
            // CPU
            $table->string('socket')->nullable();
            $table->unsignedSmallInteger('tdp_watts')->nullable();
            $table->string('memory_type')->nullable(); // DDR4/DDR5
            $table->boolean('has_igpu')->nullable();
            $table->unsignedTinyInteger('score_gaming')->nullable();
            $table->unsignedTinyInteger('score_productivity')->nullable();
            // Motherboard
            $table->string('chipset')->nullable();
            $table->unsignedTinyInteger('memory_slots')->nullable();
            $table->unsignedSmallInteger('max_memory_gb')->nullable();
            $table->string('form_factor')->nullable(); // ATX/mATX/ITX
            $table->unsignedTinyInteger('m2_slots')->nullable();
            $table->unsignedTinyInteger('sata_ports')->nullable();
            // RAM
            $table->unsignedSmallInteger('capacity_gb')->nullable();
            $table->unsignedTinyInteger('module_count')->nullable();
            $table->unsignedSmallInteger('speed_mhz')->nullable();
            // GPU
            $table->unsignedSmallInteger('length_mm')->nullable();
            $table->unsignedSmallInteger('recommended_psu_watts')->nullable();
            $table->unsignedTinyInteger('score_1080p')->nullable();
            $table->unsignedTinyInteger('score_1440p')->nullable();
            $table->unsignedTinyInteger('score_4k')->nullable();
            // PSU
            $table->unsignedSmallInteger('wattage')->nullable();
            $table->string('efficiency')->nullable(); // 80+ Bronze/Gold/Platinum
            // Cooler
            $table->string('cooler_type')->nullable(); // air/aio
            $table->json('socket_support')->nullable();
            $table->unsignedSmallInteger('tdp_rating_watts')->nullable();
            $table->unsignedSmallInteger('height_mm')->nullable(); // air cooler
            $table->unsignedSmallInteger('radiator_mm')->nullable(); // AIO
            // Case
            $table->json('form_factor_support')->nullable();
            $table->unsignedSmallInteger('max_gpu_length_mm')->nullable();
            $table->unsignedSmallInteger('max_cooler_height_mm')->nullable();
            $table->json('radiator_support')->nullable();
            $table->boolean('is_gamemax')->default(false);
            // Storage interface
            $table->string('interface')->nullable(); // NVMe_M2/SATA
            // Brand (shared)
            $table->string('brand')->nullable();
            // Extra JSON for anything not covered
            $table->json('extra')->nullable();
            $table->timestamps();
            $table->unique('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('component_attributes');
    }
};
