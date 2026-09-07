<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            /** Kept nullable so deleting a product never destroys order history. */
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();

            /** Descriptive fields are copied so the line reads correctly forever. */
            $table->string('name');
            $table->string('colourway');
            $table->string('size');
            $table->string('sku')->nullable();

            $table->text('custom_affirmation')->nullable();
            $table->unsignedInteger('custom_fee_cents')->default(0);

            $table->unsignedInteger('unit_price_cents');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('total_cents');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
