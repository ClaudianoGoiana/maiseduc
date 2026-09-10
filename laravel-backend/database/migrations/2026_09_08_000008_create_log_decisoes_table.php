<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('log_decisoes')) {
            return;
        }

        Schema::create('log_decisoes', function (Blueprint $table) {
            $table->integer('id_log')->autoIncrement();
            $table->integer('id_aluno');
            $table->integer('id_fase');
            $table->string('id_decisao', 50);
            $table->enum('categoria', ['etica', 'logica', 'seguranca']);
            $table->enum('classificacao', ['correta', 'neutra', 'catastrofica']);
            $table->integer('pontos_ganhos')->default(0);
            $table->string('texto_escolha', 255);
            $table->text('feedback_exibido')->nullable();
            $table->timestamp('criado_em')->useCurrent();

            $table->index(['id_fase', 'classificacao'], 'idx_professor_analise');
            $table->foreign('id_aluno')->references('id_aluno')->on('alunos')->onDelete('cascade');
            $table->foreign('id_fase')->references('id_fase')->on('fases')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_decisoes');
    }
};
