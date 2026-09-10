<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Aluno;
use App\Models\Turma;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Agrupa as ações do domínio "turma": criar, listar, vincular, excluir.
 */
class TurmaController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        return match ($request->query('acao')) {
            'criar' => $this->criar($request),
            'listar' => $this->listar($request),
            'vincular' => $this->vincular($request),
            'excluir' => $this->excluir($request),
            default => ApiResponse::error('Ação inválida para o domínio "turma".', 404),
        };
    }

    private function criar(Request $request): JsonResponse
    {
        $idProfessor = (int) $request->input('id_professor', 0);
        $nomeTurma = trim((string) $request->input('nome_turma', $request->input('nome', '')));

        if ($idProfessor <= 0) {
            return ApiResponse::error('Professor não identificado. Faça login novamente.', 401);
        }
        if (mb_strlen($nomeTurma) < 2 || mb_strlen($nomeTurma) > 100) {
            return ApiResponse::error('Informe um nome de turma entre 2 e 100 caracteres.', 422);
        }

        $codigoAcesso = '';
        for ($tentativa = 0; $tentativa < 10; $tentativa++) {
            $cand = 'CD-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
            if (!Turma::where('codigo_acesso', $cand)->exists()) {
                $codigoAcesso = $cand;
                break;
            }
        }
        if ($codigoAcesso === '') {
            $codigoAcesso = 'CD-' . strtoupper(substr(uniqid(), -6));
        }

        $turma = Turma::create([
            'id_professor' => $idProfessor,
            'nome_turma' => $nomeTurma,
            'codigo_acesso' => $codigoAcesso,
        ]);

        return ApiResponse::success([
            'turma' => [
                'id_turma' => $turma->id_turma,
                'nome' => $nomeTurma,
                'codigo' => $codigoAcesso,
                'total_alunos' => 0,
                'media_pontuacao' => 0,
            ],
        ], 201);
    }

    private function listar(Request $request): JsonResponse
    {
        $idProfessor = (int) $request->query('id_professor', 0);

        $query = Turma::query()
            ->select([
                'turmas.id_turma', 'turmas.nome_turma', 'turmas.codigo_acesso', 'turmas.criado_em',
                DB::raw('COUNT(alunos.id_aluno) AS total_alunos'),
                DB::raw('COALESCE(ROUND(AVG(COALESCE(alunos.xp_etica, 0) + COALESCE(alunos.xp_logica, 0) + GREATEST(COALESCE(alunos.xp_linguagens, 0), COALESCE(pl_sum.total_ling, 0)) + COALESCE(alunos.xp_seguranca, 0)), 1), 0) AS media_pontuacao'),
            ])
            ->leftJoin('alunos', 'alunos.id_turma', '=', 'turmas.id_turma')
            ->leftJoinSub(
                DB::table('progresso_linguagens')
                    ->select('id_aluno', DB::raw('COALESCE(SUM(nota_modulo), 0) AS total_ling'))
                    ->groupBy('id_aluno'),
                'pl_sum',
                'pl_sum.id_aluno',
                '=',
                'alunos.id_aluno'
            )
            ->groupBy('turmas.id_turma', 'turmas.nome_turma', 'turmas.codigo_acesso', 'turmas.criado_em')
            ->orderByDesc('turmas.id_turma');

        if ($idProfessor > 0) {
            $query->where('turmas.id_professor', $idProfessor);
        }

        $turmas = $query->get()->map(fn ($t) => [
            'id_turma' => (int) $t->id_turma,
            'nome' => $t->nome_turma,
            'codigo' => $t->codigo_acesso,
            'total_alunos' => (int) $t->total_alunos,
            'media_pontuacao' => (float) $t->media_pontuacao,
            'criado_em' => $t->criado_em,
        ]);

        return ApiResponse::success(['turmas' => $turmas]);
    }

    private function vincular(Request $request): JsonResponse
    {
        $idAluno = (int) $request->input('id_aluno', 0);
        $codigoTurma = trim((string) $request->input('codigo_turma', $request->input('turma', '')));

        if ($idAluno <= 0) {
            return ApiResponse::error('Aluno não autenticado.', 401);
        }
        if ($codigoTurma === '') {
            return ApiResponse::error('Informe o número ou código da turma.', 422);
        }

        $aluno = Aluno::find($idAluno);
        if (!$aluno) {
            return ApiResponse::error('Aluno não encontrado.', 404);
        }

        $isNum = ctype_digit($codigoTurma);
        $turma = Turma::query()
            ->where('codigo_acesso', strtoupper($codigoTurma))
            ->orWhere(function ($q) use ($isNum, $codigoTurma) {
                if ($isNum) {
                    $q->where('id_turma', (int) $codigoTurma);
                }
            })
            ->orWhere('nome_turma', $codigoTurma)
            ->first();

        if (!$turma) {
            return ApiResponse::error('Turma não encontrada. Verifique o número ou código informado.', 404);
        }

        $aluno->update(['id_turma' => $turma->id_turma]);

        return ApiResponse::success([
            'turma' => [
                'id_turma' => $turma->id_turma,
                'nome_turma' => $turma->nome_turma,
            ],
        ]);
    }

    private function excluir(Request $request): JsonResponse
    {
        $idProfessor = (int) $request->input('id_professor', $request->query('id_professor', 0));
        $idTurma = (int) $request->input('id_turma', $request->query('id_turma', 0));

        if ($idTurma <= 0) {
            return ApiResponse::error('Identificador da turma (id_turma) não informado.', 422);
        }

        $turma = Turma::find($idTurma);
        if (!$turma) {
            return ApiResponse::error('Esta turma não existe ou já foi excluída.', 404);
        }
        if ($idProfessor > 0 && (int) $turma->id_professor !== $idProfessor) {
            return ApiResponse::error('Você não tem permissão para excluir esta turma.', 403);
        }

        DB::transaction(function () use ($turma) {
            Aluno::where('id_turma', $turma->id_turma)->update(['id_turma' => null]);
            $turma->delete();
        });

        return ApiResponse::success([
            'mensagem' => "Turma '{$turma->nome_turma}' excluída com sucesso.",
            'id_turma' => $idTurma,
        ]);
    }
}
