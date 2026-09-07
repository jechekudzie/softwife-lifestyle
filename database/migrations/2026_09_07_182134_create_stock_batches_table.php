<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** A delivery of stock from the printer, received in one go. */
    public function up(): void
    {
        Schema::create('stock_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reference');
            $table->date('received_on');
            /** What the run cost per piece, for margin later. Optional. */
            $table->unsignedInteger('unit_cost_cents')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'received_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_batches');
    }
};
