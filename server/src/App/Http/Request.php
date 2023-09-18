<?php
declare(strict_types=1);

namespace Loxya\Http;

use Loxya\Config\Config;
use Loxya\Http\Enums\AppContext;
use Slim\Http\ServerRequest as CoreRequest;

class Request extends CoreRequest
{
    /**
     * Retourne le contexte de la requête.
     *
     * @return string - Le contexte ({@see \Loxya\Http\Enums\AppContext})
     */
    public function getContext(): string
    {
        return AppContext::INTERNAL;
    }

    /**
     * La requête est t'elle à destination de l'API ?
     *
     * @return bool `true` si c'est une requête d'API, `false` sinon.
     */
    public function isApi(): bool
    {
        return $this->match('/api');
    }

    /**
     * La requête est t'elle dans le context fourni ?
     *
     * @param string $context - Le context à vérifier.
     *
     * @return bool `true` si on est dans le contexte, `false` sinon.
     */
    public function isInContext(string $context): bool
    {
        return $this->getContext() === $context;
    }

    /**
     * Permet de vérifier si le chemin de la requête courante correspond au(x) chemin(s) passés.
     *
     * @param array|string $paths - Le ou les chemins à vérifier.
     *                              Si c'est un tableau, le chemin courant doit correspondre à
     *                              au moins une des entrées. Ce tableau peut contenir une liste
     *                              d'URL simples ou bien contenir en clé l'URL et en valeur des
     *                              méthodes requises pour que l'URL soit considérée comme
     *                              correspondante.
     *
     * @return bool `true` si la requête correspond, `false` sinon.
     */
    public function match(string | array $paths): bool
    {
        $requestMethod = $this->getMethod();
        $requestPath = str_replace('//', '/', sprintf('/%s', $this->getUri()->getPath()));

        foreach ((array) $paths as $path => $methods) {
            if (is_numeric($path)) {
                $path = $methods;
                $methods = null;
            }

            $path = rtrim(Config::getBaseUri()->withPath($path)->getPath(), '/');
            $isUriMatching = (bool) preg_match(sprintf('@^%s(?:/|$)@', preg_quote($path, '@')), $requestPath);
            $isMethodMatching = $methods === null || in_array($requestMethod, (array) $methods, true);

            if ($isUriMatching && $isMethodMatching) {
                return true;
            }
        }

        return false;
    }
}
