<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('alunos')) {
            return;
        }

        Schema::create('alunos', function (Blueprint $table) {
            $table->integer('id_aluno')->autoIncrement();
            $table->integer('id_turma')->nullable();
            $table->string('nome', 120);
            $table->string('email', 150)->unique();
            $table->string('whatsapp', 20)->nullable();
            $table->string('senha_hash', 255);
            $table->string('token_recuperacao', 64)->nullable();
            $table->dateTime('token_expira_em')->nullable();
            $table->string('avatar', 50)->default('hacker_default');
            $table->decimal('xp_etica', 10, 1)->default(0);
            $table->decimal('xp_logica', 10, 1)->default(0);
            $table->decimal('xp_seguranca', 10, 1)->default(0);
            $table->decimal('xp_linguagens', 10, 1)->default(0);
            $table->integer('nivel')->default(1);
            $table->timestamp('criado_em')->useCurrent();

            $table->foreign('id_turma')->references('id_turma')->on('turmas')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alunos');
    }
};
