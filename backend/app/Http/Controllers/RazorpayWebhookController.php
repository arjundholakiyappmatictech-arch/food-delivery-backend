<?php

namespace App\Http\Controllers;

use App\Services\RazorpayService;
use App\Services\RazorpayWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RazorpayWebhookController extends Controller
{
    public function __construct(
        protected RazorpayService $razorpayService,
        protected RazorpayWebhookService $razorpayWebhookService,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $signature = $request->header('X-Razorpay-Signature');

        $this->razorpayService->verifyWebhookSignature($request->getContent(), $signature);

        $event = $request->input('event');
        $payload = $request->input('payload', []);
        $eventId = $request->header('x-razorpay-event-id');

        $this->razorpayWebhookService->handle($event, $payload, $eventId);

        return $this->successResponse('Webhook processed successfully');
    }
}
