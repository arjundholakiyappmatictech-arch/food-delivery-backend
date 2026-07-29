<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'required|digits_between:10,15|unique:users,phone_number',
            'password' => 'required|string|min:8',
            'type' => 'required|in:customer,delivery_agent,restaurant_owner',
        ];
    }
}
