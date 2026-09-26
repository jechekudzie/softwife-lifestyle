<?php

namespace Tests\Feature;

use App\Models\Colourway;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontCatalogueTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_homepage_lists_what_the_admin_manages(): void
    {
        $product = Product::factory()->create(['name' => 'Soft Mom']);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('lines.0.slug', $product->slug)
                ->where('lines.0.name', 'Soft Mom'));
    }

    public function test_a_hidden_product_is_not_offered(): void
    {
        Product::factory()->create(['is_active' => false]);

        $this->get(route('shop'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('lines', []));
    }

    public function test_a_gallery_frame_carries_the_colourway_it_pictures(): void
    {
        $product = Product::factory()->create();
        $plum = Colourway::factory()->create(['name' => 'Plum']);

        ProductImage::factory()->create([
            'product_id' => $product->id,
            'colourway_id' => $plum->id,
            'path' => '/media/plum.jpg',
            'position' => 1,
        ]);
        ProductImage::factory()->create([
            'product_id' => $product->id,
            'colourway_id' => null,
            'path' => '/media/flat-lay.jpg',
            'position' => 2,
        ]);

        $this->get(route('home'))
            ->assertInertia(fn ($page) => $page
                ->where('lines.0.images.0.src', '/media/plum.jpg')
                ->where('lines.0.images.0.colourway', 'Plum')
                ->where('lines.0.images.1.colourway', null));
    }

    public function test_a_product_without_a_gallery_still_shows_its_card_shot(): void
    {
        Product::factory()->create(['card_image' => '/media/card.jpg']);

        $this->get(route('home'))
            ->assertInertia(fn ($page) => $page
                ->where('lines.0.images', [
                    ['src' => '/media/card.jpg', 'colourway' => null, 'alt' => null],
                ]));
    }

    public function test_the_header_is_given_the_catalogue_to_search(): void
    {
        Product::factory()->create(['name' => 'Becoming Softwife']);

        $this->get(route('shop'))
            ->assertInertia(fn ($page) => $page->where('catalogue.0.name', 'Becoming Softwife'));
    }

    public function test_a_product_has_a_page_of_its_own(): void
    {
        $product = Product::factory()->create(['name' => 'Soft Babe']);
        Product::factory()->create(['name' => 'Soft Mom']);

        $this->get(route('product', $product))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('shop/show')
                ->where('line.name', 'Soft Babe')
                ->where('related.0.name', 'Soft Mom'));
    }

    public function test_a_hidden_product_has_no_page(): void
    {
        $product = Product::factory()->create(['is_active' => false]);

        $this->get(route('product', $product))->assertNotFound();
    }

    public function test_a_page_carries_the_same_shape_as_a_listing(): void
    {
        $product = Product::factory()->create();

        $listed = $this->get(route('shop'))->viewData('page')['props']['lines'][0];
        $shown = $this->get(route('product', $product))->viewData('page')['props']['line'];

        $this->assertSame(array_keys($listed), array_keys($shown));
    }
}
