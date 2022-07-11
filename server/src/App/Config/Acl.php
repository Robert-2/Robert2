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
                'update',
                'reset',
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
                'duplicate',
                'update',
                'delete',
                'restore',
                'updateMaterialReturn',
                'updateMaterialTerminate',
            ],
            'EventTechnician' => [
                'create',
                'update',
                'delete',
            ],
            'Estimate' => [
                'create',
                'delete',
            ],
            'Bill' => [
                'getOne',
                'create',
                'delete',
            ],
            'Attribute' => [
                'create',
                'update',
                'delete',
            ],
            'Material' => [
                'create',
                'update',
                'delete',
                'restore',
                'handleUploadDocuments',
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
                'update',
                'reset',
            ],
            'Document' => [
                'delete',
            ]
        ],
    ];
}
