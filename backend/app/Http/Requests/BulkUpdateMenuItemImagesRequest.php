<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateMenuItemImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'menu_items' => ['required', 'array', 'min:1'],
            'menu_items.*.id' => ['required', 'integer', 'exists:menu_items,id'],
            'menu_items.*.image_url' => ['required', 'string', 'url'],
        ];
    }
}
