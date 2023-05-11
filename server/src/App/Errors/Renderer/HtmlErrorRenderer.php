<?php
declare(strict_types=1);

namespace Robert2\API\Errors\Renderer;

use Slim\Error\Renderers\HtmlErrorRenderer as CoreHtmlErrorRenderer;

// TODO: Utiliser Twig pour le rendu + Des vues par code d'erreur dans `views/errors/http/[code].twig`.
class HtmlErrorRenderer extends CoreHtmlErrorRenderer
{
    protected string $defaultErrorTitle = 'Internal Error';
    protected string $defaultErrorDescription = 'Internal error has occurred. Sorry for the temporary inconvenience.';
}
