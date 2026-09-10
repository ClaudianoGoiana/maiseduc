<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Professor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Agrupa as ações do domínio "professor": cadastro e login.
 */
class ProfessorController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        return match ($request->query('acao')) {
            'cadastro' => $this->cadastro($request),
            'login' => $this->login($request),
            default => ApiResponse::error('Ação inválida para o domínio "professor".', 404),
        };
    }

    private function cadastro(Request $request): JsonResponse
    {
        $nome = trim((string) $request->input('nome', ''));
        $email = strtolower(trim((string) $request->input('email', '')));
        $senha = (string) $request->input('senha', '');
        $escola = trim((string) $request->input('escola', ''));

        if (mb_strlen($nome) < 3 || mb_strlen($nome) > 120) {
            return ApiResponse::error('Informe um nome entre 3 e 120 caracteres.', 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
            return ApiResponse::error('Informe um e-mail válido.', 422);
        }
        if (strlen($senha) < 8) {
            return ApiResponse::error('A senha deve ter pelo menos 8 caracteres.', 422);
        }

        if (DB::table('professores')->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            return ApiResponse::error('Este e-mail institucional já possui cadastro.', 409);
        }

        $professor = Professor::create([
            'nome' => $nome,
            'email' => $email,
            'senha_hash' => bcrypt($senha),
            'escola' => $escola !== '' ? $escola : null,
        ]);

        return ApiResponse::success([
            'professor' => [
                'id_professor' => $professor->id_professor,
                'nome' => $nome,
                'email' => $email,
                'escola' => $escola,
            ],
        ], 201);
    }

    private function login(Request $request): JsonResponse
    {
        $email = strtolower(trim((string) $request->input('email', '')));
        $senha = (string) $request->input('senha', '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $senha === '') {
            return ApiResponse::error('Informe e-mail e senha válidos.', 422);
        }

        $professor = Professor::where('email', $email)->first();

        if (!$professor || !password_verify($senha, $professor->senha_hash)) {
            return ApiResponse::error('E-mail ou senha incorretos.', 401);
        }

        return ApiResponse::success([
            'professor' => [
                'id_professor' => $professor->id_professor,
                'nome' => $professor->nome,
                'email' => $professor->email,
                'escola' => $professor->escola ?? '',
            ],
        ]);
    }
}
