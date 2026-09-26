<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(CatalogueSeeder::class);

        /**
         * The shop owner. Seeded rather than made by hand so a fresh database
         * is usable, and driven by the environment so production never ships
         * a password that lives in the repository.
         */
        User::firstOrCreate(
            ['email' => config('shop.admin.email')],
            [
                'name' => config('shop.admin.name'),
                'password' => Hash::make(config('shop.admin.password')),
                'email_verified_at' => now(),
                'is_admin' => true,
            ],
        );

        if (app()->environment('local')) {
            User::firstOrCreate(
                ['email' => 'test@example.com'],
                User::factory()->raw(['email' => 'test@example.com', 'name' => 'Test User']),
            );
        }
    }
}
