<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('turmas')) {
            return;
        }

        Schema::create('turmas', function (Blueprint $table) {
            $table->integer('id_turma')->autoIncrement();
            $table->integer('id_professor');
            $table->string('nome_turma', 100);
            $table->string('codigo_acesso', 20)->unique();
            $table->timestamp('criado_em')->useCurrent();

            $table->foreign('id_professor')->references('id_professor')->on('professores')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turmas');
    }
};
