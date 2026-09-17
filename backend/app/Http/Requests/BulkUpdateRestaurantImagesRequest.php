<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateRestaurantImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurants' => ['required', 'array', 'min:1'],
            'restaurants.*.id' => ['required', 'integer', 'exists:restaurants,id'],
            'restaurants.*.image_url' => ['required', 'string', 'url'],
        ];
    }
}
