<?php

namespace App\Mcp\Resources;

use App\Http\Resources\Mcp\RestaurantMenuResponseResource;
use App\Models\Restaurant;
use App\Services\RestaurantService;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Annotations\Priority;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Contracts\HasUriTemplate;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Support\UriTemplate;

#[MimeType('text/plain')]
#[Priority(1.0)]
#[Description('Provides the menus and menu-items available at a specific restaurant.')]
class RestaurantMenuResource extends Resource implements HasUriTemplate
{
    public function __construct(private RestaurantService $restaurantService) {}

    // Get the URI template for this resource.
    public function uriTemplate(): UriTemplate
    {
        return new UriTemplate('restaurant://{restaurantId}/menus');
    }

    // Handle the resource request.
    public function handle(Request $request): Response
    {
        $restaurantId = $request->get('restaurantId');

        $restaurant = Restaurant::findOrFail($restaurantId);

        $menus = $this->restaurantService->getMenus($restaurant);

        return Response::text(
            new RestaurantMenuResponseResource([
                'restaurant' => $restaurant,
                'menus' => $menus,
            ])->toJson(),
        );
    }
}
