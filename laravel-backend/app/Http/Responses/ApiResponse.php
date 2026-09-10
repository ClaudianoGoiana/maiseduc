<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

/**
 * Envelope JSON padronizado {success, error, data} usado por toda a API.
 */
class ApiResponse
{
    public static function success(mixed $data = null, int $httpCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'error' => null,
            'data' => $data,
        ], $httpCode);
    }

    public static function error(string $mensagem, int $httpCode = 500): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $mensagem,
            'data' => null,
        ], $httpCode);
    }
}
