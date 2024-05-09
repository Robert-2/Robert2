<?php
declare(strict_types=1);

namespace Loxya\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Errors\Enums\ApiErrorCode;

class ApiException extends \RuntimeException
{
    private ApiErrorCode $apiCode;
    private int $statusCode;

    /**
     * @param ApiErrorCode $code Le code d'erreur d'API.
     * @param string|null $message L'éventuel message à joindre à l'erreur.
     * @param int $statusCode Le code HTTP à utiliser avec cette erreur.
     */
    public function __construct(
        ApiErrorCode $code,
        ?string $message = null,
        int $statusCode = StatusCode::STATUS_INTERNAL_SERVER_ERROR,
    ) {
        $this->apiCode = $code;
        $this->statusCode = $statusCode;

        parent::__construct($message ?? '', $code->value);
    }

    /**
     * Retourne le code HTTP lié à l'erreur d'API.
     *
     * @return int Le code HTTP lié.
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * Retourne le code d'erreur API sous forme d'enum.
     *
     * @return ApiErrorCode Le code d'erreur API sous forme d'enum.
     */
    public function getApiCode(): ApiErrorCode
    {
        return $this->apiCode;
    }
}
