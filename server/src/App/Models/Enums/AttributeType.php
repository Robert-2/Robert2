<?php
declare(strict_types=1);

namespace Loxya\Models\Enums;

/**
 * Types de donnée des caractéristiques spéciales.
 */
enum AttributeType: string
{
    /** Caractéristique spéciale de type "chaîne de caractère". */
    case STRING = 'string';

    /** Caractéristique spéciale de type "texte libre". */
    case TEXT = 'text';

    /** Caractéristique spéciale de type "nombre entier". */
    case INTEGER = 'integer';

    /** Caractéristique spéciale de type "nombre décimal". */
    case FLOAT = 'float';

    /** Caractéristique spéciale de type "booléen". */
    case BOOLEAN = 'boolean';

    /** Caractéristique spéciale de type "date". */
    case DATE = 'date';
}
