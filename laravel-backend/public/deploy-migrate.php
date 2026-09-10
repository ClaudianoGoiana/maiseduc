<?php
/**
 * Executor de migrations sem SSH. Acesse UMA VEZ via navegador após o upload:
 * https://api.resetprint.com.br/deploy-migrate.php?token=SEU_TOKEN
 * Depois disso, APAGUE este arquivo do servidor (ele executa comandos artisan).
 */
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

// Lê o token direto do .env (sem depender do bootstrap do Laravel, que falha
// silenciosamente se houver config cacheada de um deploy anterior).
function lerDeployToken(string $envPath): ?string
{
    if (!is_readable($envPath)) {
        return null;
    }
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linha) {
        $linha = trim($linha);
        if (str_starts_with($linha, 'DEPLOY_MIGRATE_TOKEN=')) {
            return trim(substr($linha, strlen('DEPLOY_MIGRATE_TOKEN=')), " \t\n\r\0\x0B\"'");
        }
    }
    return null;
}

$tokenEsperado = lerDeployToken(__DIR__ . '/../.env');
$tokenRecebido = trim((string) ($_GET['token'] ?? ''));

if (!$tokenEsperado || $tokenRecebido !== $tokenEsperado) {
    http_response_code(403);
    echo "Acesso negado. Defina DEPLOY_MIGRATE_TOKEN no .env e passe ?token= igual.\n";
    if (!$tokenEsperado) {
        echo "Diagnóstico: DEPLOY_MIGRATE_TOKEN não foi encontrado no arquivo .env (verifique se o .env foi renomeado corretamente e está na raiz do projeto).\n";
    }
    exit;
}

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Rodando migrations...\n\n";
$exitCode = Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
echo Illuminate\Support\Facades\Artisan::output();
echo "\nCódigo de saída: {$exitCode}\n";
echo "\nAGORA APAGUE ESTE ARQUIVO (deploy-migrate.php) DO SERVIDOR.\n";
