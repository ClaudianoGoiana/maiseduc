<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('fases')) {
            return;
        }

        Schema::create('fases', function (Blueprint $table) {
            $table->integer('id_fase')->autoIncrement();
            $table->string('codigo', 50)->unique();
            $table->string('titulo', 150);
            $table->string('competencia_bncc', 255)->nullable();
            $table->integer('ordem');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fases');
    }
};
