<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogMissaoLinguagem extends Model
{
    protected $table = 'log_missoes_linguagens';
    protected $primaryKey = 'id_log_missao';
    public $timestamps = false;

    const CREATED_AT = 'criado_em';

    protected $fillable = [
        'id_aluno', 'linguagem', 'id_modulo', 'numero_missao', 'resposta_escolhida',
        'resposta_correta', 'correta', 'tentativa', 'pontos_obtidos',
    ];
}
