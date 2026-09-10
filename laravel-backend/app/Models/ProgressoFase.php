<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressoFase extends Model
{
    protected $table = 'progresso_fases';
    protected $primaryKey = 'id_progresso';
    public $timestamps = false;

    protected $fillable = [
        'id_aluno', 'id_fase', 'status', 'pontuacao_fase', 'tentativas', 'iniciado_em', 'concluido_em',
    ];
}
