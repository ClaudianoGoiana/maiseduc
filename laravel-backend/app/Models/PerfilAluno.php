<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfilAluno extends Model
{
    protected $table = 'perfil_aluno';
    protected $primaryKey = 'id_perfil';
    public $timestamps = false;

    const CREATED_AT = 'criado_em';

    protected $fillable = [
        'id_aluno', 'fase_alcancada', 'tipo_aluno', 'confianca_score',
        'score_critico', 'score_passivo', 'score_etico', 'score_pragmatico',
        'score_investigador', 'score_ativista', 'score_hacker', 'score_engenheiro',
    ];
}
