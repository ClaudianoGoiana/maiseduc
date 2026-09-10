<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('progresso_linguagens')) {
            return;
        }

        Schema::create('progresso_linguagens', function (Blueprint $table) {
            $table->integer('id_progresso_linguagem')->autoIncrement();
            $table->integer('id_aluno');
            $table->string('linguagem', 30);
            $table->string('id_modulo', 100);
            $table->unsignedTinyInteger('missoes_concluidas')->default(0);
            $table->decimal('nota_modulo', 5, 2)->default(0);
            $table->unsignedInteger('vezes_concluido')->default(0);
            $table->timestamp('atualizado_em')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['id_aluno', 'linguagem', 'id_modulo'], 'uq_aluno_linguagem_modulo');
            $table->foreign('id_aluno')->references('id_aluno')->on('alunos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progresso_linguagens');
    }
};
