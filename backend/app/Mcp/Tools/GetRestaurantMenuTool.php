<?php

namespace App\Mcp\Tools;

use App\Exceptions\Mcp\McpException;
use App\Exceptions\Mcp\RestaurantNotFoundException;
use App\Http\Resources\Mcp\RestaurantMenuResponseResource;
use App\Models\Restaurant;
use App\Services\RestaurantService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Retrieve the menu and menu items available at a specific restaurant.')]
class GetRestaurantMenuTool extends Tool
{
    public function __construct(private RestaurantService $restaurantService) {}

    public function handle(Request $request): Response|ResponseFactory
    {
        try {
            $restaurantId = $request->integer('restaurant_id');

            $restaurant = Restaurant::find($restaurantId);

            if (!$restaurant) {
                throw new RestaurantNotFoundException($restaurantId);
            }

            $menus = $this->restaurantService->getMenus($restaurant);

            return Response::structured(
                new RestaurantMenuResponseResource([
                    'restaurant' => $restaurant,
                    'menus' => $menus,
                ])->resolve(),
            );
        } catch (McpException $exception) {
            return Response::error($exception->getMessage());
        }
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'restaurant_id' => $schema
                ->integer()
                ->description('The ID of the restaurant whose menu should be retrieved.')
                ->required(),
        ];
    }
}
