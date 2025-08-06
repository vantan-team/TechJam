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
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->string('hotpepper_id')->nullable()->unique();
            $table->string('image_url')->nullable();
            $table->string('shop_name');
            $table->string('address');
            $table->string('category')->nullable();
            $table->timestamps();

            $table->unique(['shop_name', 'address']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
