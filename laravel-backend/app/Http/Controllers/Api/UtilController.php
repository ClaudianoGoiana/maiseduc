<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Aluno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * Ações utilitárias diversas: contato, registro de decisões narrativas,
 * teste de decisão e diagnóstico do banco (debug).
 */
class UtilController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        return match ($request->query('acao')) {
            'send_contact' => $this->sendContact($request),
            'save_decision' => $this->saveDecision($request),
            'test_save_decision' => $this->testSaveDecision(),
            'debug' => $this->debug(),
            default => ApiResponse::error('Ação inválida para o domínio "util".', 404),
        };
    }

    private function sendContact(Request $request): JsonResponse
    {
        $nome = trim((string) $request->input('nome', ''));
        $email = trim((string) $request->input('email', ''));
        $mensagem = trim((string) $request->input('mensagem', ''));

        if ($nome === '' || mb_strlen($nome) > 120 || $mensagem === '' || mb_strlen($mensagem) > 5000 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ApiResponse::error('Preencha nome, e-mail válido e mensagem.', 422);
        }

        $destinatario = config('mail.contact_receiver');
        $assunto = 'Contato pelo Cidadão Digital - ' . preg_replace('/[\r\n]+/', ' ', $nome);
        $corpo = "Nome: {$nome}\nE-mail: {$email}\n\nMensagem:\n{$mensagem}";

        try {
            Mail::raw($corpo, function ($msg) use ($destinatario, $assunto, $email) {
                $msg->to($destinatario)->subject($assunto)->replyTo($email);
            });
        } catch (\Throwable $e) {
            report($e);

            return ApiResponse::error('O servidor não conseguiu enviar o e-mail. Configure o serviço de e-mail da hospedagem.', 500);
        }

        return ApiResponse::success(['mensagem' => 'Mensagem enviada diretamente para o e-mail de contato.']);
    }

    private function saveDecision(Request $request): JsonResponse
    {
        $payload = $request->all();

        foreach (['id_aluno', 'id_fase', 'id_decisao', 'categoria', 'classificacao', 'pontos_ganhos', 'texto_escolha', 'feedback_exibido'] as $campo) {
            if (!array_key_exists($campo, $payload)) {
                return ApiResponse::error("Campo obrigatório ausente: {$campo}", 422);
            }
        }

        $idAluno = filter_var($payload['id_aluno'] ?? null, FILTER_VALIDATE_INT) ?: 0;
        $emailAluno = strtolower(trim((string) ($payload['email'] ?? '')));
        $idFase = filter_var($payload['id_fase'], FILTER_VALIDATE_INT);
        $idDecisao = substr((string) $payload['id_decisao'], 0, 50);
        $categoria = $payload['categoria'];
        $classificacao = $payload['classificacao'];
        $pontosGanhos = is_numeric($payload['pontos_ganhos'] ?? null) ? (float) $payload['pontos_ganhos'] : false;
        $textoEscolha = substr((string) $payload['texto_escolha'], 0, 255);
        $feedbackExibido = (string) $payload['feedback_exibido'];
        $pontosPorCategoria = $payload['pontos_por_categoria'] ?? [$categoria => $pontosGanhos];

        $categoriasValidas = ['etica', 'logica', 'seguranca'];
        $classificacoesValidas = ['correta', 'neutra', 'catastrofica'];

        if ($idFase === false || $pontosGanhos === false) {
            return ApiResponse::error('Tipos inválidos para id_fase ou pontos_ganhos', 422);
        }
        if (!in_array($categoria, $categoriasValidas, true)) {
            return ApiResponse::error('Categoria inválida', 422);
        }
        if (!in_array($classificacao, $classificacoesValidas, true)) {
            return ApiResponse::error('Classificação inválida', 422);
        }

        foreach ($categoriasValidas as $categoriaValida) {
            if (array_key_exists($categoriaValida, $pontosPorCategoria)) {
                $val = $pontosPorCategoria[$categoriaValida];
                $pontosPorCategoria[$categoriaValida] = is_numeric($val) ? (float) $val : false;
                if ($pontosPorCategoria[$categoriaValida] === false) {
                    return ApiResponse::error('Pontuação inválida', 422);
                }
            } else {
                $pontosPorCategoria[$categoriaValida] = 0.0;
            }
        }

        try {
            return DB::transaction(function () use ($idAluno, $emailAluno, $idFase, $idDecisao, $categoria, $classificacao, $pontosGanhos, $textoEscolha, $feedbackExibido, $pontosPorCategoria) {
                if ($idAluno > 0 && !Aluno::where('id_aluno', $idAluno)->exists()) {
                    $idAluno = 0;
                }
                if ($idAluno <= 0 && $emailAluno !== '') {
                    $idAluno = (int) (Aluno::whereRaw('LOWER(email) = ?', [$emailAluno])->value('id_aluno') ?? 0);
                }
                if ($idAluno <= 0) {
                    return ApiResponse::error('Aluno não encontrado no banco de dados', 422);
                }

                // 1) Registra o log de decisão (rastreabilidade para o professor)
                $idLog = DB::table('log_decisoes')->insertGetId([
                    'id_aluno' => $idAluno,
                    'id_fase' => $idFase,
                    'id_decisao' => $idDecisao,
                    'categoria' => $categoria,
                    'classificacao' => $classificacao,
                    'pontos_ganhos' => $pontosGanhos,
                    'texto_escolha' => $textoEscolha,
                    'feedback_exibido' => $feedbackExibido,
                    'criado_em' => now(),
                ]);

                // 2) Atualiza os três indicadores de XP em uma única transação
                DB::table('alunos')->where('id_aluno', $idAluno)->update([
                    'xp_etica' => DB::raw('xp_etica + ' . $pontosPorCategoria['etica']),
                    'xp_logica' => DB::raw('xp_logica + ' . $pontosPorCategoria['logica']),
                    'xp_seguranca' => DB::raw('xp_seguranca + ' . $pontosPorCategoria['seguranca']),
                ]);

                // 3) Garante/atualiza o progresso na fase
                DB::table('progresso_fases')->updateOrInsert(
                    ['id_aluno' => $idAluno, 'id_fase' => $idFase],
                    [
                        'status' => 'concluido',
                        'pontuacao_fase' => DB::raw('COALESCE(pontuacao_fase, 0) + ' . $pontosGanhos),
                        'tentativas' => DB::raw('COALESCE(tentativas, 0) + 1'),
                        'iniciado_em' => DB::raw('COALESCE(iniciado_em, NOW())'),
                    ]
                );

                return ApiResponse::success([
                    'mensagem' => 'Decisão registrada com sucesso.',
                    'id_log' => $idLog,
                ], 201);
            });
        } catch (\Throwable $e) {
            report($e);

            return ApiResponse::error('Erro interno ao processar a decisão.', 500);
        }
    }

    /** Simula uma chamada de save_decision para diagnóstico local. */
    private function testSaveDecision(): JsonResponse
    {
        $payload = [
            'id_aluno' => 1, 'id_fase' => 1, 'id_decisao' => 'fase1_escolha_test',
            'categoria' => 'etica', 'classificacao' => 'correta', 'pontos_ganhos' => 20,
            'texto_escolha' => 'Teste de salvar decisão', 'feedback_exibido' => 'Feedback de teste',
        ];

        $resultado = ['timestamp' => now()->toDateTimeString(), 'payload' => $payload, 'execucao' => []];

        try {
            DB::transaction(function () use ($payload, &$resultado) {
                $resultado['execucao'][] = 'Conexão iniciada';

                DB::table('log_decisoes')->insert([
                    'id_aluno' => $payload['id_aluno'],
                    'id_fase' => $payload['id_fase'],
                    'id_decisao' => $payload['id_decisao'],
                    'categoria' => $payload['categoria'],
                    'classificacao' => $payload['classificacao'],
                    'pontos_ganhos' => $payload['pontos_ganhos'],
                    'texto_escolha' => $payload['texto_escolha'],
                    'feedback_exibido' => $payload['feedback_exibido'],
                    'criado_em' => now(),
                ]);
                $resultado['execucao'][] = 'INSERT em log_decisoes OK';

                $colunaXp = 'xp_' . $payload['categoria'];
                DB::table('alunos')->where('id_aluno', $payload['id_aluno'])
                    ->update([$colunaXp => DB::raw("{$colunaXp} + {$payload['pontos_ganhos']}")]);
                $resultado['execucao'][] = 'UPDATE de XP OK';

                DB::table('progresso_fases')->updateOrInsert(
                    ['id_aluno' => $payload['id_aluno'], 'id_fase' => $payload['id_fase']],
                    [
                        'status' => 'concluido',
                        'pontuacao_fase' => DB::raw('COALESCE(pontuacao_fase, 0) + ' . $payload['pontos_ganhos']),
                        'tentativas' => DB::raw('COALESCE(tentativas, 0) + 1'),
                        'iniciado_em' => DB::raw('COALESCE(iniciado_em, NOW())'),
                    ]
                );
                $resultado['execucao'][] = 'INSERT/UPDATE em progresso_fases OK';
            });

            return ApiResponse::success($resultado);
        } catch (\Throwable $e) {
            $resultado['errors'][] = 'Erro: ' . $e->getMessage();

            return ApiResponse::success($resultado);
        }
    }

    /** Diagnóstico de conexão e estrutura do banco. */
    private function debug(): JsonResponse
    {
        $debug = ['timestamp' => now()->toDateTimeString(), 'database' => [], 'tables' => [], 'errors' => []];

        try {
            $debug['database']['connected'] = true;
            $debug['database']['name'] = config('database.connections.mysql.database');

            foreach (['alunos', 'log_decisoes', 'progresso_fases'] as $tabela) {
                try {
                    $debug['tables'][$tabela] = array_map(fn ($c) => $c->Field, DB::select("DESCRIBE {$tabela}"));
                } catch (\Throwable $e) {
                    $debug['errors'][] = "Erro ao descrever {$tabela}: " . $e->getMessage();
                }
            }

            $aluno = DB::table('alunos')->select('id_aluno', 'nome', 'email', 'xp_etica', 'xp_logica', 'xp_seguranca')->where('id_aluno', 1)->first();
            $debug['database']['aluno_1'] = $aluno ?: 'Não encontrado';
            $debug['database']['log_decisoes_count'] = DB::table('log_decisoes')->count();
        } catch (\Throwable $e) {
            $debug['database']['connected'] = false;
            $debug['errors'][] = 'Erro de conexão: ' . $e->getMessage();
        }

        return ApiResponse::success($debug);
    }
}
