<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('log_missoes_linguagens')) {
            return;
        }

        Schema::create('log_missoes_linguagens', function (Blueprint $table) {
            $table->integer('id_log_missao')->autoIncrement();
            $table->integer('id_aluno');
            $table->string('linguagem', 30);
            $table->string('id_modulo', 100);
            $table->unsignedTinyInteger('numero_missao');
            $table->string('resposta_escolhida', 255);
            $table->string('resposta_correta', 255);
            $table->boolean('correta');
            $table->unsignedTinyInteger('tentativa');
            $table->decimal('pontos_obtidos', 4, 2)->default(0);
            $table->timestamp('criado_em')->useCurrent();

            $table->index(['id_aluno', 'criado_em'], 'idx_log_missao_aluno_data');
            $table->index(['linguagem', 'id_modulo', 'numero_missao'], 'idx_log_missao_trilha');
            $table->foreign('id_aluno')->references('id_aluno')->on('alunos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_missoes_linguagens');
    }
};
