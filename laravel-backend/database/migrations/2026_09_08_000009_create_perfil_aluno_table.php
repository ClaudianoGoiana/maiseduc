<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('perfil_aluno')) {
            return;
        }

        Schema::create('perfil_aluno', function (Blueprint $table) {
            $table->increments('id_perfil');
            $table->integer('id_aluno');
            $table->integer('fase_alcancada');
            $table->string('tipo_aluno', 50);
            $table->integer('confianca_score')->default(0);
            $table->integer('score_critico')->default(0);
            $table->integer('score_passivo')->default(0);
            $table->integer('score_etico')->default(0);
            $table->integer('score_pragmatico')->default(0);
            $table->integer('score_investigador')->default(0);
            $table->integer('score_ativista')->default(0);
            $table->integer('score_hacker')->default(0);
            $table->integer('score_engenheiro')->default(0);
            $table->timestamp('criado_em')->useCurrent();

            $table->index(['id_aluno', 'fase_alcancada'], 'idx_aluno_fase');
            $table->foreign('id_aluno')->references('id_aluno')->on('alunos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perfil_aluno');
    }
};
