<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware): void {})

    ->withExceptions(function (Exceptions $exceptions): void {
        // runs whenever laravel throws 404 not found exception
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            $previous = $e->getPrevious();

            if ($previous instanceof ModelNotFoundException) {
                $model = class_basename($previous->getModel());

                $message = match ($model) {
                    'Address' => 'Address not found.',
                    default => "{$model} not found.",
                };

                return response()->json(
                    [
                        'status' => false,
                        'message' => $message,
                        'data' => null,
                    ],
                    404,
                );
            }

            return response()->json(
                [
                    'status' => false,
                    'message' => 'Route not found.',
                    'data' => null,
                ],
                404,
            );
        });

        $exceptions->render(function (ValidationException $exception, Request $request) {
            return response()->json(
                [
                    'status' => false,
                    'message' => $exception->getMessage(),
                    'errors' => null,
                ],
                422,
            );
        });

        $exceptions->render(function (MethodNotAllowedHttpException $exception, Request $request) {
            return response()->json(
                [
                    'status' => false,
                    'message' => 'The HTTP method used for this route is not allowed.',
                    'data' => null,
                ],
                405,
            );
        });

        // 401 — Unauthenticated
        $exceptions->render(function (AuthenticationException $e, $request) {
            return response()->json(
                [
                    'status' => false,
                    'message' => 'Please login first',
                    'data' => null,
                ],
                401,
            );
        });

        // 403 — Unauthorized (catch AccessDeniedHttpException, not AuthorizationException)
        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            return response()->json(
                [
                    'status' => false,
                    'message' => $exception->getMessage() ?: 'You are not authorized to perform this action.',
                    'data' => null,
                ],
                403,
            );
        });

        $exceptions->render(function (AccessDeniedHttpException $exception, Request $request) {
            return response()->json(
                [
                    'status' => false,
                    'message' => $exception->getMessage() ?: 'You are not authorized to perform this action.',
                    'data' => null,
                ],
                403,
            );
        });

        // 505 - internal server error
        $exceptions->render(function (QueryException $e, $request) {
            return response()->json(
                [
                    'status' => false,
                    'message' => 'Connection Failed',
                    'data' => null,
                ],
                500,
            );
        });
    })
    ->create();
