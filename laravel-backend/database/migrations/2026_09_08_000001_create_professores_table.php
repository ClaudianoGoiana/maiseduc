<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Mantém compatibilidade com a tabela pré-existente na Hostinger (só cria se não existir)
        if (Schema::hasTable('professores')) {
            return;
        }

        Schema::create('professores', function (Blueprint $table) {
            $table->integer('id_professor')->autoIncrement();
            $table->string('nome', 120);
            $table->string('email', 150)->unique();
            $table->string('senha_hash', 255);
            $table->string('token_recuperacao', 64)->nullable();
            $table->dateTime('token_expira_em')->nullable();
            $table->string('escola', 150)->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professores');
    }
};
