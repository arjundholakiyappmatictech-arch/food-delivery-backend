<?php

namespace App\Notifications;

use App\Models\Cart;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CartItemAddedNotification extends Notification
{
    use Queueable;

    public function __construct(public Cart $cart) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Item Added to Cart',
            'message' => 'Item has been added to your cart successfully.',
            'cart_id' => $this->cart->id,
            'menu_item_id' => $this->cart->menu_item_id,
            'quantity' => $this->cart->quantity,
        ];
    }
}
