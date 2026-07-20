<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'restaurant_ids' => ['required', 'array'],
            'restaurant_ids.*' => ['exists:restaurants,id'],
        ];
    }
}
