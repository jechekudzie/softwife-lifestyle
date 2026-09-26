<?php

namespace Tests\Feature\Admin;

use App\Models\Colourway;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProductGalleryTest extends TestCase
{
    use RefreshDatabase;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->admin()->create());
        $this->product = Product::factory()->create();
    }

    public function test_an_admin_can_add_photographs_against_a_colourway(): void
    {
        $colourway = Colourway::factory()->create();

        $this->post(route('admin.products.images.store', $this->product), [
            'images' => [
                UploadedFile::fake()->image('front.jpg'),
                UploadedFile::fake()->image('back.jpg'),
            ],
            'colourway_id' => $colourway->id,
        ])->assertRedirect();

        $images = $this->product->images()->get();

        $this->assertCount(2, $images);
        $this->assertSame([$colourway->id, $colourway->id], $images->pluck('colourway_id')->all());
        $this->assertSame([1, 2], $images->pluck('position')->all());

        $images->each(function (ProductImage $image) {
            $this->assertFileExists(public_path(ltrim($image->path, '/')));
            @unlink(public_path(ltrim($image->path, '/')));
        });
    }

    public function test_a_photograph_may_belong_to_no_colourway(): void
    {
        $this->post(route('admin.products.images.store', $this->product), [
            'images' => [UploadedFile::fake()->image('flat-lay.jpg')],
        ])->assertRedirect();

        $image = $this->product->images()->sole();

        $this->assertNull($image->colourway_id);

        @unlink(public_path(ltrim($image->path, '/')));
    }

    public function test_a_gallery_row_of_another_product_cannot_be_touched(): void
    {
        $other = ProductImage::factory()->create([
            'product_id' => Product::factory(),
        ]);

        $this->delete(route('admin.products.images.destroy', [$this->product, $other]))
            ->assertNotFound();

        $this->assertModelExists($other);
    }

    public function test_removing_a_row_leaves_a_shoot_image_it_did_not_write_on_disk(): void
    {
        $image = ProductImage::factory()->create([
            'product_id' => $this->product->id,
            'path' => '/media/soft-wife-butter-studio.jpg',
        ]);

        $this->delete(route('admin.products.images.destroy', [$this->product, $image]))
            ->assertRedirect();

        $this->assertModelMissing($image);
        $this->assertFileExists(public_path('media/soft-wife-butter-studio.jpg'));
    }
}
