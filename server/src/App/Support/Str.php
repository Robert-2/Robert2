<?php
declare(strict_types=1);

namespace Robert2\Support;

use Cocur\Slugify\Slugify;
use Illuminate\Support\Str as StrCore;

class Str extends StrCore
{
    /**
     * Permet de "sluggifier" une chaîne de caractères.
     *
     * @param string $string La chaîne à "sluggifier".
     * @param string $separator Le séparateur à utiliser.
     * @param string $language Le groupe de règles à utiliser pour la normalisation des caractères.
     *                         (@see {@link \Cocur\Slugify\Slugify::$options})
     *
     * @return string La chaîne "sluggifiée".
     */
    public static function slugify($string, $separator = '-', $rulesets = 'default')
    {
        return (new Slugify())->slugify($string, [
            'separator' => $separator,
            'rulesets' => $rulesets,
        ]);
    }
}
