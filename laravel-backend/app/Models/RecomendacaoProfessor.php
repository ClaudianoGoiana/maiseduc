<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecomendacaoProfessor extends Model
{
    protected $table = 'recomendacoes_professor';
    protected $primaryKey = 'id_recomendacao';
    public $timestamps = false;

    const CREATED_AT = 'criado_em';

    protected $fillable = [
        'id_aluno', 'id_professor', 'tipo_aluno', 'recomendacao_texto', 'risco_desvio', 'sugestao_estrategia',
    ];
}
