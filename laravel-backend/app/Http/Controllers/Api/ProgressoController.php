<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Aluno;
use App\Models\LogDecisao;
use App\Models\PerfilAluno;
use App\Models\RecomendacaoProfessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Agrupa as ações do domínio "progresso": salvar_progresso, get_student_progress, calcular_perfil.
 */
class ProgressoController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        return match ($request->query('acao')) {
            'salvar_progresso' => $this->salvarProgresso($request),
            'get_student_progress' => $this->getStudentProgress($request),
            'calcular_perfil' => $this->calcularPerfil($request),
            default => ApiResponse::error('Ação inválida para o domínio "progresso".', 404),
        };
    }

    private function salvarProgresso(Request $request): JsonResponse
    {
        $payload = $request->all();
        $idAluno = filter_var($payload['id_aluno'] ?? null, FILTER_VALIDATE_INT) ?: 0;
        $emailAluno = strtolower(trim((string) ($payload['email'] ?? '')));

        try {
            return DB::transaction(function () use ($payload, $idAluno, $emailAluno) {
                $idAluno = $this->resolverIdAluno($idAluno, $emailAluno);
                if ($idAluno <= 0) {
                    return ApiResponse::error('Aluno não encontrado no banco de dados', 422);
                }

                $acao = $payload['acao'] ?? 'missao';

                if ($acao === 'sincronizar_todas') {
                    $totalXpLinguagens = $this->sincronizarTodasAsTrilhas($idAluno, $payload);
                } else {
                    $totalXpLinguagens = $this->registrarMissaoIndividual($idAluno, $payload);
                }

                DB::table('alunos')->where('id_aluno', $idAluno)->update([
                    'xp_linguagens' => $totalXpLinguagens,
                    'nivel' => DB::raw('GREATEST(1, 1 + FLOOR((COALESCE(xp_etica, 0) + COALESCE(xp_logica, 0) + ' . (float) $totalXpLinguagens . ' + COALESCE(xp_seguranca, 0)) / 50))'),
                ]);

                $alunoAtual = DB::table('alunos')
                    ->selectRaw('xp_etica, xp_logica, xp_linguagens, xp_seguranca, nivel, (COALESCE(xp_etica, 0) + COALESCE(xp_logica, 0) + COALESCE(xp_linguagens, 0) + COALESCE(xp_seguranca, 0)) AS xp_total')
                    ->where('id_aluno', $idAluno)
                    ->first();

                return ApiResponse::success([
                    'mensagem' => 'Progresso de linguagens sincronizado com sucesso.',
                    'xp_linguagens' => (float) $totalXpLinguagens,
                    'xp_total' => (float) ($alunoAtual->xp_total ?? $totalXpLinguagens),
                    'nivel' => (int) ($alunoAtual->nivel ?? 1),
                ]);
            });
        } catch (\Throwable $e) {
            report($e);

            return ApiResponse::error('Erro interno ao sincronizar progresso de linguagens: ' . $e->getMessage(), 500);
        }
    }

    private function resolverIdAluno(int $idAluno, string $emailAluno): int
    {
        if ($idAluno > 0 && !Aluno::where('id_aluno', $idAluno)->exists()) {
            $idAluno = 0;
        }
        if ($idAluno <= 0 && $emailAluno !== '') {
            $idAluno = (int) (Aluno::whereRaw('LOWER(email) = ?', [$emailAluno])->value('id_aluno') ?? 0);
        }

        return $idAluno;
    }

    private function sincronizarTodasAsTrilhas(int $idAluno, array $payload): float
    {
        $trilhas = is_array($payload['trilhas'] ?? null) ? $payload['trilhas'] : [];

        foreach ($trilhas as $linguagemId => $dadosTrilha) {
            $linguagemLimpa = substr((string) $linguagemId, 0, 30);
            $notas = is_array($dadosTrilha['notaPorModulo'] ?? null) ? $dadosTrilha['notaPorModulo'] : [];
            $progressos = is_array($dadosTrilha['progressoPorModulo'] ?? null) ? $dadosTrilha['progressoPorModulo'] : [];
            $conclusoes = is_array($dadosTrilha['conclusoesPorModulo'] ?? null) ? $dadosTrilha['conclusoesPorModulo'] : [];

            $todosModulos = array_unique(array_merge(array_keys($notas), array_keys($progressos)));
            foreach ($todosModulos as $mod) {
                $modKey = (string) $mod;
                $nota = min(999.99, max(0.0, (float) ($notas[$modKey] ?? 0.0)));
                $missoes = min(255, max(0, (int) ($progressos[$modKey] ?? 0)));
                $vezes = max(0, (int) ($conclusoes[$modKey] ?? 0));

                if ($nota > 0 || $missoes > 0 || $vezes > 0) {
                    DB::table('progresso_linguagens')->updateOrInsert(
                        ['id_aluno' => $idAluno, 'linguagem' => $linguagemLimpa, 'id_modulo' => $modKey],
                        [
                            'missoes_concluidas' => DB::raw("GREATEST(missoes_concluidas, {$missoes})"),
                            'nota_modulo' => DB::raw("GREATEST(nota_modulo, {$nota})"),
                            'vezes_concluido' => DB::raw("GREATEST(vezes_concluido, {$vezes})"),
                        ]
                    );
                }
            }
        }

        $totalXpLinguagens = (float) DB::table('progresso_linguagens')->where('id_aluno', $idAluno)->sum('nota_modulo');

        if (isset($payload['pontuacao_total'])) {
            $totalXpLinguagens = max($totalXpLinguagens, (float) $payload['pontuacao_total']);
        }

        return $totalXpLinguagens;
    }

    private function registrarMissaoIndividual(int $idAluno, array $payload): float
    {
        $linguagem = substr((string) ($payload['linguagem'] ?? 'geral'), 0, 30);
        $idModulo = substr((string) ($payload['id_modulo'] ?? '0'), 0, 100);
        $numeroMissao = min(255, max(1, (int) ($payload['numero_missao'] ?? 1)));
        $respostaEscolhida = substr((string) ($payload['resposta_escolhida'] ?? ''), 0, 255);
        $respostaCorreta = substr((string) ($payload['resposta_correta'] ?? ''), 0, 255);
        $correta = !empty($payload['correta']) ? 1 : 0;
        $tentativa = min(255, max(1, (int) ($payload['tentativa'] ?? 1)));
        $pontosObtidos = (float) ($payload['pontos_obtidos'] ?? 0.0);
        $notaModulo = (float) ($payload['nota_modulo'] ?? 0.0);
        $missoesConcluidas = min(255, max(0, (int) ($payload['missoes_concluidas'] ?? 1)));

        // 1. Grava log para auditoria pedagógica do professor
        DB::table('log_missoes_linguagens')->insert([
            'id_aluno' => $idAluno,
            'linguagem' => $linguagem,
            'id_modulo' => $idModulo,
            'numero_missao' => $numeroMissao,
            'resposta_escolhida' => $respostaEscolhida,
            'resposta_correta' => $respostaCorreta,
            'correta' => $correta,
            'tentativa' => $tentativa,
            'pontos_obtidos' => $pontosObtidos,
            'criado_em' => now(),
        ]);

        // 2. Upsert no progresso do módulo
        $vezesIncrementa = $missoesConcluidas >= 10 ? 1 : 0;
        DB::table('progresso_linguagens')->updateOrInsert(
            ['id_aluno' => $idAluno, 'linguagem' => $linguagem, 'id_modulo' => $idModulo],
            [
                'missoes_concluidas' => DB::raw("GREATEST(missoes_concluidas, {$missoesConcluidas})"),
                'nota_modulo' => DB::raw("GREATEST(nota_modulo, {$notaModulo})"),
                'vezes_concluido' => DB::raw($vezesIncrementa ? 'vezes_concluido + 1' : 'vezes_concluido'),
            ]
        );

        // 3. Recalcula o total de XP de linguagens somando todos os módulos
        return (float) DB::table('progresso_linguagens')->where('id_aluno', $idAluno)->sum('nota_modulo');
    }

    private function getStudentProgress(Request $request): JsonResponse
    {
        $idAluno = $request->query('id_aluno');

        if (!$idAluno || !is_numeric($idAluno)) {
            return ApiResponse::error('ID do aluno inválido', 400);
        }

        $aluno = DB::table('alunos')
            ->selectRaw('COALESCE(xp_etica, 0) AS xp_etica, COALESCE(xp_logica, 0) AS xp_logica, COALESCE(xp_linguagens, 0) AS xp_linguagens, COALESCE(xp_seguranca, 0) AS xp_seguranca, COALESCE(nivel, 1) AS nivel')
            ->where('id_aluno', (int) $idAluno)
            ->first();

        if (!$aluno) {
            return ApiResponse::success($this->xpZerado());
        }

        $trilhasSalvas = [];
        foreach (DB::table('progresso_linguagens')->where('id_aluno', (int) $idAluno)->get() as $lt) {
            $lang = $lt->linguagem;
            $mod = (string) $lt->id_modulo;
            $trilhasSalvas[$lang] ??= ['notaPorModulo' => [], 'progressoPorModulo' => [], 'conclusoesPorModulo' => []];
            $trilhasSalvas[$lang]['notaPorModulo'][$mod] = number_format((float) $lt->nota_modulo, 1, '.', '');
            $trilhasSalvas[$lang]['progressoPorModulo'][$mod] = (int) $lt->missoes_concluidas;
            $trilhasSalvas[$lang]['conclusoesPorModulo'][$mod] = (int) $lt->vezes_concluido;
        }

        $xpEtica = (float) $aluno->xp_etica;
        $xpLogica = (float) $aluno->xp_logica;
        $xpLinguagens = (float) $aluno->xp_linguagens;
        $xpSeguranca = (float) $aluno->xp_seguranca;

        return ApiResponse::success([
            'xp' => [
                'xp_etica' => $xpEtica,
                'xp_logica' => $xpLogica,
                'xp_linguagens' => $xpLinguagens,
                'xp_total_logica' => $xpLogica + $xpLinguagens,
                'xp_seguranca' => $xpSeguranca,
                'xp_total' => $xpEtica + $xpLogica + $xpLinguagens + $xpSeguranca,
                'nivel' => (int) $aluno->nivel,
            ],
            'trilhas' => $trilhasSalvas,
        ]);
    }

    private function xpZerado(): array
    {
        return [
            'xp' => [
                'xp_etica' => 0.0, 'xp_logica' => 0.0, 'xp_linguagens' => 0.0,
                'xp_total_logica' => 0.0, 'xp_seguranca' => 0.0, 'xp_total' => 0.0, 'nivel' => 1,
            ],
            'trilhas' => (object) [],
        ];
    }

    private function calcularPerfil(Request $request): JsonResponse
    {
        $payload = $request->all();
        if (!isset($payload['id_aluno'], $payload['fase_alcancada'])) {
            return ApiResponse::error('Payload inválido', 422);
        }

        $idAluno = (int) $payload['id_aluno'];
        $faseAlcancada = (int) $payload['fase_alcancada'];

        $decisoes = LogDecisao::where('id_aluno', $idAluno)->orderBy('criado_em')->get();
        if ($decisoes->isEmpty()) {
            return ApiResponse::error('Nenhuma decisão encontrada para este aluno', 400);
        }

        $scores = [
            'critico' => 0, 'passivo' => 0, 'etico' => 0, 'pragmatico' => 0,
            'investigador' => 0, 'ativista' => 0, 'hacker' => 0, 'engenheiro' => 0,
        ];

        foreach ($decisoes as $decisao) {
            if ($decisao->classificacao === 'correta') {
                $scores['critico'] += 2;
                $scores['etico'] += 1;
            }
            if ($decisao->classificacao === 'catastrofica') {
                $scores['passivo'] += 1;
                $scores['ativista'] += 1;
            }
            if ($decisao->categoria === 'etica' && $decisao->pontos_ganhos > 10) {
                $scores['etico'] += 2;
                $scores['ativista'] += 1;
                $scores['investigador'] += 1;
            }
            if ($decisao->categoria === 'logica' && $decisao->pontos_ganhos > 10) {
                $scores['hacker'] += 2;
                $scores['engenheiro'] += 1;
                $scores['critico'] += 1;
                $scores['investigador'] += 1;
            }
            if ($decisao->categoria === 'seguranca' && $decisao->pontos_ganhos > 10) {
                $scores['hacker'] += 1;
                $scores['pragmatico'] += 1;
                $scores['investigador'] += 1;
            }
        }

        $maxScore = max($scores);
        if ($maxScore > 0) {
            foreach ($scores as $tipo => $valor) {
                $scores[$tipo] = intval(($valor / $maxScore) * 100);
            }
        }

        $tipoDominante = array_key_first(array_filter($scores, fn ($v) => $v === max($scores)));

        $scoresOrdenados = $scores;
        arsort($scoresOrdenados);
        $scoresOrdenados = array_values($scoresOrdenados);
        $confianca = max(0, min(100, $scoresOrdenados[0] - ($scoresOrdenados[1] ?? 0)));

        $recomendacoes = $this->gerarRecomendacoes($tipoDominante);

        DB::transaction(function () use ($idAluno, $faseAlcancada, $tipoDominante, $confianca, $scores, $recomendacoes) {
            PerfilAluno::create([
                'id_aluno' => $idAluno,
                'fase_alcancada' => $faseAlcancada,
                'tipo_aluno' => $tipoDominante,
                'confianca_score' => $confianca,
                'score_critico' => $scores['critico'],
                'score_passivo' => $scores['passivo'],
                'score_etico' => $scores['etico'],
                'score_pragmatico' => $scores['pragmatico'],
                'score_investigador' => $scores['investigador'],
                'score_ativista' => $scores['ativista'],
                'score_hacker' => $scores['hacker'],
                'score_engenheiro' => $scores['engenheiro'],
            ]);

            RecomendacaoProfessor::create([
                'id_aluno' => $idAluno,
                'tipo_aluno' => $tipoDominante,
                'recomendacao_texto' => $recomendacoes['recomendacao'],
                'risco_desvio' => $recomendacoes['risco'],
                'sugestao_estrategia' => $recomendacoes['estrategia'],
            ]);
        });

        return ApiResponse::success([
            'tipo_aluno' => $tipoDominante,
            'descricao' => $recomendacoes['descricao'],
            'confianca' => $confianca,
            'scores' => $scores,
            'recomendacoes' => $recomendacoes['mensagens'],
        ], 201);
    }

    private function gerarRecomendacoes(string $tipoAluno): array
    {
        $mapa = [
            'critico' => [
                'descricao' => 'Cidadão Crítico 🔍',
                'recomendacao' => 'Este aluno questiona tudo e verifica fontes constantemente. Excelente pensador crítico.',
                'risco' => 'Paralisia analítica (dificuldade em decidir sem informação perfeita)',
                'estrategia' => 'Debate estruturado, estudos de caso, análise de dados em grupo',
                'mensagens' => ['Parabéns! Você demonstra forte pensamento crítico.', 'Próximo desafio: converta análise em ação.'],
            ],
            'etico' => [
                'descricao' => 'Cidadão Ético ⚖️',
                'recomendacao' => 'Aluno que coloca valores morais acima de conveniência. Defensor dos direitos digitais.',
                'risco' => 'Idealismo ingênuo (desconexão com realidade política/econômica)',
                'estrategia' => 'Casos de impacto social real, projetos de advocacy, estágio com ONGs digitais',
                'mensagens' => ['Sua bússola ética é sólida.', 'Equilibre ideais com pragmatismo: nem sempre há solução perfeita.'],
            ],
            'ativista' => [
                'descricao' => 'Cidadão Ativista ✊',
                'recomendacao' => 'Toma ação contra injustiças. Quer mudar o sistema.',
                'risco' => 'Ação precipitada sem análise (compartilhar notícia falsa de boa fé)',
                'estrategia' => 'Projetos de impacto social, campanhas educativas, mobilização comunitária',
                'mensagens' => ['Seu poder de mobilização é forte.', 'Cuidado: sempre analise antes de agir. Informação falsa prejudica movimentos.'],
            ],
            'hacker' => [
                'descricao' => 'Cidadão Hacker (Bem) ⚙️',
                'recomendacao' => 'Curiosidade técnica extrema. Quer explorar como sistemas funcionam.',
                'risco' => 'Curiosidade sem ética (hacking malicioso, invasão de privacidade)',
                'estrategia' => 'Desafios de CTF (Capture The Flag), bug bounty programs, reverse engineering ético',
                'mensagens' => ['Sua curiosidade técnica é admirável.', 'Lembre-se: grande poder = grande responsabilidade.'],
            ],
            'engenheiro' => [
                'descricao' => 'Cidadão Engenheiro 🛠️',
                'recomendacao' => 'Pragmático e eficiente. Quer construir soluções que funcionam.',
                'risco' => 'Negligência ética em prol de performance',
                'estrategia' => 'Prototipagem rápida, MVP, startups, otimização e escalabilidade',
                'mensagens' => ['Seu pragmatismo eficiente é valioso.', 'Não deixe a ética de lado. Sistemas éticos são mais sustentáveis.'],
            ],
            'passivo' => [
                'descricao' => 'Cidadão Passivo 😴',
                'recomendacao' => 'Aceita o status quo. Não questiona. Segue a maioria.',
                'risco' => 'Manipulação fácil, conformismo, falta de pensamento crítico',
                'estrategia' => 'Exemplos simples e impactantes, narrativas claras, mentoria individual',
                'mensagens' => ['Explore fases que ofereçam dilemas com impacto direto.', 'Pratique questionar: "Por que isso é assim?"'],
            ],
            'pragmatico' => [
                'descricao' => 'Cidadão Pragmático ⚡',
                'recomendacao' => 'Busca equilíbrio. Segue regras mas questiona quando necessário.',
                'risco' => 'Falta de posicionamento em questões críticas',
                'estrategia' => 'Estudos de caso com dilemas reais, negociação, mediação',
                'mensagens' => ['Seu equilíbrio é a base de soluções reais.', 'Agora aprofunde: especialize-se em uma área (técnica, ética ou investigação).'],
            ],
            'investigador' => [
                'descricao' => 'Cidadão Investigador 🔎',
                'recomendacao' => 'Quer entender a verdade completa. Junta evidências e tira conclusões.',
                'risco' => 'Teorias da conspiração (sem base factual)',
                'estrategia' => 'Análise de dados, jornalismo investigativo, documentários, fact-checking',
                'mensagens' => ['Sua análise profunda é excepcional.', 'Compartilhe suas descobertas: investigação sem comunicação não muda nada.'],
            ],
        ];

        return $mapa[$tipoAluno] ?? $mapa['pragmatico'];
    }
}
