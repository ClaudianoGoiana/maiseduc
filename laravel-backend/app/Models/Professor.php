<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Professor extends Model
{
    protected $table = 'professores';
    protected $primaryKey = 'id_professor';
    public $timestamps = false;

    const CREATED_AT = 'criado_em';

    protected $fillable = ['nome', 'email', 'senha_hash', 'escola', 'token_recuperacao', 'token_expira_em'];
    protected $hidden = ['senha_hash', 'token_recuperacao'];

    public function turmas()
    {
        return $this->hasMany(Turma::class, 'id_professor', 'id_professor');
    }
}
