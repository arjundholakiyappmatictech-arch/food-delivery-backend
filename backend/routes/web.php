<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/logo', function () {
    return response()->file(
        public_path('/images/logo.png')
    );
});

/* Route::get('/', function () {
    return response()->json([
        'status' => true,
        'message' => 'Laravel backend is working',
    ]);
});
 */