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
            'address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'latitude' => ['nullable', 'required_without:address_id', 'numeric', 'between:-90,90'],

            'longitude' => ['nullable', 'required_without:address_id', 'numeric', 'between:-180,180'],
            'include' => ['nullable', 'in:menus,menus.menuItems'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort_by' => ['nullable', 'in:nearest,a-z,z-a'],
            'open_now' => ['nullable', 'boolean'],

            'radius' => ['nullable', 'numeric', 'min:0'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
