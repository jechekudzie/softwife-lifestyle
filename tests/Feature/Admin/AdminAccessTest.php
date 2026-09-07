<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{string}>
     */
    public static function adminRoutes(): array
    {
        return [
            'dashboard' => ['admin.dashboard'],
            'products' => ['admin.products.index'],
            'orders' => ['admin.orders.index'],
            'fulfilment' => ['admin.fulfilment.edit'],
        ];
    }

    #[DataProvider('adminRoutes')]
    public function test_guests_are_sent_to_the_login_page(string $route): void
    {
        $this->get(route($route))->assertRedirect(route('login'));
    }

    #[DataProvider('adminRoutes')]
    public function test_a_signed_in_customer_is_refused(string $route): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route($route))->assertForbidden();
    }

    #[DataProvider('adminRoutes')]
    public function test_an_admin_may_visit(string $route): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->get(route($route))->assertOk();
    }
}
