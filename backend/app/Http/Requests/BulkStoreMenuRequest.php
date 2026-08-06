<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkStoreMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'menus' => ['required', 'array', 'min:1'],

            'menus.*.name' => ['required', 'string', 'max:255'],

            'menus.*.image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],

            'menus.*.items' => ['required', 'array', 'min:1'],

            'menus.*.items.*.name' => ['required', 'string', 'max:255'],

            'menus.*.items.*.price' => ['required', 'numeric', 'min:0'],

            'menus.*.items.*.availability' => ['sometimes', 'boolean'],

            'menus.*.items.*.image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
