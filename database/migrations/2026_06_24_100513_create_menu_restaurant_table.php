<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menu_restaurant', function (Blueprint $table) {
            $table->foreignId('restaurant_id')
                ->constrained();

            $table->foreignId('menu_id')
                ->constrained();

            $table->primary([
                'restaurant_id',
                'menu_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_restaurant');
    }
};
