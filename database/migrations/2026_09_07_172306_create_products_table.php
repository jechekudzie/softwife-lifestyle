<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            /** The short era word, and the italic line shown under the wordmark. */
            $table->string('era');
            $table->string('phrase');
            $table->text('affirmation');
            /** Money is stored in minor units to keep totals exact. */
            $table->unsignedInteger('price_cents');
            $table->unsignedInteger('compare_at_cents')->nullable();
            $table->string('badge')->nullable();
            $table->string('hero_image')->nullable();
            $table->string('hero_ground')->default('rose');
            $table->string('card_image')->nullable();
            $table->string('pictured_label')->nullable();
            $table->string('field_colour')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'position']);
        });

        Schema::create('colourway_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('colourway_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position')->default(0);

            $table->unique(['product_id', 'colourway_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('colourway_product');
        Schema::dropIfExists('products');
    }
};
