<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Aluno;
use App\Models\Professor;
use App\Models\Turma;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Agrupa as ações do domínio "aluno": listar, cadastrar, login, setup,
 * redefinir_senha, solicitar_recuperacao. Dispatch via ?acao=.
 */
class AlunoController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        return match ($request->query('acao')) {
            'listar' => $this->listar($request),
            'cadastrar' => $this->cadastrar($request),
            'login' => $this->login($request),
            'setup' => $this->setup(),
            'redefinir_senha' => $this->redefinirSenha($request),
            'solicitar_recuperacao' => $this->solicitarRecuperacao($request),
            default => ApiResponse::error('Ação inválida para o domínio "aluno".', 404),
        };
    }

    private function listar(Request $request): JsonResponse
    {
        $idProfessor = (int) $request->query('id_professor', 0);
        $idTurma = (int) $request->query('id_turma', 0);

        $query = Aluno::query()
            ->select([
                'alunos.id_aluno', 'alunos.nome', 'alunos.email', 'alunos.whatsapp', 'alunos.id_turma',
                'turmas.nome_turma', 'turmas.codigo_acesso',
                DB::raw('COALESCE(alunos.xp_etica, 0) AS xp_etica'),
                DB::raw('COALESCE(alunos.xp_logica, 0) AS xp_logica'),
                DB::raw('COALESCE(alunos.xp_seguranca, 0) AS xp_seguranca'),
                DB::raw('GREATEST(COALESCE(alunos.xp_linguagens, 0), COALESCE(pl_sum.total_ling, 0)) AS xp_linguagens'),
                DB::raw('(COALESCE(alunos.xp_etica, 0) + COALESCE(alunos.xp_logica, 0) + GREATEST(COALESCE(alunos.xp_linguagens, 0), COALESCE(pl_sum.total_ling, 0)) + COALESCE(alunos.xp_seguranca, 0)) AS xp_total'),
                'alunos.nivel', 'alunos.criado_em',
                // Taxa de acerto = respostas certas / total de tentativas (missões de linguagens + decisões narrativas)
                DB::raw('ROUND((COALESCE(missoes.corretas, 0) + COALESCE(decisoes.corretas, 0)) / NULLIF(COALESCE(missoes.total, 0) + COALESCE(decisoes.total, 0), 0) * 100, 1) AS taxa_acerto'),
            ])
            ->join('turmas', 'turmas.id_turma', '=', 'alunos.id_turma')
            ->leftJoinSub(
                DB::table('log_missoes_linguagens')
                    ->select('id_aluno', DB::raw('COUNT(*) AS total'), DB::raw('SUM(correta) AS corretas'))
                    ->groupBy('id_aluno'),
                'missoes',
                'missoes.id_aluno',
                '=',
                'alunos.id_aluno'
            )
            ->leftJoinSub(
                DB::table('log_decisoes')
                    ->select('id_aluno', DB::raw('COUNT(*) AS total'), DB::raw("SUM(CASE WHEN classificacao = 'correta' THEN 1 ELSE 0 END) AS corretas"))
                    ->groupBy('id_aluno'),
                'decisoes',
                'decisoes.id_aluno',
                '=',
                'alunos.id_aluno'
            )
            ->leftJoinSub(
                DB::table('progresso_linguagens')
                    ->select('id_aluno', DB::raw('COALESCE(SUM(nota_modulo), 0) AS total_ling'))
                    ->groupBy('id_aluno'),
                'pl_sum',
                'pl_sum.id_aluno',
                '=',
                'alunos.id_aluno'
            )
            ->orderBy('alunos.nome');

        if ($idProfessor > 0) {
            $query->where('turmas.id_professor', $idProfessor);
        }
        if ($idTurma > 0) {
            $query->where('alunos.id_turma', $idTurma);
        }

        $alunos = $query->get()->map(function ($aluno) {
            $aluno->xp_etica = (float) $aluno->xp_etica;
            $aluno->xp_logica = (float) $aluno->xp_logica;
            $aluno->xp_seguranca = (float) $aluno->xp_seguranca;
            $aluno->xp_linguagens = (float) $aluno->xp_linguagens;
            $aluno->xp_total = (float) $aluno->xp_total;
            $aluno->nivel = (int) $aluno->nivel;
            // null = aluno ainda não tentou nenhuma missão/decisão (não confundir com 0% de acerto)
            $aluno->taxa_acerto = $aluno->taxa_acerto === null ? null : (float) $aluno->taxa_acerto;

            return $aluno;
        });

        return ApiResponse::success(['alunos' => $alunos]);
    }

    private function cadastrar(Request $request): JsonResponse
    {
        $nome = trim((string) $request->input('nome', ''));
        $email = strtolower(trim((string) $request->input('email', '')));
        $senha = (string) $request->input('senha', '');
        $whatsapp = preg_replace('/\D+/', '', (string) $request->input('whatsapp', ''));
        $turmaInput = trim((string) $request->input('turma', $request->input('codigo_turma', $request->input('numero_turma', ''))));

        if (mb_strlen($nome) < 3 || mb_strlen($nome) > 120) {
            return ApiResponse::error('Informe um nome entre 3 e 120 caracteres.', 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
            return ApiResponse::error('Informe um e-mail válido.', 422);
        }
        if (strlen($whatsapp) < 10 || strlen($whatsapp) > 15) {
            return ApiResponse::error('Informe um WhatsApp válido com DDD.', 422);
        }
        if (strlen($senha) < 8) {
            return ApiResponse::error('A senha deve ter pelo menos 8 caracteres.', 422);
        }
        if ($turmaInput === '') {
            return ApiResponse::error('Informe o número ou código da turma.', 422);
        }

        $isNum = ctype_digit($turmaInput);
        $turma = Turma::query()
            ->where('codigo_acesso', strtoupper($turmaInput))
            ->orWhere(function ($q) use ($isNum, $turmaInput) {
                if ($isNum) {
                    $q->where('id_turma', (int) $turmaInput);
                }
            })
            ->orWhere('nome_turma', $turmaInput)
            ->first();

        if (!$turma) {
            if (Turma::count() > 0) {
                return ApiResponse::error('Turma não encontrada. Verifique o número ou código fornecido pelo professor.', 422);
            }

            // Banco de turmas vazio: cria turma e professor padrão para não bloquear o funcionamento inicial
            $professor = Professor::query()->first();
            if (!$professor) {
                $professor = Professor::create([
                    'nome' => 'Professor Coordenador',
                    'email' => 'coordenador@escola.com',
                    'senha_hash' => bcrypt('SenhaPadrao!2026'),
                    'escola' => 'Escola Digital',
                ]);
            }

            $nomeCriada = $isNum ? "Turma {$turmaInput}" : $turmaInput;
            $codigoCriado = strtoupper($isNum ? "TURMA-{$turmaInput}" : (preg_match('/^[A-Z0-9-]{4,20}$/', $turmaInput) ? $turmaInput : 'CD-' . substr(md5(uniqid()), 0, 6)));

            $turma = Turma::create([
                'id_professor' => $professor->id_professor,
                'nome_turma' => $nomeCriada,
                'codigo_acesso' => $codigoCriado,
            ]);
        }

        if (Aluno::where('email', $email)->exists()) {
            return ApiResponse::error('Este e-mail já possui cadastro.', 409);
        }

        $aluno = Aluno::create([
            'id_turma' => $turma->id_turma,
            'nome' => $nome,
            'email' => $email,
            'whatsapp' => $whatsapp,
            'senha_hash' => bcrypt($senha),
        ]);

        return ApiResponse::success([
            'aluno' => [
                'id_aluno' => $aluno->id_aluno,
                'nome' => $nome,
                'email' => $email,
                'id_turma' => $turma->id_turma,
                'nome_turma' => $turma->nome_turma,
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

        $aluno = Aluno::with('turma')->where('email', $email)->first();

        if (!$aluno || !password_verify($senha, $aluno->senha_hash)) {
            return ApiResponse::error('E-mail ou senha incorretos.', 401);
        }

        return ApiResponse::success([
            'aluno' => [
                'id_aluno' => $aluno->id_aluno,
                'nome' => $aluno->nome,
                'email' => $aluno->email,
                'id_turma' => $aluno->id_turma ? (int) $aluno->id_turma : null,
                'nome_turma' => $aluno->turma->nome_turma ?? null,
            ],
        ]);
    }

    /** Garante que o aluno de teste (id 1) exista; usado em setup local/dev. */
    private function setup(): JsonResponse
    {
        if (Aluno::where('id_aluno', 1)->exists()) {
            return ApiResponse::success(['status' => 'aluno_existe', 'mensagem' => 'Aluno 1 já existe no banco de dados']);
        }

        DB::table('alunos')->insert([
            'id_aluno' => 1,
            'id_turma' => 1,
            'nome' => 'Jogador Teste',
            'email' => 'jogador@teste.com',
            'senha_hash' => '',
            'xp_etica' => 0,
            'xp_logica' => 0,
            'xp_seguranca' => 0,
            'nivel' => 1,
        ]);

        return ApiResponse::success(['status' => 'aluno_criado', 'mensagem' => 'Aluno 1 foi criado com sucesso']);
    }

    private function redefinirSenha(Request $request): JsonResponse
    {
        $email = strtolower(trim((string) $request->input('email', '')));
        $token = trim((string) $request->input('token', ''));
        $novaSenha = (string) $request->input('nova_senha', '');
        $tipo = strtolower(trim((string) $request->input('tipo', 'aluno')));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $token === '' || strlen($novaSenha) < 6) {
            return ApiResponse::error('E-mail, código/token válido e nova senha com no mínimo 6 caracteres são obrigatórios.', 422);
        }

        $tabela = $tipo === 'professor' ? 'professores' : 'alunos';

        $usuario = DB::table($tabela)
            ->whereRaw('LOWER(email) = ?', [$email])
            ->where('token_recuperacao', $token)
            ->where('token_expira_em', '>=', now())
            ->first();

        if (!$usuario) {
            return ApiResponse::error('Código de verificação/token inválido ou expirado. Solicite uma nova recuperação.', 400);
        }

        DB::table($tabela)
            ->whereRaw('LOWER(email) = ?', [$email])
            ->update([
                'senha_hash' => bcrypt($novaSenha),
                'token_recuperacao' => null,
                'token_expira_em' => null,
            ]);

        return ApiResponse::success(['mensagem' => 'Senha redefinida com sucesso! Agora você já pode fazer o login com a nova senha.']);
    }

    private function solicitarRecuperacao(Request $request): JsonResponse
    {
        $email = strtolower(trim((string) $request->input('email', '')));
        $tipo = strtolower(trim((string) $request->input('tipo', 'aluno')));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ApiResponse::error('Por favor, informe um e-mail válido.', 422);
        }

        $tabela = $tipo === 'professor' ? 'professores' : 'alunos';

        $existe = DB::table($tabela)->whereRaw('LOWER(email) = ?', [$email])->exists();
        if (!$existe) {
            return ApiResponse::error('Nenhuma conta encontrada com este e-mail.', 404);
        }

        $token = bin2hex(random_bytes(32));
        $expiracao = now()->addHour();

        DB::table($tabela)
            ->whereRaw('LOWER(email) = ?', [$email])
            ->update([
                'token_recuperacao' => $token,
                'token_expira_em' => $expiracao,
            ]);

        $schema = $request->isSecure() ? 'https' : 'http';
        $host = $request->getHost();
        $path = $request->header('referer') ? (parse_url($request->header('referer'), PHP_URL_PATH) ?: '/') : '/';

        $linkRecuperacao = "{$schema}://{$host}{$path}?token={$token}&email=" . urlencode($email) . "&tipo={$tipo}";

        $assunto = 'Link para Redefinicao de Senha - Cidadao Digital';
        $mensagem = "Olá!\n\n" .
            "Foi solicitada a redefinição de senha para a conta: {$email}\n\n" .
            "Para criar uma nova senha, clique no link abaixo (ou cole no seu navegador):\n" .
            "{$linkRecuperacao}\n\n" .
            "Ou caso prefira digitar manualmente na tela do sistema, seu código/token de verificação é:\n" .
            "{$token}\n\n" .
            "Este link e código expiram em 1 hora.\n" .
            "Se você não solicitou a recuperação de senha, ignore este e-mail.";

        try {
            Mail::raw($mensagem, fn ($msg) => $msg->to($email)->subject($assunto));
        } catch (\Throwable $e) {
            report($e);
        }

        // SEGURANÇA: NUNCA retorna o token no JSON da resposta! O token é enviado EXCLUSIVAMENTE para o e-mail.
        return ApiResponse::success([
            'mensagem' => 'Um e-mail com o link de recuperação de senha foi enviado para ' . $email . '. Verifique sua caixa de entrada e spam.',
        ]);
    }
}
