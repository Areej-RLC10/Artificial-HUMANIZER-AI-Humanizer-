<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->longText('original_text');
            $table->longText('processed_text')->nullable();
            $table->decimal('ai_score', 3, 2)->nullable();
            $table->decimal('human_score', 3, 2)->nullable();
            $table->decimal('confidence', 3, 2)->nullable();
            $table->integer('word_count')->default(0);
            $table->integer('processing_time')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->json('indicators')->nullable();
            $table->string('detection_method')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analyses');
    }
};
