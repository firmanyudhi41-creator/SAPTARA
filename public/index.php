<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Tentukan direktori dasar aplikasi Laravel (mendukung mode cPanel terpisah ../saptara atau standar ../)
$appDirs = [
    __DIR__.'/../saptara',
    __DIR__.'/..',
];

$baseAppDir = null;
foreach ($appDirs as $dir) {
    if (file_exists($dir.'/vendor/autoload.php') && file_exists($dir.'/bootstrap/app.php')) {
        $baseAppDir = $dir;
        break;
    }
}

if (! $baseAppDir) {
    http_response_code(500);
    exit('Direktori aplikasi Laravel (vendor/autoload.php atau bootstrap/app.php) tidak ditemukan.');
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $baseAppDir.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $baseAppDir.'/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $baseAppDir.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
