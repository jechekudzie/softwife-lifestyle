<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('status')->default('pending');

            $table->string('customer_name');
            $table->string('email');
            $table->string('phone');

            $table->string('fulfilment_method');
            $table->foreignId('delivery_zone_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('collection_point_id')->nullable()->constrained()->nullOnDelete();
            $table->string('address_line')->nullable();
            $table->string('suburb')->nullable();
            $table->string('city')->nullable();
            $table->text('notes')->nullable();

            /**
             * Totals are captured at checkout rather than recomputed, so a
             * later price or fee change never rewrites a placed order.
             */
            $table->unsignedInteger('subtotal_cents');
            $table->unsignedInteger('delivery_fee_cents')->default(0);
            $table->unsignedInteger('total_cents');
            $table->string('currency', 3)->default('USD');

            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('unpaid');
            $table->string('payment_reference')->nullable();

            $table->timestamp('placed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
