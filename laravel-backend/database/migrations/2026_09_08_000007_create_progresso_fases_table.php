<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('progresso_fases')) {
            return;
        }

        Schema::create('progresso_fases', function (Blueprint $table) {
            $table->integer('id_progresso')->autoIncrement();
            $table->integer('id_aluno');
            $table->integer('id_fase');
            $table->enum('status', ['nao_iniciado', 'em_andamento', 'concluido'])->default('nao_iniciado');
            $table->integer('pontuacao_fase')->default(0);
            $table->integer('tentativas')->default(0);
            $table->timestamp('iniciado_em')->nullable();
            $table->timestamp('concluido_em')->nullable();

            $table->unique(['id_aluno', 'id_fase'], 'uq_aluno_fase');
            $table->foreign('id_aluno')->references('id_aluno')->on('alunos')->onDelete('cascade');
            $table->foreign('id_fase')->references('id_fase')->on('fases')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progresso_fases');
    }
};
