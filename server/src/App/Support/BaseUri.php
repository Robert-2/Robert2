<?php
declare(strict_types=1);

namespace Loxya\Support;

use Psr\Http\Message\UriInterface;
use Slim\Psr7\Uri;

/**
 * Un wrapper autour de (@link Uri} pour les URIs de "base".
 *
 * Une URI de base est utilisée comme ... base pour construire d'autre chemin.
 * C'est, par exemple, l'URI "root" de l'application à partir de laquelle les autres
 * URIs se construisent (= Les autres URIs intègrent toujours l'URI root).
 *
 * Ces URIs ont les caractéristiques suivantes:
 * - Elles n'ont pas de query strings, ni de "fragment".
 * - Elles ne perdent jamais la portion de "path", même lorsque l'on utilise `->withPath()`.
 *   Par exemple, pour une URI de base `https://my-website.com/loxya`, si on appelle
 *   `->withPath('/login')` cela donnera `https://my-website.com/loxya/login`.
 */
class BaseUri implements UriInterface
{
    private UriInterface $uri;

    /**
     * Constructeur.
     *
     * @param string $uri L'URI de base sous forme de chaîne de caractères.
     *
     * @return static La nouvelle instance représentant l'URI de base.
     *
     * @throws \InvalidArgumentException Si la chaîne d'URI ne peut pas être parsée.
     */
    public function __construct(string $uri)
    {
        $parts = parse_url($uri);
        if ($parts === false) {
            throw new \InvalidArgumentException("The URI appears to be invalid and cannot be parsed.");
        }

        $scheme = $parts['scheme'] ?? '';
        $user = $parts['user'] ?? '';
        $pass = $parts['pass'] ?? '';
        $host = $parts['host'] ?? '';
        $port = $parts['port'] ?? null;
        $path = $parts['path'] ?? '';

        $this->uri = new Uri($scheme, $host, $port, $path, $user, $pass);
    }

    public function getScheme(): string
    {
        return $this->uri->getScheme();
    }

    public function getAuthority(): string
    {
        return $this->uri->getAuthority();
    }

    public function getUserInfo(): string
    {
        return $this->uri->getUserInfo();
    }

    public function getHost(): string
    {
        return $this->uri->getHost();
    }

    public function getPort(): ?int
    {
        return $this->uri->getPort();
    }

    public function getPath(): string
    {
        return $this->uri->getPath();
    }

    public function getQuery(): string
    {
        return $this->uri->getQuery();
    }

    public function getFragment(): string
    {
        return $this->uri->getFragment();
    }

    public function withScheme(string $scheme): UriInterface
    {
        return $this->uri->withScheme($scheme);
    }

    public function withUserInfo(string $user, ?string $password = null): UriInterface
    {
        return $this->uri->withUserInfo($user, $password);
    }

    public function withHost(string $host): UriInterface
    {
        return $this->uri->withHost($host);
    }

    public function withPort(?int $port): UriInterface
    {
        return $this->uri->withPort($port);
    }

    /**
     * Retourne une instance d'`Uri` avec le chemin spécifié, en conservant
     * le path d'origine de l'URI de base quoi qu'il se passe
     * (avec ou sans slash en préfixe).
     *
     * @param string $path Le chemin à utiliser.
     *
     * @return static Une instance d'Uri avec le chemin spécifié (en plus du chemin de base).
     *
     * @throws \InvalidArgumentException Pour les chemins invalides.
     */
    public function withPath(string $path): UriInterface
    {
        $path = implode('/', [rtrim($this->getPath(), '/'), ltrim($path, '/')]);
        return $this->uri->withPath($path);
    }

    public function withQuery(string $query): UriInterface
    {
        return $this->uri->withQuery($query);
    }

    public function withFragment(string $fragment): UriInterface
    {
        return $this->uri->withFragment($fragment);
    }

    /**
     * {@inheritdoc}
     */
    public function __toString()
    {
        return $this->uri->__toString();
    }
}
