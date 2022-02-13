<?php
declare(strict_types=1);

namespace Robert2\API\Config;

class Acl
{
    const PUBLIC_ROUTES = [
        '/install',
        '/login',

        '/calendar/public',

        //
        // - Api
        //

        '/api/session' => ['POST'],
    ];

    const DENY_LIST = [
        'admin'  => [],
        'member' => [
            'Bill' => [
                'delete',
            ],
            'Attribute' => [
                'create',
            ],
            'User' => [
                'getAll',
                'create',
                'delete',
                'restore',
            ],
            'Setting' => [
                'update'
            ],
        ],
        'visitor' => [
            'Category' => [
                'create',
                'update',
                'delete',
                'restore',
            ],
            'SubCategory' => [
                'create',
                'update',
                'delete',
                'restore',
            ],
            'Company' => [
                'create',
                'update',
                'delete',
                'restore',
            ],
            'Event' => [
                'create',
                'update',
                'delete',
                'restore',
            ],
            'Bill' => [
                'getOne',
                'create',
                'delete',
            ],
            'Attribute' => [
                'create',
            ],
            'Material' => [
                'create',
                'update',
                'delete',
                'restore',
            ],
            'Park' => [
                'create',
                'update',
                'delete',
                'restore',
            ],
            'Person' => [
                'create',
                'update',
                'delete',
                'restore',
            ],
            'Tag' => [
                'create',
                'update',
                'delete',
                'restore',
            ],
            'User' => [
                'getAll',
                'create',
                'delete',
                'restore',
            ],
            'Setting' => [
                'update'
            ],
        ],
    ];
}
