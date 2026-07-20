<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class Controller
{
    protected function successResponse(
        string $message,
        $data = null,
        int $status = 200,
        ?array $pagination = null,
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if ($pagination !== null) {
            $response['pagination'] = $pagination;
        }

        return response()->json($response, $status);
    }

    protected function errorResponse(string $message, $errors = null, int $status = 400): JsonResponse
    {
        return response()->json(
            [
                'success' => false,
                'message' => $message,
                'errors' => $errors,
            ],
            $status,
        );
    }

    protected function pagination(LengthAwarePaginator|Paginator|CursorPaginator $paginator): array
    {
        $pagination = [
            'per_page' => $paginator->perPage(),
            'count' => $paginator->count(),
            'previous_page_url' => $paginator->previousPageUrl(),
            'next_page_url' => $paginator->nextPageUrl(),
            'has_more_pages' => $paginator->hasMorePages(),
        ];

        if ($paginator instanceof CursorPaginator) {
            $pagination['previous_cursor'] = $paginator->previousCursor()?->encode();

            $pagination['next_cursor'] = $paginator->nextCursor()?->encode();

            return $pagination;
        }

        $pagination['current_page'] = $paginator->currentPage();
        $pagination['loaded_records'] = $paginator->lastItem() ?? 0;

        if ($paginator instanceof LengthAwarePaginator) {
            $pagination['last_page'] = $paginator->lastPage();
            $pagination['total'] = $paginator->total();
        }
        return $pagination;
    }
}
