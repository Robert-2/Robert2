<?php
declare(strict_types=1);

namespace Loxya\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 *
 * @method static \Illuminate\Database\Eloquent\Builder|static query()
 * @method static \Illuminate\Database\Eloquent\Builder|static select($columns = ['*'])
 * @method static \Illuminate\Database\Eloquent\Builder|static selectRaw(string $expression, array $bindings = [])
 * @method static \Illuminate\Database\Eloquent\Builder|static orderBy($column, string $direction = 'asc')
 * @method static \Illuminate\Database\Eloquent\Builder|static where($column, $operator = null, $value = null, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|static whereNotIn(string $column, $values, string $boolean = 'and')
 * @method static \Illuminate\Database\Eloquent\Builder|static whereIn(string $column, $values, string $boolean = 'and', bool $not = false)
 */
abstract class BasePivot extends Pivot
{
}
