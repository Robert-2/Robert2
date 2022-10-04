<?php
namespace Robert2\API\Contracts;

interface Serializable
{
    /**
     * Permet d'obtenir l'instance sous forme de tableau "sérialisé".
     *
     * Dans le contexte de l'application, un tableau "sérialisé" est
     * un tableau que l'on peut faire transiter via l'API REST.
     *
     * @return array
     */
    public function serialize(): array;
}
