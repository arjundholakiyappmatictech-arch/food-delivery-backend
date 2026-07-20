<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    protected InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function store(Order $order): JsonResponse
    {
        $invoice = $this->invoiceService->generate($order);

        return response()->json([
            'success' => true,
            'message' => 'Invoice generated successfully',
            'data' => $invoice,
        ], 201);
    }

    public function order(Invoice $invoice): JsonResponse
    {
        $order = $this->invoiceService->getOrder($invoice);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }
}
