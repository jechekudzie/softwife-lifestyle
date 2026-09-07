<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'phone' => ['required', 'string', 'max:40'],

            'fulfilment_method' => ['required', Rule::in(['collection', 'delivery'])],
            'delivery_zone' => [
                'nullable',
                'required_if:fulfilment_method,delivery',
                Rule::exists('delivery_zones', 'slug')->where('is_active', true),
            ],
            'collection_point' => [
                'nullable',
                'required_if:fulfilment_method,collection',
                Rule::exists('collection_points', 'slug')->where('is_active', true),
            ],

            'address_line' => ['nullable', 'required_if:fulfilment_method,delivery', 'string', 'max:180'],
            'suburb' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'required_if:fulfilment_method,delivery', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],

            'payment_method' => ['nullable', 'string', 'max:60'],

            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product' => ['required', 'string', Rule::exists('products', 'slug')->where('is_active', true)],
            'items.*.colourway' => ['required', 'string', Rule::exists('colourways', 'name')],
            'items.*.size' => ['required', 'string', Rule::in(config('shop.sizes'))],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
            'items.*.custom' => ['nullable', 'string', 'min:8', 'max:180'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Your bag is empty.',
            'delivery_zone.required_if' => 'Choose where we are delivering to.',
            'collection_point.required_if' => 'Choose where you are collecting from.',
        ];
    }

    /** Guards against a delivery order arriving with collection details, and vice versa. */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->input('fulfilment_method') === 'collection' && $this->filled('delivery_zone')) {
                    $validator->errors()->add('delivery_zone', 'A collection order cannot carry a delivery zone.');
                }

                if ($this->input('fulfilment_method') === 'delivery' && $this->filled('collection_point')) {
                    $validator->errors()->add('collection_point', 'A delivery order cannot carry a collection point.');
                }
            },
        ];
    }
}
