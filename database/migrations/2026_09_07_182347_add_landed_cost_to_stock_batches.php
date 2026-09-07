<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The landed cost of a batch: what the pieces cost plus what it cost to
     * get them here. Held as components so the total can be explained, and
     * per batch so a cheap run and an expensive one never average silently.
     */
    public function up(): void
    {
        Schema::table('stock_batches', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('product_id')
                ->constrained()->nullOnDelete();
            /** Batch-wide costs, spread across the pieces received. */
            $table->unsignedInteger('freight_cents')->default(0)->after('unit_cost_cents');
            $table->unsignedInteger('duty_cents')->default(0)->after('freight_cents');
            $table->unsignedInteger('other_cost_cents')->default(0)->after('duty_cents');
            $table->string('currency', 3)->default('USD')->after('other_cost_cents');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            /**
             * What this movement cost per piece. Snapshotted on a sale so a
             * later batch at a different price never rewrites past margin.
             */
            $table->unsignedInteger('unit_cost_cents')->nullable()->after('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('stock_batches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn(['freight_cents', 'duty_cents', 'other_cost_cents', 'currency']);
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropColumn('unit_cost_cents');
        });
    }
};
