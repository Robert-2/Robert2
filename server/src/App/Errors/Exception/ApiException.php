<?php
declare(strict_types=1);

namespace Robert2\API\Errors\Exception;

use Fig\Http\Message\StatusCodeInterface as StatusCode;

class ApiException extends \RuntimeException
{
    private int $statusCode;

    /**
     * @param string|int $code Le code d'erreur d'API (@see {@link Enums\ApiErrorCode}).
     * @param string|null $message L'éventuel message à joindre à l'erreur.
     * @param int $statusCode Le code HTTP à utiliser avec cette erreur.
     */
    public function __construct(
        $code,
        ?string $message = null,
        int $statusCode = StatusCode::STATUS_INTERNAL_SERVER_ERROR
    ) {
        $this->statusCode = $statusCode;

        parent::__construct($message ?? '', $code);
    }

    /**
     * Retourne le code HTTP a utiliser.
     *
     * @return int
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
