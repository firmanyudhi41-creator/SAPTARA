<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('schools', 'stamp')) {
            Schema::table('schools', function (Blueprint $table) {
                $table->string('stamp')->nullable()->after('logo');
            });
        }

        Schema::table('teachers', function (Blueprint $table) {
            if (! Schema::hasColumn('teachers', 'nip')) {
                $table->string('nip', 50)->nullable()->after('display_name');
            }
            if (! Schema::hasColumn('teachers', 'signature')) {
                $table->string('signature')->nullable()->after('nip');
            }
            if (! Schema::hasColumn('teachers', 'title')) {
                $table->string('title', 100)->nullable()->after('signature');
            }
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn('stamp');
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['nip', 'signature', 'title']);
        });
    }
};
