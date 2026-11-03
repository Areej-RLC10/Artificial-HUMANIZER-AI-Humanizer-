<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ResetMonthlyCredits extends Command
{
    /**
     * The name and signature of the console command.
     * You run this with: php artisan credits:reset
     */
    protected $signature = 'credits:reset';

    /**
     * The console command description.
     */
    protected $description = 'Reset all users credits to 100 (runs daily)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Count users who currently have less than 100 credits
        $usersToReset = User::where('credits', '<', 100)->count();

        if ($usersToReset === 0) {
            $this->info('ℹ️  All users already have 100+ credits. Nothing to reset.');
            return Command::SUCCESS;
        }

        // Reset all users back to 100 credits
        User::query()->update(['credits' => 100]);

        $this->info("✅ Successfully reset credits for {$usersToReset} users back to 100.");
        
        return Command::SUCCESS;
    }
}