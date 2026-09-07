<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Colourways were stored as CSS custom properties, which a colour picker
 * cannot read or write. They become plain hex so the admin can edit them.
 */
return new class extends Migration
{
    private const HEX = [
        'var(--color-butter)' => '#f2e7b7',
        'var(--color-choc)' => '#271814',
        'var(--color-bone)' => '#fbf9f4',
        'var(--color-magenta)' => '#ce3c84',
        'var(--color-blush)' => '#ea7fb0',
        'var(--color-wine)' => '#6b2137',
        'var(--color-plum)' => '#5a2450',
        'var(--color-rose)' => '#e6a9c1',
        'var(--color-petal)' => '#fdeef4',
        'var(--color-petal-deep)' => '#f9d9e6',
        '#ffffff' => '#ffffff',
    ];

    public function up(): void
    {
        foreach (self::HEX as $variable => $hex) {
            DB::table('colourways')->where('cloth', $variable)->update(['cloth' => $hex]);
            DB::table('colourways')->where('ink', $variable)->update(['ink' => $hex]);
        }
    }

    public function down(): void
    {
        foreach (array_flip(self::HEX) as $hex => $variable) {
            DB::table('colourways')->where('cloth', $hex)->update(['cloth' => $variable]);
            DB::table('colourways')->where('ink', $hex)->update(['ink' => $variable]);
        }
    }
};
