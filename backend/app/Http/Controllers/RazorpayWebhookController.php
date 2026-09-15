<?php

namespace App\Http\Controllers;

use App\Services\RazorpayService;
use App\Services\RazorpayWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RazorpayWebhookController extends Controller
{
    public function __construct(
        protected RazorpayService $razorpayService,
        protected RazorpayWebhookService $razorpayWebhookService,
    ) {}

    public function handle(Request $request): JsonResponse
    {

        Log::info('Razorpay webhook received', [
    'event' => $request->input('event'),
    'event_id' => $request->header('x-razorpay-event-id'),
]);


        $signature = $request->header('X-Razorpay-Signature');

        $this->razorpayService->verifyWebhookSignature($request->getContent(), $signature);

        $event = $request->input('event');
        $payload = $request->input('payload', []);
        $eventId = $request->header('x-razorpay-event-id');

        $this->razorpayWebhookService->handle($event, $payload, $eventId);

        return $this->successResponse('Webhook processed successfully');
    }
}
