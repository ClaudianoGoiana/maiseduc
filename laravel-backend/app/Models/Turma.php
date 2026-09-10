<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Turma extends Model
{
    protected $table = 'turmas';
    protected $primaryKey = 'id_turma';
    public $timestamps = false;

    const CREATED_AT = 'criado_em';

    protected $fillable = ['id_professor', 'nome_turma', 'codigo_acesso'];

    public function professor()
    {
        return $this->belongsTo(Professor::class, 'id_professor', 'id_professor');
    }

    public function alunos()
    {
        return $this->hasMany(Aluno::class, 'id_turma', 'id_turma');
    }
}
