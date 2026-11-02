<?php
// database/migrations/2024_01_01_000000_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['user', 'admin'])->default('user');
            $table->integer('credits')->default(100);
            $table->timestamp('last_active')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('email');
            $table->index(['role', 'credits']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};