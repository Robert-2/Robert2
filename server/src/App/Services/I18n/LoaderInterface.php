<?php
declare(strict_types=1);

namespace Robert2\API\Services\I18n;

use Robert2\API\Services\I18n\Exceptions\ContainerException;
use Robert2\API\Services\I18n\Exceptions\NotFoundException;
use Psr\Container\ContainerInterface;

/**
 * LoaderInterface interface.
 *
 * This interface is highly based on Dmitry Elfimov <elfimov@gmail.com> work
 * on `Translate` package (https://github.com/delfimov/Translate/). This
 * package is subject to the MIT License whose terms are as follows:
 *
 *    Copyright 2017 Dmitry Elfimov
 *
 *    Permission is hereby granted, free of charge, to any person
 *    obtaining a copy of this software and associated documentation
 *    files (the "Software"), to deal in the Software without restriction,
 *    including without limitation the rights to use, copy, modify, merge,
 *    publish, distribute, sublicense, and/or sell copies of the Software,
 *    and to permit persons to whom the Software is furnished to do so,
 *    subject  to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be
 *    included in all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 *    AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 *    OR OTHER DEALINGS IN THE SOFTWARE.
 */
interface LoaderInterface extends ContainerInterface
{
    /**
     * Permet de savoir si une langue est disponible.
     *
     * @param string $language Code de la langue à verifier.
     *
     * @return bool `true` si la langue est disponible, `false` sinon.
     */
    public function hasLanguage(string $language): bool;

    /**
     * Change la langue actuellement chargée.
     *
     * @param string $language Code de la langue à charger.
     *
     * @throws ContainerException
     */
    public function setLanguage(string $language): void;

    /**
     * Récupère le message de traduction lié à la clé de traduction passée.
     *
     * @param string $key La clé de traduction pour laquelle on souhaite
     *                    récupérer le message de traduction dans la langue
     *                    actuellement chargée.
     *
     * @return string|array Le message de traduction (un tableau si gestion du pluriel).
     *
     * @throws ContainerException
     * @throws NotFoundException
     */
    public function get(string $key): string | array;

    /**
     * Permet de savoir si un message de traduction est disponible pour une clé donnée.
     *
     * @param string $key La clé de traduction pour laquelle on souhaite
     *                    savoir si un message de traduction est disponible
     *                    dans la langue actuellement chargée.
     *
     * @return bool `true` si le message de traduction existe, `false` sinon.
     */
    public function has(string $key): bool;
}
