<?php
declare(strict_types=1);

namespace Loxya\Services\I18n\Exceptions;

use Psr\Container\NotFoundExceptionInterface;

class NotFoundException extends ContainerException implements NotFoundExceptionInterface
{
}
