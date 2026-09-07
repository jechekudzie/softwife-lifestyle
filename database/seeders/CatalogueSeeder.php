<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CollectionPoint;
use App\Models\Colourway;
use App\Models\DeliveryZone;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * The catalogue as it stands today.
 *
 * Prices are in minor units. Fees, zones and the collection address are
 * placeholders until the real ones are confirmed.
 */
class CatalogueSeeder extends Seeder
{
    private const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

    public function run(): void
    {
        $colourways = $this->colourways();
        $tees = $this->categories();
        $this->products($tees, $colourways);
        $this->fulfilment();
    }

    /** @return array<string, Colourway> */
    private function colourways(): array
    {
        $rows = [
            ['Butter', '#f2e7b7', '#271814'],
            ['Chocolate', '#271814', '#f2e7b7'],
            ['Bone', '#fbf9f4', '#ce3c84'],
            ['Blush', '#ea7fb0', '#271814'],
            ['Burgundy', '#6b2137', '#f2e7b7'],
            ['Plum', '#5a2450', '#ffffff'],
        ];

        $made = [];

        foreach ($rows as $position => [$name, $cloth, $ink]) {
            $made[$name] = Colourway::updateOrCreate(
                ['slug' => Str::slug($name)],
                compact('name', 'cloth', 'ink') + ['position' => $position],
            );
        }

        return $made;
    }

    private function categories(): Category
    {
        $rows = [
            ['Tees', 'The original affirmation tee, in four colourways.', 'tee', true],
            ['Tracksuits', 'Heavyweight sets for slow mornings and long seasons.', 'hoodie', false],
            ['Caps', 'Embroidered, structured, quietly said.', 'cap', false],
        ];

        $tees = null;

        foreach ($rows as $position => [$name, $blurb, $silhouette, $available]) {
            $category = Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'blurb' => $blurb,
                    'silhouette' => $silhouette,
                    'is_available' => $available,
                    'position' => $position,
                ],
            );

            $tees ??= $category;
        }

        return $tees;
    }

    /** @param array<string, Colourway> $colourways */
    private function products(Category $category, array $colourways): void
    {
        $rows = [
            [
                'name' => 'Soft Wife',
                'era' => 'Wife',
                'phrase' => 'in my soft wife era',
                'affirmation' => 'In my soft wife era means I don’t chase. I attract. Demure in my presence, mindful in my heart and unbothered, because God already wrote the best plot twist.',
                'price_cents' => 3500,
                'compare_at_cents' => null,
                'badge' => 'Best seller',
                'hero_image' => '/media/soft-wife-choc-lights.jpg',
                'hero_ground' => 'brown',
                'card_image' => '/media/soft-wife-choc-affirmation.jpg',
                'pictured_label' => 'Chocolate · butter print',
                'field_colour' => 'var(--color-bone)',
                'colourways' => ['Butter', 'Chocolate', 'Bone', 'Blush', 'Burgundy', 'Plum'],
            ],
            [
                'name' => 'Soft Mom',
                'era' => 'Mom',
                'phrase' => 'in my soft mom era',
                'affirmation' => 'In my soft mom era because God looked at me and thought me worthy enough to become a mother, to care for His most beautiful creations, to experience the purest form of love.',
                'price_cents' => 3500,
                'compare_at_cents' => null,
                'badge' => null,
                'hero_image' => '/media/soft-mom-white-coat.jpg',
                'hero_ground' => 'wine',
                'card_image' => '/media/soft-mom-white-seated.jpg',
                'pictured_label' => 'Bone · burgundy print',
                'field_colour' => 'var(--color-petal-deep)',
                'colourways' => ['Chocolate', 'Burgundy', 'Butter', 'Bone'],
            ],
            [
                'name' => 'Soft Babe',
                'era' => 'Babe',
                'phrase' => 'in my soft babe era',
                'affirmation' => 'I am in my soft babe era because I know my worth, I invest in myself mentally, spiritually and financially, and I keep it cute without competing.',
                'price_cents' => 3500,
                'compare_at_cents' => null,
                'badge' => 'New',
                'hero_image' => '/media/soft-babe-plum-seated.jpg',
                'hero_ground' => 'plum',
                'card_image' => '/media/soft-babe-plum-standing.jpg',
                'pictured_label' => 'Plum · white print',
                'field_colour' => 'var(--color-petal)',
                'colourways' => ['Bone', 'Butter', 'Blush'],
            ],
            [
                'name' => 'Becoming Softwife',
                'era' => 'Her',
                'phrase' => 'becoming her, softly',
                'affirmation' => 'I am becoming her. Softer in my seasons, steadier in my faith, and no longer shrinking to make anyone else comfortable.',
                'price_cents' => 4000,
                'compare_at_cents' => 4800,
                'badge' => null,
                'hero_image' => '/media/soft-wife-white-tashas.jpg',
                'hero_ground' => 'pale',
                'card_image' => '/media/soft-babe-plum-table.jpg',
                'pictured_label' => 'Plum · white print',
                'field_colour' => 'var(--color-butter)',
                'colourways' => ['Burgundy', 'Chocolate', 'Bone'],
            ],
        ];

        foreach ($rows as $position => $row) {
            $names = $row['colourways'];
            unset($row['colourways']);

            $product = Product::updateOrCreate(
                ['slug' => Str::slug($row['name'])],
                $row + ['category_id' => $category->id, 'position' => $position],
            );

            $product->colourways()->sync(
                collect($names)
                    ->mapWithKeys(fn (string $name, int $index) => [
                        $colourways[$name]->id => ['position' => $index],
                    ])
                    ->all(),
            );

            foreach ($names as $name) {
                foreach (self::SIZES as $size) {
                    ProductVariant::updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'colourway_id' => $colourways[$name]->id,
                            'size' => $size,
                        ],
                        [
                            'sku' => Str::upper(
                                Str::slug($product->name).'-'.Str::slug($name).'-'.$size
                            ),
                            'stock' => 12,
                        ],
                    );
                }
            }
        }
    }

    private function fulfilment(): void
    {
        $zones = [
            ['Harare', 'CBD and surrounding suburbs', 500, '1–2 days'],
            ['Greater Harare', 'Chitungwiza, Norton, Ruwa, Epworth', 800, '2–3 days'],
            ['Elsewhere in Zimbabwe', 'Bulawayo, Mutare, Gweru, Victoria Falls and beyond', 1200, '3–5 days'],
            ['Regional', 'South Africa, Zambia, Botswana, Namibia', 2500, '7–10 days'],
        ];

        foreach ($zones as $position => [$name, $detail, $fee, $eta]) {
            DeliveryZone::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'detail' => $detail,
                    'fee_cents' => $fee,
                    'eta' => $eta,
                    'position' => $position,
                ],
            );
        }

        CollectionPoint::updateOrCreate(
            ['slug' => 'harare-studio'],
            [
                'name' => 'Harare studio',
                'address' => 'Address to be confirmed, Harare',
                'hours' => 'Mon–Fri, 9am–5pm · Sat, 9am–1pm',
                'position' => 0,
            ],
        );
    }
}
