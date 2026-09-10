<?php

use App\Http\Controllers\Api\AlunoController;
use App\Http\Controllers\Api\ProfessorController;
use App\Http\Controllers\Api\ProgressoController;
use App\Http\Controllers\Api\TurmaController;
use App\Http\Controllers\Api\UtilController;
use Illuminate\Support\Facades\Route;

// Mantém o contrato usado pelo frontend: /api/{dominio}?acao={acao}
Route::match(['get', 'post'], '/aluno', [AlunoController::class, 'handle']);
Route::match(['get', 'post'], '/professor', [ProfessorController::class, 'handle']);
Route::match(['get', 'post'], '/turma', [TurmaController::class, 'handle']);
Route::match(['get', 'post'], '/progresso', [ProgressoController::class, 'handle']);
Route::match(['get', 'post'], '/util', [UtilController::class, 'handle']);
