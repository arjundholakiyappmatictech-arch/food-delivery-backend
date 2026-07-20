<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use App\Models\Order;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Order Placed',
            'message' => 'Your order #' . $this->order->id . ' has been placed successfully.',
            'order_id' => $this->order->id,
        ];
    }
}
