<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressoLinguagem extends Model
{
    protected $table = 'progresso_linguagens';
    protected $primaryKey = 'id_progresso_linguagem';
    public $timestamps = false;

    protected $fillable = [
        'id_aluno', 'linguagem', 'id_modulo', 'missoes_concluidas', 'nota_modulo', 'vezes_concluido',
    ];
}
