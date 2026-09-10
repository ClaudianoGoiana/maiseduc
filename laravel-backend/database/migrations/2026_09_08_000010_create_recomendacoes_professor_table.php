<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('recomendacoes_professor')) {
            return;
        }

        Schema::create('recomendacoes_professor', function (Blueprint $table) {
            $table->increments('id_recomendacao');
            $table->integer('id_aluno');
            $table->integer('id_professor')->nullable();
            $table->string('tipo_aluno', 50)->nullable();
            $table->text('recomendacao_texto')->nullable();
            $table->string('risco_desvio', 150)->nullable();
            $table->string('sugestao_estrategia', 255)->nullable();
            $table->timestamp('criado_em')->useCurrent();

            $table->foreign('id_aluno')->references('id_aluno')->on('alunos')->onDelete('cascade');
            $table->foreign('id_professor')->references('id_professor')->on('professores')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recomendacoes_professor');
    }
};
