<x-mail::message>
# Welcome, {{ $user->full_name ?? $user->name }}

Thank you for registering in our Zomato App.

Your account has been created successfully.

<x-mail::panel>
You can now browse restaurants, add food to cart, and place orders.
</x-mail::panel>

<x-mail::button :url="url('/')">
Visit App
</x-mail::button>

Thanks,  
{{ config('app.name') }}
</x-mail::message>