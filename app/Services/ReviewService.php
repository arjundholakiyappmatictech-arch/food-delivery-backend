<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderReview;
use App\Models\User;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ReviewService
{
    public function index(): Paginator
    {
        $user = $this->authUser();

        if ($user->type === 'customer') {
            return OrderReview::query()
                ->with(['user', 'order'])
                ->where('user_id', $user->id)
                ->latest()
                ->simplePaginate(1);
        }

        throw new HttpException(403, 'You are not allowed to view reviews.');
    }

    public function store(Order $order, array $data): OrderReview
    {
        $user = $this->authUser();
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
        $user = $this->authUser();
        $this->authorizeReviewOwner($review, $user);

        $review->delete();
    }

    private function authUser(): User
    {
        $user = Auth::user();

        if (! $user) {
            throw new HttpException(401, 'Please login first.');
        }

        return $user;
    }

    private function authorizeCanReview(Order $order, User $user): void
    {
        if ($user->type !== 'customer') {
            throw new HttpException(403, 'Only customers can create reviews.');
        }

        if ($order->user_id !== $user->id) {
            throw new HttpException(403, 'You can only review your own order.');
        }

        if ($order->status !== 'placed') {
            throw new HttpException(400, 'You can review only delivered orders.');
        }

        $alreadyReviewed = OrderReview::where('user_id', $user->id)->where('order_id', $order->id)->exists();

        if ($alreadyReviewed) {
            throw new HttpException(409, 'You already reviewed this order.');
        }
    }

    private function authorizeReviewOwner(OrderReview $review, User $user): void
    {
        if ($review->user_id !== $user->id) {
            throw new HttpException(403, 'This review does not belong to you.');
        }
    }
}
