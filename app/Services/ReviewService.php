<?php

namespace App\Services;

use App\Exceptions\reviews\AlreadyReviewException;
use App\Exceptions\reviews\ReviewOnlyDeliveredOrderException;
use App\Models\Order;
use App\Models\OrderReview;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Auth;

class ReviewService
{
    public function index(): Paginator
    {
        $user = Auth::user();

        if ($user->type === 'customer') {
            return OrderReview::query()
                ->with(['user', 'order'])
                ->where('user_id', $user->id)
                ->latest()
                ->simplePaginate(1);
        }

        throw new AuthorizationException('You are not allowed to view reviews');
    }

    public function store(Order $order, array $data): OrderReview
    {
        $user = Auth::user();
        $this->authorizeCanReview($order, $user);

        return OrderReview::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ])->load(['user', 'order']);
    }

    public function destroy(OrderReview $review): void
    {
        $user = Auth::user();
        $this->authorizeReviewOwner($review, $user);

        $review->delete();
    }

    private function authorizeCanReview(Order $order, User $user): void
    {
        if ($user->type !== 'customer') {
            throw new AuthorizationException('Only customers can create reviews');
        }

        if ($order->user_id !== $user->id) {
            throw new AuthorizationException('You can only review your own order');
        }

        if ($order->status !== 'delivered') {
            throw new ReviewOnlyDeliveredOrderException();
        }

        $alreadyReviewed = OrderReview::where('user_id', $user->id)->where('order_id', $order->id)->exists();

        if ($alreadyReviewed) {
            throw new AlreadyReviewException();
        }
    }

    private function authorizeReviewOwner(OrderReview $review, User $user): void
    {
        if ($review->user_id !== $user->id) {
            throw new AuthorizationException('This review does not belong to you');
        }
    }
}
