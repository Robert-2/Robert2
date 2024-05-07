<?php
declare(strict_types=1);

namespace Loxya\Models\Enums;

/**
 * Période affichée dans le calendrier public.
 *
 * #TODO: Migrer vers un `enum`.
 */
final class PublicCalendarPeriodDisplay
{
    /** Les périodes d'opération uniquement sont affichées. */
    public const OPERATION = 'operation';

    /** Les périodes de mobilisation uniquement sont affichées. */
    public const MOBILIZATION = 'mobilization';

    /** Les périodes de mobilisation et d'opération sont affichées. */
    public const BOTH = 'both';
}
