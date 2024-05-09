<?php
declare(strict_types=1);

namespace Loxya\Contracts;

interface Serializable
{
    /**
     * Permet d'obtenir l'instance sous forme d'élément "sérialisé".
     *
     * Dans le contexte de l'application, un élément "sérialisé" est
     * un élément que l'on peut faire transiter via l'API REST.
     *
     * @return array L'instance, sérialisée sous forme de tableau.
     */
    public function serialize(): array;
}
