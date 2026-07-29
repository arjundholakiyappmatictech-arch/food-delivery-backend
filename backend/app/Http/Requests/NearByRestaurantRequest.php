<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NearByRestaurantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address_id' => ['required', 'exists:addresses,id'],
            'include' => ['nullable', 'in:menus,menus.menuItems'],
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
