<?php

namespace App\Http\Resources\Mcp;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantMenuResponseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'restaurant' => [
                'name' => $this->resource['restaurant']['name'],
            ],

            'menus' => collect($this->resource['menus'])
                ->map(
                    fn($menu) => [
                        'category' => $menu['name'],

                        'menu_items' => collect($menu['menuItems'])
                            ->map(
                                fn($item) => [
                                    'name' => $item['name'],
                                    'price' => (float) $item['price'],
                                    'availability' => $item['availability'],
                                ],
                            )
                            ->values(),
                    ],
                )
                ->values(),
        ];
    }
}
