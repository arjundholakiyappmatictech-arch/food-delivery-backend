<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'menu_id' => ['required', 'exists:menus,id'],
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:1'],
            'availability' => ['required', 'boolean'],
            'image' => ['required', File::image()->max('2mb'), 'extensions:jpg,jpeg,png,webp'],
        ];
    }
}
