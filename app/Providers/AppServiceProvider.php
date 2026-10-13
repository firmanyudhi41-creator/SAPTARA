<?php

namespace App\Providers;

use DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Larang perintah destruktif seperti migrate:fresh jika terhubung ke server/production
        DB::prohibitDestructiveCommands(
            $this->app->environment('production') || config('database.connections.mysql.host') !== '127.0.0.1'
        );
        Schema::defaultStringLength(191);
    }
}
