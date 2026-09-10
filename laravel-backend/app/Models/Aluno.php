<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aluno extends Model
{
    protected $table = 'alunos';
    protected $primaryKey = 'id_aluno';
    public $timestamps = false;

    const CREATED_AT = 'criado_em';

    protected $fillable = [
        'id_turma', 'nome', 'email', 'whatsapp', 'senha_hash', 'avatar',
        'xp_etica', 'xp_logica', 'xp_seguranca', 'xp_linguagens', 'nivel',
        'token_recuperacao', 'token_expira_em',
    ];
    protected $hidden = ['senha_hash', 'token_recuperacao'];

    public function turma()
    {
        return $this->belongsTo(Turma::class, 'id_turma', 'id_turma');
    }

    public function progressoLinguagens()
    {
        return $this->hasMany(ProgressoLinguagem::class, 'id_aluno', 'id_aluno');
    }
}
