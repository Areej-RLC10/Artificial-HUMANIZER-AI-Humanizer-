<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('action', ['detect', 'humanize', 'both']);
            $table->longText('original_text');
            $table->longText('result_text')->nullable();
            $table->decimal('ai_score', 3, 2)->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'action']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('history');
    }
};
