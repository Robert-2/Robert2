<?php
declare(strict_types=1);

namespace Loxya\Services\Auth\Contracts;

use Loxya\Services\Auth\Exceptions\AuthException;
use Psr\Http\Message\ResponseInterface;

interface RemoteAuthenticatorInterface extends AuthenticatorInterface
{
    /**
     * Est-ce que l'utilisateur est authentifié pour l'authentifieur ?
     *
     * @return bool `true` si l'utilisateur est authentifié, `false` sinon.
     *
     * @throws \LogicException Si l'authentifieur n'est pas activé (@see {@link static::isEnabled()}).
     */
    public function isAuthenticated(): bool;

    /**
     * Permet de lancer le processus de connexion de l'utilisateur
     * courant avec un système d'identification externe.
     *
     * Une fois l'utilisateur authentifié via ce système externe, il devrait être
     * redirigé vers Loxya qui devra vérifier le retour de ce système et déterminer
     * si l'utilisateur est bien authentifié ou non. Et si oui, dans quel mesure
     * il est nécessaire de persister des données de session de notre côté ou non.
     * (= Si ce n'est pas déjà fait par une bibliothèque tierce par exemple (e.g. `phpcas`))
     *
     * @param ?string $returnTo L'URL vers laquelle l'utilisateur sera redirigé après connexion distante
     *                          et vérification de la validité de la connexion du côté Loxya.
     *                          (si omise, l'utilisateur sera redirigé vers l'accueil de l'application)
     *
     * @return ResponseInterface Dans le cas ou l'utilisateur n'était pas déjà authentifié auprès du service distant,
     *                           contiendra une réponse de redirection vers le système de connexion distant.
     *                           Sinon, contiendra la redirection vers `$returnTo` (voir ce paramètre pour plus
     *                           d'informations à ce sujet).
     *
     * @throws \LogicException Si l'authentifieur n'est pas activé (@see {@link static::isEnabled()}).
     * @throws AuthException Si une erreur s'est produite lors de la connexion.
     */
    public function login(?string $returnTo): ResponseInterface;

    /**
     * Permet de demander la déconnexion - complète - de l'utilisateur.
     *
     * Cela veut dire qu'il devrait être déconnecté complètement de Loxya
     * ET de son système de connexion distant si c'est opportun.
     *
     * @param ?string $returnTo L'URL vers laquelle l'utilisateur sera redirigée après déconnexion distante.
     *                          (si omise, l'utilisateur sera redirigé vers l'accueil de l'application)
     *
     * @return ResponseInterface Dans le cas ou l'utilisateur était authentifié auprès du service distant,
     *                           contiendra une réponse de redirection vers le système de déconnexion distant.
     *                           Sinon, contiendra la redirection vers `$returnTo` (voir ce paramètre pour plus
     *                           d'informations à ce sujet).
     *
     * @throws \LogicException Si l'authentifieur n'est pas activé (@see {@link static::isEnabled()}).
     * @throws AuthException Si une erreur s'est produite lors de la déconnexion.
     */
    public function logout(?string $returnTo): ResponseInterface;
}
