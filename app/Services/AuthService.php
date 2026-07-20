<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): User
    {
        return User::create([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone_number' => $data['phone_number'],
            'password' => Hash::make($data['password']),
            'type' => $data['type'],
        ]);
    }

    public function login(array $data): array
    {
        $user = User::query()->where('email', '=', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        return [
            'user' => $user,
            'token' => $this->createAuthToken($user),
        ];
    }

    private function createAuthToken(User $user): string
    {
        return $user->createToken('auth_token')->plainTextToken;
    }
}
