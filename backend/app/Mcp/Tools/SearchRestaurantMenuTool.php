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

#[Description('Search for menus and menu items available at a specific restaurant.')]
class SearchRestaurantMenuTool extends Tool
{
    public function __construct(private RestaurantService $restaurantService) {}

    public function handle(Request $request): Response|ResponseFactory
    {
        try {
            $restaurantId = $request->integer('restaurant_id');
            $query = $request->string('query')->trim()->toString();

            $restaurant = Restaurant::find($restaurantId);

            if (!$restaurant) {
                throw new RestaurantNotFoundException($restaurantId);
            }

            // Get the complete menu using your existing service.
            $menus = $this->restaurantService->getMenus($restaurant);

            // Filter menus and menu-items for the MCP request.
            $menus = $menus
                ->filter(function ($menu) use ($query) {
                    return str_contains(strtolower($menu->name), strtolower($query)) ||
                        $menu->menuItems->contains(function ($item) use ($query) {
                            return str_contains(strtolower($item->name), strtolower($query));
                        });
                })
                ->values();

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
            'restaurant_id' => $schema->integer()->description('The ID of the restaurant to search.')->required(),

            'query' => $schema
                ->string()
                ->description('The menu or food item to search for, such as pizza, pasta, or beverages.')
                ->required(),
        ];
    }
}
