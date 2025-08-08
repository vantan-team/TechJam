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
        Schema::create('guide_book_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('guide_books')->onDelete('cascade');
            $table->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $table->tinyInteger('star')->unsigned()->comment('1-3 stars');
            $table->foreignId('visited_shop_id')->nullable()->constrained('visited_shops')->onDelete('set null');
            $table->string('image_url')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['guide_id', 'shop_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_book_contents');
    }
};
