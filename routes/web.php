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
