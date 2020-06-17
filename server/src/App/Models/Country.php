<?php
declare(strict_types=1);

namespace Robert2\API\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Respect\Validation\Validator as V;

class Country extends BaseModel
{
    use SoftDeletes;

    protected $table = 'countries';

    protected $_modelName = 'Country';
    protected $_orderField = 'name';
    protected $_orderDirection = 'asc';

    protected $_allowedSearchFields = ['name', 'code'];
    protected $_searchField = 'name';

    public function __construct()
    {
        parent::__construct();

        $this->validation = [
            'name' => V::notEmpty()->alpha(self::EXTRA_CHARS)->length(4, 96),
            'code' => V::notEmpty()->alpha()->length(4, 4),
        ];
    }

    // ——————————————————————————————————————————————————————
    // —
    // —    Mutators
    // —
    // ——————————————————————————————————————————————————————

    protected $casts = [
        'name' => 'string',
        'code' => 'string',
    ];

    // ——————————————————————————————————————————————————————
    // —
    // —    Setters
    // —
    // ——————————————————————————————————————————————————————

    protected $fillable = ['name', 'code'];
}
