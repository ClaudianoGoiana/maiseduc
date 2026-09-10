<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogDecisao extends Model
{
    protected $table = 'log_decisoes';
    protected $primaryKey = 'id_log';
    public $timestamps = false;

    const CREATED_AT = 'criado_em';

    protected $fillable = [
        'id_aluno', 'id_fase', 'id_decisao', 'categoria', 'classificacao',
        'pontos_ganhos', 'texto_escolha', 'feedback_exibido',
    ];
}
