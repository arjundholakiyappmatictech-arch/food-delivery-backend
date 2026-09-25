<?php

namespace App\Mcp\Tools;

use App\Models\Restaurant;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Find restaurants by name so that a specific restaurant can be identified before retrieving its menu.')]
class SearchRestaurantsTool extends Tool
{
    public function handle(Request $request): Response|ResponseFactory
    {
        $query = $request->string('query')->trim()->toString();

        $restaurants = Restaurant::query()
            ->where('name', 'ILIKE', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name', 'address']);

        return Response::structured($restaurants->toArray());
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema
                ->string()
                ->description('The restaurant name or part of the restaurant name to search for.')
                ->required(),
        ];
    }
}
